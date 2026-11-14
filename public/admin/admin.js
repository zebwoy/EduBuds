/**
 * ═══════════════════════════════════════════════════════════════
 * EduBuds CMS Studio — Client Application
 * Zero-dependency, lightweight reactive controller
 * ═══════════════════════════════════════════════════════════════
 */

'use strict';

const TOKEN_KEY = 'edubuds_cms_token';

// Application State
const state = {
  token: localStorage.getItem(TOKEN_KEY),
  user: null,
  settings: {},
  stats: {},
  series: [],
  books: [],
  media: [],
  faqs: [],
  faqSearch: '',
  faqStatusFilter: 'all',
  subscribers: [],
  subscribersTotal: 0,
  subscribersPage: 1,
  subscribersLimit: 20,
  subscribersTotalPages: 1,
  subscribersSearch: '',
  subscribersStatusFilter: 'all',
  content: {},
  activeContentSection: 'hero',
  activeSeriesFilter: 'all',
  searchQuery: '',
  statusFilter: 'all',
  activeMediaCategory: 'all',
  mediaSearch: '',
  hasBlobToken: false,
  uploadFileData: null,
  uploadQueue: [],
  uploadTargetCallback: null,
  itemToDelete: null, // { type: 'book' | 'series' | 'media' | 'faq' | 'subscriber', id: string, title: string }
  lastDeleted: null,
  undoTimeoutId: null,
  undoIntervalId: null,
  defaultBooks: [],
  missingBooks: [],
};

// Top-level DOM Elements
const loginView = document.getElementById('login-view');
const appShell = document.getElementById('app-shell');
const loginForm = document.getElementById('login-form');
const loginBtn = document.getElementById('login-btn');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const currentUsernameEl = document.getElementById('current-username');
const toastEl = document.getElementById('cms-toast');

// Floating Undo Action Elements
const cmsUndoBar = document.getElementById('cms-undo-bar');
const undoMessage = document.getElementById('undo-message');
const undoActionBtn = document.getElementById('undo-action-btn');
const undoTimerBadge = document.getElementById('undo-timer-badge');
const undoDismissBtn = document.getElementById('undo-dismiss-btn');
const undoProgressBar = document.getElementById('undo-progress-bar');

// Settings DOM Elements
const settingsForm = document.getElementById('settings-form');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const resetSettingsBtn = document.getElementById('reset-settings-btn');
const refreshDashboardBtn = document.getElementById('refresh-dashboard-btn');
const settingWhatsappInput = document.getElementById('setting-whatsapp');
const settingEmailInput = document.getElementById('setting-email');
const settingWaTestLink = document.getElementById('setting-wa-test');
const dashboardTestWaLink = document.getElementById('dashboard-test-wa');

// Catalogue DOM Elements
const seriesFilterPillsEl = document.getElementById('series-filter-pills');
const catalogueSearchInput = document.getElementById('catalogue-search-input');
const catalogueStatusSelect = document.getElementById('catalogue-status-select');
const booksLoadingEl = document.getElementById('books-loading');
const booksEmptyEl = document.getElementById('books-empty');
const booksGridEl = document.getElementById('books-grid');
const addBookBtn = document.getElementById('add-book-btn');
const manageSeriesBtn = document.getElementById('manage-series-btn');
const seriesCountBadge = document.getElementById('series-count-badge');
const openRecoveryBtn = document.getElementById('open-recovery-btn');
const recoveryCountBadge = document.getElementById('recovery-count-badge');

// Catalogue Recovery Modal Elements
const recoveryModal = document.getElementById('recovery-modal');
const recoveryEmptyState = document.getElementById('recovery-empty-state');
const recoveryListContainer = document.getElementById('recovery-list-container');
const recoveryItemsList = document.getElementById('recovery-items-list');
const restoreAllMissingBtn = document.getElementById('restore-all-missing-btn');

// Book Modal DOM Elements
const bookModal = document.getElementById('book-modal');
const bookModalForm = document.getElementById('book-modal-form');
const bookModalTitle = document.getElementById('book-modal-title');
const bookFieldSeries = document.getElementById('book-field-series');
const bookFieldId = document.getElementById('book-field-id');
const bookFieldTitle = document.getElementById('book-field-title');
const bookFieldSubtitle = document.getElementById('book-field-subtitle');
const bookFieldImage = document.getElementById('book-field-image');
const bookCoverPreview = document.getElementById('book-cover-preview');
const clearCoverBtn = document.getElementById('clear-cover-btn');
const uploadCoverDirectBtn = document.getElementById('upload-cover-direct-btn');
const bookFieldTags = document.getElementById('book-field-tags');
const bookFieldOrder = document.getElementById('book-field-order');
const bookFieldDesc = document.getElementById('book-field-desc');
const bookFieldWa = document.getElementById('book-field-wa');
const bookFieldPublished = document.getElementById('book-field-published');
const bookFieldMode = document.getElementById('book-field-mode');
const generateWaTemplateBtn = document.getElementById('generate-wa-template-btn');
const browseMediaForBookBtn = document.getElementById('browse-media-for-book-btn');
const bookDuplicateBar = document.getElementById('book-duplicate-bar');
const bookDuplicateSourceSelect = document.getElementById('book-duplicate-source-select');
const bookDuplicateApplyBtn = document.getElementById('book-duplicate-apply-btn');
const bookDuplicateClearBtn = document.getElementById('book-duplicate-clear-btn');
const bookDuplicateBanner = document.getElementById('book-duplicate-banner');
const bookDuplicateBannerDesc = document.getElementById('book-duplicate-banner-desc');

// Series Modal DOM Elements
const seriesModal = document.getElementById('series-modal');
const seriesModalForm = document.getElementById('series-modal-form');
const seriesItemsListEl = document.getElementById('series-items-list');
const seriesFormHeading = document.getElementById('series-form-heading');
const seriesFieldMode = document.getElementById('series-field-mode');
const seriesFieldId = document.getElementById('series-field-id');
const seriesFieldLabel = document.getElementById('series-field-label');
const seriesFieldTagline = document.getElementById('series-field-tagline');
const seriesFieldDesc = document.getElementById('series-field-desc');
const seriesFieldColor = document.getElementById('series-field-color');
const seriesFieldColorPicker = document.getElementById('series-field-color-picker');
const seriesFieldColorLight = document.getElementById('series-field-color-light');
const seriesFieldColorLightPicker = document.getElementById('series-field-color-light-picker');
const seriesFieldOrder = document.getElementById('series-field-order');
const seriesFormResetBtn = document.getElementById('series-form-reset-btn');

// Media Library DOM Elements
const refreshMediaBtn = document.getElementById('refresh-media-btn');
const uploadMediaBtn = document.getElementById('upload-media-btn');
const mediaFilterPills = document.querySelectorAll('#media-filter-pills .filter-pill');
const mediaSearchInput = document.getElementById('media-search-input');
const blobStatusBadge = document.getElementById('blob-status-badge');
const blobStatusText = document.getElementById('blob-status-text');
const mediaLoadingEl = document.getElementById('media-loading');
const mediaEmptyEl = document.getElementById('media-empty');
const mediaGridEl = document.getElementById('media-grid');

// Upload Modal DOM Elements
const uploadModal = document.getElementById('upload-modal');
const uploadDropzone = document.getElementById('upload-dropzone');
const uploadFileInput = document.getElementById('upload-file-input');
const uploadQueueContainer = document.getElementById('upload-queue-container');
const uploadQueueList = document.getElementById('upload-queue-list');
const queueCountLabel = document.getElementById('queue-count-label');
const queueSizeLabel = document.getElementById('queue-size-label');
const uploadAddMoreBtn = document.getElementById('upload-add-more-btn');
const uploadClearAllBtn = document.getElementById('upload-clear-all-btn');
const uploadProgressWrap = document.getElementById('upload-progress-wrap');
const uploadProgressStatus = document.getElementById('upload-progress-status');
const uploadProgressPct = document.getElementById('upload-progress-pct');
const uploadProgressBar = document.getElementById('upload-progress-bar');
const startUploadBtn = document.getElementById('start-upload-btn');
const blobWarningBanner = document.getElementById('blob-warning-banner');
const uploadValidationBanner = document.getElementById('upload-validation-banner');
const uploadValidationIcon = document.getElementById('upload-validation-icon');
const uploadValidationTitle = document.getElementById('upload-validation-title');
const uploadValidationDesc = document.getElementById('upload-validation-desc');
const uploadOverrideRow = document.getElementById('upload-override-row');
const uploadOverrideCheckbox = document.getElementById('upload-override-checkbox');

// Media Picker Modal DOM Elements
const mediaPickerModal = document.getElementById('media-picker-modal');
const pickerSearchInput = document.getElementById('picker-search-input');
const pickerGalleryGrid = document.getElementById('picker-gallery-grid');

// Delete Modal DOM Elements
const deleteModal = document.getElementById('delete-modal');
const deleteModalTitle = document.getElementById('delete-modal-title');
const deleteModalMessage = document.getElementById('delete-modal-message');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

/* ── Toast Notifications ───────────────────────────────────── */
let toastTimeout = null;
function showToast(message, type = 'success') {
  if (!toastEl) return;
  clearTimeout(toastTimeout);

  toastEl.textContent = message;
  toastEl.className = `cms-toast show ${type}`;

  toastTimeout = setTimeout(() => {
    toastEl.classList.remove('show');
  }, 3500);
}

/* ── API Client Helper ─────────────────────────────────────── */
async function apiRequest(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }

  const res = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (res.status === 401 && endpoint !== '/api/cms/login') {
    handleLogout('Session expired. Please log in again.');
    throw new Error('Unauthorized');
  }

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `HTTP error ${res.status}`);
  }

  return data;
}

/* ── Auth Flow ─────────────────────────────────────────────── */
async function initAuth() {
  if (!state.token) {
    showLoginView();
    return;
  }

  try {
    const res = await apiRequest('/api/cms/verify');
    if (res.valid) {
      state.user = res.user || 'Admin';
      showAppView();
      await Promise.all([
        loadDashboard(),
        loadSettings(),
        loadCatalogue(),
        loadMedia(),
        loadContent(),
        loadFaqs(),
        loadSubscribers(),
      ]);
    } else {
      showLoginView();
    }
  } catch (err) {
    showLoginView();
  }
}

function showLoginView() {
  loginView.classList.add('active');
  appShell.classList.add('hidden');
}

function showAppView() {
  loginView.classList.remove('active');
  appShell.classList.remove('hidden');
  if (currentUsernameEl) {
    currentUsernameEl.textContent = state.user || 'Admin';
  }
}

function handleLogout(message = 'Logged out successfully.') {
  state.token = null;
  state.user = null;
  localStorage.removeItem(TOKEN_KEY);
  showLoginView();
  showToast(message, 'info');
}

/* ── Login Form Submission ─────────────────────────────────── */
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.classList.add('hidden');

    const username = loginForm.username.value.trim();
    const password = loginForm.password.value;

    const btnText = loginBtn.querySelector('.btn-text');
    const btnSpinner = loginBtn.querySelector('.btn-spinner');

    btnText.classList.add('hidden');
    btnSpinner.classList.remove('hidden');
    loginBtn.disabled = true;

    try {
      const data = await apiRequest('/api/cms/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
      });

      state.token = data.token;
      state.user = username;
      localStorage.setItem(TOKEN_KEY, data.token);

      loginForm.reset();
      showAppView();
      showToast(`Welcome back, ${username}!`, 'success');

      await Promise.all([
        loadDashboard(),
        loadSettings(),
        loadCatalogue(),
        loadMedia(),
        loadContent(),
        loadFaqs(),
        loadSubscribers(),
      ]);
    } catch (err) {
      loginError.textContent = err.message || 'Invalid username or password.';
      loginError.classList.remove('hidden');
    } finally {
      btnText.classList.remove('hidden');
      btnSpinner.classList.add('hidden');
      loginBtn.disabled = false;
    }
  });
}

// Password toggle
const togglePasswordBtn = document.getElementById('toggle-password');
const passwordInput = document.getElementById('login-password');
if (togglePasswordBtn && passwordInput) {
  togglePasswordBtn.addEventListener('click', () => {
    const isPassword = passwordInput.type === 'password';
    passwordInput.type = isPassword ? 'text' : 'password';
    togglePasswordBtn.style.opacity = isPassword ? '1' : '0.6';
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', () => handleLogout());
}

/* ── Tab Switching & Mobile Drawer UX ──────────────────────── */
const navItems = document.querySelectorAll('.nav-item[data-tab]');
const bottomNavItems = document.querySelectorAll('.bottom-nav-item[data-tab]');
const contentTabs = document.querySelectorAll('.content-tab');
const sidebarEl = document.getElementById('cms-sidebar');
const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
const sidebarCloseBtn = document.getElementById('sidebar-close-btn');
const sidebarBackdrop = document.getElementById('sidebar-backdrop');
const bottomNavMoreBtn = document.getElementById('bottom-nav-more');

function openDrawer() {
  if (sidebarEl) sidebarEl.classList.add('sidebar-open');
  if (sidebarBackdrop) sidebarBackdrop.classList.add('active');
  if (sidebarToggleBtn) {
    sidebarToggleBtn.setAttribute('aria-expanded', 'true');
    const menuIcon = sidebarToggleBtn.querySelector('.icon-menu');
    const closeIcon = sidebarToggleBtn.querySelector('.icon-close');
    if (menuIcon) menuIcon.classList.add('hidden');
    if (closeIcon) closeIcon.classList.remove('hidden');
  }
  document.body.classList.add('drawer-locked');
}

function closeDrawer() {
  if (sidebarEl) sidebarEl.classList.remove('sidebar-open');
  if (sidebarBackdrop) sidebarBackdrop.classList.remove('active');
  if (sidebarToggleBtn) {
    sidebarToggleBtn.setAttribute('aria-expanded', 'false');
    const menuIcon = sidebarToggleBtn.querySelector('.icon-menu');
    const closeIcon = sidebarToggleBtn.querySelector('.icon-close');
    if (menuIcon) menuIcon.classList.remove('hidden');
    if (closeIcon) closeIcon.classList.add('hidden');
  }
  document.body.classList.remove('drawer-locked');
}

function toggleDrawer() {
  if (sidebarEl && sidebarEl.classList.contains('sidebar-open')) {
    closeDrawer();
  } else {
    openDrawer();
  }
}

if (sidebarToggleBtn) sidebarToggleBtn.addEventListener('click', toggleDrawer);
if (sidebarCloseBtn) sidebarCloseBtn.addEventListener('click', closeDrawer);
if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeDrawer);
if (bottomNavMoreBtn) bottomNavMoreBtn.addEventListener('click', openDrawer);

// Close drawer on Escape
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && sidebarEl && sidebarEl.classList.contains('sidebar-open')) {
    closeDrawer();
  }
});

