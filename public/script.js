/* ═══════════════════════════════════════════════════════
   EduBuds — script.js
   Learn · Grow · Shine
   ═══════════════════════════════════════════════════════ */

'use strict';

/* ── Config ─────────────────────────────────────────────
   Loaded dynamically from CMS (/api/settings) with fallback
   ─────────────────────────────────────────────────────── */
let WHATSAPP_NUMBER = '919222315006';
let CONTACT_EMAIL = 'support@edubuds.in';
var floatRotateTimer = null;

/* ── Remote Settings Loader ─────────────────────────────── */
async function loadRemoteSettings() {
  try {
    const res = await fetch('/api/settings?_t=' + Date.now(), { cache: 'no-cache' });
    if (!res.ok) return;
    const data = await res.json();
    if (data.whatsapp_number && String(data.whatsapp_number).trim()) {
      WHATSAPP_NUMBER = String(data.whatsapp_number).replace(/\D/g, '');
      // Update any rendered whatsapp buttons
      document.querySelectorAll('a.btn-whatsapp').forEach(a => {
        try {
          const url = new URL(a.href, window.location.origin);
          const textParam = url.searchParams.get('text');
          if (textParam) {
            a.href = buildWhatsAppURL(textParam);
          }
        } catch {
          // ignore malformed URLs
        }
      });
    }
    if (data.contact_email) {
      CONTACT_EMAIL = data.contact_email.trim();
      document.querySelectorAll('a[href^="mailto:"]').forEach(a => {
        a.href = `mailto:${CONTACT_EMAIL}`;
        if (a.textContent.includes('@')) a.textContent = CONTACT_EMAIL;
      });
    }
    if (data.site_title && !document.title.includes('404')) {
      document.title = data.site_title;
    }
  } catch {
    // Offline or static fallback — keeps running seamlessly
  }
}
loadRemoteSettings();

/* ── Utilities ──────────────────────────────────────────── */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function debounce(fn, ms = 150) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

function buildWhatsAppURL(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/* ── Year ────────────────────────────────────────────────── */
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();
/* ── Theme Toggle (GSAP MorphSVG Curve Swipe Transition) ── */
(function initTheme() {
  const html = document.documentElement;
  const toggle = $('#theme-toggle');
  const STORAGE = 'edubuds-theme';

  const overlay = document.getElementById('theme-curve-overlay');
  const path = document.getElementById('theme-curve-path');
  let isTransitioning = false;

  // Fluid wave Bézier shapes across 100x100 viewBox
  const pathStart    = 'M 0 0 L 100 0 L 100 0 Q 50 0 0 0 Z';
  const pathMidEnter = 'M 0 0 L 100 0 L 100 65 Q 50 115 0 65 Z';
  const pathFull     = 'M 0 0 L 100 0 L 100 100 Q 50 100 0 100 Z';
  const pathMidExit  = 'M 0 65 Q 50 115 100 65 L 100 100 Q 50 100 0 100 Z';
  const pathEnd      = 'M 0 100 Q 50 100 100 100 L 100 100 Q 50 100 0 100 Z';

  function applyInstantTheme(next) {
    html.classList.add('theme-instant');
    html.dataset.theme = next;
    localStorage.setItem(STORAGE, next);
    void html.offsetHeight; // force reflow so tokens resolve instantly
    html.classList.remove('theme-instant');
  }

  function handleThemeToggle() {
    if (isTransitioning) return;

    const current = html.dataset.theme || 'light';
    const next = current === 'dark' ? 'light' : 'dark';

    // Fallback: If prefers-reduced-motion, or GSAP/MorphSVG not yet loaded, toggle immediately
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !window.gsap || !window.MorphSVGPlugin || !overlay || !path) {
      applyInstantTheme(next);
      return;
    }

    isTransitioning = true;
    window.gsap.registerPlugin(window.MorphSVGPlugin);

    // Target theme's background color (matches the user's specification)
    const targetBg = next === 'dark' ? '#0d1b2e' : '#fffdf7';

    overlay.classList.add('is-active');

    const tl = window.gsap.timeline({
      onComplete: () => {
        overlay.classList.remove('is-active');
        window.gsap.set(path, { attr: { d: pathStart } });
        isTransitioning = false;
      }
    });

    tl.set(path, { attr: { d: pathStart, fill: targetBg } })
      // Phase 1: Wave swells downward into a deep fluid curve
      .to(path, {
        duration: 0.26,
        ease: 'power2.in',
        morphSVG: pathMidEnter
      })
      // Phase 2: Fills the entire screen
      .to(path, {
        duration: 0.18,
        ease: 'power1.out',
        morphSVG: pathFull
      })
      // Exact Apex: Swap theme instantly under the fluid curtain
      .add(() => {
        applyInstantTheme(next);
      })
      // Phase 3: Wave uncovers downward from the top
      .to(path, {
        duration: 0.26,
        ease: 'power2.in',
        morphSVG: pathMidExit
      })
      // Phase 4: Collapses smoothly at bottom
      .to(path, {
        duration: 0.18,
        ease: 'power1.out',
        morphSVG: pathEnd
      });
  }

  toggle && toggle.addEventListener('click', handleThemeToggle);
})();

/* ── Mobile Menu ─────────────────────────────────────────── */
(function initMobileMenu() {
  const btn = $('#menu-toggle');
  const nav = $('#main-nav');
  if (!btn || !nav) return;

  btn.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    btn.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  });

  // Close on nav link click
  $$('a', nav).forEach(a => {
    a.addEventListener('click', () => {
      nav.classList.remove('open');
      btn.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    });
  });
})();

/* ── Header scroll shadow ────────────────────────────────── */
(function initHeaderScroll() {
  const header = $('.header');
  if (!header) return;
  const cb = () => header.classList.toggle('scrolled', window.scrollY > 20);
  window.addEventListener('scroll', cb, { passive: true });
})();

/* ── Scroll Reveal ───────────────────────────────────────── */
// Global reveal observer — available to all dynamic sections
const globalRevealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      globalRevealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

(function initReveal() {
  $$('.reveal').forEach(el => globalRevealObserver.observe(el));
})();

