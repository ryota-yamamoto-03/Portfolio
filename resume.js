/* ==========================================
   PILL NAV — SHOW / ACTIVE STATE
   ========================================== */
const pillNav   = document.getElementById('pillNav');
const pillLinks = document.querySelectorAll('.pill-link');
const indicator = document.querySelector('.pill-indicator');

function movePillIndicator(activeLink) {
  if (!activeLink) return;
  const navRect  = pillNav.querySelector('.pill-nav-inner').getBoundingClientRect();
  const linkRect = activeLink.getBoundingClientRect();
  indicator.style.left   = (linkRect.left - navRect.left) + 'px';
  indicator.style.top    = (linkRect.top  - navRect.top)  + 'px';
  indicator.style.width  = linkRect.width  + 'px';
  indicator.style.height = linkRect.height + 'px';
}

function setActivePillLink(id) {
  pillLinks.forEach(l => l.classList.remove('active'));
  const active = document.querySelector(`.pill-link[data-section="${id}"]`);
  if (active) {
    active.classList.add('active');
    movePillIndicator(active);
  }
}

// Show pill nav after hero
const heroEl = document.getElementById('hero');

const heroObserver = new IntersectionObserver(([entry]) => {
  pillNav.classList.toggle('visible', !entry.isIntersecting);
}, { threshold: 0.1 });

heroObserver.observe(heroEl);

// Active section tracking
const sections = document.querySelectorAll('section[id]');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      setActivePillLink(entry.target.id);
    }
  });
}, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });

sections.forEach(s => sectionObserver.observe(s));

// Smooth scroll on pill link click
pillLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ==========================================
   SCROLL REVEAL — GENERIC
   ========================================== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => entry.target.classList.add('revealed'), delay * 1000);
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.scroll-reveal, .r-eyebrow, .r-heading, .r-body-lg, .r-quote, .r-body')
  .forEach(el => revealObserver.observe(el));

/* ==========================================
   EXPERIENCE CARDS
   ========================================== */
const expObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const idx = parseInt(entry.target.dataset.index || 0);
      setTimeout(() => entry.target.classList.add('revealed'), idx * 120);
      expObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.exp-item').forEach(el => expObserver.observe(el));

/* ==========================================
   PUBLICATIONS
   ========================================== */
const pubObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const idx = parseInt(entry.target.dataset.index || 0);
      setTimeout(() => entry.target.classList.add('revealed'), idx * 140);
      pubObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.pub-card').forEach(el => pubObserver.observe(el));

/* ==========================================
   EDUCATION
   ========================================== */
const eduObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('revealed'), i * 100);
      eduObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.edu-item').forEach(el => eduObserver.observe(el));

/* ==========================================
   RADIAL SKILL CHARTS
   ========================================== */
const CIRCUMFERENCE = 2 * Math.PI * 34; // r=34 → ~213.6

function animateRadial(el) {
  const pct   = parseInt(el.dataset.pct);
  const fill  = el.querySelector('.radial-fill');
  const label = el.querySelector('.radial-pct');
  const offset = CIRCUMFERENCE * (1 - pct / 100);

  // Animate stroke
  requestAnimationFrame(() => {
    fill.style.strokeDashoffset = offset;
  });

  // Count up
  let current = 0;
  const duration = 1400;
  const start = performance.now();

  function tick(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);
    current = Math.round(eased * pct);
    label.textContent = current;
    if (progress < 1) requestAnimationFrame(tick);
    else label.textContent = pct;
  }

  requestAnimationFrame(tick);
}

const radialObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => animateRadial(entry.target), i * 80);
      radialObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.4 });

document.querySelectorAll('.radial-item').forEach(el => radialObserver.observe(el));

/* ==========================================
   AWARDS
   ========================================== */
const awardObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('revealed'), i * 100);
      awardObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.award-item').forEach(el => awardObserver.observe(el));

/* ==========================================
   HERO PARALLAX
   ========================================== */
const heroGlows = document.querySelectorAll('.r-hero-glow');
const heroChips = document.querySelectorAll('.chip');
const heroContent = document.querySelector('.r-hero-content');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const heroH   = heroEl.offsetHeight;

  if (scrollY < heroH) {
    const p = scrollY / heroH;

    heroContent.style.transform = `translateY(${scrollY * 0.2}px)`;
    heroContent.style.opacity   = 1 - p * 1.5;

    heroGlows.forEach((g, i) => {
      g.style.transform = `translateY(${scrollY * (0.1 + i * 0.06)}px)`;
    });

    heroChips.forEach((c, i) => {
      const dir = i % 2 === 0 ? 1 : -1;
      c.style.transform = `translateY(${scrollY * 0.08 * dir}px)`;
      c.style.opacity   = 1 - p * 2;
    });
  }
}, { passive: true });

/* ==========================================
   BOOK COVER — 3D HOVER
   ========================================== */
document.querySelectorAll('.pub-cover').forEach(cover => {
  cover.addEventListener('mousemove', e => {
    const r  = cover.getBoundingClientRect();
    const cx = r.left + r.width  / 2;
    const cy = r.top  + r.height / 2;
    const dx = (e.clientX - cx) / (r.width  / 2);
    const dy = (e.clientY - cy) / (r.height / 2);
    cover.style.transform = `perspective(600px) rotateX(${-dy * 10}deg) rotateY(${dx * 10}deg) translateY(-6px) scale(1.02)`;
  });

  cover.addEventListener('mouseleave', () => {
    cover.style.transition = 'transform 0.6s cubic-bezier(0.16,1,0.3,1)';
    cover.style.transform  = '';
    setTimeout(() => cover.style.transition = '', 600);
  });
});

/* ==========================================
   DOWNLOAD BUTTON — RIPPLE
   ========================================== */
const dlBtn = document.querySelector('.btn-download');

if (dlBtn) {
  dlBtn.addEventListener('click', e => {
    e.preventDefault();

    const ripple = document.createElement('span');
    ripple.style.cssText = `
      position:absolute; border-radius:50%; pointer-events:none;
      background:rgba(255,255,255,0.3); transform:scale(0);
      animation: ripple-expand 0.5s ease-out forwards;
      width:120px; height:120px;
      left:${e.offsetX - 60}px; top:${e.offsetY - 60}px;
    `;

    if (!document.getElementById('ripple-style')) {
      const s = document.createElement('style');
      s.id = 'ripple-style';
      s.textContent = `@keyframes ripple-expand { to { transform:scale(3); opacity:0; } }`;
      document.head.appendChild(s);
    }

    dlBtn.style.position = 'relative';
    dlBtn.style.overflow = 'hidden';
    dlBtn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);

    // Simulate download feedback
    const orig = dlBtn.innerHTML;
    dlBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" width="18" height="18"><path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg> 準備中...`;
    setTimeout(() => { dlBtn.innerHTML = orig; }, 2000);
  });
}

/* ==========================================
   AWARD CERTIFICATE MODAL
   ========================================== */
const certOverlay = document.getElementById('certOverlay');
const certModal   = document.getElementById('certModal');
const certClose   = document.getElementById('certClose');

function openCert(img) {
  document.getElementById('certPhoto').src = img;
  certOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeCert() {
  certOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

document.querySelectorAll('.award-h3-btn').forEach(h3 => {
  h3.addEventListener('click', () => {
    openCert(h3.dataset.img);
  });
});

certClose.addEventListener('click', closeCert);

certOverlay.addEventListener('click', e => {
  if (e.target === certOverlay) closeCert();
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeCert();
});

/* ==========================================
   SMOOTH ANCHOR LINKS
   ========================================== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
