/**
 * alert.js — Clinic CMS
 *
 * showAlert(type, message, options?)
 *   type:    'success' | 'error' | 'warning' | 'info'
 *   message: string
 *   options: { title?, duration?, action?: { label, fn } }
 *
 * Also exports showToast() as a compat alias so existing pages
 * don't need to be touched.
 */

// ── Config ────────────────────────────────────────────────
const DEFAULTS = {
  duration: 4500,   // ms before auto-dismiss
  maxStack: 4,      // max alerts visible at once
};

const CONFIG = {
  success: {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
             <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
           </svg>`,
    label: 'Success',
    color: '#16a34a',
    bg:    '#f0fdf4',
    bar:   'linear-gradient(90deg,#22c55e,#16a34a)',
    border:'rgba(34,197,94,0.28)',
    iconBg:'rgba(34,197,94,0.12)',
  },
  error: {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
             <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
           </svg>`,
    label: 'Error',
    color: '#dc2626',
    bg:    '#fff5f5',
    bar:   'linear-gradient(90deg,#ef4444,#dc2626)',
    border:'rgba(239,68,68,0.28)',
    iconBg:'rgba(239,68,68,0.1)',
  },
  warning: {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
             <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
             <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
           </svg>`,
    label: 'Warning',
    color: '#b45309',
    bg:    '#fffbeb',
    bar:   'linear-gradient(90deg,#f59e0b,#b45309)',
    border:'rgba(245,158,11,0.28)',
    iconBg:'rgba(245,158,11,0.1)',
  },
  info: {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
             <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
           </svg>`,
    label: 'Info',
    color: '#0284c7',
    bg:    '#f0f9ff',
    bar:   'linear-gradient(90deg,#38bdf8,#0284c7)',
    border:'rgba(14,165,233,0.28)',
    iconBg:'rgba(14,165,233,0.1)',
  },
};

// ── DOM root ──────────────────────────────────────────────
function getRoot() {
  let root = document.getElementById('alert-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'alert-root';
    root.setAttribute('aria-live', 'polite');
    root.setAttribute('aria-atomic', 'false');
    // Styles injected inline so no extra CSS file needed
    Object.assign(root.style, {
      position: 'fixed',
      top: '1.1rem',
      right: '1.1rem',
      zIndex: '99999',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.6rem',
      maxWidth: 'min(420px, calc(100vw - 2rem))',
      width: '100%',
      pointerEvents: 'none',
    });
    document.body.appendChild(root);
  }
  return root;
}

