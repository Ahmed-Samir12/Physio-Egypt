const holder = document.getElementById('reset-token');
const token =
  holder?.dataset?.token || window.location.pathname.split('/').pop();

const views = {
  reset: document.getElementById('view-reset'),
  done: document.getElementById('view-done'),
  error: document.getElementById('view-error'),
};

function activate(viewName) {
  Object.entries(views).forEach(([k, el]) => {
    if (!el) return;
    el.classList.toggle('is-active', k === viewName);
  });
}

const submitBtn = document.getElementById('reset-submit');
const btnText = document.getElementById('reset-btn-text');
const newPw = document.getElementById('new-password');
const confirmPw = document.getElementById('confirm-password');

// Render lucide icons after toggling content in buttons
window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });

// PW toggles
document.querySelectorAll('[data-pw-toggle]').forEach((btn) => {
  btn.addEventListener('click', () => {
    const input = btn.closest('.input-group')?.querySelector('input');
    if (!input) return;

    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.innerHTML = show
      ? '<i data-lucide="eye-off"></i>'
      : '<i data-lucide="eye"></i>';
    window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
  });
});

function setLoading(isLoading) {
  if (!submitBtn) return;
  submitBtn.disabled = Boolean(isLoading);
  if (!btnText) return;
  btnText.textContent = isLoading ? 'جارٍ التحديث…' : 'إعادة التعيين';
}

submitBtn?.addEventListener('click', async () => {
  if (!submitBtn || !newPw || !confirmPw) return;

  const password = newPw.value || '';
  const passwordConfirm = confirmPw.value || '';

  // Client-side validation for matching fields
  confirmPw.setCustomValidity('');
  newPw.setCustomValidity('');
  if (password.length < 8) {
    newPw.setCustomValidity('كلمة المرور يجب أن تكون 8 أحرف على الأقل.');
    newPw.reportValidity();
    return;
  }

  if (password !== passwordConfirm) {
    confirmPw.setCustomValidity('كلمتا المرور غير متطابقتين.');
    confirmPw.reportValidity();
    return;
  }

  if (!token) {
    activate('error');
    return;
  }

  setLoading(true);
  try {
    const res = await fetch(
      `/api/v1/auth/resetPassword/${encodeURIComponent(token)}`,
      {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: password, passwordConfirm }),
      },
    );

    if (!res.ok) {
      activate('error');
      return;
    }

    activate('done');
  } catch {
    activate('error');
  } finally {
    setLoading(false);
  }
});
