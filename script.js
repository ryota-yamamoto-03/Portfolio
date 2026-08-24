/* ==========================================
   CUSTOM CURSOR
   ========================================== */
const cursor = document.createElement('div');
cursor.className = 'cursor';
const follower = document.createElement('div');
follower.className = 'cursor-follower';
document.body.appendChild(cursor);
document.body.appendChild(follower);

let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;
  cursor.style.left = mouseX + 'px';
  cursor.style.top = mouseY + 'px';
});

function animateFollower() {
  followerX += (mouseX - followerX) * 0.12;
  followerY += (mouseY - followerY) * 0.12;
  follower.style.left = followerX + 'px';
  follower.style.top = followerY + 'px';
  requestAnimationFrame(animateFollower);
}
animateFollower();

/* ==========================================
   NAVIGATION SCROLL STATE
   ========================================== */
const nav = document.getElementById('nav');
let lastScrollY = 0;

window.addEventListener('scroll', () => {
  const currentScrollY = window.scrollY;

  if (currentScrollY > 10) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }

  if (currentScrollY > lastScrollY && currentScrollY > 80) {
    nav.classList.add('nav--hidden');
  } else {
    nav.classList.remove('nav--hidden');
  }

  lastScrollY = currentScrollY;
}, { passive: true });

/* ==========================================
   HAMBURGER MENU
   ========================================== */
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');

hamburger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  hamburger.classList.toggle('active', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
    hamburger.classList.remove('active');
    document.body.style.overflow = '';
  });
});

/* ==========================================
   INTERSECTION OBSERVER — REVEAL
   ========================================== */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -40px 0px'
});

document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right')
  .forEach(el => revealObserver.observe(el));

/* ==========================================
   HERO PARALLAX
   ========================================== */
const heroSection = document.getElementById('hero');
const heroContent = heroSection.querySelector('.hero-content');
const heroScroll = heroSection.querySelector('.hero-scroll');
const heroOrbs = heroSection.querySelectorAll('.hero-orb');

window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const heroHeight = heroSection.offsetHeight;

  if (scrollY < heroHeight) {
    const progress = scrollY / heroHeight;

    heroContent.style.transform = `translateY(${scrollY * 0.25}px)`;
    heroContent.style.opacity = 1 - progress * 1.8;

    heroScroll.style.opacity = 1 - progress * 4;

    heroOrbs.forEach((orb, i) => {
      const factor = (i + 1) * 0.15;
      orb.style.transform = `translateY(${scrollY * factor}px)`;
    });
  }
}, { passive: true });

/* ==========================================
   ABOUT CARD TILT
   ========================================== */
const aboutCard = document.querySelector('.about-card');

if (aboutCard) {
  aboutCard.addEventListener('mousemove', e => {
    const rect = aboutCard.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    aboutCard.style.transform =
      `translateY(-8px) rotateX(${-dy * 8}deg) rotateY(${dx * 8}deg)`;
  });

  aboutCard.addEventListener('mouseleave', () => {
    aboutCard.style.transform = '';
    aboutCard.style.transition = 'transform 0.5s var(--ease-out), box-shadow 0.5s';
    setTimeout(() => {
      aboutCard.style.transition = '';
    }, 500);
  });
}

/* ==========================================
   WORK ITEM HOVER DEPTH
   ========================================== */
document.querySelectorAll('.work-mockup').forEach(mockup => {
  mockup.addEventListener('mousemove', e => {
    const rect = mockup.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    mockup.style.transform =
      `perspective(800px) rotateX(${-dy * 4}deg) rotateY(${dx * 6}deg) translateY(-4px)`;
  });

  mockup.addEventListener('mouseleave', () => {
    mockup.style.transform = '';
    mockup.style.transition = 'transform 0.6s var(--ease-out)';
    setTimeout(() => mockup.style.transition = '', 600);
  });
});

/* ==========================================
   SMOOTH ANCHOR SCROLL
   ========================================== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const href = anchor.getAttribute('href');

    // href="#"（ロゴなど）はページ先頭へ。querySelector('#') は例外になるので先に処理する
    if (href === '#') {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    const offset = parseInt(getComputedStyle(document.documentElement)
      .getPropertyValue('--nav-h')) || 52;
    const top = target.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ==========================================
   PAGE LOAD ANIMATION
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
  document.body.style.opacity = '0';
  document.body.style.transition = 'opacity 0.5s ease';
  requestAnimationFrame(() => {
    document.body.style.opacity = '1';
  });

  const heroReveals = document.querySelectorAll('.hero .reveal-up');
  heroReveals.forEach((el, i) => {
    setTimeout(() => {
      el.classList.add('revealed');
    }, 200 + i * 100);
  });
});

/* ==========================================
   ACTIVE NAV LINK HIGHLIGHT
   ========================================== */
const sections = document.querySelectorAll('section[id]');
const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');

const activeObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.getAttribute('id');
      navAnchors.forEach(a => {
        const match = a.getAttribute('href') === `#${id}`;
        a.style.color = match ? '#fff' : '';
      });
    }
  });
}, { threshold: 0.4 });

sections.forEach(s => activeObserver.observe(s));