// ── Core builder ──────────────────────────────────────────
function showAlert(type = 'info', message = '', options = {}) {
  const cfg = CONFIG[type] || CONFIG.info;
  const { title = cfg.label, duration = DEFAULTS.duration, action = null } = options;

  const root = getRoot();

  // Trim oldest if too many
  const existing = root.querySelectorAll('.cms-alert');
  if (existing.length >= DEFAULTS.maxStack) {
    dismiss(existing[0]);
  }

  // ── Build element ─────────────────────────────────────
  const el = document.createElement('div');
  el.className = 'cms-alert';
  el.setAttribute('role', 'status');

  Object.assign(el.style, {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: '44px 1fr auto',
    gap: '0',
    alignItems: 'center',
    background: cfg.bg,
    border: `1px solid ${cfg.border}`,
    borderRadius: '14px',
    overflow: 'hidden',
    boxShadow: '0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)',
    pointerEvents: 'auto',
    cursor: 'default',
    opacity: '0',
    transform: 'translateX(18px) scale(0.97)',
    transition: 'opacity 0.28s cubic-bezier(0.4,0,0.2,1), transform 0.28s cubic-bezier(0.4,0,0.2,1)',
    willChange: 'transform, opacity',
    userSelect: 'none',
    minWidth: '280px',
  });

  // Left colour stripe
  const stripe = document.createElement('div');
  Object.assign(stripe.style, {
    position: 'absolute',
    left: '0', top: '0', bottom: '0',
    width: '4px',
    background: cfg.bar,
    borderRadius: '14px 0 0 14px',
  });

  // Icon column
  const iconCol = document.createElement('div');
  Object.assign(iconCol.style, {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingLeft: '18px',
    paddingRight: '2px',
  });

  const iconWrap = document.createElement('div');
  Object.assign(iconWrap.style, {
    width: '32px', height: '32px',
    borderRadius: '8px',
    background: cfg.iconBg,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: '0',
    color: cfg.color,
  });
  iconWrap.innerHTML = cfg.icon;
  const svg = iconWrap.querySelector('svg');
  if (svg) Object.assign(svg.style, { width: '17px', height: '17px' });

  iconCol.appendChild(iconWrap);

  // Text column
  const textCol = document.createElement('div');
  Object.assign(textCol.style, {
    padding: '13px 10px 13px 10px',
    minWidth: '0',
  });

  const titleEl = document.createElement('div');
  Object.assign(titleEl.style, {
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: '700',
    fontSize: '0.88rem',
    color: '#0f172a',
    letterSpacing: '-0.01em',
    lineHeight: '1.3',
  });
  titleEl.textContent = title;

  const msgEl = document.createElement('div');
  Object.assign(msgEl.style, {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: '0.83rem',
    color: '#475569',
    marginTop: '2px',
    lineHeight: '1.45',
    wordBreak: 'break-word',
  });
  msgEl.textContent = message;

  textCol.appendChild(titleEl);
  textCol.appendChild(msgEl);

  // Optional action button
  if (action?.label && action?.fn) {
    const actBtn = document.createElement('button');
    Object.assign(actBtn.style, {
      background: 'none', border: 'none',
      color: cfg.color,
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: '700',
      fontSize: '0.8rem',
      cursor: 'pointer',
      marginTop: '5px',
      padding: '0',
      display: 'block',
      textDecoration: 'underline',
      textUnderlineOffset: '2px',
    });
    actBtn.textContent = action.label;
    actBtn.addEventListener('click', () => { action.fn(); dismiss(el); });
    textCol.appendChild(actBtn);
  }

  // Close button column
  const closeCol = document.createElement('div');
  Object.assign(closeCol.style, {
    padding: '0 10px 0 0',
    alignSelf: 'flex-start',
    paddingTop: '9px',
  });

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.setAttribute('aria-label', 'Dismiss');
  closeBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="width:15px;height:15px;display:block"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  Object.assign(closeBtn.style, {
    background: 'none', border: 'none',
    cursor: 'pointer', padding: '5px',
    borderRadius: '6px',
    color: '#94a3b8',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'color 0.15s, background 0.15s',
  });
  closeBtn.addEventListener('mouseenter', () => {
    closeBtn.style.color = '#0f172a';
    closeBtn.style.background = 'rgba(0,0,0,0.06)';
  });
  closeBtn.addEventListener('mouseleave', () => {
    closeBtn.style.color = '#94a3b8';
    closeBtn.style.background = 'none';
  });
  closeBtn.addEventListener('click', () => dismiss(el));

  closeCol.appendChild(closeBtn);

  // Progress bar
  const bar = document.createElement('div');
  Object.assign(bar.style, {
    position: 'absolute',
    bottom: '0', left: '0', right: '0',
    height: '3px',
    background: cfg.bar,
    transformOrigin: 'left',
    borderRadius: '0 0 14px 14px',
    transition: `transform ${duration}ms linear`,
    transform: 'scaleX(1)',
    opacity: '0.55',
  });

  // Assemble
  el.appendChild(stripe);
  el.appendChild(iconCol);
  el.appendChild(textCol);
  el.appendChild(closeCol);
  el.appendChild(bar);

  root.appendChild(el);

  // ── Animate in ────────────────────────────────────────
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateX(0) scale(1)';
      // Start progress bar drain
      bar.style.transform = 'scaleX(0)';
    });
  });

  // ── Auto-dismiss ──────────────────────────────────────
  let timer = setTimeout(() => dismiss(el), duration);

  // Pause on hover
  el.addEventListener('mouseenter', () => {
    clearTimeout(timer);
    bar.style.transition = 'none';
  });
  el.addEventListener('mouseleave', () => {
    bar.style.transition = `transform 1200ms linear`;
    bar.style.transform = 'scaleX(0)';
    timer = setTimeout(() => dismiss(el), 1200);
  });

  return el;
}

// ── Dismiss ───────────────────────────────────────────────
function dismiss(el) {
  if (!el || el._dismissing) return;
  el._dismissing = true;
  el.style.opacity = '0';
  el.style.transform = 'translateX(18px) scale(0.95)';
  el.style.maxHeight = el.offsetHeight + 'px';
  setTimeout(() => {
    el.style.maxHeight = '0';
    el.style.marginBottom = '0';
    el.style.overflow = 'hidden';
    el.style.transition += ', max-height 0.2s ease, margin 0.2s ease';
    setTimeout(() => el.remove(), 220);
  }, 260);
}

// ── Compat alias (drop-in for old showToast calls) ─────────
// showToast(message, type) → showAlert(type, message)
function showToast(message, type = 'info', title = null) {
  showAlert(type, message, title ? { title } : {});
}

// ── Dismiss all ───────────────────────────────────────────
function dismissAll() {
  document.querySelectorAll('.cms-alert').forEach(dismiss);
}

export { showAlert, showToast, dismissAll };