function switchTab(targetTabId) {
  if (!targetTabId) return;

  // Sync sidebar active state
  navItems.forEach(nav => {
    if (nav.dataset.tab === targetTabId) {
      nav.classList.add('active');
    } else {
      nav.classList.remove('active');
    }
  });

  // Sync bottom nav active state
  bottomNavItems.forEach(bNav => {
    if (bNav.dataset.tab === targetTabId) {
      bNav.classList.add('active');
    } else {
      bNav.classList.remove('active');
    }
  });

  // Sync content panes
  contentTabs.forEach(tab => {
    if (tab.id === targetTabId) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });

  // Close drawer if open on mobile/tablet
  closeDrawer();

  // Scroll main view to top smoothly
  const mainContent = document.querySelector('.cms-main-content');
  if (mainContent) {
    mainContent.scrollTo({ top: 0, behavior: 'smooth' });
  } else {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Bind sidebar items
navItems.forEach(item => {
  item.addEventListener('click', () => {
    switchTab(item.dataset.tab);
  });
});

// Bind bottom nav items
bottomNavItems.forEach(item => {
  item.addEventListener('click', () => {
    switchTab(item.dataset.tab);
  });
});

/* ── Dashboard Operations ──────────────────────────────────── */
async function loadDashboard() {
  const booksEl = document.getElementById('stat-books');
  const seriesEl = document.getElementById('stat-series');
  const subsEl = document.getElementById('stat-subscribers');
  const faqsEl = document.getElementById('stat-faqs');
  const waEl = document.getElementById('stat-whatsapp');

  try {
    const stats = await apiRequest('/api/cms/dashboard');
    state.stats = stats;

    if (booksEl) booksEl.textContent = stats.books;
    if (seriesEl) seriesEl.textContent = stats.series;
    if (subsEl) subsEl.textContent = stats.subscribers;
    if (faqsEl) faqsEl.textContent = stats.faqs || state.faqs.filter(f => f.isPublished).length || '6';

    renderRecentActivities(stats.recentActivities || []);
  } catch (err) {
    if (booksEl && booksEl.textContent === '-') booksEl.textContent = state.books.filter(b => b.isPublished).length || '17';
    if (seriesEl && seriesEl.textContent === '-') seriesEl.textContent = state.series.length || '3';
    if (subsEl && subsEl.textContent === '-') subsEl.textContent = '0';
    if (faqsEl && faqsEl.textContent === '-') faqsEl.textContent = '6';
  }

  // Update WhatsApp stat card
  const waNum = state.settings.whatsapp_number || '919222315006';
  if (waEl) {
    waEl.textContent = formatPhone(waNum);
  }
  if (dashboardTestWaLink) {
    dashboardTestWaLink.href = `https://wa.me/${waNum.replace(/\D/g, '')}?text=${encodeURIComponent('Assalamu Alaikum! Testing EduBuds WhatsApp enquiry routing.')}`;
  }
}

function renderRecentActivities(activities = []) {
  const container = document.getElementById('recent-activity-list');
  if (!container) return;

  if (!activities || activities.length === 0) {
    container.innerHTML = '<div class="timeline-empty">No activity recorded yet. Edits will appear here in real-time.</div>';
    return;
  }

  container.innerHTML = activities.map(act => {
    let badgeClass = 'blue';

    if (act.action.includes('create') || act.action.includes('publish')) {
      badgeClass = 'green';
    } else if (act.action.includes('delete')) {
      badgeClass = 'amber';
    }

    const actionMap = {
      update_settings: 'Updated Global Site Settings',
      create_book: 'Added new book to catalogue',
      update_book: 'Updated book details',
      delete_book: 'Removed book from catalogue',
      toggle_book_publish: 'Toggled book visibility',
      create_series: 'Added new curriculum series',
      update_series: 'Updated series configuration',
      delete_series: 'Deleted curriculum series',
      create_faq: 'Created new FAQ question',
      update_faq: 'Edited FAQ question',
      delete_faq: 'Removed FAQ question',
      toggle_faq_publish: 'Toggled FAQ visibility',
      update_section: `Updated ${act.entity_id || 'section'} copy`,
      batch_update_sections: 'Batch updated section content',
      export_subscribers_csv: 'Exported newsletter subscribers CSV',
      delete_subscriber: 'Removed newsletter subscriber',
      upload_media: 'Uploaded media asset to library',
      delete_media: 'Deleted media asset'
    };

    const friendlyText = actionMap[act.action] || act.action.replace(/_/g, ' ');
    const timeFormatted = formatRelativeTime(act.createdAt);

    return `
      <div class="timeline-item">
        <div class="timeline-left">
          <span class="timeline-badge ${badgeClass}"></span>
          <div class="timeline-text">
            <strong>${escapeHtml(friendlyText)}</strong>
            ${act.entity_id && !friendlyText.includes(act.entity_id) ? `<span style="color:var(--text-dim);"> (${escapeHtml(act.entity_id)})</span>` : ''}
          </div>
        </div>
        <span class="timeline-time">${timeFormatted}</span>
      </div>
    `;
  }).join('');
}

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const date = new Date(dateStr);
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return date.toLocaleDateString();
}

if (refreshDashboardBtn) {
  refreshDashboardBtn.addEventListener('click', async () => {
    refreshDashboardBtn.disabled = true;
    showToast('Refreshing dashboard stats...', 'info');
    await Promise.all([loadDashboard(), loadCatalogue(), loadMedia()]);
    refreshDashboardBtn.disabled = false;
    showToast('Stats updated!', 'success');
  });
}

/* ── Settings Operations ───────────────────────────────────── */
async function loadSettings() {
  try {
    const res = await apiRequest('/api/cms/settings');
    state.settings = res.settings || {};
    populateSettingsForm(state.settings);
  } catch (err) {
    console.warn('[CMS] Using fallback settings:', err);
    state.settings = {
      whatsapp_number: '919222315006',
      contact_email: 'support@edubuds.in',
      site_title: 'EduBuds — Learn. Grow. Shine.',
      site_description: 'EduBuds — a complete Islamic Studies curriculum for Grades 1–9. Three carefully crafted series: Islamic Studies, Prophet Stories, and the 20 Hadith Collection. Learn. Grow. Shine.',
      og_image: '/assets/logos/logo 3D.png',
    };
    populateSettingsForm(state.settings);
  }
}

function populateSettingsForm(s) {
  if (settingWhatsappInput) {
    settingWhatsappInput.value = s.whatsapp_number || '';
    updateWaTestLink(s.whatsapp_number || '');
  }

  if (settingEmailInput) {
    settingEmailInput.value = s.contact_email || 'support@edubuds.in';
  }

  const titleInput = document.getElementById('setting-title');
  if (titleInput) titleInput.value = s.site_title || '';

  const descInput = document.getElementById('setting-description');
  if (descInput) descInput.value = s.site_description || '';

  const ogInput = document.getElementById('setting-og');
  if (ogInput) ogInput.value = s.og_image || '';
}

function updateWaTestLink(num) {
  const clean = String(num || '').replace(/\D/g, '');
  if (!settingWaTestLink) return;
  if (clean.length >= 7) {
    settingWaTestLink.href = `https://wa.me/${clean}?text=${encodeURIComponent('Assalamu Alaikum! Testing WhatsApp routing from EduBuds CMS.')}`;
    settingWaTestLink.classList.remove('hidden');
  } else {
    settingWaTestLink.classList.add('hidden');
  }
}

if (settingWhatsappInput) {
  settingWhatsappInput.addEventListener('input', (e) => {
    updateWaTestLink(e.target.value);
  });
}

if (settingsForm) {
  settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const btnText = saveSettingsBtn.querySelector('.btn-text');
    const btnSpinner = saveSettingsBtn.querySelector('.btn-spinner');

    btnText.classList.add('hidden');
    btnSpinner.classList.remove('hidden');
    saveSettingsBtn.disabled = true;

    const payload = {
      whatsapp_number: settingWhatsappInput ? settingWhatsappInput.value.trim() : '',
      contact_email: settingEmailInput ? settingEmailInput.value.trim() : 'support@edubuds.in',
      site_title: document.getElementById('setting-title')?.value.trim() || '',
      site_description: document.getElementById('setting-description')?.value.trim() || '',
      og_image: document.getElementById('setting-og')?.value.trim() || '',
    };

    try {
      const res = await apiRequest('/api/cms/settings', {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      state.settings = res.settings || payload;
      populateSettingsForm(state.settings);

      const waEl = document.getElementById('stat-whatsapp');
      if (waEl) waEl.textContent = formatPhone(state.settings.whatsapp_number);
      if (dashboardTestWaLink) {
        dashboardTestWaLink.href = `https://wa.me/${state.settings.whatsapp_number.replace(/\D/g, '')}?text=${encodeURIComponent('Assalamu Alaikum! Testing EduBuds WhatsApp enquiry routing.')}`;
      }

      showToast('Settings saved successfully!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to save settings.', 'error');
    } finally {
      btnText.classList.remove('hidden');
      btnSpinner.classList.add('hidden');
      saveSettingsBtn.disabled = false;
    }
  });
}

if (resetSettingsBtn) {
  resetSettingsBtn.addEventListener('click', () => {
    populateSettingsForm(state.settings);
    showToast('Changes discarded.', 'info');
  });
}

/* ═══════════════════════════════════════════════════════════════
   PHASE 2: CATALOGUE (BOOKS & SERIES) OPERATIONS
   ═══════════════════════════════════════════════════════════════ */

async function loadCatalogue() {
  if (booksLoadingEl) booksLoadingEl.classList.remove('hidden');
  if (booksEmptyEl) booksEmptyEl.classList.add('hidden');

  try {
    const [seriesRes, booksRes] = await Promise.all([
      apiRequest('/api/cms/series').catch(() => ({ series: [] })),
      apiRequest('/api/cms/books').catch(() => ({ books: [] })),
    ]);

    state.series = Array.isArray(seriesRes.series) ? seriesRes.series : [];
    state.books = Array.isArray(booksRes.books) ? booksRes.books : [];

    if (state.series.length === 0 && state.books.length === 0) {
      await fallbackLocalSeed();
    }

    if (seriesCountBadge) seriesCountBadge.textContent = state.series.length;

    renderSeriesOptionsInBookModal();
    renderSeriesFilterPills();
    renderBooksGrid();
    await checkCatalogueHealth();
  } catch (err) {
    console.error('[CMS] Failed to load catalogue:', err);
    showToast('Could not load full catalogue from database.', 'error');
  } finally {
    if (booksLoadingEl) booksLoadingEl.classList.add('hidden');
  }
}

/* ── Catalogue Health & Recovery Manager ────────────────────── */
async function checkCatalogueHealth() {
  if (!state.defaultBooks || state.defaultBooks.length === 0) {
    try {
      const res = await fetch('/products.json');
      const data = await res.json();
      if (data && Array.isArray(data.series)) {
        state.defaultBooks = [];
        data.series.forEach(s => {
          if (Array.isArray(s.books)) {
            s.books.forEach((b, idx) => {
              state.defaultBooks.push({
                ...b,
                seriesId: s.id,
                seriesLabel: s.label,
                seriesColor: s.color,
                orderIndex: idx + 1,
                isPublished: true,
              });
            });
          }
        });
      }
    } catch (e) {
      console.warn('Could not load products.json reference:', e);
    }
  }

  if (state.defaultBooks && state.defaultBooks.length > 0) {
    const existingIds = new Set(state.books.map(b => b.id));
    state.missingBooks = state.defaultBooks.filter(db => !existingIds.has(db.id));

    if (openRecoveryBtn && recoveryCountBadge) {
      if (state.missingBooks.length > 0) {
        recoveryCountBadge.textContent = state.missingBooks.length;
        openRecoveryBtn.classList.remove('hidden');
      } else {
        openRecoveryBtn.classList.add('hidden');
      }
    }
  }
}

function openRecoveryModal() {
  if (!recoveryModal) return;
  renderRecoveryModalList();
  recoveryModal.classList.remove('hidden');
}

function renderRecoveryModalList() {
  if (!recoveryItemsList || !recoveryEmptyState || !recoveryListContainer) return;

  if (state.missingBooks.length === 0) {
    recoveryEmptyState.classList.remove('hidden');
    recoveryListContainer.classList.add('hidden');
    return;
  }

  recoveryEmptyState.classList.add('hidden');
  recoveryListContainer.classList.remove('hidden');

  const foundText = document.getElementById('recovery-found-text');
  if (foundText) {
    foundText.textContent = `${state.missingBooks.length} missing curriculum title${state.missingBooks.length === 1 ? '' : 's'} available to restore:`;
  }

  recoveryItemsList.innerHTML = '';
  state.missingBooks.forEach(book => {
    const card = document.createElement('div');
    card.className = 'recovery-item-card';
    card.innerHTML = `
      <div class="recovery-item-left">
        <img class="recovery-item-thumb" src="${escapeHtml(book.image || '/assets/placeholder-cover.svg')}" alt="${escapeHtml(book.title)}" onerror="this.onerror=null; this.src='/assets/placeholder-cover.svg'">
        <div class="recovery-item-meta">
          <span class="recovery-item-title">${escapeHtml(book.title)}${book.subtitle ? ' — ' + escapeHtml(book.subtitle) : ''}</span>
          <span class="recovery-item-sub">${escapeHtml(book.seriesLabel || book.seriesId)} • ID: <code>${escapeHtml(book.id)}</code></span>
        </div>
      </div>
      <button type="button" class="btn btn-secondary btn-sm restore-single-btn" data-id="${escapeHtml(book.id)}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:14px;height:14px;"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
        <span>Restore</span>
      </button>
    `;

    card.querySelector('.restore-single-btn').addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      btn.disabled = true;
      btn.innerHTML = '<span class="btn-spinner" style="width:12px;height:12px;"></span> Restoring...';
      try {
        await apiRequest('/api/cms/books', {
          method: 'POST',
          body: JSON.stringify(book),
        });
        showToast(`Restored "${book.title}" to catalogue!`, 'success');
        await loadCatalogue();
        renderRecoveryModalList();
      } catch (err) {
        showToast(err.message || 'Failed to restore book.', 'error');
        btn.disabled = false;
        btn.innerHTML = 'Restore';
      }
    });

    recoveryItemsList.appendChild(card);
  });
}

if (openRecoveryBtn) {
  openRecoveryBtn.addEventListener('click', openRecoveryModal);
}

if (restoreAllMissingBtn) {
  restoreAllMissingBtn.addEventListener('click', async () => {
    if (state.missingBooks.length === 0) return;
    restoreAllMissingBtn.disabled = true;
    restoreAllMissingBtn.textContent = 'Restoring All...';

    try {
      for (const book of state.missingBooks) {
        await apiRequest('/api/cms/books', {
          method: 'POST',
          body: JSON.stringify(book),
        }).catch(err => console.warn('Restore book failed:', book.id, err));
      }
      showToast('All missing catalogue books restored successfully!', 'success');
      closeModal('recovery-modal');
      await loadCatalogue();
    } catch (err) {
      showToast(err.message || 'Failed to restore all books.', 'error');
    } finally {
      restoreAllMissingBtn.disabled = false;
      restoreAllMissingBtn.textContent = 'Restore All Missing';
    }
  });
}

