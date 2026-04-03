function ensureToastsRoot() {
  let root = document.querySelector('.toasts');
  if (!root) {
    root = document.createElement('div');
    root.className = 'toasts';
    root.setAttribute('aria-live', 'polite');
    root.setAttribute('aria-relevant', 'additions');
    document.body.appendChild(root);
  }
  return root;
}

function iconFor(type) {
  const wrap = document.createElement('div');
  wrap.innerHTML =
    type === 'success'
      ? '<i data-lucide="check-circle"></i>'
      : type === 'error'
        ? '<i data-lucide="alert-triangle"></i>'
        : '<i data-lucide="info"></i>';
  return wrap.firstChild;
}

function showToast(message, type = 'info', title = null) {
  const root = ensureToastsRoot();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'status');

  const icon = iconFor(type);

  const content = document.createElement('div');
  const t = document.createElement('div');
  t.className = 'title';
  t.textContent = title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : 'Notice');

  const msg = document.createElement('div');
  msg.className = 'msg';
  msg.textContent = message;

  content.appendChild(t);
  content.appendChild(msg);

  const close = document.createElement('button');
  close.className = 'x';
  close.type = 'button';
  close.innerHTML = '<i data-lucide="x"></i>';
  close.addEventListener('click', () => removeToast());

  toast.appendChild(icon);
  toast.appendChild(content);
  toast.appendChild(close);
  root.appendChild(toast);

  // lucide icon hydration
  if (window.lucide?.createIcons) {
    window.lucide.createIcons({ attrs: { 'stroke-width': 1.8 } });
  }

  requestAnimationFrame(() => toast.classList.add('is-in'));

  const tId = window.setTimeout(removeToast, 4000);

  function removeToast() {
    window.clearTimeout(tId);
    toast.classList.remove('is-in');
    window.setTimeout(() => toast.remove(), 220);
  }
}

export { showToast };

