/* ═══════════════════════════════════════════════════════
   EduBuds — faq.js
   Self-contained, independent FAQ accordion component.
   Works with static HTML out of the box and gracefully
   hydrates from /api/faqs when available.
   ═══════════════════════════════════════════════════════ */

(function () {
  'use strict';

  const DEFAULT_WA_NUMBER = '919222315006';
  const DEFAULT_EMAIL = 'support@edubuds.in';
  const DEFAULT_WA_MESSAGE =
    'Assalamu Alaikum! I have a question regarding the EduBuds curriculum and book orders.';

  function escapeHTML(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function buildWhatsAppURL(number, message) {
    const cleanNum = String(number || DEFAULT_WA_NUMBER).replace(/\D/g, '') || DEFAULT_WA_NUMBER;
    return `https://wa.me/${cleanNum}?text=${encodeURIComponent(message)}`;
  }

  function observeRevealItems(container) {
    const items = container.querySelectorAll('.faq-item.reveal');
    if (!items.length) return;

    const markVisible = (el) => el.classList.add('visible');

    if (!('IntersectionObserver' in window)) {
      items.forEach(markVisible);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            markVisible(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: '0px 0px -20px 0px' }
    );

    const vh = window.innerHeight || document.documentElement.clientHeight;
    items.forEach((el) => {
      const rect = el.getBoundingClientRect();
      // Immediately reveal if already in or above the viewport
      if (rect.top < vh) {
        markVisible(el);
      } else {
        observer.observe(el);
      }
    });
  }

  function closeItem(item) {
    item.classList.remove('active');
    const trigger = item.querySelector('.faq-trigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'false');
    const panel = item.querySelector('.faq-panel');
    if (panel) panel.style.maxHeight = '';
  }

  function openItem(item) {
    item.classList.add('active');
    const trigger = item.querySelector('.faq-trigger');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
    const panel = item.querySelector('.faq-panel');
    if (panel) {
      panel.style.maxHeight = panel.scrollHeight + 32 + 'px';
    }
  }

  function initFaqComponent() {
    const faqList = document.getElementById('faq-list');
    if (!faqList) return;

    // Prevent duplicate initialization
    if (faqList.dataset.faqInitialized === 'true') return;
    faqList.dataset.faqInitialized = 'true';

    // Ensure initial static items are revealed reliably
    observeRevealItems(faqList);

    // Event delegation: works for both static and dynamically rendered items
    faqList.addEventListener('click', (e) => {
      const trigger = e.target.closest('.faq-trigger');
      if (!trigger || !faqList.contains(trigger)) return;

      const item = trigger.closest('.faq-item');
      if (!item) return;

      const isOpen = item.classList.contains('active');

      // Single-open accordion: close siblings
      faqList.querySelectorAll('.faq-item.active').forEach((sibling) => {
        if (sibling !== item) closeItem(sibling);
      });

      if (isOpen) {
        closeItem(item);
      } else {
        openItem(item);
      }
    });

    // Wire FAQ CTA buttons independently (preserving any existing number/email)
    const faqWaCta = document.getElementById('faq-wa-cta');
    if (faqWaCta) {
      const existingMatch = (faqWaCta.getAttribute('href') || '').match(/wa\.me\/(\d+)/);
      const waNum = existingMatch ? existingMatch[1] : DEFAULT_WA_NUMBER;
      faqWaCta.href = buildWhatsAppURL(waNum, DEFAULT_WA_MESSAGE);
    }

    const faqMailCta = document.getElementById('faq-mail-cta');
    if (faqMailCta && !faqMailCta.getAttribute('href')) {
      faqMailCta.href = `mailto:${DEFAULT_EMAIL}`;
    }

    // Background hydration from /api/faqs with graceful static fallback
    async function syncFaqsFromApi() {
      try {
        const res = await fetch('/api/faqs?_t=' + Date.now(), { cache: 'no-cache' });
        if (!res.ok) return;
        const json = await res.json();
        if (!json || !Array.isArray(json.faqs) || json.faqs.length === 0) return;

        const validFaqs = json.faqs.filter(
          (f) => f && typeof f.question === 'string' && f.question.trim() && typeof f.answer === 'string'
        );
        if (validFaqs.length === 0) return;

        // Preserve any currently expanded question across hydration
        const activeTrigger = faqList.querySelector('.faq-item.active .faq-trigger span');
        const activeQuestion = activeTrigger ? activeTrigger.textContent.trim() : null;

        const fragment = document.createDocumentFragment();
        validFaqs.forEach((faq, idx) => {
          const panelId = `faq-live-ans-${faq.id || idx}`;
          const article = document.createElement('article');
          article.className = 'faq-item reveal';
          article.innerHTML = `
            <button type="button" class="faq-trigger" aria-expanded="false" aria-controls="${escapeHTML(panelId)}">
              <span>${escapeHTML(faq.question)}</span>
              <div class="faq-icon-wrap" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="6 9 12 15 18 9"></polyline></svg>
              </div>
            </button>
            <div class="faq-panel" id="${escapeHTML(panelId)}">
              <p>${escapeHTML(faq.answer)}</p>
            </div>
          `;

          if (activeQuestion && faq.question.trim() === activeQuestion) {
            article.classList.add('active');
            const btn = article.querySelector('.faq-trigger');
            if (btn) btn.setAttribute('aria-expanded', 'true');
          }

          fragment.appendChild(article);
        });

        faqList.innerHTML = '';
        faqList.appendChild(fragment);
        observeRevealItems(faqList);

        // Adjust maxHeight for any preserved open item after DOM insertion
        faqList.querySelectorAll('.faq-item.active').forEach(openItem);
      } catch {
        // Offline or API unavailable: static HTML FAQs remain active and functional
      }
    }

    syncFaqsFromApi();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFaqComponent);
  } else {
    initFaqComponent();
  }
})();