async function fallbackLocalSeed() {
  try {
    const res = await fetch('/api/products');
    const json = await res.json();
    if (json && json.series) {
      state.series = json.series.map(s => ({
        id: s.id,
        label: s.label,
        tagline: s.tagline || '',
        description: s.description || '',
        color: s.color || '#0878c9',
        colorLight: s.colorLight || '#e7f2ff',
        orderIndex: 0,
      }));

      const allBooks = [];
      json.series.forEach(s => {
        if (s.books) {
          s.books.forEach((b, idx) => {
            allBooks.push({
              ...b,
              seriesId: s.id,
              seriesLabel: s.label,
              seriesColor: s.color,
              isPublished: true,
              orderIndex: idx,
            });
          });
        }
      });
      state.books = allBooks;
    }
  } catch {
    // ignore
  }
}

/* ── Filter Pills Rendering ────────────────────────────────── */
function renderSeriesFilterPills() {
  if (!seriesFilterPillsEl) return;
  seriesFilterPillsEl.innerHTML = '';

  // "All Books" Pill
  const allCount = state.books.length;
  const allPill = document.createElement('button');
  allPill.className = `filter-pill ${state.activeSeriesFilter === 'all' ? 'active' : ''}`;
  allPill.innerHTML = `
    <span>All Books</span>
    <span class="pill-count">${allCount}</span>
  `;
  allPill.addEventListener('click', () => {
    state.activeSeriesFilter = 'all';
    renderSeriesFilterPills();
    renderBooksGrid();
  });
  seriesFilterPillsEl.appendChild(allPill);

  // Per-Series Pills
  state.series.forEach(s => {
    const count = state.books.filter(b => (b.seriesId || b.series_id) === s.id).length;
    const pill = document.createElement('button');
    pill.className = `filter-pill ${state.activeSeriesFilter === s.id ? 'active' : ''}`;
    pill.innerHTML = `
      <span class="pill-dot" style="background:${s.color}"></span>
      <span>${escapeHtml(s.label)}</span>
      <span class="pill-count">${count}</span>
    `;
    pill.addEventListener('click', () => {
      state.activeSeriesFilter = s.id;
      renderSeriesFilterPills();
      renderBooksGrid();
    });
    seriesFilterPillsEl.appendChild(pill);
  });
}

function renderSeriesOptionsInBookModal() {
  if (!bookFieldSeries) return;
  bookFieldSeries.innerHTML = '';

  state.series.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = s.label;
    bookFieldSeries.appendChild(opt);
  });
}

/* ── Dynamic Book Cover Matcher & Reconciler ───────────────── */
function extractTokens(str) {
  if (!str) return [];
  const cleaned = String(str)
    .toLowerCase()
    .replace(/^edubuds-\d+-/, '')
    .replace(/-[a-z0-9]{10,}(\.[a-z0-9]+)?$/i, '')
    .replace(/\.[a-z0-9]+$/i, '');

  return cleaned
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(t => t.length > 0 && !['edubuds', 'png', 'jpg', 'jpeg', 'webp', 'svg', 'as', 'cover', 'the', 'and', 'for'].includes(t));
}

function scoreAssetMatch(assetName, book) {
  const assetTokens = extractTokens(assetName);
  if (!assetTokens.length) return 0;

  const bookIdTokens = extractTokens(book.id);
  const bookSubTokens = extractTokens(book.subtitle);
  const bookTitleTokens = extractTokens(book.title);
  const allBookTokens = Array.from(new Set([...bookIdTokens, ...bookSubTokens, ...bookTitleTokens]));

  // Strict numeric guard: if asset has number (e.g. "1"), book MUST match that number
  const assetNumbers = assetTokens.filter(t => /^\d+$/.test(t));
  const bookNumbers = allBookTokens.filter(t => /^\d+$/.test(t));
  if (assetNumbers.length > 0 && bookNumbers.length > 0) {
    const hasCommonNumber = assetNumbers.some(n => bookNumbers.includes(n));
    if (!hasCommonNumber) return 0;
  }

  let matchCount = 0;
  for (const at of assetTokens) {
    if (allBookTokens.includes(at)) {
      matchCount += 1;
    }
  }

  return matchCount / Math.max(assetTokens.length, 1);
}

function findBestMatchingBook(assetName) {
  let bestScore = 0;
  let bestBook = null;

  for (const book of state.books) {
    const s = scoreAssetMatch(assetName, book);
    if (s > bestScore && s >= 0.5) {
      bestScore = s;
      bestBook = book;
    }
  }

  return bestBook;
}

function findMatchingAssetForBook(book, mediaList = state.media) {
  const cloudMedia = (mediaList || []).filter(m => m.isBlob || (m.url && m.url.startsWith('http')));
  let bestScore = 0;
  let bestAsset = null;

  for (const asset of cloudMedia) {
    const s = scoreAssetMatch(asset.name, book);
    if (s > bestScore && s >= 0.5) {
      bestScore = s;
      bestAsset = asset;
    }
  }

  return bestAsset;
}

async function applyCoverToBook(bookId, assetUrl) {
  try {
    showToast('Saving cover to database & publishing live...', 'info');
    const res = await apiRequest('/api/cms/books', {
      method: 'PUT',
      body: JSON.stringify({
        id: bookId,
        image: assetUrl,
      }),
    });

    if (res && res.book) {
      const idx = state.books.findIndex(b => b.id === bookId);
      if (idx !== -1) {
        state.books[idx] = { ...state.books[idx], ...res.book };
      }
      renderBooksGrid();
      showToast(`✓ Cover updated for "${res.book.title} ${res.book.subtitle || ''}"!`, 'success', 5000);
      return res.book;
    }
  } catch (err) {
    console.error('[CMS] Failed to apply cover to book:', err);
    showToast(err.message || 'Failed to update book cover.', 'error');
    throw err;
  }
}

async function reconcileAllCloudCovers() {
  const unlinkedBooks = state.books.filter(b => {
    const img = (b.image || '').trim();
    return !img || img.startsWith('/assets/Resource/') || img.includes('placeholder-cover');
  });

  if (!unlinkedBooks.length) {
    showToast('All catalogue books already have active cloud covers!', 'info');
    return;
  }

  const matches = [];
  for (const b of unlinkedBooks) {
    const asset = findMatchingAssetForBook(b);
    if (asset) {
      matches.push({ book: b, asset });
    }
  }

  if (matches.length === 0) {
    showToast('No matching cloud assets found in Media Library for unlinked books.', 'info');
    return;
  }

  const confirmMsg = `Found ${matches.length} matching cloud asset(s):\n\n` +
    matches.map(m => `• "${m.book.title} ${m.book.subtitle || ''}" ➔ ${m.asset.name}`).join('\n') +
    `\n\nApply and publish these covers to the live site now?`;

  if (!confirm(confirmMsg)) return;

  showToast(`Linking ${matches.length} book cover(s)...`, 'info');
  let successCount = 0;

  for (const m of matches) {
    try {
      await applyCoverToBook(m.book.id, m.asset.url);
      successCount += 1;
    } catch (err) {
      console.error(`Failed to link ${m.book.id}:`, err);
    }
  }

  showToast(`✓ Successfully linked ${successCount} cover(s) to the live catalogue!`, 'success', 5000);
}

function updateAssignComparisonPreview() {
  const select = document.getElementById('assign-target-book');
  const card = document.getElementById('assign-comparison-card');
  const currImg = document.getElementById('assign-current-cover-img');
  const currTitle = document.getElementById('assign-current-cover-title');
  const newImg = document.getElementById('assign-new-cover-img');
  const newTitle = document.getElementById('assign-new-cover-title');
  const targetUrl = document.getElementById('assign-target-url')?.value;

  if (!select || !card) return;

  const selectedId = select.value;
  const book = state.books.find(b => b.id === selectedId);

  if (!book) {
    card.classList.add('hidden');
    return;
  }

  card.classList.remove('hidden');
  const hasCover = Boolean(book.image && !book.image.startsWith('/assets/Resource/') && !book.image.includes('placeholder-cover'));
  if (currImg) currImg.src = hasCover ? book.image : '/assets/placeholder-cover.svg';
  if (currTitle) {
    currTitle.textContent = hasCover ? 'Active Live Cover' : 'Placeholder (No Cover)';
    currTitle.className = hasCover ? 'comparison-caption' : 'comparison-caption text-dim';
  }
  if (newImg && targetUrl) {
    newImg.src = targetUrl;
  }
  if (newTitle) {
    newTitle.textContent = 'Will be published live';
  }
}

function openAssignMediaModal(assetUrl, assetName) {
  const modal = document.getElementById('assign-media-modal');
  const targetUrlInput = document.getElementById('assign-target-url');
  const previewImg = document.getElementById('assign-preview-img');
  const previewName = document.getElementById('assign-preview-name');
  const previewUrl = document.getElementById('assign-preview-url');
  const previewFormat = document.getElementById('assign-preview-format');
  const select = document.getElementById('assign-target-book');

  if (!modal || !select) return;

  targetUrlInput.value = assetUrl;
  if (previewImg) previewImg.src = assetUrl;
  if (previewName) previewName.textContent = assetName || 'Media Asset';
  if (previewUrl) previewUrl.textContent = assetUrl;

  const ext = (assetName ? assetName.split('.').pop() || 'IMG' : 'IMG').toUpperCase();
  if (previewFormat) previewFormat.textContent = ext;

  select.innerHTML = '<option value="" disabled selected>Select a curriculum title...</option>';

  const matchedBook = findBestMatchingBook(assetName);

  state.series.forEach(s => {
    const seriesBooks = state.books.filter(b => (b.seriesId || b.series_id) === s.id);
    if (!seriesBooks.length) return;

    const group = document.createElement('optgroup');
    group.label = s.label;

    seriesBooks.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b.id;
      const fullTitle = `${b.title}${b.subtitle ? ' - ' + b.subtitle : ''}`;
      opt.textContent = fullTitle;
      if (matchedBook && matchedBook.id === b.id) {
        opt.selected = true;
      }
      group.appendChild(opt);
    });

    select.appendChild(group);
  });

  updateAssignComparisonPreview();
  modal.classList.remove('hidden');
}

/* ── Books Grid Rendering ──────────────────────────────────── */
function renderBooksGrid() {
  if (!booksGridEl) return;

  const query = state.searchQuery.toLowerCase().trim();
  const filtered = state.books.filter(book => {
    const seriesMatch = state.activeSeriesFilter === 'all' || (book.seriesId || book.series_id) === state.activeSeriesFilter;
    if (!seriesMatch) return false;

    if (state.statusFilter === 'published' && !book.isPublished) return false;
    if (state.statusFilter === 'draft' && book.isPublished) return false;

    if (query) {
      const matchTitle = (book.title || '').toLowerCase().includes(query);
      const matchSub = (book.subtitle || '').toLowerCase().includes(query);
      const matchDesc = (book.description || '').toLowerCase().includes(query);
      const matchTags = Array.isArray(book.tags) ? book.tags.some(t => t.toLowerCase().includes(query)) : (book.tags || '').toLowerCase().includes(query);
      return matchTitle || matchSub || matchDesc || matchTags;
    }

    return true;
  });

  if (filtered.length === 0) {
    booksGridEl.innerHTML = '';
    if (booksEmptyEl) booksEmptyEl.classList.remove('hidden');
    return;
  }

  if (booksEmptyEl) booksEmptyEl.classList.add('hidden');
  booksGridEl.innerHTML = '';

  filtered.forEach(book => {
    const seriesObj = state.series.find(s => s.id === (book.seriesId || book.series_id)) || {};
    const seriesColor = seriesObj.color || book.seriesColor || '#0878c9';
    const seriesLabel = seriesObj.label || book.seriesLabel || book.seriesId || 'Curriculum';

    const hasActiveCover = Boolean(book.image && !book.image.startsWith('/assets/Resource/') && !book.image.includes('placeholder-cover'));
    const matchedAsset = !hasActiveCover ? findMatchingAssetForBook(book) : null;

    const card = document.createElement('div');
    card.className = `book-admin-card ${!book.isPublished ? 'draft' : ''}`;
    card.id = `book-card-${book.id}`;

    card.innerHTML = `
      <div class="book-admin-header">
        <img class="book-admin-cover" src="${escapeHtml(book.image || '/assets/placeholder-cover.svg')}" alt="${escapeHtml(book.title)}" loading="lazy" onerror="this.onerror=null; this.src='/assets/placeholder-cover.svg'">
        <div class="book-admin-meta">
          <span class="book-series-pill" style="background:${seriesColor}">${escapeHtml(seriesLabel)}</span>
          <h4 class="book-admin-title" title="${escapeHtml(book.title)}">${escapeHtml(book.title)}</h4>
          <span class="book-admin-subtitle">${book.subtitle ? escapeHtml(book.subtitle) : '&nbsp;'}</span>
          <span class="book-admin-id-tag">ID: ${escapeHtml(book.id)}</span>
        </div>
      </div>

      ${matchedAsset ? `
        <div class="smart-asset-pill" title="Detected matching cloud cover in Media Library: ${escapeHtml(matchedAsset.name)}">
          <span class="pill-sparkle">✨</span>
          <span class="pill-title">Detected Cloud Asset: <strong>${escapeHtml(matchedAsset.name)}</strong></span>
          <button type="button" class="btn-quick-link" data-book-id="${escapeHtml(book.id)}" data-url="${escapeHtml(matchedAsset.url)}">
            1-Click Link
          </button>
        </div>
      ` : ''}

      <p class="book-admin-desc">${escapeHtml(book.description || 'No description provided.')}</p>

      <div class="book-admin-footer">
        <label class="status-toggle-label" title="Toggle publication on live site">
          <span class="custom-switch">
            <input type="checkbox" class="book-publish-toggle" data-id="${escapeHtml(book.id)}" ${book.isPublished ? 'checked' : ''}>
            <span class="switch-slider"></span>
          </span>
          <span class="status-text">${book.isPublished ? 'Live' : 'Draft'}</span>
        </label>

        <div class="card-action-btns">
          <button type="button" class="icon-action-btn duplicate-btn duplicate-book-btn" data-id="${escapeHtml(book.id)}" title="Duplicate this book as a new entry">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          </button>
          <button type="button" class="icon-action-btn edit-book-btn" data-id="${escapeHtml(book.id)}" title="Edit book details">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          </button>
          <button type="button" class="icon-action-btn delete-btn delete-book-btn" data-id="${escapeHtml(book.id)}" title="Delete book">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </div>
      </div>
    `;

    booksGridEl.appendChild(card);
  });

  booksGridEl.querySelectorAll('.book-publish-toggle').forEach(input => {
    input.addEventListener('change', async (e) => {
      const bookId = e.target.dataset.id;
      const nextState = e.target.checked;
      await handleToggleBookPublish(bookId, nextState, e.target);
    });
  });

  booksGridEl.querySelectorAll('.btn-quick-link').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const bookId = btn.dataset.bookId;
      const url = btn.dataset.url;
      btn.disabled = true;
      btn.textContent = 'Linking...';
      try {
        await applyCoverToBook(bookId, url);
      } catch (err) {
        btn.disabled = false;
        btn.textContent = 'Retry Link';
      }
    });
  });

  booksGridEl.querySelectorAll('.duplicate-book-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const bookId = btn.dataset.id;
      openBookModal('duplicate', bookId);
    });
  });

  booksGridEl.querySelectorAll('.edit-book-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const bookId = btn.dataset.id;
      openBookModal('edit', bookId);
    });
  });

  booksGridEl.querySelectorAll('.delete-book-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const bookId = btn.dataset.id;
      const b = state.books.find(x => x.id === bookId);
      openDeleteModal('book', bookId, b ? b.title : bookId);
    });
  });
}