/* ── Animated Counter ────────────────────────────────────── */
function animateStatCounter(el) {
  if (!el) return;
  if (el._countRafId) {
    cancelAnimationFrame(el._countRafId);
    el._countRafId = null;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const target = parseInt(el.dataset.count, 10) || 0;
    el.textContent = String(target);
    el._countAnimated = true;
    return;
  }

  const duration = 1200;
  const start = performance.now();

  function step(now) {
    // Always read live dataset.count so async API hydration never gets overwritten
    const target = parseInt(el.dataset.count, 10) || 0;
    const progress = Math.min((now - start) / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = String(Math.round(eased * target));
    if (progress < 1) {
      el._countRafId = requestAnimationFrame(step);
    } else {
      el.textContent = String(target);
      el._countRafId = null;
      el._countAnimated = true;
    }
  }

  el._countRafId = requestAnimationFrame(step);
}

function setStatCounterValue(el, newValue) {
  if (!el) return;
  const parsed = parseInt(newValue, 10);
  if (Number.isNaN(parsed)) return;

  el.dataset.count = String(parsed);

  // If animation is in-flight, step() reads live dataset.count and converges seamlessly
  if (el._countRafId) return;

  // If already animated or visible with a number, reflect updated value immediately
  if (el._countAnimated || parseInt(el.textContent, 10) > 0) {
    el.textContent = String(parsed);
  }
}

(function initCounters() {
  const counters = $$('[data-count]');
  if (!counters.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateStatCounter(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => io.observe(el));
})();

/* ── Hero Sparkle Particles ──────────────────────────────── */
(function initParticles() {
  const container = $('#hero-particles');
  if (!container) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const colors = ['#ffc20e', '#0878c9', '#279447', '#ef3e62', '#7c5cbf'];
  const count = window.innerWidth < 640 ? 8 : 16;

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size = Math.random() * 5 + 3;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const opacity = Math.random() * 0.35 + 0.15;

    Object.assign(p.style, {
      width: size + 'px',
      height: size + 'px',
      background: color,
      left: (Math.random() * 90 + 5) + '%',
      top: (Math.random() * 85 + 5) + '%',
      '--dur': (Math.random() * 4 + 4) + 's',
      '--delay': (Math.random() * 3) + 's',
      '--op': opacity,
    });

    container.appendChild(p);
  }
})();

/* ── 3D Tilt Cards ───────────────────────────────────────── */
(function initTilt() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if ('ontouchstart' in window) return; // Skip on touch devices

  const cards = $$('.strand-card');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const rotX = -dy * 6;
      const rotY = dx * 6;

      card.style.transform = `translateY(-6px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.35s';
    });

    card.addEventListener('mouseenter', () => {
      card.style.transition = 'transform 0.1s linear, box-shadow 0.35s';
    });
  });
})();

/* ── Products / CMS ─────────────────────────────────────────
   Product data is inlined here for standalone (file://) use.
   The same data lives in products.json for server deployments.
   To add/edit books: update BOTH this object AND products.json.
   ─────────────────────────────────────────────────────────── */
const PRODUCTS_DATA = {
  series: [
    {
      id: 'islamic-studies',
      label: 'Islamic Studies Series',
      tagline: 'A complete curriculum — Pre-Primer – Grade 8',
      description: 'A carefully structured Islamic Studies programme that grows with the learner. Each grade contains four modules, weaving belief, action, du\'as, etiquettes, history, and Qur\'anic understanding into one connected journey.',
      color: '#0878c9', colorLight: '#e7f2ff',
      books: [
        { id: 'is-grade-pp1', title: 'Islamic Studies', subtitle: 'Pre-Primer 1', image: 'https://mg57l9mdmzsnv8rl.public.blob.vercel-storage.com/edubuds-1794999956899-islamic-studies-pre-primer-workbook-cover-BHhd0lsCWeFDmwPPkD14FLe3acsF2y.png', tags: ['Pre-Primer 1', 'Curriculum'], description: 'The foundation year — introducing children to belief, practice, and the beauty of being Muslim through age-appropriate stories and activities.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds "Islamic Studies (Pre-Primer 1)". Could you please share details on pricing, availability, and how to place an order?' },
        { id: 'is-grade-pp2', title: 'Islamic Studies', subtitle: 'Pre-Primer 2', image: 'https://mg57l9mdmzsnv8rl.public.blob.vercel-storage.com/edubuds-1794999885973-islamic-studies-pre-primer-2-cover-qgSNd5BLdPOfe1c1qjaJoI6ABtnGNi.png', tags: ['Pre-Primer 2', 'Curriculum'], description: 'The foundation year — introducing children to belief, practice, and the beauty of being Muslim through age-appropriate stories and activities.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds "Islamic Studies (Pre-Primer 2)". Could you please share details on pricing, availability, and how to place an order?' },
        { id: 'is-grade-1', title: 'Islamic Studies', subtitle: 'Grade 1', image: 'https://mg57l9mdmzsnv8rl.public.blob.vercel-storage.com/edubuds-1795004756974-colorful-islamic-studies-grade-1-cover-CsNLBe9qyK4Z1KDaVY3tfg3V0vxNKk.png', tags: ['Grade 1', 'Curriculum'], description: 'The foundation year — introducing children to belief, practice, and the beauty of being Muslim through age-appropriate stories and activities.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds Islamic Studies Grade 1 book. Could you please share details on pricing, availability, and how to place an order?' },
        { id: 'is-grade-2', title: 'Islamic Studies', subtitle: 'Grade 2', image: 'https://mg57l9mdmzsnv8rl.public.blob.vercel-storage.com/edubuds-1794572000864-grade-2-aKGoXpBnF1JlkKifrpo1ZmCQd6bkuL.webp', tags: ['Grade 2', 'Curriculum'], description: 'Building on Year 1, Grade 2 deepens understanding of worship, manners, and selected du\'as with engaging lessons suited to the growing learner.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds Islamic Studies Grade 2 book. Could you please share details on pricing, availability, and how to place an order?' },
        { id: 'is-grade-3', title: 'Islamic Studies', subtitle: 'Grade 3', image: 'https://mg57l9mdmzsnv8rl.public.blob.vercel-storage.com/edubuds-1794926228090-islamic-studies-grade-3-cover-SXSDogRiLSSxHH0SFeyVtrGP43dNPB.png', tags: ['Grade 3', 'Curriculum'], description: 'Grade 3 introduces richer Qur\'anic understanding, prophetic biographies, and a stronger lens on character and Islamic etiquettes.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds Islamic Studies Grade 3 book. Could you please share details on pricing, availability, and how to place an order?' },
        { id: 'is-grade-4', title: 'Islamic Studies', subtitle: 'Grade 4', image: 'https://mg57l9mdmzsnv8rl.public.blob.vercel-storage.com/edubuds-1794304337935-grade-4--1--ez3x7LSxz7yymvxLTti7BJjwxlZm7E.webp', tags: ['Grade 4', 'Curriculum'], description: 'Grade 4 marks a pivotal year — students engage with deeper aspects of creed, history, and the Qur\'an, preparing them for the middle years.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds Islamic Studies Grade 4 book. Could you please share details on pricing, availability, and how to place an order?' },
        { id: 'is-grade-5', title: 'Islamic Studies', subtitle: 'Grade 5', image: 'https://mg57l9mdmzsnv8rl.public.blob.vercel-storage.com/edubuds-1794577012570-grade-5-dRazkrIDg6SoEgkXKnaCjnHqMOiKaA.webp', tags: ['Grade 5', 'Curriculum'], description: 'Grade 5 marks a pivotal year — students engage with deeper aspects of creed, history, and the Qur\'an, preparing them for the middle years.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds "Islamic Studies (Grade 5)". Could you please share details on pricing, availability, and how to place an order?' },
        { id: 'is-grade-6', title: 'Islamic Studies', subtitle: 'Grade 6', image: 'https://mg57l9mdmzsnv8rl.public.blob.vercel-storage.com/edubuds-1794656786884-grade-6-JZSN41bHdsj769qjXNBBL2QqtlGqWV.webp', tags: ['Grade 6', 'Curriculum'], description: 'Grade 6 marks a pivotal year — students engage with deeper aspects of creed, history, and the Qur\'an, preparing them for the middle years.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds "Islamic Studies (Grade 6)". Could you please share details on pricing, availability, and how to place an order?' },
        { id: 'is-grade-7', title: 'Islamic Studies', subtitle: 'Grade 7', image: 'https://mg57l9mdmzsnv8rl.public.blob.vercel-storage.com/edubuds-1794656868336-grade-7-S5guNLBLNEjC1GXQlCxAWrE2oZ97GC.webp', tags: ['Grade 7', 'Curriculum'], description: 'Grade 7 marks a pivotal year — students engage with deeper aspects of creed, history, and the Qur\'an, preparing them for the middle years.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds "Islamic Studies (Grade 7)". Could you please share details on pricing, availability, and how to place an order?' },
        { id: 'is-grade-8', title: 'Islamic Studies', subtitle: 'Grade 8', image: 'https://mg57l9mdmzsnv8rl.public.blob.vercel-storage.com/edubuds-1794925124848-edubuds-islamic-studies-grade-3-cover-zw6XdelohKoTceHNZsIC7MUJVVtt5N.png', tags: ['Grade 8', 'Curriculum'], description: 'Grade 8 marks a pivotal year — students engage with deeper aspects of creed, history, and the Qur\'an, preparing them for the middle years.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds "Islamic Studies (Grade 8)". Could you please share details on pricing, availability, and how to place an order?' }
      ]
    },
    {
      id: 'prophet-stories',
      label: 'Prophet Stories Series',
      tagline: '10 illustrated storybooks — Prophets Sent by Allah',
      description: 'A set of ten beautifully illustrated storybooks, each bringing to life the story of a Prophet sent by Allah.',
      color: '#279447', colorLight: '#e5f5e5',
      books: [
        { id: 'ps-box-english', title: 'Prophets Sent by Allah', subtitle: 'Complete Box Set — English', image: '/assets/placeholder-cover.svg', description: 'The complete collection — all 10 Prophet storybooks in a beautiful box set. Perfect as a gift or for the home library. Available in English.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds Prophet Stories Box Set (English). Could you please share details on pricing, availability, and delivery?' },
        { id: 'ps-box-roman', title: 'Prophets Sent by Allah', subtitle: 'Complete Box Set — Roman Urdu', image: '/assets/placeholder-cover.svg', description: 'The complete collection in Roman Urdu — all 10 Prophet storybooks in a beautiful box set. Accessible to Urdu-speaking families who read in Roman script.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds Prophet Stories Box Set (Roman Urdu). Could you please share details on pricing, availability, and delivery?' },
        { id: 'ps-box-urdu', title: 'Prophets Sent by Allah', subtitle: 'Complete Box Set — Urdu', image: '/assets/placeholder-cover.svg', description: 'The complete collection in Urdu — all 10 Prophet storybooks in a beautiful box set for Urdu-speaking families.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds Prophet Stories Box Set (Urdu). Could you please share details on pricing, availability, and delivery?' },
        { id: 'ps-adam', title: 'The Story of Adam', subtitle: 'عليه السلام', image: '/assets/placeholder-cover.svg', description: 'The story of the first human being and first Prophet — Adam (AS). A gentle and meaningful introduction to creation, trust, and returning to Allah.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds storybook \'The Story of Adam (AS)\'. Could you please share details on pricing and availability?' },
        { id: 'ps-nooh', title: 'The Story of Nooh', subtitle: 'عليه السلام', image: '/assets/placeholder-cover.svg', description: 'The extraordinary story of Prophet Nooh (AS) — patience, conviction, and trust in Allah against all odds.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds storybook \'The Story of Nooh (AS)\'. Could you please share details on pricing and availability?' },
        { id: 'ps-hood', title: 'The Story of Hood', subtitle: 'عليه السلام', image: '/assets/placeholder-cover.svg', description: 'The story of Prophet Hood (AS) and the people of \'Aad — a powerful reminder of gratitude, humility, and the consequences of turning away from guidance.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds storybook \'The Story of Hood (AS)\'. Could you please share details on pricing and availability?' },
        { id: 'ps-musa', title: 'The Story of Musa', subtitle: 'عليه السلام', image: '/assets/placeholder-cover.svg', description: 'One of the greatest stories in the Qur\'an — Prophet Musa (AS), Fir\'awn, and the miracles of Allah. Brought to life with vivid illustrations.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds storybook \'The Story of Musa (AS)\'. Could you please share details on pricing and availability?' },
        { id: 'ps-yusuf', title: 'The Story of Yusuf', subtitle: 'عليه السلام', image: '/assets/placeholder-cover.svg', description: 'The most beautiful of stories — Prophet Yusuf (AS). A tale of patience, character, and the plan of Allah unfolding in the most unexpected ways.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds storybook \'The Story of Yusuf (AS)\'. Could you please share details on pricing and availability?' },
        { id: 'ps-loot', title: 'The Story of Loot', subtitle: 'عليه السلام', image: '/assets/placeholder-cover.svg', description: 'The story of Prophet Loot (AS) — a reminder of moral clarity, steadfastness in truth, and trust in Allah\'s plan even when alone.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds storybook \'The Story of Loot (AS)\'. Could you please share details on pricing and availability?' },
        { id: 'ps-ayyub-yunus', title: 'The Story of Ayyub & Yunus', subtitle: 'عليهما السلام', image: '/assets/placeholder-cover.svg', description: 'Two remarkable stories of patience and repentance — Prophet Ayyub (AS) and Prophet Yunus (AS) — told side by side with wisdom and warmth.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds storybook \'The Story of Ayyub and Yunus (AS)\'. Could you please share details on pricing and availability?' },
        { id: 'ps-isa', title: 'The Story of Isa', subtitle: 'عليه السلام', image: '/assets/placeholder-cover.svg', description: 'The remarkable story of Prophet Isa (AS) — his miraculous birth, his message, and his honoured place in Islam. A must-read for every Muslim child.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds storybook \'The Story of Isa (AS)\'. Could you please share details on pricing and availability?' },
      ]
    },
    {
      id: 'hadith-collection',
      label: '20 Hadith Collection',
      tagline: '20 essential ahadith for growing Muslims',
      description: 'Twenty carefully selected ahadith presented in a child-friendly format — Arabic, transliteration, translation, vocabulary, explanation, and an activity.',
      color: '#ffc20e', colorLight: '#fff3c9',
      books: [
        { id: 'hc-poster-set', title: '20 Hadith for Kids', subtitle: 'Full Poster & Lesson Set', image: '/assets/placeholder-cover.svg', description: 'Twenty essential ahadith as beautiful, classroom-ready posters with Arabic, transliteration, translation, explanation, and activities built in. Ideal for homes, madrasahs, and Islamic schools.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds \'20 Hadith for Kids\' collection. Could you please share details on pricing, format options, and availability?' },
      ]
    }
  ]
};

(function initProducts() {
  const tabsEl = $('#filter-tabs');
  const gridEl = $('#products-grid');
  const labelEl = $('#series-label');
  const dotEl = $('#series-label-dot');
  const textEl = $('#series-label-text');
  const descEl = $('#series-label-desc');
  if (!tabsEl || !gridEl) return;

  let series = PRODUCTS_DATA.series;
  let activeId = 'all';

  async function syncProductsFromApi() {
    try {
      const res = await fetch('/api/products?_t=' + Date.now(), { cache: 'no-cache' });
      if (!res.ok) {
        console.warn('[EduBuds] /api/products responded with status:', res.status);
        return;
      }
      const json = await res.json();
      if (json && Array.isArray(json.series) && json.series.length > 0) {
        series = json.series;
        const gInfo = extractGradeInfo(series);
        window.__edubudsGradeInfo = gInfo;
        if (gInfo.islamicSeries) {
          gInfo.islamicSeries.tagline = `A complete curriculum — ${gInfo.rangeLabel}`;
        }
        renderTabs();
        renderGrid();
        applyFilter(activeId);
        updateLabel(activeId);
        $$('.book-card:not(.hidden)', gridEl).forEach(card => revealObserver.observe(card));
        // Cascade series data to rest of page
        updatePageFromSeries(series);
      }
    } catch (err) {
      console.warn('[EduBuds] Could not sync products from API, keeping offline catalogue:', err);
    }
  }

  /* ── Render Filter Tabs ─────────────────────────────── */
  function renderTabs() {
    tabsEl.innerHTML = '';

    // "All" tab
    const allBtn = document.createElement('button');
    allBtn.className = `filter-tab ${activeId === 'all' ? 'active' : ''}`;
    allBtn.textContent = 'All Books';
    allBtn.dataset.id = 'all';
    allBtn.setAttribute('role', 'tab');
    allBtn.setAttribute('aria-selected', activeId === 'all' ? 'true' : 'false');
    allBtn.addEventListener('click', () => setActive('all'));
    tabsEl.appendChild(allBtn);

    series.forEach(s => {
      const btn = document.createElement('button');
      btn.className = `filter-tab ${activeId === s.id ? 'active' : ''}`;
      btn.textContent = s.label;
      btn.dataset.id = s.id;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', activeId === s.id ? 'true' : 'false');
      btn.addEventListener('click', () => setActive(s.id));
      tabsEl.appendChild(btn);
    });
  }

  /* ── Update Series Label ────────────────────────────── */
  function updateLabel(id) {
    if (id === 'all') {
      dotEl.style.background = '#279447';
      textEl.textContent = 'All Books';
      descEl.textContent = 'Browse the complete EduBuds catalogue across all series.';
    } else {
      const s = series.find(x => x.id === id);
      if (!s) return;
      dotEl.style.background = s.color;
      textEl.textContent = s.label;
      descEl.textContent = s.tagline;
    }
    // Animate label in
    labelEl.classList.remove('visible');
    requestAnimationFrame(() => requestAnimationFrame(() => labelEl.classList.add('visible')));
  }

  /* ── Render All Book Cards ──────────────────────────── */
  function renderGrid() {
    gridEl.innerHTML = '';

    series.forEach(s => {
      s.books.forEach(book => {
        const card = buildCard(book, s);
        gridEl.appendChild(card);
      });
    });
  }

  /* ── Build Single Book Card ─────────────────────────── */
  function buildCard(book, series) {
    const card = document.createElement('div');
    card.className = 'book-card reveal';
    card.setAttribute('role', 'listitem');
    card.dataset.series = series.id;

    card.innerHTML = `
      <div class="book-card-cover">
        <img src="${book.image}" alt="${book.title}${book.subtitle ? ' — ' + book.subtitle : ''}" loading="lazy" onerror="this.onerror=null;this.src='/assets/placeholder-cover.svg';">
        <span class="book-series-badge" style="background:${series.color}">${series.label}</span>
      </div>
      <div class="book-card-body">
        <div class="book-card-title">${book.title}</div>
        ${book.subtitle ? `<div class="book-card-subtitle">${book.subtitle}</div>` : ''}
        <p class="book-card-desc">${book.description}</p>
      </div>
      <div class="book-card-footer">
        <a
          class="btn btn-whatsapp"
          href="${buildWhatsAppURL(book.whatsappMessage)}"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Enquire about ${book.title} on WhatsApp"
        >
          ${whatsappIcon()}
          Enquire on WhatsApp
        </a>
      </div>
    `;

    return card;
  }

  /* ── Filter Logic ────────────────────────────────────── */
  function applyFilter(id) {
    const cards = $$('.book-card', gridEl);
    cards.forEach(card => {
      const show = id === 'all' || card.dataset.series === id;
      card.classList.toggle('hidden', !show);
    });
  }

  /* ── Set Active Tab ──────────────────────────────────── */
  function setActive(id) {
    activeId = id;
    renderTabs();
    applyFilter(id);
    updateLabel(id);

    // Re-observe newly visible cards for reveal
    $$('.book-card:not(.hidden)', gridEl).forEach(card => {
      card.classList.remove('visible');
      revealObserver.observe(card);
    });
  }

  /* ── Reveal observer for cards ───────────────────────── */
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  /* ── Init ────────────────────────────────────────────── */
  renderTabs();
  renderGrid();
  applyFilter('all');
  updateLabel('all');

  // Observe initial cards
  $$('.book-card', gridEl).forEach(card => revealObserver.observe(card));

  // Expose global series switcher for hero float cards & navigation
  window.selectSeries = function (id) {
    setActive(id);
    const booksEl = document.getElementById('books');
    if (booksEl) {
      booksEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Immediate render from built-in series data (stats, trust pills, marquee, float cards)
  updatePageFromSeries(series);

  // Background fetch live series & books from API/DB
  syncProductsFromApi();
})();

/* ── Approach Section: Tree of Growth & Pathway Synergy ──── */
(function initApproachSynergy() {
  const treeSvg = document.querySelector('.tree-of-growth-svg');
  const pathwaySteps = document.querySelectorAll('.pathway-step');
  if (!treeSvg || !pathwaySteps.length) return;

  pathwaySteps.forEach((step) => {
    const stepNum = step.getAttribute('data-step');
    if (!stepNum) return;

    const setHighlight = () => {
      treeSvg.classList.remove('highlight-1', 'highlight-2', 'highlight-3');
      treeSvg.classList.add(`highlight-${stepNum}`);
    };

    const clearHighlight = () => {
      treeSvg.classList.remove(`highlight-${stepNum}`);
    };

    step.addEventListener('mouseenter', setHighlight);
    step.addEventListener('mouseleave', clearHighlight);
    step.addEventListener('focus', setHighlight);
    step.addEventListener('blur', clearHighlight);

    // Mobile / touch support: tap to highlight
    step.addEventListener('click', () => {
      const activeClass = `highlight-${stepNum}`;
      if (treeSvg.classList.contains(activeClass)) {
        treeSvg.classList.remove(activeClass);
      } else {
        treeSvg.classList.remove('highlight-1', 'highlight-2', 'highlight-3');
        treeSvg.classList.add(activeClass);
      }
    });
  });

  // Entrance animation observer
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const approach = $('#approach');
    if (approach && 'IntersectionObserver' in window) {
      let animated = false;
      const io = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !animated) {
            animated = true;
            treeSvg.classList.add('approach-in-view');
          }
        });
      }, { threshold: 0.25 });
      io.observe(approach);
    }
  }
})();

/* ── Newsletter form ──────────────────────────────────────── */
(function initNewsletter() {
  const form = $('#subscribe-form');
  const msg = $('#form-message');
  if (!form || !msg) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const honey = form.querySelector('#website');
    if (honey && honey.value) return;

    const email = form.querySelector('#email').value.trim();
    if (!email) return;

    const submitBtn = form.querySelector('.nl-submit');
    submitBtn.textContent = 'Sending…';
    submitBtn.disabled = true;

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        msg.textContent = '✓ You\'re in! We\'ll be in touch with the good stuff.';
        msg.style.color = '#8ddd82';
        form.querySelector('#email').value = '';
      } else {
        const body = await res.json().catch(() => ({}));
        msg.textContent = body.error || 'Something went wrong. Please try again.';
        msg.style.color = '#ef3e62';
      }
    } catch {
      msg.textContent = 'Could not connect. Please check your connection and try again.';
      msg.style.color = '#ef3e62';
    } finally {
      submitBtn.textContent = 'Keep me posted →';
      submitBtn.disabled = false;
    }
  });
})();

/* ── WhatsApp Icon SVG ────────────────────────────────────── */
function whatsappIcon() {
  return `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
  </svg>`;
}

/* ── FAQs Accordion ─────────────────────────────────────────
   Managed independently by /faq.js
   ─────────────────────────────────────────────────────────── */

/* ── Dynamic Site Content Hydration ───────────────────────── */
async function syncContentFromApi() {
  try {
    const res = await fetch('/api/content?_t=' + Date.now(), { cache: 'no-cache' });
    if (!res.ok) return;
    const json = await res.json();
    if (!json || !json.content) return;
    const c = json.content;

    // 1. Marquee
    if (c.marquee && Array.isArray(c.marquee.items) && c.marquee.items.length > 0) {
      const track = document.querySelector('.topline-track');
      if (track) {
        // Double for seamless infinite css scroll
        const duplicated = [...c.marquee.items, ...c.marquee.items];
        track.innerHTML = duplicated.map(item => `<span class="topline-item">${item} <span class="dot"></span></span>`).join('');
      }
    }

    // 2. Hero
    if (c.hero) {
      const heroH1 = document.querySelector('.hero-copy h1');
      if (heroH1 && c.hero.heading) heroH1.innerHTML = c.hero.heading;
      const heroP = document.querySelector('.hero-copy p');
      if (heroP && c.hero.lead) heroP.textContent = c.hero.lead;
      const heroEyebrow = document.querySelector('.hero-copy .eyebrow');
      if (heroEyebrow && c.hero.eyebrow) {
        heroEyebrow.innerHTML = `<span class="mark">✳</span> ${escapeHTML(c.hero.eyebrow)}`;
      }
      if (c.hero.trustPills && Array.isArray(c.hero.trustPills)) {
        const trustWrap = document.querySelector('.hero-trust');
        if (trustWrap) {
          trustWrap.innerHTML = c.hero.trustPills
            .map(p => `<span class="trust-pill"><span class="dot"></span> ${escapeHTML(p)}</span>`)
            .join('');
        }
      }
    }

    // 3. Stats
    if (c.stats) {
      const statItems = document.querySelectorAll('.stats-bar .stat-item');
      const statsKeys = [
        { num: c.stats.stat1Num, label: c.stats.stat1Label },
        { num: c.stats.stat2Num, label: c.stats.stat2Label },
        { num: c.stats.stat3Num, label: c.stats.stat3Label },
        { num: c.stats.stat4Num, label: c.stats.stat4Label },
      ];
      statItems.forEach((el, idx) => {
        const pair = statsKeys[idx];
        if (pair && pair.num !== undefined) {
          const numEl = el.querySelector('.stat-num');
          const labelEl = el.querySelector('.stat-label');
          if (numEl) {
            setStatCounterValue(numEl, pair.num);
          }
          if (labelEl && pair.label) labelEl.textContent = pair.label;
        }
      });
    }

    // 4. Curriculum
    if (c.curriculum) {
      const curEye = document.querySelector('#curriculum .eyebrow');
      if (curEye && c.curriculum.eyebrow) curEye.innerHTML = `<span class="mark">✳</span> ${escapeHTML(c.curriculum.eyebrow)}`;
      const curHead = document.querySelector('#curriculum-heading');
      if (curHead && c.curriculum.heading) curHead.innerHTML = c.curriculum.heading;
      const curLead = document.querySelector('#curriculum .section-head > p');
      if (curLead && c.curriculum.lead) curLead.textContent = c.curriculum.lead;

      if (Array.isArray(c.curriculum.strands)) {
        const strandCards = document.querySelectorAll('.strand-card');
        strandCards.forEach((card, idx) => {
          const st = c.curriculum.strands[idx];
          if (!st) return;
          const nameEl = card.querySelector('.strand-name');
          const descEl = card.querySelector('.strand-desc');
          if (nameEl && st.name) nameEl.textContent = st.name;
          if (descEl && st.desc) descEl.textContent = st.desc;
        });
      }
    }

    // 5. Approach (Our Educational Purpose)
    if (c.approach) {
      const appEye = document.querySelector('.approach-copy .eyebrow');
      if (appEye && c.approach.eyebrow) appEye.innerHTML = `<span class="mark">✳</span> ${escapeHTML(c.approach.eyebrow)}`;
      const appHead = document.querySelector('#approach-heading');
      if (appHead && c.approach.heading) appHead.innerHTML = c.approach.heading;
      const appLead = document.querySelector('.approach-copy > p');
      if (appLead && c.approach.lead) appLead.textContent = c.approach.lead;

      if (Array.isArray(c.approach.pillars)) {
        const steps = document.querySelectorAll('.pathway-step');
        steps.forEach((step, idx) => {
          const pil = c.approach.pillars[idx];
          if (!pil) return;
          const titleEl = step.querySelector('.step-title');
          const descEl = step.querySelector('.step-desc');
          if (titleEl && pil.title) titleEl.textContent = pil.title;
          if (descEl && pil.desc) descEl.textContent = pil.desc;
        });
      }
    }

    // 6. Parents & Educators
    if (c.parents) {
      const parEye = document.querySelector('.parent-copy .eyebrow');
      if (parEye && c.parents.eyebrow) parEye.innerHTML = `<span class="mark">✳</span> ${escapeHTML(c.parents.eyebrow)}`;
      const parHead = document.querySelector('#parents-heading');
      if (parHead && c.parents.heading) parHead.innerHTML = c.parents.heading;
      const parLead = document.querySelector('.parent-copy > p');
      if (parLead && c.parents.lead) parLead.textContent = c.parents.lead;

      if (Array.isArray(c.parents.cards)) {
        const cards = document.querySelectorAll('.parent-card');
        cards.forEach((card, idx) => {
          const item = c.parents.cards[idx];
          if (!item) return;
          const h3 = card.querySelector('h3');
          const p = card.querySelector('p');
          if (h3 && item.title) h3.textContent = item.title;
          if (p && item.body) p.textContent = item.body;
        });
      }
    }

    if (window.__edubudsGradeInfo) {
      applyDynamicGradesToDOM(window.__edubudsGradeInfo);
    }
  } catch {
    // Offline resilience: keep static HTML
  }
}
syncContentFromApi();

/* ── Dynamic Grade Info Extractor & DOM Hydrator ──────────── */
function extractGradeInfo(seriesData) {
  if (!seriesData || !Array.isArray(seriesData)) {
    return {
      minGrade: 1,
      maxGrade: 8,
      gradeCount: 10,
      gradeCountWord: 'ten',
      hasPrePrimer: true,
      prePrimerCount: 2,
      rangeLabel: 'Pre-Primer – Grade 8',
      rangeText: 'Pre-Primer to Grade 8',
      rangeThrough: 'Pre-Primer through Grade 8',
      statsLabel: 'Learning + Grade Levels',
      islamicSeries: null,
      orderedBooks: [],
    };
  }

  const islamicSeries = seriesData.find(s => s.id === 'islamic-studies') ||
    seriesData.find(s => /islamic\s*studies/i.test(s.label || '')) ||
    seriesData[0];

  const rawBooks = (islamicSeries && Array.isArray(islamicSeries.books)) ? islamicSeries.books : [];
  const gradeBooks = [...rawBooks].sort((a, b) => {
    const idxA = a.order_index ?? a.orderIndex ?? 0;
    const idxB = b.order_index ?? b.orderIndex ?? 0;
    return idxA - idxB;
  });

  const gradeNumbers = [];
  let prePrimerCount = 0;

  gradeBooks.forEach(b => {
    const str = `${b.subtitle || ''} ${b.title || ''} ${b.id || ''}`;
    if (/pre[-_\s]*primer/i.test(str)) {
      prePrimerCount++;
    } else {
      const m = str.match(/grade[-_\s]*(\d+)/i);
      if (m) gradeNumbers.push(parseInt(m[1], 10));
    }
  });

  const hasPrePrimer = prePrimerCount > 0;
  const minGrade = gradeNumbers.length > 0 ? Math.min(...gradeNumbers) : 1;
  const maxGrade = gradeNumbers.length > 0 ? Math.max(...gradeNumbers) : (gradeBooks.length || 8);
  const gradeCount = gradeBooks.length || (hasPrePrimer ? prePrimerCount + maxGrade : (maxGrade - minGrade + 1));

  const numWords = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen'];
  const gradeCountWord = numWords[gradeCount] || String(gradeCount);

  const rangeLabel = hasPrePrimer ? `Pre-Primer – Grade ${maxGrade}` : `Grades ${minGrade}–${maxGrade}`;
  const rangeText = hasPrePrimer ? `Pre-Primer to Grade ${maxGrade}` : `Grade ${minGrade} to Grade ${maxGrade}`;
  const rangeThrough = hasPrePrimer ? `Pre-Primer through Grade ${maxGrade}` : `Grade ${minGrade} through Grade ${maxGrade}`;
  const statsLabel = 'Learning + Grade Levels';

  return {
    minGrade,
    maxGrade,
    gradeCount,
    gradeCountWord,
    hasPrePrimer,
    prePrimerCount,
    rangeLabel,
    rangeText,
    rangeThrough,
    statsLabel,
    islamicSeries,
    orderedBooks: gradeBooks,
  };
}

// Pre-initialize global grade info from inline data
window.__edubudsGradeInfo = extractGradeInfo(PRODUCTS_DATA.series);

function applyDynamicGradesToDOM(info) {
  if (!info) return;
  const { minGrade, maxGrade, gradeCount, gradeCountWord, hasPrePrimer, prePrimerCount, rangeLabel, rangeText, rangeThrough, statsLabel, islamicSeries, orderedBooks } = info;

  // 1. Stats bar: grade levels counter
  const statItems = document.querySelectorAll('.stats-bar .stat-item');
  if (statItems[0]) {
    const numEl = statItems[0].querySelector('.stat-num');
    const labEl = statItems[0].querySelector('.stat-label');
    if (numEl) {
      setStatCounterValue(numEl, gradeCount);
    }
    if (labEl) labEl.textContent = statsLabel;
  }

  // 2. Hero Trust Pills
  const trustPills = document.querySelectorAll('.hero-trust .trust-pill');
  trustPills.forEach(pill => {
    if (/GRADES|PRE-PRIMER|LEVELS/i.test(pill.textContent)) {
      const dot = pill.querySelector('.dot');
      pill.textContent = '';
      if (dot) pill.appendChild(dot);
      pill.append(` ${rangeLabel.toUpperCase()}`);
    }
  });

  // 3. Topline Marquee
  const track = document.querySelector('.topline-track');
  if (track) {
    track.querySelectorAll('.topline-item').forEach(item => {
      item.innerHTML = item.innerHTML
        .replace(/(?:Grades?\s*\d+\s*(?:–|-|to)\s*\d+|Pre-Primer\s*(?:–|-|to)\s*Grade\s*\d+)/gi, rangeLabel);
    });
  }

  // 4. Hero Lead Description
  const heroDesc = document.querySelector('.hero-copy p');
  if (heroDesc) {
    if (hasPrePrimer) {
      heroDesc.innerHTML = heroDesc.innerHTML
        .replace(/(?:Grade\s*1|from\s+Grade\s*\d+|from\s+Pre-Primer)\s+all\s+the\s+way\s+to\s+Grade\s*\d+/gi, `from Pre-Primer all the way to Grade ${maxGrade}`)
        .replace(/(?:Grades?\s*\d+\s*(?:–|-|to)\s*\d+|Pre-Primer\s*(?:–|-|to)\s*Grade\s*\d+)/gi, rangeLabel);
    } else {
      heroDesc.innerHTML = heroDesc.innerHTML
        .replace(/(?:Grade\s*1|from\s+Grade\s*\d+)\s+all\s+the\s+way\s+to\s+Grade\s*\d+/gi, `from Grade ${minGrade} all the way to Grade ${maxGrade}`)
        .replace(/Grades?\s*\d+\s*(?:–|-|to)\s*\d+/gi, rangeLabel);
    }
  }

  // 5. Curriculum Section Lead & Journey Headline
  const curLead = document.querySelector('#curriculum .section-head > p');
  if (curLead) {
    const levelDescriptor = hasPrePrimer ? `${gradeCountWord} learning levels` : `${gradeCountWord} grades`;
    curLead.innerHTML = curLead.innerHTML
      .replace(/Across\s+all\s+(?:nine|seven|eight|ten|\d+)\s+(?:grades|learning levels)/gi, `Across all ${levelDescriptor}`)
      .replace(/Across\s+all\s+\w+\s+(?:grades|learning levels)/gi, `Across all ${levelDescriptor}`);
  }

  const journeyHead = document.querySelector('.grade-journey-copy h3');
  if (journeyHead) {
    journeyHead.textContent = `From ${rangeText}.`;
  }

  // 6. Grade Journey Orbs
  const orbsContainer = document.querySelector('.grade-orbs');
  if (orbsContainer) {
    orbsContainer.setAttribute('aria-label', `Learning levels: ${rangeLabel}`);
    orbsContainer.innerHTML = '';

    if (orderedBooks && orderedBooks.length > 0) {
      orderedBooks.forEach(b => {
        const str = `${b.subtitle || ''} ${b.title || ''} ${b.id || ''}`;
        const orb = document.createElement('span');
        orb.className = 'grade-orb';

        const ppMatch = str.match(/pre[-_\s]*primer\s*(\d*)/i);
        const grMatch = str.match(/grade[-_\s]*(\d+)/i);

        if (ppMatch) {
          const num = ppMatch[1] || '';
          orb.textContent = `PP${num}`;
          orb.classList.add('grade-orb-foundation');
          orb.title = b.subtitle || `Pre-Primer ${num}`.trim();
        } else if (grMatch) {
          orb.textContent = grMatch[1];
          orb.title = b.subtitle || `Grade ${grMatch[1]}`;
        } else {
          orb.textContent = b.subtitle || b.title;
          orb.title = b.title;
        }
        orbsContainer.appendChild(orb);
      });
    } else {
      if (hasPrePrimer) {
        for (let p = 1; p <= (prePrimerCount || 2); p++) {
          const orb = document.createElement('span');
          orb.className = 'grade-orb grade-orb-foundation';
          orb.textContent = `PP${p}`;
          orb.title = `Pre-Primer ${p}`;
          orbsContainer.appendChild(orb);
        }
      }
      for (let g = minGrade; g <= maxGrade; g++) {
        const orb = document.createElement('span');
        orb.className = 'grade-orb';
        orb.textContent = g;
        orb.title = `Grade ${g}`;
        orbsContainer.appendChild(orb);
      }
    }
  }

  // 7. Books Section Tagline (when Islamic Studies is selected or loaded)
  if (islamicSeries) {
    islamicSeries.tagline = `A complete curriculum — ${rangeLabel}`;
    const descEl = document.getElementById('series-label-desc');
    const textEl = document.getElementById('series-label-text');
    if (descEl && textEl && /islamic/i.test(textEl.textContent)) {
      descEl.textContent = islamicSeries.tagline;
    }
  }

  // 8. Approach Section Milestone Seal & Pillars
  const approachSeal = document.querySelector('.approach-seal small');
  if (approachSeal) {
    approachSeal.textContent = `A Connected Continuum across ${rangeLabel}`;
  }
  const pathwaySteps = document.querySelectorAll('.pathway-step .step-desc');
  pathwaySteps.forEach(p => {
    const levelDescriptor = hasPrePrimer ? `${gradeCountWord} learning levels` : `${gradeCountWord} grades`;
    p.innerHTML = p.innerHTML
      .replace(/across\s+(?:nine|seven|eight|ten|\d+)\s+(?:grades|learning levels)/gi, `across ${levelDescriptor}`)
      .replace(/across\s+\w+\s+(?:grades|learning levels)/gi, `across ${levelDescriptor}`);
  });

  // 9. Parents & Educators Section Card 01
  const parentCards = document.querySelectorAll('.parent-cards .parent-card p');
  parentCards.forEach(p => {
    p.innerHTML = p.innerHTML
      .replace(/(?:Grade\s*1|from\s+Grade\s*\d+|Pre-Primer)\s+through\s+Grade\s*\d+/gi, rangeThrough)
      .replace(/(?:Grades?\s*\d+\s*(?:–|-|to)\s*\d+|Pre-Primer\s*(?:–|-|to)\s*Grade\s*\d+)/gi, rangeLabel);
  });

  // 10. Footer Tagline
  const footerTagline = document.querySelector('.footer-tagline');
  if (footerTagline) {
    footerTagline.innerHTML = footerTagline.innerHTML
      .replace(/(?:Grades?\s*\d+\s*(?:–|-|to)\s*\d+|Pre-Primer\s*(?:–|-|to)\s*Grade\s*\d+)/gi, rangeLabel);
  }
}

// Initial hydration on page boot
applyDynamicGradesToDOM(window.__edubudsGradeInfo);

/* ── Dynamic Page Cascade from Series Data ───────────────────────────
   Called after products are fetched from the API.
   Updates every section that depends on how many series / books exist.
   ─────────────────────────────────────────────────────────────────── */
function updatePageFromSeries(seriesData) {
  if (!seriesData || !Array.isArray(seriesData) || seriesData.length === 0) return;

  const totalSeries = seriesData.length;
  const totalBooks = seriesData.reduce((sum, s) => sum + (s.books ? s.books.length : 0), 0);

  // Derive dynamic grade metrics from the live Islamic Studies catalogue
  const gradeInfo = extractGradeInfo(seriesData);
  window.__edubudsGradeInfo = gradeInfo;

  /* 1 — Stats bar: update "Learning + Grade Levels" and "Book series" count ---- */
  const statItems = $$('.stats-bar .stat-item');
  if (statItems[0]) {
    const numEl = statItems[0].querySelector('.stat-num');
    const labEl = statItems[0].querySelector('.stat-label');
    if (numEl) {
      setStatCounterValue(numEl, gradeInfo.gradeCount);
    }
    if (labEl) labEl.textContent = gradeInfo.statsLabel;
  }
  if (statItems[1]) {
    const numEl = statItems[1].querySelector('.stat-num');
    const labEl = statItems[1].querySelector('.stat-label');
    if (numEl) {
      setStatCounterValue(numEl, totalSeries);
    }
    if (labEl) labEl.textContent = 'Book series';
  }

  /* 2 — Trust pills: update series count and grade range ----------- */
  const trustPills = $$('.hero-trust .trust-pill');
  trustPills.forEach(pill => {
    const text = pill.textContent.trim();
    if (/SERIES/i.test(text)) {
      const dot = pill.querySelector('.dot');
      pill.textContent = '';
      if (dot) pill.appendChild(dot);
      pill.append(' ' + totalSeries + ' SERIES');
    } else if (/GRADES|PRE-PRIMER|LEVELS/i.test(text)) {
      const dot = pill.querySelector('.dot');
      pill.textContent = '';
      if (dot) pill.appendChild(dot);
      pill.append(' ' + gradeInfo.rangeLabel.toUpperCase());
    }
  });

  /* 3 — Topline marquee: inject dynamic grades and series names --- */
  const track = document.querySelector('.topline-track');
  if (track) {
    const seriesNames = seriesData.map(s => s.label).join(' \u00b7 ');
    const items = [
      '\u2736 \u00a0 A complete Islamic Studies programme for growing minds',
      `${gradeInfo.rangeLabel} \u00a0\u2022\u00a0 ${totalSeries} Series \u00a0\u2022\u00a0 One connected journey`,
      seriesNames,
      'Knowledge \u00b7 Practice \u00b7 Character',
    ];
    // Double for seamless loop
    const doubled = [...items, ...items];
    track.innerHTML = doubled
      .map(t => '<span class="topline-item">' + t + ' <span class="dot"></span></span>')
      .join('');
  }

  /* 4 — Comprehensive dynamic DOM grade hydration ----------------- */
  applyDynamicGradesToDOM(gradeInfo);

  /* 5 — Hero float cards: dynamically render ALL series around hero logo */
  renderHeroFloatCards(seriesData);
}

function renderHeroFloatCards(seriesData) {
  const container = document.getElementById('hero-float-cards');
  if (!container) return;

  if (floatRotateTimer) {
    clearInterval(floatRotateTimer);
    floatRotateTimer = null;
  }

  const positions = ['float-card-1', 'float-card-2', 'float-card-3', 'float-card-4'];

  function cleanSub(s) {
    if (s.id === 'islamic-studies' || /islamic\s*studies/i.test(s.label || '')) {
      const gInfo = window.__edubudsGradeInfo || extractGradeInfo(seriesData);
      const bCount = (s.books && s.books.length > 0) ? (s.books.length === 1 ? '1 book' : `${s.books.length} books`) : `${gInfo ? gInfo.gradeCount : 10} books`;
      const rLabel = gInfo ? gInfo.rangeLabel : 'Pre-Primer – Grade 8';
      return `${rLabel} · ${bCount}`;
    }
    if (s.books && s.books.length > 0) {
      const bCount = s.books.length === 1 ? '1 book' : `${s.books.length} books`;
      if (s.tagline) {
        const shortTag = s.tagline.split('—')[0].trim();
        return shortTag.length < 24 ? `${shortTag} · ${bCount}` : bCount;
      }
      return bCount;
    }
    if (s.tagline) {
      return s.tagline.split('—')[0].trim();
    }
    return 'Curriculum Series';
  }

  function createCard(s, slotIdx) {
    const card = document.createElement('div');
    card.className = `float-card ${positions[slotIdx] || 'float-card-1'}`;
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');
    card.setAttribute('title', `Explore ${s.label}`);
    card.setAttribute('aria-label', `Explore ${s.label}`);
    card.dataset.series = s.id;

    const subText = cleanSub(s);
    const accentColor = s.color || 'var(--blue)';

    card.innerHTML = `
      <span class="fc-dot" style="background:${accentColor};color:${accentColor}"></span>
      <div class="fc-content">
        <div class="fc-title">${escapeHTML(s.label)}</div>
        <div class="fc-sub">${escapeHTML(subText)}</div>
      </div>
    `;

    // Click & keyboard activation: filter catalog and scroll smoothly
    const handleActivate = () => {
      if (typeof window.selectSeries === 'function') {
        window.selectSeries(s.id);
      } else {
        const target = document.querySelector('#books');
        if (target) target.scrollIntoView({ behavior: 'smooth' });
      }
    };

    card.addEventListener('click', handleActivate);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleActivate();
      }
    });

    return card;
  }

  // If 4 or fewer series: show all of them simultaneously in orbital positions
  if (seriesData.length <= 4) {
    container.innerHTML = '';
    seriesData.forEach((s, idx) => {
      container.appendChild(createCard(s, idx));
    });
    return;
  }

  // If > 4 series: display 3 active slots and smoothly rotate through the series list every 5s
  let offset = 0;
  function updateSlots() {
    container.innerHTML = '';
    for (let slot = 0; slot < 3; slot++) {
      const sIdx = (offset + slot) % seriesData.length;
      container.appendChild(createCard(seriesData[sIdx], slot));
    }
    offset = (offset + 1) % seriesData.length;
  }

  updateSlots();
  floatRotateTimer = setInterval(updateSlots, 5000);
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}