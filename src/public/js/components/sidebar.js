/**
 * sidebar.js
 * - Smooth collapse/expand (CSS handles the animation)
 * - Persists collapsed state in localStorage
 * - Tooltips on nav items when collapsed
 * - Mobile drawer
 */

const STORAGE_KEY = 'sidebar_collapsed';

function setActiveNav() {
  const path = window.location.pathname;
  document.querySelectorAll('.nav a').forEach((a) => {
    const href = a.getAttribute('href');
    if (!href) return;
    const active =
      href === path ||
      (href !== '/' && href.length > 1 && path.startsWith(href));
    a.classList.toggle('is-active', active);
  });
}

// ── Tooltip on collapsed nav items ───────────────────────
function addNavTooltips() {
  document.querySelectorAll('.nav a').forEach((a) => {
    const label = a.querySelector('span')?.textContent?.trim();
    if (!label) return;
    a.setAttribute('title', ''); // clear default title

    const tip = document.createElement('span');
    tip.className = 'nav-tooltip';
    tip.textContent = label;
    a.appendChild(tip);
  });
}

function initSidebar() {
  const app = document.querySelector('[data-app]');
  const toggle = document.querySelector('[data-sidebar-toggle]');
  const drawerBackdrop = document.querySelector('[data-drawer-backdrop]');
  const burger = document.querySelector('[data-burger]');

  if (!app) return;

  setActiveNav();
  addNavTooltips();

  // ── Restore persisted state ─────────────────────────
  const isMobile = () => window.innerWidth <= 768;

  if (!isMobile() && localStorage.getItem(STORAGE_KEY) === 'true') {
    // Apply collapsed immediately — CSS transition will NOT play on page load
    // (we add no-transition class, apply state, then re-enable)
    app.classList.add('no-transition');
    app.classList.add('is-collapsed');
    // Force reflow so the class is applied without animating
    void app.offsetWidth;
    app.classList.remove('no-transition');
  }

  // ── Collapse / expand ───────────────────────────────
  toggle?.addEventListener('click', () => {
    const willCollapse = !app.classList.contains('is-collapsed');
    app.classList.toggle('is-collapsed', willCollapse);
    localStorage.setItem(STORAGE_KEY, String(willCollapse));
  });

  // ── Mobile drawer ───────────────────────────────────
  function openDrawer() {
    app.classList.add('is-drawer-open');
    drawerBackdrop?.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    app.classList.remove('is-drawer-open');
    drawerBackdrop?.classList.remove('is-open');
    document.body.style.overflow = '';
  }

  burger?.addEventListener('click', () => {
    if (app.classList.contains('is-drawer-open')) closeDrawer();
    else openDrawer();
  });
  drawerBackdrop?.addEventListener('click', closeDrawer);
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });

  // Close drawer on resize to desktop
  window.addEventListener('resize', () => {
    if (!isMobile()) closeDrawer();
  });
}

export { initSidebar };