if (catalogueSearchInput) {
  catalogueSearchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value;
    renderBooksGrid();
  });
}

if (catalogueStatusSelect) {
  catalogueStatusSelect.addEventListener('change', (e) => {
    state.statusFilter = e.target.value;
    renderBooksGrid();
  });
}

/* ── Toggle Book Publish Status ────────────────────────────── */
async function handleToggleBookPublish(bookId, isPublished, inputEl) {
  try {
    await apiRequest('/api/cms/books', {
      method: 'PUT',
      body: JSON.stringify({
        id: bookId,
        action: 'toggle_publish',
        isPublished,
      }),
    });

    const b = state.books.find(x => x.id === bookId);
    if (b) b.isPublished = isPublished;

    const card = document.getElementById(`book-card-${bookId}`);
    if (card) {
      card.classList.toggle('draft', !isPublished);
      const statusText = card.querySelector('.status-text');
      if (statusText) statusText.textContent = isPublished ? 'Live' : 'Draft';
    }

    showToast(`Book is now ${isPublished ? 'Live in catalogue' : 'Hidden as draft'}`, 'success');
    loadDashboard();
  } catch (err) {
    if (inputEl) inputEl.checked = !isPublished;
    showToast(err.message || 'Could not update publication status.', 'error');
  }
}

/* ── Book Modal Duplication & Templating ───────────────────── */
function renderDuplicateSourceOptions(selectedBookId = null) {
  if (!bookDuplicateSourceSelect) return;
  bookDuplicateSourceSelect.innerHTML = '<option value="">— Select book template —</option>';

  const currentSeries = state.series || [];

  currentSeries.forEach(series => {
    const seriesBooks = state.books.filter(b => (b.seriesId || b.series_id) === series.id);
    if (!seriesBooks.length) return;

    const optgroup = document.createElement('optgroup');
    optgroup.label = series.label || series.id;

    // Sort books by order index
    seriesBooks.sort((a, b) => (a.orderIndex ?? a.order_index ?? 0) - (b.orderIndex ?? b.order_index ?? 0));

    seriesBooks.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b.id;
      const sub = b.subtitle ? ` (${b.subtitle})` : '';
      opt.textContent = `${b.title}${sub}`;
      if (selectedBookId && b.id === selectedBookId) {
        opt.selected = true;
      }
      optgroup.appendChild(opt);
    });

    bookDuplicateSourceSelect.appendChild(optgroup);
  });

  const unassigned = state.books.filter(b => !currentSeries.some(s => s.id === (b.seriesId || b.series_id)));
  if (unassigned.length) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = 'Other Titles';
    unassigned.forEach(b => {
      const opt = document.createElement('option');
      opt.value = b.id;
      const sub = b.subtitle ? ` (${b.subtitle})` : '';
      opt.textContent = `${b.title}${sub}`;
      if (selectedBookId && b.id === selectedBookId) {
        opt.selected = true;
      }
      optgroup.appendChild(opt);
    });
    bookDuplicateSourceSelect.appendChild(optgroup);
  }

  if (bookDuplicateApplyBtn) {
    bookDuplicateApplyBtn.disabled = !bookDuplicateSourceSelect.value;
  }
}

function generateUniqueBookId(seriesId, title, subtitle) {
  const seriesSlug = (seriesId || 'book').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const titleSlug = (title || 'title').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const subSlug = subtitle ? '-' + subtitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '';

  let base = `${seriesSlug}-${titleSlug}${subSlug}`.slice(0, 50).replace(/(^-|-$)/g, '');
  if (!base) base = 'book-' + Date.now();

  let candidate = base;
  let counter = 2;
  while (state.books.some(b => b.id === candidate)) {
    candidate = `${base}-${counter}`.slice(0, 60);
    counter++;
  }

  if (bookFieldId) {
    bookFieldId.value = candidate;
    bookFieldId.dataset.dirty = 'true';
  }
  return candidate;
}

function generateWaTemplateForCurrentBook() {
  const title = (bookFieldTitle ? bookFieldTitle.value : '').trim() || 'Book';
  const sub = (bookFieldSubtitle ? bookFieldSubtitle.value : '').trim();
  const full = `${title}${sub ? ' (' + sub + ')' : ''}`;
  if (bookFieldWa) {
    bookFieldWa.value = `Assalamu Alaikum! I am interested in ordering the EduBuds "${full}". Could you please share details on pricing, availability, and how to place an order?`;
  }
}

function duplicateFromBook(sourceBookId) {
  const sourceBook = state.books.find(b => b.id === sourceBookId);
  if (!sourceBook) return;

  const targetSeriesId = sourceBook.seriesId || sourceBook.series_id || '';
  if (bookFieldSeries) bookFieldSeries.value = targetSeriesId;

  // Title
  if (bookFieldTitle) bookFieldTitle.value = sourceBook.title || '';

  // Smart Subtitle Increment:
  // e.g. "Grade 1" -> "Grade 2", "Book 3" -> "Book 4", "Volume 1" -> "Volume 2", "Part 1" -> "Part 2"
  const rawSub = (sourceBook.subtitle || '').trim();
  let nextSub = rawSub;
  const numMatch = rawSub.match(/^(.*?)(\d+)(\s*)$/);
  if (numMatch) {
    const prefix = numMatch[1];
    const currentNum = parseInt(numMatch[2], 10);
    const suffix = numMatch[3];
    nextSub = `${prefix}${currentNum + 1}${suffix}`;
  }
  if (bookFieldSubtitle) bookFieldSubtitle.value = nextSub;

  // Smart Order Index: Highest order index in this series + 1
  const seriesBooks = state.books.filter(b => (b.seriesId || b.series_id) === targetSeriesId);
  const maxOrder = seriesBooks.reduce((max, b) => Math.max(max, b.orderIndex ?? b.order_index ?? 0), 0);
  if (bookFieldOrder) bookFieldOrder.value = maxOrder + 1;

  // Tags & Description
  if (bookFieldTags) {
    bookFieldTags.value = Array.isArray(sourceBook.tags) ? sourceBook.tags.join(', ') : (sourceBook.tags || '');
  }
  if (bookFieldDesc) {
    bookFieldDesc.value = sourceBook.description || '';
  }

  // Cover image: retain source cover as visual starter
  const sourceImage = sourceBook.image || '/assets/placeholder-cover.svg';
  if (bookFieldImage) bookFieldImage.value = sourceImage;
  updateCoverPreview(sourceImage);

  // Generate clean unique ID
  generateUniqueBookId(targetSeriesId, sourceBook.title, nextSub);

  // Synchronize WhatsApp template
  generateWaTemplateForCurrentBook();

  // Published toggle defaults to active for new book
  if (bookFieldPublished) bookFieldPublished.checked = true;

  // Form mode is create (saving will POST a brand new book)
  if (bookFieldMode) bookFieldMode.value = 'create';
  if (bookFieldId) bookFieldId.disabled = false;

  // Visual context badges
  if (bookModalTitle) bookModalTitle.textContent = 'Add New Book (Duplicate)';
  const subEl = document.getElementById('book-modal-sub');
  if (subEl) {
    subEl.textContent = `Cloned template from "${sourceBook.title}${rawSub ? ' - ' + rawSub : ''}". Modify fields and save.`;
  }

  if (bookDuplicateBanner) {
    bookDuplicateBanner.classList.remove('hidden');
    if (bookDuplicateBannerDesc) {
      bookDuplicateBannerDesc.textContent = `Pre-populated from "${sourceBook.title}${rawSub ? ' - ' + rawSub : ''}". Adjust subtitle, slug, or cover image below and save as a new book.`;
    }
  }

  if (bookDuplicateClearBtn) {
    bookDuplicateClearBtn.classList.remove('hidden');
  }

  if (bookDuplicateSourceSelect) {
    bookDuplicateSourceSelect.value = sourceBookId;
  }
  if (bookDuplicateApplyBtn) {
    bookDuplicateApplyBtn.disabled = true;
  }

  // Automatically focus on the Subtitle field for quickest editing
  setTimeout(() => {
    if (bookFieldSubtitle) {
      bookFieldSubtitle.focus();
      bookFieldSubtitle.select();
    }
  }, 100);
}

/* ── Book Modal (Add / Edit) ───────────────────────────────── */
function openBookModal(mode = 'create', bookId = null) {
  if (!bookModal) return;

  bookModalForm.reset();
  renderSeriesOptionsInBookModal();

  if (mode === 'edit') {
    bookFieldMode.value = 'edit';
    if (bookDuplicateBar) bookDuplicateBar.classList.add('hidden');
    if (bookDuplicateBanner) bookDuplicateBanner.classList.add('hidden');

    bookModalTitle.textContent = 'Edit Book';
    const subEl = document.getElementById('book-modal-sub');
    if (subEl) subEl.textContent = `Editing: ${bookId}`;

    const book = state.books.find(b => b.id === bookId);
    if (!book) return;

    bookFieldSeries.value = book.seriesId || book.series_id || '';
    bookFieldId.value = book.id;
    bookFieldId.disabled = true;
    bookFieldTitle.value = book.title || '';
    bookFieldSubtitle.value = book.subtitle || '';
    bookFieldImage.value = book.image || '';
    updateCoverPreview(book.image || '');
    bookFieldTags.value = Array.isArray(book.tags) ? book.tags.join(', ') : (book.tags || '');
    bookFieldOrder.value = book.orderIndex ?? book.order_index ?? 0;
    bookFieldDesc.value = book.description || '';
    bookFieldWa.value = book.whatsappMessage || book.whatsapp_message || '';
    bookFieldPublished.checked = Boolean(book.isPublished);

    bookModal.classList.remove('hidden');
    return;
  }

  // Mode is 'create' or 'duplicate'
  bookFieldMode.value = 'create';
  if (bookDuplicateBar) bookDuplicateBar.classList.remove('hidden');

  if (mode === 'duplicate' && bookId) {
    renderDuplicateSourceOptions(bookId);
    duplicateFromBook(bookId);
  } else {
    // Fresh create
    bookModalTitle.textContent = 'Add New Book';
    const subEl = document.getElementById('book-modal-sub');
    if (subEl) subEl.textContent = 'Add a curriculum title to your public catalogue.';
    bookFieldPublished.checked = true;
    bookFieldOrder.value = state.books.length + 1;
    bookFieldImage.value = '/assets/placeholder-cover.svg';
    updateCoverPreview('/assets/placeholder-cover.svg');

    if (state.activeSeriesFilter !== 'all') {
      bookFieldSeries.value = state.activeSeriesFilter;
    }

    bookFieldId.disabled = false;
    delete bookFieldId.dataset.dirty;

    renderDuplicateSourceOptions();
    if (bookDuplicateBanner) bookDuplicateBanner.classList.add('hidden');
    if (bookDuplicateClearBtn) bookDuplicateClearBtn.classList.add('hidden');
  }

  bookModal.classList.remove('hidden');
}

function updateCoverPreview(url) {
  if (!bookCoverPreview) return;
  const clean = (url || '').trim();
  if (clean && clean !== '/assets/placeholder-cover.svg') {
    bookCoverPreview.src = clean;
    if (clearCoverBtn) clearCoverBtn.classList.remove('hidden');
  } else {
    bookCoverPreview.src = '/assets/placeholder-cover.svg';
    if (clearCoverBtn) clearCoverBtn.classList.add('hidden');
  }
}

if (bookFieldImage) {
  bookFieldImage.addEventListener('input', (e) => {
    updateCoverPreview(e.target.value);
  });
}

if (clearCoverBtn) {
  clearCoverBtn.addEventListener('click', () => {
    if (bookFieldImage) bookFieldImage.value = '';
    updateCoverPreview('');
  });
}

if (uploadCoverDirectBtn) {
  uploadCoverDirectBtn.addEventListener('click', () => {
    // When direct upload completes, set the book's cover image automatically & persist if editing
    state.uploadTargetCallback = async (uploadedUrl) => {
      if (bookFieldImage) {
        bookFieldImage.value = uploadedUrl;
        updateCoverPreview(uploadedUrl);
      }

      const currentBookId = bookFieldId ? bookFieldId.value.trim() : null;
      const mode = bookFieldMode ? bookFieldMode.value : 'create';

      if (mode === 'edit' && currentBookId) {
        await applyCoverToBook(currentBookId, uploadedUrl);
      } else {
        showToast('Cover updated with uploaded asset! Click "Save Book" below to complete.', 'success');
      }
    };
    openUploadModal();
  });
}

if (browseMediaForBookBtn) {
  browseMediaForBookBtn.addEventListener('click', () => {
    openMediaPicker();
  });
}

if (bookFieldTitle) {
  bookFieldTitle.addEventListener('input', () => {
    if (bookFieldMode.value === 'create' && !bookFieldId.dataset.dirty) {
      const seriesSlug = bookFieldSeries.value || 'book';
      const titleSlug = bookFieldTitle.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const subSlug = bookFieldSubtitle.value ? '-' + bookFieldSubtitle.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '';
      bookFieldId.value = `${seriesSlug}-${titleSlug}${subSlug}`.slice(0, 50);
    }
  });
}

if (bookFieldSubtitle) {
  bookFieldSubtitle.addEventListener('input', () => {
    if (bookFieldMode.value === 'create' && !bookFieldId.dataset.dirty) {
      const seriesSlug = bookFieldSeries.value || 'book';
      const titleSlug = (bookFieldTitle ? bookFieldTitle.value : '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const subSlug = bookFieldSubtitle.value ? '-' + bookFieldSubtitle.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') : '';
      bookFieldId.value = `${seriesSlug}-${titleSlug}${subSlug}`.slice(0, 50);
    }
  });
}

if (bookFieldId) {
  bookFieldId.addEventListener('input', () => {
    bookFieldId.dataset.dirty = 'true';
  });
}

if (generateWaTemplateBtn) {
  generateWaTemplateBtn.addEventListener('click', () => {
    generateWaTemplateForCurrentBook();
    showToast('WhatsApp enquiry template generated!', 'info');
  });
}

if (bookDuplicateSourceSelect) {
  bookDuplicateSourceSelect.addEventListener('change', () => {
    if (bookDuplicateApplyBtn) {
      bookDuplicateApplyBtn.disabled = !bookDuplicateSourceSelect.value;
    }
  });
}

if (bookDuplicateApplyBtn) {
  bookDuplicateApplyBtn.addEventListener('click', () => {
    const selectedId = bookDuplicateSourceSelect ? bookDuplicateSourceSelect.value : null;
    if (selectedId) {
      duplicateFromBook(selectedId);
      showToast('Template fields loaded! Customize and save book.', 'info');
    }
  });
}

