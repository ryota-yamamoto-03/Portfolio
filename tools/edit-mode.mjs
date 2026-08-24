#!/usr/bin/env node
// クリックして文言を編集する開発用サーバー。
// 起動: node tools/edit-mode.mjs  →  http://localhost:5173
// ブラウザ上で書き換えた内容を、そのままソースの HTML ファイルへ書き戻す。

import { createServer } from 'node:http';
import { readFile, writeFile, copyFile, access } from 'node:fs/promises';
import { extname, join, normalize, sep, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = normalize(join(HERE, '..'));
const PORT = Number(process.env.PORT || 5173);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.png': 'image/png', '.gif': 'image/gif', '.svg': 'image/svg+xml',
  '.webp': 'image/webp', '.ico': 'image/x-icon', '.mp4': 'video/mp4',
  '.woff': 'font/woff', '.woff2': 'font/woff2',
};

// ROOT の外へ出るパスを弾く
function resolveSafe(urlPath) {
  const decoded = decodeURIComponent(urlPath.split('?')[0]);
  const rel = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  const abs = normalize(join(ROOT, rel));
  if (abs !== ROOT && !abs.startsWith(ROOT + sep)) return null;
  return abs;
}

function readBody(req, limit = 5 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) { reject(new Error('リクエストが大きすぎます')); req.destroy(); return; }
      chunks.push(c);
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

// oldHTML の nth 番目の出現位置を返す。完全一致で見つからなければ trim して再探索する。
function locate(source, oldHTML, nth) {
  for (const needle of [oldHTML, oldHTML.trim()]) {
    if (!needle) continue;
    const hits = [];
    let i = source.indexOf(needle);
    while (i !== -1) { hits.push(i); i = source.indexOf(needle, i + 1); }
    if (hits.length === 0) continue;
    // DOM 上の出現順に対応する位置を優先。件数が合わないときは一意な場合のみ採用する。
    if (nth < hits.length) return { pos: hits[nth], length: needle.length, needle };
    if (hits.length === 1) return { pos: hits[0], length: needle.length, needle };
  }
  return null;
}

async function applyEdits(file, edits) {
  const abs = resolveSafe(file);
  if (!abs || extname(abs) !== '.html') throw new Error(`編集対象にできないファイルです: ${file}`);
  await access(abs);

  const source = await readFile(abs, 'utf8');
  const applied = [];
  const failed = [];

  // 置換位置は必ず元テキスト上で確定させ、後ろから適用してオフセットのズレを防ぐ
  for (const edit of edits) {
    const found = locate(source, edit.oldHTML, edit.nth ?? 0);
    if (!found) { failed.push(edit); continue; }
    // 元の前後の空白（インデント・改行）を保ったまま中身だけ差し替える
    const lead = edit.oldHTML.match(/^\s*/)[0];
    const trail = edit.oldHTML.match(/\s*$/)[0];
    const inner = edit.newHTML.trim();
    const replacement = found.needle === edit.oldHTML ? lead + inner + trail : inner;
    applied.push({ ...found, replacement });
  }

  if (applied.length) {
    applied.sort((a, b) => b.pos - a.pos);
    let next = source;
    for (const a of applied) next = next.slice(0, a.pos) + a.replacement + next.slice(a.pos + a.length);
    await copyFile(abs, abs + '.bak');   // 上書き前の内容を .bak に退避
    await writeFile(abs, next, 'utf8');
  }

  return { file, applied: applied.length, failed };
}

const server = createServer(async (req, res) => {
  try {
    if (req.method === 'POST' && req.url === '/__edit/save') {
      const { file, edits } = JSON.parse(await readBody(req));
      if (!Array.isArray(edits)) throw new Error('edits が不正です');
      const out = await applyEdits(file, edits);
      console.log(`  保存: ${out.file} — 適用 ${out.applied} 件 / 失敗 ${out.failed.length} 件`);
      res.writeHead(200, { 'content-type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(out));
      return;
    }

    if (req.url === '/__edit/client.js') {
      const client = await readFile(join(HERE, 'edit-client.js'));
      res.writeHead(200, { 'content-type': 'text/javascript; charset=utf-8', 'cache-control': 'no-store' });
      res.end(client);
      return;
    }

    const abs = resolveSafe(req.url);
    if (!abs) { res.writeHead(403); res.end('Forbidden'); return; }

    const ext = extname(abs).toLowerCase();
    let body = await readFile(abs);
    if (ext === '.html') {
      body = Buffer.from(
        body.toString('utf8').replace(/<\/body>/i, '  <script src="/__edit/client.js"></script>\n</body>'),
        'utf8',
      );
    }
    res.writeHead(200, { 'content-type': MIME[ext] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(body);
  } catch (err) {
    const code = err.code === 'ENOENT' ? 404 : 500;
    res.writeHead(code, { 'content-type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: code === 404 ? 'Not found' : err.message }));
  }
});

server.listen(PORT, '127.0.0.1', () => {
  console.log(`\n  編集モード起動  →  http://localhost:${PORT}\n`);
  console.log('  1. 画面下の「✏️ 編集モード」を押す');
  console.log('  2. 変えたい文字をクリックして書き換える');
  console.log('  3.「保存」または Cmd/Ctrl+S でソースに書き戻す');
  console.log('  ※ 上書き前の内容は <ファイル名>.bak に残ります\n');
});
