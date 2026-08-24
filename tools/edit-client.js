// 編集モードのクライアント。edit-mode.mjs が HTML に注入して配信する。
(() => {
  const SKIP = new Set(['SCRIPT','STYLE','NOSCRIPT','SVG','PATH','BR','HR','IMG','INPUT','TEXTAREA','SELECT','CANVAS','IFRAME']);
  const state = {
    on: false,
    pending: new Map(),
    file: location.pathname === '/' ? 'index.html' : location.pathname.slice(1),
  };

  // 直下に意味のあるテキストを持つ要素だけを編集対象にする
  const isEditable = (el) => {
    if (SKIP.has(el.tagName) || el.closest('#edit-bar')) return false;
    if (el.querySelector('img, svg, canvas, video, iframe')) return false;
    return [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
  };

  const targets = [...document.body.querySelectorAll('*')].filter(isEditable);

  // 同一の HTML が複数ある場合に備え、文書順での出現番号を持たせる
  const seen = new Map();
  const meta = new Map();
  for (const el of targets) {
    const html = el.innerHTML;
    const nth = seen.get(html) ?? 0;
    seen.set(html, nth + 1);
    meta.set(el, { original: html, nth });
  }

  const style = document.createElement('style');
  style.textContent = `
    #edit-bar{position:fixed;left:50%;bottom:20px;transform:translateX(-50%);z-index:2147483647;
      display:flex;gap:10px;align-items:center;padding:10px 14px;border-radius:999px;
      background:#111;border:1px solid #333;color:#eee;font:500 13px/1 system-ui,sans-serif;
      box-shadow:0 8px 30px rgba(0,0,0,.5)}
    #edit-bar button{cursor:pointer;border:0;border-radius:999px;padding:7px 14px;font:inherit;
      background:#2b2b2b;color:#eee}
    #edit-bar button:hover:not(:disabled){background:#3a3a3a}
    #edit-bar button:disabled{opacity:.4;cursor:default}
    #edit-bar button[data-act="save"]{background:#10b981;color:#04231a}
    #edit-bar [data-role="msg"]{color:#9ca3af;max-width:340px;line-height:1.4}
    body.edit-on [data-editable]{outline:1px dashed rgba(16,185,129,.55);cursor:text}
    body.edit-on [data-editable]:hover{outline:2px solid #10b981;background:rgba(16,185,129,.08)}
    [data-editable][contenteditable="true"]{outline:2px solid #38bdf8 !important;background:rgba(56,189,248,.10)}
    [data-dirty]{outline:2px solid #f59e0b !important}
  `;
  document.head.appendChild(style);

  const bar = document.createElement('div');
  bar.id = 'edit-bar';
  bar.innerHTML =
    '<button data-act="toggle">✏️ 編集モード</button>' +
    '<span data-role="count">未保存 0 件</span>' +
    '<button data-act="save" disabled>保存</button>' +
    '<button data-act="revert" disabled>取消</button>' +
    '<span data-role="msg"></span>';
  document.body.appendChild(bar);

  const msg = (text, ms = 5000) => {
    const el = bar.querySelector('[data-role="msg"]');
    el.textContent = text;
    if (ms) setTimeout(() => { if (el.textContent === text) el.textContent = ''; }, ms);
  };

  const sync = () => {
    const n = state.pending.size;
    bar.querySelector('[data-role="count"]').textContent = '未保存 ' + n + ' 件';
    bar.querySelector('[data-act="save"]').disabled = n === 0;
    bar.querySelector('[data-act="revert"]').disabled = n === 0;
  };

  // contenteditable が作る div/p を <br> に均してからソースへ戻す
  const normalize = (html) => html
    .replace(/<div><br\s*\/?><\/div>/gi, '<br>')
    .replace(/<\/div>\s*<div[^>]*>/gi, '<br>')
    .replace(/<\/p>\s*<p[^>]*>/gi, '<br>')
    .replace(/<\/?(?:div|p)[^>]*>/gi, '')
    .replace(/<br\s*\/?>/gi, '<br>')
    .replace(/ /g, ' ');

  const commit = (el) => {
    const m = meta.get(el);
    const now = normalize(el.innerHTML);
    if (now === m.original) {
      state.pending.delete(el);
      el.removeAttribute('data-dirty');
    } else {
      state.pending.set(el, { oldHTML: m.original, newHTML: now, nth: m.nth });
      el.setAttribute('data-dirty', '');
    }
    sync();
  };

  for (const el of targets) {
    el.setAttribute('data-editable', '');
    el.addEventListener('click', (e) => {
      if (!state.on) return;
      e.preventDefault();          // リンク遷移やサイト側の挙動を止める
      e.stopPropagation();
      if (el.isContentEditable) return;
      el.contentEditable = 'true';
      el.focus();
    });
    el.addEventListener('blur', () => {
      if (!el.isContentEditable) return;
      el.contentEditable = 'false';
      commit(el);
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { el.innerHTML = meta.get(el).original; el.blur(); }
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); el.blur(); }  // Shift+Enter で改行
    });
  }

  const setMode = (on) => {
    state.on = on;
    document.body.classList.toggle('edit-on', on);
    bar.querySelector('[data-act="toggle"]').textContent = on ? '✅ 編集モード ON' : '✏️ 編集モード';
    if (!on && document.activeElement && document.activeElement.blur) document.activeElement.blur();
  };

  const revert = () => {
    for (const el of [...state.pending.keys()]) {
      el.innerHTML = meta.get(el).original;
      el.removeAttribute('data-dirty');
    }
    state.pending.clear();
    sync();
    msg('変更を取り消しました');
  };

  const save = async () => {
    if (!state.pending.size) return;
    bar.querySelector('[data-act="save"]').disabled = true;
    msg('保存中…', 0);
    try {
      const res = await fetch('/__edit/save', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ file: state.file, edits: [...state.pending.values()] }),
      });
      const out = await res.json();
      if (!res.ok) throw new Error(out.error || '保存に失敗しました');

      for (const [el, edit] of [...state.pending]) {
        const stuck = out.failed.some((f) => f.oldHTML === edit.oldHTML && f.nth === edit.nth);
        if (stuck) continue;
        meta.get(el).original = edit.newHTML;
        el.removeAttribute('data-dirty');
        state.pending.delete(el);
      }
      sync();
      msg(out.failed.length
        ? out.applied + ' 件を ' + out.file + ' に保存。' + out.failed.length + ' 件は該当箇所を特定できず未保存です'
        : out.applied + ' 件を ' + out.file + ' に保存しました');
    } catch (err) {
      msg('エラー: ' + err.message, 8000);
      sync();
    }
  };

  bar.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;
    if (btn.dataset.act === 'toggle') setMode(!state.on);
    if (btn.dataset.act === 'save') save();
    if (btn.dataset.act === 'revert') revert();
  });

  addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); save(); }
    if (e.key === 'Escape' && state.on && !(document.activeElement || {}).isContentEditable) setMode(false);
  });

  addEventListener('beforeunload', (e) => { if (state.pending.size) e.preventDefault(); });

  console.log('[edit-mode] 編集対象 ' + targets.length + ' 要素');
})();