if (bookDuplicateClearBtn) {
  bookDuplicateClearBtn.addEventListener('click', () => {
    openBookModal('create');
    showToast('Reset to blank book form.', 'info');
  });
}

if (addBookBtn) {
  addBookBtn.addEventListener('click', () => openBookModal('create'));
}

if (bookModalForm) {
  bookModalForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const saveBtn = document.getElementById('save-book-btn');
    const btnText = saveBtn.querySelector('.btn-text');
    const btnSpinner = saveBtn.querySelector('.btn-spinner');

    btnText.classList.add('hidden');
    btnSpinner.classList.remove('hidden');
    saveBtn.disabled = true;

    const mode = bookFieldMode.value;
    const payload = {
      id: bookFieldId.value.trim(),
      seriesId: bookFieldSeries.value,
      title: bookFieldTitle.value.trim(),
      subtitle: bookFieldSubtitle.value.trim(),
      image: bookFieldImage.value.trim(),
      tags: bookFieldTags.value.split(',').map(t => t.trim()).filter(Boolean),
      orderIndex: parseInt(bookFieldOrder.value, 10) || 0,
      description: bookFieldDesc.value.trim(),
      whatsappMessage: bookFieldWa.value.trim(),
      isPublished: bookFieldPublished.checked,
    };

    try {
      await apiRequest('/api/cms/books', {
        method: mode === 'create' ? 'POST' : 'PUT',
        body: JSON.stringify(payload),
      });

      closeModal('book-modal');
      showToast(mode === 'create' ? 'New book added to catalogue!' : 'Book details saved!', 'success');
      await Promise.all([loadCatalogue(), loadDashboard()]);
    } catch (err) {
      showToast(err.message || 'Failed to save book.', 'error');
    } finally {
      btnText.classList.remove('hidden');
      btnSpinner.classList.add('hidden');
      saveBtn.disabled = false;
    }
  });
}

/* ── Series Modal Operations ───────────────────────────────── */
function openSeriesModal() {
  if (!seriesModal) return;
  renderSeriesModalList();
  resetSeriesForm();
  seriesModal.classList.remove('hidden');
}

if (manageSeriesBtn) {
  manageSeriesBtn.addEventListener('click', openSeriesModal);
}

function renderSeriesModalList() {
  if (!seriesItemsListEl) return;
  seriesItemsListEl.innerHTML = '';

  state.series.forEach(s => {
    const bookCount = state.books.filter(b => (b.seriesId || b.series_id) === s.id).length;
    const row = document.createElement('div');
    row.className = 'series-item-row';
    row.innerHTML = `
      <div class="series-row-left">
        <span class="series-color-swatch" style="background:${s.color}"></span>
        <div class="series-row-info">
          <strong>${escapeHtml(s.label)}</strong>
          <small>${bookCount} books • Slug: <code>${escapeHtml(s.id)}</code></small>
        </div>
      </div>
      <div class="series-row-actions">
        <button type="button" class="btn-subtle edit-series-btn" data-id="${escapeHtml(s.id)}" title="Edit series">
          Edit
        </button>
        <button type="button" class="btn-subtle delete-series-btn" data-id="${escapeHtml(s.id)}" title="Delete series">
          Delete
        </button>
      </div>
    `;

    row.querySelector('.edit-series-btn').addEventListener('click', () => {
      populateSeriesForm(s);
    });

    row.querySelector('.delete-series-btn').addEventListener('click', () => {
      openDeleteModal('series', s.id, s.label);
    });

    seriesItemsListEl.appendChild(row);
  });
}

function populateSeriesForm(s) {
  seriesFieldMode.value = 'edit';
  seriesFormHeading.textContent = `Edit Series: ${s.label}`;
  seriesFieldId.value = s.id;
  seriesFieldId.disabled = true;
  seriesFieldLabel.value = s.label || '';
  seriesFieldTagline.value = s.tagline || '';
  seriesFieldDesc.value = s.description || '';
  seriesFieldColor.value = s.color || '#0878c9';
  seriesFieldColorPicker.value = s.color || '#0878c9';
  seriesFieldColorLight.value = s.colorLight || '#e7f2ff';
  seriesFieldColorLightPicker.value = s.colorLight || '#e7f2ff';
  seriesFieldOrder.value = s.orderIndex ?? s.order_index ?? 0;
  if (seriesFormResetBtn) seriesFormResetBtn.classList.remove('hidden');
}

function resetSeriesForm() {
  seriesModalForm.reset();
  seriesFieldMode.value = 'create';
  seriesFormHeading.textContent = 'Add New Series';
  seriesFieldId.disabled = false;
  seriesFieldColor.value = '#0878c9';
  seriesFieldColorPicker.value = '#0878c9';
  seriesFieldColorLight.value = '#e7f2ff';
  seriesFieldColorLightPicker.value = '#e7f2ff';
  seriesFieldOrder.value = state.series.length + 1;
  if (seriesFormResetBtn) seriesFormResetBtn.classList.add('hidden');
}

if (seriesFormResetBtn) {
  seriesFormResetBtn.addEventListener('click', resetSeriesForm);
}

if (seriesFieldColorPicker && seriesFieldColor) {
  seriesFieldColorPicker.addEventListener('input', (e) => seriesFieldColor.value = e.target.value);
  seriesFieldColor.addEventListener('input', (e) => seriesFieldColorPicker.value = e.target.value);
}
if (seriesFieldColorLightPicker && seriesFieldColorLight) {
  seriesFieldColorLightPicker.addEventListener('input', (e) => seriesFieldColorLight.value = e.target.value);
  seriesFieldColorLight.addEventListener('input', (e) => seriesFieldColorLightPicker.value = e.target.value);
}

if (seriesFieldLabel) {
  seriesFieldLabel.addEventListener('input', () => {
    if (seriesFieldMode.value === 'create' && !seriesFieldId.dataset.dirty) {
      seriesFieldId.value = seriesFieldLabel.value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
  });
}
if (seriesFieldId) {
  seriesFieldId.addEventListener('input', () => {
    seriesFieldId.dataset.dirty = 'true';
  });
}

if (seriesModalForm) {
  seriesModalForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const saveBtn = document.getElementById('save-series-btn');
    const btnText = saveBtn.querySelector('.btn-text');
    const btnSpinner = saveBtn.querySelector('.btn-spinner');

    btnText.classList.add('hidden');
    btnSpinner.classList.remove('hidden');
    saveBtn.disabled = true;

    const mode = seriesFieldMode.value;
    const payload = {
      id: seriesFieldId.value.trim(),
      label: seriesFieldLabel.value.trim(),
      tagline: seriesFieldTagline.value.trim(),
      description: seriesFieldDesc.value.trim(),
      color: seriesFieldColor.value.trim(),
      colorLight: seriesFieldColorLight.value.trim(),
      orderIndex: parseInt(seriesFieldOrder.value, 10) || 0,
    };

    try {
      await apiRequest('/api/cms/series', {
        method: mode === 'create' ? 'POST' : 'PUT',
        body: JSON.stringify(payload),
      });

      showToast(mode === 'create' ? 'Series created!' : 'Series updated!', 'success');
      await Promise.all([loadCatalogue(), loadDashboard()]);
      renderSeriesModalList();
      resetSeriesForm();
    } catch (err) {
      showToast(err.message || 'Failed to save series.', 'error');
    } finally {
      btnText.classList.remove('hidden');
      btnSpinner.classList.add('hidden');
      saveBtn.disabled = false;
    }
  });
}

/* ═══════════════════════════════════════════════════════════════
   PHASE 3: MEDIA LIBRARY OPERATIONS
   ═══════════════════════════════════════════════════════════════ */

async function loadMedia() {
  if (mediaLoadingEl) mediaLoadingEl.classList.remove('hidden');
  if (mediaEmptyEl) mediaEmptyEl.classList.add('hidden');

  try {
    const res = await apiRequest('/api/cms/media');
    state.media = Array.isArray(res.media) ? res.media : [];
    state.hasBlobToken = Boolean(res.hasBlobToken);

    updateBlobBadge(state.hasBlobToken);
    updateMediaCounts();
    renderMediaGallery();
    renderBooksGrid();
  } catch (err) {
    console.error('[CMS Media] Load error:', err);
    showToast('Failed to scan media assets.', 'error');
  } finally {
    if (mediaLoadingEl) mediaLoadingEl.classList.add('hidden');
  }
}

function updateBlobBadge(connected) {
  if (!blobStatusBadge || !blobStatusText) return;
  const pulse = blobStatusBadge.querySelector('.status-pulse-sm');
  if (connected) {
    if (pulse) pulse.className = 'status-pulse-sm connected';
    blobStatusText.textContent = 'Vercel Blob Active';
    blobStatusBadge.title = 'Cloud storage active. New uploads will be served via Vercel Edge.';
  } else {
    if (pulse) pulse.className = 'status-pulse-sm local';
    blobStatusText.textContent = 'Local Assets (35+)';
    blobStatusBadge.title = 'Serving built-in repository assets. Add BLOB_READ_WRITE_TOKEN to enable cloud uploads.';
  }
}

function updateMediaCounts() {
  const allEl = document.getElementById('media-count-all');
  const booksEl = document.getElementById('media-count-books');
  const logosEl = document.getElementById('media-count-logos');
  const cloudEl = document.getElementById('media-count-cloud');

  if (allEl) allEl.textContent = state.media.length;
  if (booksEl) booksEl.textContent = state.media.filter(m => m.category === 'Books & Covers').length;
  if (logosEl) logosEl.textContent = state.media.filter(m => m.category === 'Logos & Brand').length;
  if (cloudEl) cloudEl.textContent = state.media.filter(m => m.category === 'Cloud Uploads').length;
}

function renderMediaGallery() {
  if (!mediaGridEl) return;

  const query = (state.mediaSearch || '').toLowerCase().trim();
  const filtered = state.media.filter(item => {
    const matchCat = state.activeMediaCategory === 'all' || item.category === state.activeMediaCategory;
    if (!matchCat) return false;
    if (query && !item.name.toLowerCase().includes(query)) return false;
    return true;
  });

  if (filtered.length === 0) {
    mediaGridEl.innerHTML = '';
    if (mediaEmptyEl) mediaEmptyEl.classList.remove('hidden');
    return;
  }

  if (mediaEmptyEl) mediaEmptyEl.classList.add('hidden');
  mediaGridEl.innerHTML = '';

  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'media-card';
    card.innerHTML = `
      <div class="media-thumb-wrap">
        <img src="${escapeHtml(item.url)}" alt="${escapeHtml(item.name)}" loading="lazy" onerror="this.src='/assets/placeholder-cover.svg'">
      </div>
      <div class="media-card-details">
        <span class="media-badge-tag ${item.isBlob ? 'blob' : ''}">${escapeHtml(item.category)}</span>
        <div class="media-card-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</div>
        <div class="media-card-size">${formatBytes(item.size)}</div>
        <div class="media-card-actions">
          <button type="button" class="copy-url-btn" data-url="${escapeHtml(item.url)}">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            <span>Copy URL</span>
          </button>
          <button type="button" class="assign-cover-btn" data-url="${escapeHtml(item.url)}" data-name="${escapeHtml(item.name)}" title="Assign as curriculum book cover">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path></svg>
            <span>Assign to Book</span>
          </button>
          ${item.isBlob ? `
            <button type="button" class="icon-action-btn delete-btn delete-media-btn" data-url="${escapeHtml(item.url)}" title="Delete cloud asset">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            </button>
          ` : ''}
        </div>
      </div>
    `;

    card.querySelector('.copy-url-btn').addEventListener('click', (e) => {
      const url = e.currentTarget.dataset.url;
      copyToClipboard(url, 'Asset URL copied to clipboard!');
    });

    const assignBtn = card.querySelector('.assign-cover-btn');
    if (assignBtn) {
      assignBtn.addEventListener('click', (e) => {
        const url = e.currentTarget.dataset.url;
        const name = e.currentTarget.dataset.name;
        openAssignMediaModal(url, name);
      });
    }

    const deleteBtn = card.querySelector('.delete-media-btn');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => {
        openDeleteModal('media', item.url, item.name);
      });
    }

    mediaGridEl.appendChild(card);
  });
}

// Media category filter pills
mediaFilterPills.forEach(pill => {
  pill.addEventListener('click', () => {
    mediaFilterPills.forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    state.activeMediaCategory = pill.dataset.mediaCat;
    renderMediaGallery();
  });
});

if (mediaSearchInput) {
  mediaSearchInput.addEventListener('input', (e) => {
    state.mediaSearch = e.target.value;
    renderMediaGallery();
  });
}

if (refreshMediaBtn) {
  refreshMediaBtn.addEventListener('click', async () => {
    refreshMediaBtn.disabled = true;
    showToast('Refreshing media assets...', 'info');
    await loadMedia();
    refreshMediaBtn.disabled = false;
    showToast('Media assets updated!', 'success');
  });
}

/* ── Media Upload Modal ────────────────────────────────────── */
function openUploadModal() {
  if (!uploadModal) return;
  resetUploadState();
  if (blobWarningBanner) {
    blobWarningBanner.classList.toggle('hidden', state.hasBlobToken);
  }
  uploadModal.classList.remove('hidden');
}

if (uploadMediaBtn) {
  uploadMediaBtn.addEventListener('click', openUploadModal);
}

function resetUploadState() {
  state.uploadFileData = null;
  state.uploadQueue = [];
  if (uploadFileInput) uploadFileInput.value = '';
  if (uploadDropzone) uploadDropzone.classList.remove('hidden', 'dragover');
  if (uploadQueueContainer) uploadQueueContainer.classList.remove('dragover');
  if (uploadQueueContainer) uploadQueueContainer.classList.add('hidden');
  if (uploadQueueList) uploadQueueList.innerHTML = '';
  if (uploadProgressWrap) uploadProgressWrap.classList.add('hidden');
  if (uploadProgressBar) uploadProgressBar.style.width = '0%';
  if (uploadProgressPct) uploadProgressPct.textContent = '0%';
  if (uploadProgressStatus) uploadProgressStatus.textContent = 'Uploading assets...';
  if (uploadOverrideRow) uploadOverrideRow.classList.add('hidden');
  if (uploadOverrideCheckbox) uploadOverrideCheckbox.checked = false;
  if (startUploadBtn) {
    startUploadBtn.disabled = true;
    const btnText = startUploadBtn.querySelector('.btn-text');
    const btnSpinner = startUploadBtn.querySelector('.btn-spinner');
    if (btnText) {
      btnText.textContent = 'Upload to Library';
      btnText.classList.remove('hidden');
    }
    if (btnSpinner) btnSpinner.classList.add('hidden');
  }
  if (uploadAddMoreBtn) uploadAddMoreBtn.disabled = false;
  if (uploadClearAllBtn) uploadClearAllBtn.disabled = false;
}

// Drag & drop listeners for both Dropzone and Queue Container
if (uploadDropzone) {
  uploadDropzone.addEventListener('click', () => {
    if (uploadFileInput) {
      uploadFileInput.value = '';
      uploadFileInput.click();
    }
  });

  ['dragenter', 'dragover'].forEach(evt => {
    uploadDropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadDropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(evt => {
    uploadDropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadDropzone.classList.remove('dragover');
    });
  });

  uploadDropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadDropzone.classList.remove('dragover');
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
      handleFilesSelected(e.dataTransfer.files);
    }
  });
}

