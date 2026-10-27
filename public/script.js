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

/* ── Remote Settings Loader ─────────────────────────────── */
async function loadRemoteSettings() {
  try {
    const res = await fetch('/api/settings');
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

function buildWhatsAppURL(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}

/* ── Year ────────────────────────────────────────────────── */
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ── Theme Toggle ────────────────────────────────────────── */
(function initTheme() {
  const html = document.documentElement;
  const toggle = $('#theme-toggle');
  const STORAGE = 'edubuds-theme';

  const saved = localStorage.getItem(STORAGE);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const initial = saved || (prefersDark ? 'dark' : 'light');

  html.dataset.theme = initial;

  toggle && toggle.addEventListener('click', () => {
    const next = html.dataset.theme === 'dark' ? 'light' : 'dark';
    html.dataset.theme = next;
    localStorage.setItem(STORAGE, next);
  });
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
(function initReveal() {
  const els = $$('.reveal');
  if (!els.length) return;

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => io.observe(el));
})();

/* ── Animated Counter ────────────────────────────────────── */
(function initCounters() {
  const counters = $$('[data-count]');
  if (!counters.length) return;

  function animateCount(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1200;
    const start = performance.now();

    function step(now) {
      const progress = Math.min((now - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
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
      tagline: 'A complete curriculum — Grades 1 to 9',
      description: 'A carefully structured Islamic Studies programme that grows with the learner.',
      color: '#0878c9', colorLight: '#e7f2ff',
      books: [
        { id: 'is-grade-1', title: 'Islamic Studies', subtitle: 'Grade 1', image: '/assets/Resource/39 Grade 1.png', description: 'The foundation year — introducing children to belief, practice, and the beauty of being Muslim through age-appropriate stories and activities.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds Islamic Studies Grade 1 book. Could you please share details on pricing, availability, and how to place an order?' },
        { id: 'is-grade-2', title: 'Islamic Studies', subtitle: 'Grade 2', image: '/assets/Resource/39 Grade 2.png', description: 'Building on Year 1, Grade 2 deepens understanding of worship, manners, and selected du\'as with engaging lessons suited to the growing learner.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds Islamic Studies Grade 2 book. Could you please share details on pricing, availability, and how to place an order?' },
        { id: 'is-grade-3', title: 'Islamic Studies', subtitle: 'Grade 3', image: '/assets/Resource/39 Grade 3.png', description: 'Grade 3 introduces richer Qur\'anic understanding, prophetic biographies, and a stronger lens on character and Islamic etiquettes.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds Islamic Studies Grade 3 book. Could you please share details on pricing, availability, and how to place an order?' },
        { id: 'is-grade-4', title: 'Islamic Studies', subtitle: 'Grade 4', image: '/assets/Resource/39 Grade 4.png', description: 'Grade 4 marks a pivotal year — students engage with deeper aspects of creed, history, and the Qur\'an, preparing them for the middle years.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds Islamic Studies Grade 4 book. Could you please share details on pricing, availability, and how to place an order?' },
        { id: 'is-grades-5-9', title: 'Islamic Studies', subtitle: 'Grades 5–9', image: '/assets/Resource/Grade 1 Cover.jpg', description: 'The complete upper curriculum — Grades 5 through 9 continue to build a well-rounded Islamic identity, preparing young Muslims for adulthood with knowledge, practice, and character.', whatsappMessage: 'Assalamu Alaikum! I am interested in enquiring about the EduBuds Islamic Studies books for Grades 5 to 9. Could you please share details on availability and how to place an order?' },
      ]
    },
    {
      id: 'prophet-stories',
      label: 'Prophet Stories Series',
      tagline: '10 illustrated storybooks — Prophets Sent by Allah',
      description: 'A set of ten beautifully illustrated storybooks, each bringing to life the story of a Prophet sent by Allah.',
      color: '#279447', colorLight: '#e5f5e5',
      books: [
        { id: 'ps-box-english', title: 'Prophets Sent by Allah', subtitle: 'Complete Box Set — English', image: '/assets/Resource/29 Prophet series box - English1.png', description: 'The complete collection — all 10 Prophet storybooks in a beautiful box set. Perfect as a gift or for the home library. Available in English.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds Prophet Stories Box Set (English). Could you please share details on pricing, availability, and delivery?' },
        { id: 'ps-box-roman', title: 'Prophets Sent by Allah', subtitle: 'Complete Box Set — Roman Urdu', image: '/assets/Resource/29 Prophet series box - Roman1.png', description: 'The complete collection in Roman Urdu — all 10 Prophet storybooks in a beautiful box set. Accessible to Urdu-speaking families who read in Roman script.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds Prophet Stories Box Set (Roman Urdu). Could you please share details on pricing, availability, and delivery?' },
        { id: 'ps-box-urdu', title: 'Prophets Sent by Allah', subtitle: 'Complete Box Set — Urdu', image: '/assets/Resource/29 Prophet series box - Urdu.png', description: 'The complete collection in Urdu — all 10 Prophet storybooks in a beautiful box set for Urdu-speaking families.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds Prophet Stories Box Set (Urdu). Could you please share details on pricing, availability, and delivery?' },
        { id: 'ps-adam', title: 'The Story of Adam', subtitle: 'عليه السلام', image: '/assets/Resource/29 Adam (AS)-02.png', description: 'The story of the first human being and first Prophet — Adam (AS). A gentle and meaningful introduction to creation, trust, and returning to Allah.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds storybook \'The Story of Adam (AS)\'. Could you please share details on pricing and availability?' },
        { id: 'ps-nooh', title: 'The Story of Nooh', subtitle: 'عليه السلام', image: '/assets/Resource/29 Nooh (AS)-02.png', description: 'The extraordinary story of Prophet Nooh (AS) — patience, conviction, and trust in Allah against all odds.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds storybook \'The Story of Nooh (AS)\'. Could you please share details on pricing and availability?' },
        { id: 'ps-hood', title: 'The Story of Hood', subtitle: 'عليه السلام', image: '/assets/Resource/29 Hood (AS)-02.png', description: 'The story of Prophet Hood (AS) and the people of \'Aad — a powerful reminder of gratitude, humility, and the consequences of turning away from guidance.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds storybook \'The Story of Hood (AS)\'. Could you please share details on pricing and availability?' },
        { id: 'ps-musa', title: 'The Story of Musa', subtitle: 'عليه السلام', image: '/assets/Resource/29 Musa (AS)-02.png', description: 'One of the greatest stories in the Qur\'an — Prophet Musa (AS), Fir\'awn, and the miracles of Allah. Brought to life with vivid illustrations.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds storybook \'The Story of Musa (AS)\'. Could you please share details on pricing and availability?' },
        { id: 'ps-yusuf', title: 'The Story of Yusuf', subtitle: 'عليه السلام', image: '/assets/Resource/29 Yusuf (AS)-02.png', description: 'The most beautiful of stories — Prophet Yusuf (AS). A tale of patience, character, and the plan of Allah unfolding in the most unexpected ways.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds storybook \'The Story of Yusuf (AS)\'. Could you please share details on pricing and availability?' },
        { id: 'ps-loot', title: 'The Story of Loot', subtitle: 'عليه السلام', image: '/assets/Resource/29 Loot (AS)-02.png', description: 'The story of Prophet Loot (AS) — a reminder of moral clarity, steadfastness in truth, and trust in Allah\'s plan even when alone.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds storybook \'The Story of Loot (AS)\'. Could you please share details on pricing and availability?' },
        { id: 'ps-ayyub-yunus', title: 'The Story of Ayyub & Yunus', subtitle: 'عليهما السلام', image: '/assets/Resource/29 Ayyub and Yunus (AS)-02.png', description: 'Two remarkable stories of patience and repentance — Prophet Ayyub (AS) and Prophet Yunus (AS) — told side by side with wisdom and warmth.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds storybook \'The Story of Ayyub and Yunus (AS)\'. Could you please share details on pricing and availability?' },
        { id: 'ps-isa', title: 'The Story of Isa', subtitle: 'عليه السلام', image: '/assets/Resource/29 Isa AS - Cover-02.png', description: 'The remarkable story of Prophet Isa (AS) — his miraculous birth, his message, and his honoured place in Islam. A must-read for every Muslim child.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds storybook \'The Story of Isa (AS)\'. Could you please share details on pricing and availability?' },
      ]
    },
    {
      id: 'hadith-collection',
      label: '20 Hadith Collection',
      tagline: '20 essential ahadith for growing Muslims',
      description: 'Twenty carefully selected ahadith presented in a child-friendly format — Arabic, transliteration, translation, vocabulary, explanation, and an activity.',
      color: '#ffc20e', colorLight: '#fff3c9',
      books: [
        { id: 'hc-poster-set', title: '20 Hadith for Kids', subtitle: 'Full Poster & Lesson Set', image: '/assets/Resource/20 hadith.png', description: 'Twenty essential ahadith as beautiful, classroom-ready posters with Arabic, transliteration, translation, explanation, and activities built in. Ideal for homes, madrasahs, and Islamic schools.', whatsappMessage: 'Assalamu Alaikum! I am interested in ordering the EduBuds \'20 Hadith for Kids\' collection. Could you please share details on pricing, format options, and availability?' },
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
      const res = await fetch('/api/products');
      if (!res.ok) return;
      const json = await res.json();
      if (json && Array.isArray(json.series) && json.series.length > 0) {
        series = json.series;
        renderTabs();
        renderGrid();
        applyFilter(activeId);
        updateLabel(activeId);
        $$('.book-card:not(.hidden)', gridEl).forEach(card => revealObserver.observe(card));
      }
    } catch {
      // Offline fallback: series already rendered
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
      descEl.textContent = 'Browse the complete EduBuds catalogue across all three series.';
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
        <img src="${book.image}" alt="${book.title}${book.subtitle ? ' — ' + book.subtitle : ''}" loading="lazy">
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

  // Background fetch live series & books from API/DB
  syncProductsFromApi();
})();

/* ── Sprout animation trigger ─────────────────────────────── */
(function initSprout() {
  const stem = $('#sprout-stem');
  if (!stem) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Reset animation when approach section scrolls into view
  const approach = $('#approach');
  if (!approach) return;

  let played = false;
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !played) {
        played = true;
        // Restart CSS animation
        stem.style.animation = 'none';
        stem.offsetHeight; // reflow
        stem.style.animation = '';
      }
    });
  }, { threshold: 0.3 });

  io.observe(approach);
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

/* ── FAQs Accordion ───────────────────────────────────────── */
(function initFaqs() {
  const faqList = $('#faq-list');
  if (!faqList) return;

  function bindTriggers(container) {
    const items = container.querySelectorAll('.faq-item');
    items.forEach(item => {
      const trigger = item.querySelector('.faq-trigger');
      if (!trigger || trigger.dataset.bound) return;
      trigger.dataset.bound = 'true';

      trigger.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');

        // Optional: close siblings for clean single-open accordion
        items.forEach(sibling => {
          if (sibling !== item) {
            sibling.classList.remove('active');
            const sibTrigger = sibling.querySelector('.faq-trigger');
            if (sibTrigger) sibTrigger.setAttribute('aria-expanded', 'false');
          }
        });

        item.classList.toggle('active', !isOpen);
        trigger.setAttribute('aria-expanded', String(!isOpen));
      });
    });
  }

  // Bind initial static items
  bindTriggers(faqList);

  // Background fetch live FAQs from /api/faqs
  async function syncFaqsFromApi() {
    try {
      const res = await fetch('/api/faqs');
      if (!res.ok) return;
      const json = await res.json();
      if (!json || !Array.isArray(json.faqs) || json.faqs.length === 0) return;

      faqList.innerHTML = '';
      json.faqs.forEach((faq, idx) => {
        const article = document.createElement('article');
        article.className = 'faq-item reveal';
        article.innerHTML = `
          <button class="faq-trigger" aria-expanded="false" aria-controls="faq-live-ans-${faq.id || idx}">
            <span>${escapeHTML(faq.question)}</span>
            <div class="faq-icon-wrap" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </div>
          </button>
          <div class="faq-panel" id="faq-live-ans-${faq.id || idx}">
            <p>${escapeHTML(faq.answer)}</p>
          </div>
        `;
        faqList.appendChild(article);
      });

      bindTriggers(faqList);
    } catch {
      // Offline fallback: static HTML FAQs remain active
    }
  }

  syncFaqsFromApi();

  // Wire FAQ CTA action buttons
  const faqWaCta = $('#faq-wa-cta');
  if (faqWaCta) {
    faqWaCta.href = buildWhatsAppURL('Assalamu Alaikum! I have a question regarding the EduBuds curriculum and book orders.');
  }
  const faqMailCta = $('#faq-mail-cta');
  if (faqMailCta) {
    faqMailCta.href = `mailto:${CONTACT_EMAIL}`;
  }
})();

/* ── Dynamic Site Content Hydration ───────────────────────── */
async function syncContentFromApi() {
  try {
    const res = await fetch('/api/content');
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
            numEl.dataset.count = pair.num;
            numEl.textContent = pair.num;
          }
          if (labelEl && pair.label) labelEl.textContent = pair.label;
        }
      });
    }

    // 4. Curriculum
    if (c.curriculum) {
      const curHead = document.querySelector('#curriculum-heading');
      if (curHead && c.curriculum.heading) curHead.innerHTML = c.curriculum.heading;
      const curLead = document.querySelector('#curriculum .section-head > p');
      if (curLead && c.curriculum.lead) curLead.textContent = c.curriculum.lead;
    }

    // 5. Approach
    if (c.approach) {
      const appHead = document.querySelector('#approach-heading');
      if (appHead && c.approach.heading) appHead.innerHTML = c.approach.heading;
      const appLead = document.querySelector('.approach-copy > p');
      if (appLead && c.approach.lead) appLead.textContent = c.approach.lead;
    }

    // 6. Parents
    if (c.parents) {
      const parHead = document.querySelector('#parents-heading');
      if (parHead && c.parents.heading) parHead.innerHTML = c.parents.heading;
      const parLead = document.querySelector('.parent-copy > p');
      if (parLead && c.parents.lead) parLead.textContent = c.parents.lead;
    }
  } catch {
    // Offline resilience: keep static HTML
  }
}
syncContentFromApi();

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}