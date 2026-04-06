import { showAlert } from '../alert.js';

function getFocusable(root) {
  return [
    ...root.querySelectorAll(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
    ),
  ].filter(
    (el) => !el.classList.contains('hidden') && !el.hasAttribute('aria-hidden'),
  );
}

function openModal({
  title,
  body,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false,
  onConfirm,
} = {}) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');

  const modal = document.createElement('div');
  modal.className = 'modal';

  const header = document.createElement('header');
  const h = document.createElement('h3');
  h.textContent = title || 'Confirm';
  const close = document.createElement('button');
  close.className = 'icon-btn';
  close.type = 'button';
  close.innerHTML = '<i data-lucide="x"></i>';
  close.setAttribute('aria-label', 'Close');
  header.appendChild(h);
  header.appendChild(close);

  const b = document.createElement('div');
  b.className = 'body';
  if (typeof body === 'string') {
    b.textContent = body;
  } else if (body instanceof Node) {
    b.appendChild(body);
  } else {
    b.textContent = 'Are you sure?';
  }

  const footer = document.createElement('footer');
  const cancel = document.createElement('button');
  cancel.className = 'btn btn-ghost';
  cancel.type = 'button';
  cancel.textContent = cancelText;
  const confirm = document.createElement('button');
  confirm.className = danger ? 'btn btn-danger' : 'btn btn-primary';
  confirm.type = 'button';
  confirm.textContent = confirmText;
  footer.appendChild(cancel);
  footer.appendChild(confirm);

  modal.appendChild(header);
  modal.appendChild(b);
  modal.appendChild(footer);
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);

  if (window.lucide?.createIcons)
    window.lucide.createIcons({ attrs: { 'stroke-width': 1.8 } });

  const prevActive = document.activeElement;

  function closeModal() {
    backdrop.classList.remove('is-in');
    window.setTimeout(() => backdrop.remove(), 220);
    if (prevActive && prevActive.focus) prevActive.focus();
    document.removeEventListener('keydown', onKeyDown);
  }

  function onKeyDown(e) {
    if (e.key === 'Escape') closeModal();
    if (e.key !== 'Tab') return;
    const focusables = getFocusable(backdrop);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const isShift = e.shiftKey;
    if (!isShift && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
    if (isShift && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  }

  document.addEventListener('keydown', onKeyDown);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });
  close.addEventListener('click', closeModal);
  cancel.addEventListener('click', closeModal);
  confirm.addEventListener('click', async () => {
    confirm.disabled = true;
    confirm.classList.add('btn--loading');
    try {
      await onConfirm?.();
      closeModal();
    } catch (err) {
      confirm.disabled = false;
      confirm.classList.remove('btn--loading');
      showAlert('error', err?.message || 'فشل الإجراء', {
        title: 'فشل الإجراء',
      });
    }
  });

  requestAnimationFrame(() => {
    backdrop.classList.add('is-in');
    const focusables = getFocusable(backdrop);
    (focusables[0] || confirm).focus();
  });

  return { close: closeModal };
}

export { openModal };