if (uploadQueueContainer) {
  ['dragenter', 'dragover'].forEach(evt => {
    uploadQueueContainer.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadQueueContainer.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach(evt => {
    uploadQueueContainer.addEventListener(evt, (e) => {
      e.preventDefault();
      e.stopPropagation();
      uploadQueueContainer.classList.remove('dragover');
    });
  });

  uploadQueueContainer.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    uploadQueueContainer.classList.remove('dragover');
    if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
      handleFilesSelected(e.dataTransfer.files);
    }
  });
}

if (uploadFileInput) {
  uploadFileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length) {
      handleFilesSelected(e.target.files);
    }
  });
}

if (uploadAddMoreBtn) {
  uploadAddMoreBtn.addEventListener('click', () => {
    if (uploadFileInput) {
      uploadFileInput.value = '';
      uploadFileInput.click();
    }
  });
}

if (uploadClearAllBtn) {
  uploadClearAllBtn.addEventListener('click', resetUploadState);
}

if (uploadOverrideCheckbox) {
  uploadOverrideCheckbox.addEventListener('change', () => {
    updateQueueValidation();
  });
}

/* ── Queue Management & Validation ─────────────────────────── */
function removeFromQueue(id) {
  state.uploadQueue = state.uploadQueue.filter(it => it.id !== id);
  if (!state.uploadQueue.length) {
    resetUploadState();
  } else {
    renderUploadQueue();
  }
}

function updateQueueValidation() {
  if (!state.uploadQueue || !state.uploadQueue.length) {
    if (startUploadBtn) startUploadBtn.disabled = true;
    return;
  }

  const pending = state.uploadQueue.filter(it => it.status !== 'done');
  if (!pending.length) {
    if (startUploadBtn) startUploadBtn.disabled = true;
    return;
  }

  const hasExceeded = pending.some(it => it.isExceeded);
  const hasOversized = pending.some(it => it.isOversized);

  if (uploadValidationBanner) {
    uploadValidationBanner.className = 'upload-validation-banner';

    if (hasExceeded) {
      uploadValidationBanner.classList.add('validation-danger');
      if (uploadValidationIcon) uploadValidationIcon.textContent = '✕';
      if (uploadValidationTitle) uploadValidationTitle.textContent = 'Asset Exceeds 4 MB Limit';
      if (uploadValidationDesc) uploadValidationDesc.textContent = 'One or more assets exceed the 4 MB serverless threshold. Remove them (✕) or compress them before uploading.';
      if (uploadOverrideRow) uploadOverrideRow.classList.add('hidden');
      if (startUploadBtn) startUploadBtn.disabled = true;
    } else if (hasOversized) {
      uploadValidationBanner.classList.add('validation-warning');
      if (uploadValidationIcon) uploadValidationIcon.textContent = '⚠️';
      if (uploadValidationTitle) uploadValidationTitle.textContent = 'Heavy Asset Warning';
      if (uploadValidationDesc) uploadValidationDesc.textContent = 'One or more assets exceed 1.8 MB. High-resolution imagery may impact mobile loading. Check confirmation below to proceed.';
      if (uploadOverrideRow) uploadOverrideRow.classList.remove('hidden');
      if (startUploadBtn) {
        startUploadBtn.disabled = !(uploadOverrideCheckbox && uploadOverrideCheckbox.checked);
      }
    } else {
      uploadValidationBanner.classList.add('validation-optimal');
      if (uploadValidationIcon) uploadValidationIcon.textContent = '✓';
      if (uploadValidationTitle) uploadValidationTitle.textContent = 'Web-Optimized Assets';
      if (uploadValidationDesc) uploadValidationDesc.textContent = `${pending.length} asset${pending.length > 1 ? 's' : ''} verified and ready for high-speed cloud delivery.`;
      if (uploadOverrideRow) uploadOverrideRow.classList.add('hidden');
      if (startUploadBtn) startUploadBtn.disabled = false;
    }
  }

  if (startUploadBtn) {
    const btnText = startUploadBtn.querySelector('.btn-text');
    if (btnText) {
      btnText.textContent = `Upload ${pending.length} ${pending.length === 1 ? 'Asset' : 'Assets'} to Library`;
    }
  }
}

function renderUploadQueue() {
  if (!state.uploadQueue || state.uploadQueue.length === 0) {
    resetUploadState();
    return;
  }

  if (uploadDropzone) uploadDropzone.classList.add('hidden');
  if (uploadQueueContainer) uploadQueueContainer.classList.remove('hidden');

  const totalCount = state.uploadQueue.length;
  const totalBytes = state.uploadQueue.reduce((acc, it) => acc + (it.size || 0), 0);

  if (queueCountLabel) {
    queueCountLabel.textContent = `${totalCount} ${totalCount === 1 ? 'file' : 'files'} selected`;
  }
  if (queueSizeLabel) {
    queueSizeLabel.textContent = formatBytes(totalBytes);
  }

  if (uploadQueueList) {
    uploadQueueList.innerHTML = state.uploadQueue.map(item => {
      let badgeHtml = '';
      if (item.status === 'uploading') {
        badgeHtml = `<span class="queue-spinner"><span class="spinner-circle"></span> Uploading...</span>`;
      } else if (item.status === 'done') {
        badgeHtml = `<span class="queue-badge badge-success">✓ Uploaded</span>`;
      } else if (item.status === 'error') {
        badgeHtml = `<span class="queue-badge badge-danger" title="${escapeHtml(item.errorMsg || 'Failed')}">✕ Failed</span>`;
      } else {
        if (item.isExceeded) {
          badgeHtml = `<span class="queue-badge badge-danger" title="Exceeds 4 MB serverless payload limit">Exceeds 4MB</span>`;
        } else if (item.isOversized) {
          badgeHtml = `<span class="queue-badge badge-warning" title="Heavy asset (>1.8MB). Recommended under 600 KB.">Heavy</span>`;
        } else {
          badgeHtml = `<span class="queue-badge badge-optimal">Optimal</span>`;
        }
      }

      const dimsText = item.isSvg
        ? 'Vector SVG'
        : (item.width && item.height ? `${item.width} × ${item.height} px` : 'Inspecting...');

      const itemClass = ['upload-queue-item', item.status].filter(Boolean).join(' ');
      const isLocked = item.status === 'uploading' || item.status === 'done';

      return `
        <div class="${itemClass}" data-id="${item.id}">
          <img class="queue-item-thumb" src="${item.dataUrl || '/assets/logos/logo.png'}" alt="${escapeHtml(item.name)}">
          <div class="queue-item-meta">
            <div class="queue-item-name" title="${escapeHtml(item.name)}">${escapeHtml(item.name)}</div>
            <div class="queue-item-details">
              <span class="queue-item-format">${item.format}</span>
              <span>• ${dimsText}</span>
              <span>• ${formatBytes(item.size)}</span>
            </div>
          </div>
          <div class="queue-item-status-col">
            ${badgeHtml}
          </div>
          ${!isLocked ? `
            <button type="button" class="queue-item-remove-btn" data-remove-id="${item.id}" title="Remove file from queue">
              ✕
            </button>
          ` : ''}
        </div>
      `;
    }).join('');

    uploadQueueList.querySelectorAll('.queue-item-remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-remove-id');
        removeFromQueue(id);
      });
    });
  }

  updateQueueValidation();
}

function handleFilesSelected(fileList) {
  if (!fileList || !fileList.length) return;

  const files = Array.from(fileList);
  let skippedNonImages = 0;
  let skippedLarge = 0;
  let skippedDuplicates = 0;
  const validFiles = [];

  for (const file of files) {
    const isImage = file.type.startsWith('image/') || /\.(jpe?g|png|webp|svg)$/i.test(file.name);
    if (!isImage) {
      skippedNonImages++;
      continue;
    }
    if (file.size > 15 * 1024 * 1024) {
      skippedLarge++;
      continue;
    }
    const isDup = state.uploadQueue.some(item => item.name === file.name && item.size === file.size);
    if (isDup) {
      skippedDuplicates++;
      continue;
    }
    validFiles.push(file);
  }

  if (skippedNonImages > 0) {
    showToast(`Skipped ${skippedNonImages} non-image file${skippedNonImages > 1 ? 's' : ''}.`, 'warning');
  }
  if (skippedLarge > 0) {
    showToast(`Skipped ${skippedLarge} file${skippedLarge > 1 ? 's' : ''} over 15 MB.`, 'error');
  }
  if (skippedDuplicates > 0) {
    showToast(`Skipped ${skippedDuplicates} already selected file${skippedDuplicates > 1 ? 's' : ''}.`, 'info');
  }

  if (!validFiles.length) return;

  for (const file of validFiles) {
    const ext = (file.name.split('.').pop() || 'IMG').toUpperCase();
    const mimeFormat = file.type ? file.type.replace('image/', '').toUpperCase() : ext;
    const isSvg = file.type === 'image/svg+xml' || ext === 'SVG';
    const sizeMB = file.size / (1024 * 1024);

    const queueItem = {
      id: 'uq_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
      file,
      name: file.name,
      size: file.size,
      contentType: file.type || (isSvg ? 'image/svg+xml' : 'image/jpeg'),
      format: mimeFormat,
      isSvg,
      width: null,
      height: null,
      base64: null,
      dataUrl: '',
      isExceeded: sizeMB > 4.0,
      isOversized: sizeMB > 1.8 && sizeMB <= 4.0,
      status: 'pending',
      errorMsg: null,
      uploadedUrl: null,
    };

    state.uploadQueue.push(queueItem);

    const reader = new FileReader();
    reader.onload = (e) => {
      queueItem.dataUrl = e.target.result;
      queueItem.base64 = e.target.result.split(',')[1];

      if (isSvg) {
        queueItem.width = 'SVG';
        queueItem.height = 'Vector';
        renderUploadQueue();
      } else {
        const img = new Image();
        img.onload = () => {
          queueItem.width = img.naturalWidth;
          queueItem.height = img.naturalHeight;
          renderUploadQueue();
        };
        img.onerror = () => {
          queueItem.width = '--';
          queueItem.height = '--';
          renderUploadQueue();
        };
        img.src = e.target.result;
      }
    };
    reader.readAsDataURL(file);
  }

  renderUploadQueue();
}

if (startUploadBtn) {
  startUploadBtn.addEventListener('click', async () => {
    const pending = state.uploadQueue.filter(it => it.status !== 'done');
    if (!pending.length) return;

    const btnText = startUploadBtn.querySelector('.btn-text');
    const btnSpinner = startUploadBtn.querySelector('.btn-spinner');

    if (btnText) btnText.classList.add('hidden');
    if (btnSpinner) btnSpinner.classList.remove('hidden');
    startUploadBtn.disabled = true;

    if (uploadAddMoreBtn) uploadAddMoreBtn.disabled = true;
    if (uploadClearAllBtn) uploadClearAllBtn.disabled = true;
    if (uploadProgressWrap) uploadProgressWrap.classList.remove('hidden');

    const total = pending.length;
    let successCount = 0;
    let failCount = 0;
    const uploadedAssets = [];

    try {
      for (let i = 0; i < total; i++) {
        const item = pending[i];
        item.status = 'uploading';

        const startPct = Math.round((i / total) * 100);
        if (uploadProgressStatus) {
          uploadProgressStatus.textContent = `Uploading ${i + 1} of ${total}: ${item.name}...`;
        }
        if (uploadProgressPct) uploadProgressPct.textContent = `${startPct}%`;
        if (uploadProgressBar) uploadProgressBar.style.width = `${startPct}%`;
        renderUploadQueue();

        // Wait up to 5s if base64 reader hasn't finished yet
        if (!item.base64) {
          await new Promise((resolve) => {
            let waitCount = 0;
            const timer = setInterval(() => {
              waitCount++;
              if (item.base64 || waitCount > 50) {
                clearInterval(timer);
                resolve();
              }
            }, 100);
          });
        }

        try {
          const res = await apiRequest('/api/cms/media', {
            method: 'POST',
            body: JSON.stringify({
              filename: item.name,
              contentType: item.contentType,
              fileData: item.base64,
            }),
          });

          item.status = 'done';
          item.uploadedUrl = res && res.media && res.media.url ? res.media.url : null;
          const finalName = (res && res.media && res.media.name) || item.name;
          uploadedAssets.push({ url: item.uploadedUrl, name: finalName });
          successCount++;
        } catch (err) {
          console.error(`[Upload Error] ${item.name}:`, err);
          item.status = 'error';
          item.errorMsg = err.message || 'Upload failed.';
          failCount++;
        }

        const donePct = Math.round(((i + 1) / total) * 100);
        if (uploadProgressPct) uploadProgressPct.textContent = `${donePct}%`;
        if (uploadProgressBar) uploadProgressBar.style.width = `${donePct}%`;
        renderUploadQueue();
      }

      if (failCount === 0) {
        showToast(`Successfully uploaded ${successCount} media asset${successCount > 1 ? 's' : ''}!`, 'success');

        // Target callback (e.g. from Book Modal)
        if (typeof state.uploadTargetCallback === 'function' && uploadedAssets[0]?.url) {
          await state.uploadTargetCallback(uploadedAssets[0].url);
          state.uploadTargetCallback = null;
        } else if (uploadedAssets.length === 1 && uploadedAssets[0]?.url) {
          // Single standalone upload: prompt auto-assign if title matches
          const matched = findBestMatchingBook(uploadedAssets[0].name);
          if (matched) {
            setTimeout(() => {
              openAssignMediaModal(uploadedAssets[0].url, uploadedAssets[0].name);
              showToast(`💡 Auto-detected "${matched.title} ${matched.subtitle || ''}". Click "Assign & Publish" to link.`, 'info', 7000);
            }, 400);
          }
        }

        setTimeout(() => {
          closeModal('upload-modal');
          resetUploadState();
        }, 600);
      } else {
        showToast(`Uploaded ${successCount} assets. ${failCount} asset${failCount > 1 ? 's' : ''} encountered an error.`, 'error');
      }

      await loadMedia();
    } catch (err) {
      showToast(err.message || 'Media batch upload encountered an error.', 'error');
    } finally {
      if (btnText) btnText.classList.remove('hidden');
      if (btnSpinner) btnSpinner.classList.add('hidden');
      if (uploadAddMoreBtn) uploadAddMoreBtn.disabled = false;
      if (uploadClearAllBtn) uploadClearAllBtn.disabled = false;
      updateQueueValidation();
    }
  });
}

/* ── Media Picker Modal ────────────────────────────────────── */
function openMediaPicker() {
  if (!mediaPickerModal) return;
  renderPickerGallery();
  mediaPickerModal.classList.remove('hidden');
}

function renderPickerGallery() {
  if (!pickerGalleryGrid) return;
  const query = (pickerSearchInput ? pickerSearchInput.value : '').toLowerCase().trim();

  const filtered = state.media.filter(m => {
    if (query && !m.name.toLowerCase().includes(query)) return false;
    return true;
  });

  pickerGalleryGrid.innerHTML = '';
  filtered.forEach(item => {
    const card = document.createElement('div');
    card.className = 'picker-thumb-card';
    card.title = item.name;
    card.innerHTML = `
      <img class="picker-thumb-img" src="${escapeHtml(item.url)}" alt="${escapeHtml(item.name)}" loading="lazy">
      <span class="picker-thumb-name">${escapeHtml(item.name)}</span>
    `;

    card.addEventListener('click', async () => {
      if (bookFieldImage) {
        bookFieldImage.value = item.url;
        updateCoverPreview(item.url);
      }
      closeModal('media-picker-modal');

      const currentBookId = bookFieldId ? bookFieldId.value.trim() : null;
      const mode = bookFieldMode ? bookFieldMode.value : 'create';

      if (mode === 'edit' && currentBookId) {
        await applyCoverToBook(currentBookId, item.url);
      } else {
        showToast('Cover selected from Media Library! Click "Save Book" below to complete.', 'success');
      }
    });

    pickerGalleryGrid.appendChild(card);
  });
}

if (pickerSearchInput) {
  pickerSearchInput.addEventListener('input', renderPickerGallery);
}

/* ── Delete Confirmation Operations ────────────────────────── */
function openDeleteModal(type, id, title) {
  if (!deleteModal) return;

  state.itemToDelete = { type, id, title };

  if (type === 'book') {
    deleteModalTitle.textContent = 'Delete Book';
    deleteModalMessage.innerHTML = `Are you sure you want to permanently remove <strong>"${escapeHtml(title)}"</strong> from the catalogue?`;
  } else if (type === 'series') {
    deleteModalTitle.textContent = 'Delete Series';
    deleteModalMessage.innerHTML = `Are you sure you want to permanently delete the series <strong>"${escapeHtml(title)}"</strong>?<br><br><span style="color:#f87171;">⚠️ Warning: All books assigned to this series will also be deleted!</span>`;
  } else if (type === 'media') {
    deleteModalTitle.textContent = 'Delete Cloud Media';
    deleteModalMessage.innerHTML = `Are you sure you want to permanently delete <strong>"${escapeHtml(title)}"</strong> from cloud storage?`;
  } else if (type === 'faq') {
    deleteModalTitle.textContent = 'Delete FAQ';
    deleteModalMessage.innerHTML = `Are you sure you want to permanently delete the FAQ <strong>"${escapeHtml(title)}"</strong>?`;
  } else if (type === 'subscriber') {
    deleteModalTitle.textContent = 'Remove Subscriber';
    deleteModalMessage.innerHTML = `Are you sure you want to remove <strong>"${escapeHtml(title)}"</strong> from the newsletter list?`;
  }

  deleteModal.classList.remove('hidden');
}

if (confirmDeleteBtn) {
  confirmDeleteBtn.addEventListener('click', async () => {
    if (!state.itemToDelete) return;

    const { type, id, title } = state.itemToDelete;
    const btnText = confirmDeleteBtn.querySelector('.btn-text');
    const btnSpinner = confirmDeleteBtn.querySelector('.btn-spinner');

    btnText.classList.add('hidden');
    btnSpinner.classList.remove('hidden');
    confirmDeleteBtn.disabled = true;

    try {
      const deletedBookSnapshot = type === 'book' ? state.books.find(b => b.id === id) : null;
      const endpoint = type === 'book'
        ? `/api/cms/books?id=${encodeURIComponent(id)}`
        : type === 'series'
          ? `/api/cms/series?id=${encodeURIComponent(id)}`
          : type === 'media'
            ? `/api/cms/media?url=${encodeURIComponent(id)}`
            : type === 'faq'
              ? `/api/cms/faqs?id=${encodeURIComponent(id)}`
              : `/api/cms/subscribers?id=${encodeURIComponent(id)}`;

      await apiRequest(endpoint, { method: 'DELETE' });

      closeModal('delete-modal');

      if (type === 'book' && deletedBookSnapshot) {
        showUndoBar({
          type: 'book',
          title,
          data: deletedBookSnapshot,
          restoreFn: async () => {
            await apiRequest('/api/cms/books', {
              method: 'POST',
              body: JSON.stringify(deletedBookSnapshot),
            });
            await loadCatalogue();
            showToast(`Restored "${title}" to catalogue!`, 'success');
          }
        });
      } else {
        showToast(`Deleted "${title}" successfully.`, 'success');
      }

      if (type === 'media') {
        await loadMedia();
      } else if (type === 'faq') {
        await Promise.all([loadFaqs(), loadDashboard()]);
      } else if (type === 'subscriber') {
        await Promise.all([loadSubscribers(state.subscribersPage), loadDashboard()]);
      } else {
        await Promise.all([loadCatalogue(), loadDashboard()]);
        if (type === 'series') renderSeriesModalList();
      }
    } catch (err) {
      showToast(err.message || 'Failed to delete item.', 'error');
    } finally {
      btnText.classList.remove('hidden');
      btnSpinner.classList.add('hidden');
      confirmDeleteBtn.disabled = false;
      state.itemToDelete = null;
    }
  });
}

/* ── Floating Undo System ──────────────────────────────────── */
function showUndoBar(action) {
  if (!cmsUndoBar) {
    showToast(`Deleted "${action.title}".`, 'info');
    return;
  }

  if (state.undoTimeoutId) clearTimeout(state.undoTimeoutId);
  if (state.undoIntervalId) clearInterval(state.undoIntervalId);

  state.lastDeleted = action;
  if (undoMessage) undoMessage.textContent = `Deleted "${action.title}"`;

  let remaining = 10;
  if (undoTimerBadge) undoTimerBadge.textContent = `${remaining}s`;

  if (undoProgressBar) {
    undoProgressBar.style.transition = 'none';
    undoProgressBar.style.width = '100%';
    setTimeout(() => {
      undoProgressBar.style.transition = 'width 10s linear';
      undoProgressBar.style.width = '0%';
    }, 50);
  }

  cmsUndoBar.classList.remove('hidden');

  state.undoIntervalId = setInterval(() => {
    remaining -= 1;
    if (undoTimerBadge) undoTimerBadge.textContent = `${remaining}s`;
    if (remaining <= 0) {
      hideUndoBar();
    }
  }, 1000);

  state.undoTimeoutId = setTimeout(() => {
    hideUndoBar();
  }, 10000);
}

function hideUndoBar() {
  if (cmsUndoBar) cmsUndoBar.classList.add('hidden');
  if (state.undoTimeoutId) {
    clearTimeout(state.undoTimeoutId);
    state.undoTimeoutId = null;
  }
  if (state.undoIntervalId) {
    clearInterval(state.undoIntervalId);
    state.undoIntervalId = null;
  }
}

if (undoActionBtn) {
  undoActionBtn.addEventListener('click', async () => {
    if (state.lastDeleted && typeof state.lastDeleted.restoreFn === 'function') {
      const fn = state.lastDeleted.restoreFn;
      hideUndoBar();
      state.lastDeleted = null;
      try {
        await fn();
      } catch (err) {
        showToast(err.message || 'Could not restore item.', 'error');
      }
    }
  });
}

if (undoDismissBtn) {
  undoDismissBtn.addEventListener('click', hideUndoBar);
}

/* ── Global Modal Close Handlers ───────────────────────────── */
function closeModal(modalId) {
  const el = document.getElementById(modalId);
  if (el) el.classList.add('hidden');
}

document.querySelectorAll('[data-close-modal]').forEach(btn => {
  btn.addEventListener('click', () => {
    const modalId = btn.dataset.closeModal;
    closeModal(modalId);
  });
});

document.querySelectorAll('.cms-modal-backdrop').forEach(backdrop => {
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) {
      backdrop.classList.add('hidden');
    }
  });
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.cms-modal-backdrop:not(.hidden)').forEach(modal => {
      modal.classList.add('hidden');
    });
  }
});

/* ── Utility Helpers ───────────────────────────────────────── */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatPhone(num) {
  const digits = String(num || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return digits ? `+${digits}` : 'Not configured';
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

async function copyToClipboard(text, successMsg = 'Copied to clipboard!') {
  try {
    await navigator.clipboard.writeText(text);
    showToast(successMsg, 'success');
  } catch {
    window.prompt('Copy URL:', text);
  }
}

/* ═══════════════════════════════════════════════════════════════
   SECTION CONTENT EDITOR CONTROLLER
   ═══════════════════════════════════════════════════════════════ */
function initContentEditor() {
  const navPills = document.querySelectorAll('#content-nav-pills .content-nav-btn');
  const panes = document.querySelectorAll('.content-pane');
  const saveBtn = document.getElementById('save-content-btn');

  navPills.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetSec = btn.dataset.section;
      state.activeContentSection = targetSec;

      navPills.forEach(b => b.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const targetPane = document.getElementById(`pane-${targetSec}`);
      if (targetPane) targetPane.classList.add('active');
    });
  });

  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      await saveContent();
    });
  }
}

async function loadContent() {
  try {
    const res = await apiRequest('/api/cms/content');
    if (!res || !res.content) return;
    state.content = res.content;
    populateContentForm(res.content);
  } catch (err) {
    console.warn('[CMS Content] Load fallback:', err);
  }
}

function populateContentForm(c) {
  if (!c) return;

  // Hero
  if (c.hero) {
    const eb = document.getElementById('content-hero-eyebrow');
    const hd = document.getElementById('content-hero-heading');
    const ld = document.getElementById('content-hero-lead');
    const c1t = document.getElementById('content-hero-cta1-text');
    const c1l = document.getElementById('content-hero-cta1-link');
    const c2t = document.getElementById('content-hero-cta2-text');
    const c2l = document.getElementById('content-hero-cta2-link');
    const pills = document.getElementById('content-hero-pills');

    if (eb) eb.value = c.hero.eyebrow || '';
    if (hd) hd.value = c.hero.heading || '';
    if (ld) ld.value = c.hero.lead || '';
    if (c1t) c1t.value = c.hero.ctaPrimaryText || '';
    if (c1l) c1l.value = c.hero.ctaPrimaryLink || '';
    if (c2t) c2t.value = c.hero.ctaSecondaryText || '';
    if (c2l) c2l.value = c.hero.ctaSecondaryLink || '';
    if (pills && Array.isArray(c.hero.trustPills)) pills.value = c.hero.trustPills.join(', ');
  }

  // Marquee
  if (c.marquee && Array.isArray(c.marquee.items)) {
    for (let i = 0; i < 4; i++) {
      const inp = document.getElementById(`content-marquee-${i + 1}`);
      if (inp) inp.value = c.marquee.items[i] || '';
    }
  }

  // Stats
  if (c.stats) {
    for (let i = 1; i <= 4; i++) {
      const numInp = document.getElementById(`content-stat-${i}-num`);
      const lblInp = document.getElementById(`content-stat-${i}-label`);
      if (numInp) numInp.value = c.stats[`stat${i}Num`] || '';
      if (lblInp) lblInp.value = c.stats[`stat${i}Label`] || '';
    }
  }

  // Curriculum
  if (c.curriculum) {
    const eb = document.getElementById('content-curriculum-eyebrow');
    const hd = document.getElementById('content-curriculum-heading');
    const ld = document.getElementById('content-curriculum-lead');
    if (eb) eb.value = c.curriculum.eyebrow || '';
    if (hd) hd.value = c.curriculum.heading || '';
    if (ld) ld.value = c.curriculum.lead || '';
  }

  // Approach
  if (c.approach) {
    const eb = document.getElementById('content-approach-eyebrow');
    const hd = document.getElementById('content-approach-heading');
    const ld = document.getElementById('content-approach-lead');
    if (eb) eb.value = c.approach.eyebrow || '';
    if (hd) hd.value = c.approach.heading || '';
    if (ld) ld.value = c.approach.lead || '';
  }

  // Parents
  if (c.parents) {
    const eb = document.getElementById('content-parents-eyebrow');
    const hd = document.getElementById('content-parents-heading');
    const ld = document.getElementById('content-parents-lead');
    if (eb) eb.value = c.parents.eyebrow || '';
    if (hd) hd.value = c.parents.heading || '';
    if (ld) ld.value = c.parents.lead || '';
  }
}

async function saveContent() {
  const saveBtn = document.getElementById('save-content-btn');
  const btnText = saveBtn.querySelector('.btn-text');
  const btnSpinner = saveBtn.querySelector('.btn-spinner');

  btnText.classList.add('hidden');
  btnSpinner.classList.remove('hidden');
  saveBtn.disabled = true;

  try {
    const sec = state.activeContentSection;
    let payloadData = {};

    if (sec === 'hero') {
      const pillsRaw = document.getElementById('content-hero-pills')?.value || '';
      payloadData = {
        eyebrow: document.getElementById('content-hero-eyebrow')?.value || '',
        heading: document.getElementById('content-hero-heading')?.value || '',
        lead: document.getElementById('content-hero-lead')?.value || '',
        ctaPrimaryText: document.getElementById('content-hero-cta1-text')?.value || '',
        ctaPrimaryLink: document.getElementById('content-hero-cta1-link')?.value || '',
        ctaSecondaryText: document.getElementById('content-hero-cta2-text')?.value || '',
        ctaSecondaryLink: document.getElementById('content-hero-cta2-link')?.value || '',
        trustPills: pillsRaw.split(',').map(p => p.trim()).filter(Boolean)
      };
    } else if (sec === 'marquee') {
      const items = [];
      for (let i = 1; i <= 4; i++) {
        const val = document.getElementById(`content-marquee-${i}`)?.value.trim();
        if (val) items.push(val);
      }
      payloadData = { items };
    } else if (sec === 'stats') {
      payloadData = {
        stat1Num: document.getElementById('content-stat-1-num')?.value || '9',
        stat1Label: document.getElementById('content-stat-1-label')?.value || 'Grade levels',
        stat2Num: document.getElementById('content-stat-2-num')?.value || '3',
        stat2Label: document.getElementById('content-stat-2-label')?.value || 'Book series',
        stat3Num: document.getElementById('content-stat-3-num')?.value || '6',
        stat3Label: document.getElementById('content-stat-3-label')?.value || 'Learning strands',
        stat4Num: document.getElementById('content-stat-4-num')?.value || '1',
        stat4Label: document.getElementById('content-stat-4-label')?.value || 'Connected programme',
      };
    } else if (sec === 'curriculum') {
      payloadData = {
        ...(state.content.curriculum || {}),
        eyebrow: document.getElementById('content-curriculum-eyebrow')?.value || '',
        heading: document.getElementById('content-curriculum-heading')?.value || '',
        lead: document.getElementById('content-curriculum-lead')?.value || '',
      };
    } else if (sec === 'approach') {
      payloadData = {
        ...(state.content.approach || {}),
        eyebrow: document.getElementById('content-approach-eyebrow')?.value || '',
        heading: document.getElementById('content-approach-heading')?.value || '',
        lead: document.getElementById('content-approach-lead')?.value || '',
      };
    } else if (sec === 'parents') {
      payloadData = {
        ...(state.content.parents || {}),
        eyebrow: document.getElementById('content-parents-eyebrow')?.value || '',
        heading: document.getElementById('content-parents-heading')?.value || '',
        lead: document.getElementById('content-parents-lead')?.value || '',
      };
    }

    await apiRequest('/api/cms/content', {
      method: 'PUT',
      body: JSON.stringify({ section: sec, data: payloadData })
    });

    state.content[sec] = payloadData;
    showToast(`Saved ${sec.toUpperCase()} section copy successfully!`, 'success');
    await loadDashboard();
  } catch (err) {
    showToast(err.message || 'Failed to save section copy.', 'error');
  } finally {
    btnText.classList.remove('hidden');
    btnSpinner.classList.add('hidden');
    saveBtn.disabled = false;
  }
}

/* ═══════════════════════════════════════════════════════════════
   FAQS MANAGER CONTROLLER
   ═══════════════════════════════════════════════════════════════ */
function initFaqsManager() {
  const addBtn = document.getElementById('add-faq-btn');
  const searchInput = document.getElementById('faq-search-input');
  const statusSelect = document.getElementById('faq-status-select');
  const faqForm = document.getElementById('faq-modal-form');

  if (addBtn) {
    addBtn.addEventListener('click', () => openFaqModal());
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.faqSearch = e.target.value.toLowerCase().trim();
      renderFaqs();
    });
  }

  if (statusSelect) {
    statusSelect.addEventListener('change', (e) => {
      state.faqStatusFilter = e.target.value;
      renderFaqs();
    });
  }

  if (faqForm) {
    faqForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await handleSaveFaq();
    });
  }
}

async function loadFaqs() {
  const loadingEl = document.getElementById('faqs-loading');
  if (loadingEl) loadingEl.classList.remove('hidden');

  try {
    const res = await apiRequest('/api/cms/faqs');
    state.faqs = res.faqs || [];
    renderFaqs();
  } catch (err) {
    console.warn('[CMS FAQs] Failed to load FAQs:', err);
  } finally {
    if (loadingEl) loadingEl.classList.add('hidden');
  }
}

function renderFaqs() {
  const listEl = document.getElementById('faqs-list');
  const emptyEl = document.getElementById('faqs-empty');
  if (!listEl) return;

  const filtered = state.faqs.filter(faq => {
    const matchesSearch = !state.faqSearch ||
      faq.question.toLowerCase().includes(state.faqSearch) ||
      faq.answer.toLowerCase().includes(state.faqSearch);

    const matchesStatus = state.faqStatusFilter === 'all' ||
      (state.faqStatusFilter === 'published' && faq.isPublished) ||
      (state.faqStatusFilter === 'draft' && !faq.isPublished);

    return matchesSearch && matchesStatus;
  });

  if (filtered.length === 0) {
    listEl.innerHTML = '';
    if (emptyEl) emptyEl.classList.remove('hidden');
    return;
  }

  if (emptyEl) emptyEl.classList.add('hidden');

  listEl.innerHTML = filtered.map(faq => `
    <div class="faq-admin-card ${faq.isPublished ? '' : 'draft'}" data-faq-id="${faq.id}">
      <div class="faq-card-left">
        <div class="faq-order-badge" title="Display Order">${faq.orderIndex || 0}</div>
        <div class="faq-content-group">
          <div class="faq-question-title">${escapeHtml(faq.question)}</div>
          <div class="faq-answer-snippet">${escapeHtml(faq.answer)}</div>
        </div>
      </div>
      <div class="faq-card-actions">
        <label class="custom-switch" title="Toggle live publication status">
          <input type="checkbox" ${faq.isPublished ? 'checked' : ''} onchange="toggleFaqStatus('${faq.id}', this.checked)">
          <span class="switch-slider"></span>
        </label>
        <button type="button" class="btn-subtle btn-sm" onclick="editFaq('${faq.id}')" title="Edit Question & Answer">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>
          <span>Edit</span>
        </button>
        <button type="button" class="btn-subtle btn-sm btn-action-danger" onclick="deleteFaqPrompt('${faq.id}')" title="Delete FAQ">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    </div>
  `).join('');
}

function openFaqModal(faq = null) {
  const modal = document.getElementById('faq-modal');
  const titleEl = document.getElementById('faq-modal-title');
  const idEl = document.getElementById('faq-field-id');
  const qEl = document.getElementById('faq-field-question');
  const aEl = document.getElementById('faq-field-answer');
  const ordEl = document.getElementById('faq-field-order');
  const pubEl = document.getElementById('faq-field-published');

  if (faq) {
    titleEl.textContent = 'Edit FAQ';
    idEl.value = faq.id;
    qEl.value = faq.question;
    aEl.value = faq.answer;
    ordEl.value = faq.orderIndex || 0;
    pubEl.checked = Boolean(faq.isPublished);
  } else {
    titleEl.textContent = 'Add New FAQ';
    idEl.value = '';
    qEl.value = '';
    aEl.value = '';
    ordEl.value = (state.faqs.length + 1);
    pubEl.checked = true;
  }

  modal.classList.remove('hidden');
}

window.editFaq = function(id) {
  const faq = state.faqs.find(f => String(f.id) === String(id));
  if (faq) openFaqModal(faq);
};

window.toggleFaqStatus = async function(id, isPublished) {
  try {
    await apiRequest('/api/cms/faqs', {
      method: 'PUT',
      body: JSON.stringify({ id, action: 'toggle_publish', isPublished })
    });
    const item = state.faqs.find(f => String(f.id) === String(id));
    if (item) item.isPublished = isPublished;
    showToast(`FAQ marked as ${isPublished ? 'Published' : 'Draft'}.`, 'success');
    renderFaqs();
    await loadDashboard();
  } catch (err) {
    showToast(err.message || 'Failed to toggle FAQ status.', 'error');
    renderFaqs();
  }
};

window.deleteFaqPrompt = function(id) {
  const faq = state.faqs.find(f => String(f.id) === String(id));
  if (faq) {
    openDeleteModal('faq', id, faq.question);
  }
};

async function handleSaveFaq() {
  const saveBtn = document.getElementById('save-faq-btn');
  const btnText = saveBtn.querySelector('.btn-text');
  const btnSpinner = saveBtn.querySelector('.btn-spinner');

  const id = document.getElementById('faq-field-id').value;
  const question = document.getElementById('faq-field-question').value.trim();
  const answer = document.getElementById('faq-field-answer').value.trim();
  const orderIndex = parseInt(document.getElementById('faq-field-order').value, 10) || 0;
  const isPublished = document.getElementById('faq-field-published').checked;

  if (!question || !answer) {
    showToast('Please provide both question and answer.', 'error');
    return;
  }

  btnText.classList.add('hidden');
  btnSpinner.classList.remove('hidden');
  saveBtn.disabled = true;

  try {
    if (id) {
      await apiRequest('/api/cms/faqs', {
        method: 'PUT',
        body: JSON.stringify({ id, question, answer, orderIndex, isPublished })
      });
      showToast('FAQ updated successfully!', 'success');
    } else {
      await apiRequest('/api/cms/faqs', {
        method: 'POST',
        body: JSON.stringify({ question, answer, orderIndex, isPublished })
      });
      showToast('FAQ created successfully!', 'success');
    }

    closeModal('faq-modal');
    await Promise.all([loadFaqs(), loadDashboard()]);
  } catch (err) {
    showToast(err.message || 'Failed to save FAQ.', 'error');
  } finally {
    btnText.classList.remove('hidden');
    btnSpinner.classList.add('hidden');
    saveBtn.disabled = false;
  }
}

/* ═══════════════════════════════════════════════════════════════
   SUBSCRIBERS HUB CONTROLLER
   ═══════════════════════════════════════════════════════════════ */
function initSubscribersHub() {
  const searchInput = document.getElementById('subscribers-search-input');
  const statusSelect = document.getElementById('subscribers-status-select');
  const exportBtn = document.getElementById('export-subscribers-btn');
  const prevBtn = document.getElementById('subs-prev-btn');
  const nextBtn = document.getElementById('subs-next-btn');

  let debounceTimer = null;
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        state.subscribersSearch = e.target.value.trim();
        state.subscribersPage = 1;
        loadSubscribers(1);
      }, 300);
    });
  }

  if (statusSelect) {
    statusSelect.addEventListener('change', (e) => {
      state.subscribersStatusFilter = e.target.value;
      state.subscribersPage = 1;
      loadSubscribers(1);
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', async () => {
      await downloadSubscribersCsv();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (state.subscribersPage > 1) {
        loadSubscribers(state.subscribersPage - 1);
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      if (state.subscribersPage < state.subscribersTotalPages) {
        loadSubscribers(state.subscribersPage + 1);
      }
    });
  }
}

async function loadSubscribers(page = 1) {
  const loadingEl = document.getElementById('subscribers-loading');
  const emptyEl = document.getElementById('subscribers-empty');
  const tbody = document.getElementById('subscribers-tbody');

  if (loadingEl) loadingEl.classList.remove('hidden');

  try {
    const q = new URLSearchParams({
      page: String(page),
      limit: String(state.subscribersLimit),
      search: state.subscribersSearch,
      status: state.subscribersStatusFilter
    });

    const res = await apiRequest(`/api/cms/subscribers?${q.toString()}`);
    state.subscribers = res.subscribers || [];
    state.subscribersTotal = res.total || 0;
    state.subscribersPage = res.page || 1;
    state.subscribersTotalPages = res.totalPages || 1;

    renderSubscribers();
  } catch (err) {
    console.warn('[CMS Subscribers] Failed to load subscribers:', err);
    if (tbody) tbody.innerHTML = '';
    if (emptyEl) emptyEl.classList.remove('hidden');
  } finally {
    if (loadingEl) loadingEl.classList.add('hidden');
  }
}

function renderSubscribers() {
  const tbody = document.getElementById('subscribers-tbody');
  const emptyEl = document.getElementById('subscribers-empty');
  const pageInfoEl = document.getElementById('subscribers-page-info');
  const prevBtn = document.getElementById('subs-prev-btn');
  const nextBtn = document.getElementById('subs-next-btn');

  if (!tbody) return;

  if (state.subscribers.length === 0) {
    tbody.innerHTML = '';
    if (emptyEl) emptyEl.classList.remove('hidden');
    if (pageInfoEl) pageInfoEl.textContent = 'Showing 0 of 0 subscribers';
    if (prevBtn) prevBtn.disabled = true;
    if (nextBtn) nextBtn.disabled = true;
    return;
  }

  if (emptyEl) emptyEl.classList.add('hidden');

  tbody.innerHTML = state.subscribers.map(sub => {
    const isUnsub = sub.status === 'unsubscribed';
    const dateFormatted = sub.createdAt ? new Date(sub.createdAt).toLocaleDateString(undefined, {
      year: 'numeric', month: 'short', day: 'numeric'
    }) : '—';

    return `
      <tr>
        <td>
          <strong style="color:#fff; font-family:var(--font-heading); font-size:0.95rem;">${escapeHtml(sub.email)}</strong>
        </td>
        <td>
          <span style="color:var(--text-muted); font-size:0.8rem;">${escapeHtml(sub.source || 'website')}</span>
        </td>
        <td>
          <span class="status-badge ${isUnsub ? 'badge-unsub' : 'badge-active'}">
            ${isUnsub ? 'Unsubscribed' : 'Active'}
          </span>
        </td>
        <td>
          <span style="color:var(--text-dim); font-size:0.8rem;">${dateFormatted}</span>
        </td>
        <td style="text-align: right;">
          <button type="button" class="btn-subtle btn-sm btn-action-danger" onclick="deleteSubscriberPrompt('${sub.id}', '${escapeHtml(sub.email)}')" title="Remove subscriber">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  const startIdx = ((state.subscribersPage - 1) * state.subscribersLimit) + 1;
  const endIdx = Math.min(state.subscribersPage * state.subscribersLimit, state.subscribersTotal);

  if (pageInfoEl) {
    pageInfoEl.textContent = `Showing ${startIdx}–${endIdx} of ${state.subscribersTotal} subscribers (Page ${state.subscribersPage} of ${state.subscribersTotalPages})`;
  }

  if (prevBtn) prevBtn.disabled = state.subscribersPage <= 1;
  if (nextBtn) nextBtn.disabled = state.subscribersPage >= state.subscribersTotalPages;
}

window.deleteSubscriberPrompt = function(id, email) {
  openDeleteModal('subscriber', id, email);
};

async function downloadSubscribersCsv() {
  const exportBtn = document.getElementById('export-subscribers-btn');
  exportBtn.disabled = true;
  showToast('Generating CSV mailing list...', 'info');

  try {
    const res = await fetch('/api/cms/subscribers?format=csv', {
      headers: {
        'Authorization': `Bearer ${state.token}`
      }
    });

    if (!res.ok) throw new Error('Could not download CSV export.');

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edubuds_subscribers_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    showToast('Subscribers CSV exported successfully!', 'success');
  } catch (err) {
    showToast(err.message || 'Failed to export CSV.', 'error');
  } finally {
    exportBtn.disabled = false;
  }
}

/* ── Reconcile & Assign Media Listeners ─────────────────────── */
const reconcileMediaBtn = document.getElementById('reconcile-media-btn');
if (reconcileMediaBtn) {
  reconcileMediaBtn.addEventListener('click', reconcileAllCloudCovers);
}

const assignMediaForm = document.getElementById('assign-media-form');
if (assignMediaForm) {
  assignMediaForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const targetUrl = document.getElementById('assign-target-url')?.value;
    const bookId = document.getElementById('assign-target-book')?.value;
    const confirmBtn = document.getElementById('confirm-assign-btn');

    if (!targetUrl || !bookId) {
      showToast('Please select a curriculum book.', 'error');
      return;
    }

    const btnText = confirmBtn ? confirmBtn.querySelector('.btn-text') : null;
    const btnSpinner = confirmBtn ? confirmBtn.querySelector('.btn-spinner') : null;
    if (btnText) btnText.classList.add('hidden');
    if (btnSpinner) btnSpinner.classList.remove('hidden');
    if (confirmBtn) confirmBtn.disabled = true;

    try {
      await applyCoverToBook(bookId, targetUrl);
      closeModal('assign-media-modal');
    } catch (err) {
      // error toast already shown in applyCoverToBook
    } finally {
      if (btnText) btnText.classList.remove('hidden');
      if (btnSpinner) btnSpinner.classList.add('hidden');
      if (confirmBtn) confirmBtn.disabled = false;
    }
  });
}

const assignTargetBookSelect = document.getElementById('assign-target-book');
if (assignTargetBookSelect) {
  assignTargetBookSelect.addEventListener('change', updateAssignComparisonPreview);
}

const assignCopyUrlBtn = document.getElementById('assign-copy-url-btn');
if (assignCopyUrlBtn) {
  assignCopyUrlBtn.addEventListener('click', () => {
    const url = document.getElementById('assign-target-url')?.value;
    if (url) copyToClipboard(url, 'Asset URL copied to clipboard!');
  });
}

/* ── Boot ──────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initAuth();
  initContentEditor();
  initFaqsManager();
  initSubscribersHub();
});
