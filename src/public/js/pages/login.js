import { showAlert } from '../alert.js';
import { login } from '../api.js';

// ── View switcher ─────────────────────────────────────────
const views = document.querySelectorAll('.auth-view');

function showView(id) {
  views.forEach((v) => v.classList.toggle('is-active', v.id === id));
  // re-run lucide icons in case new icons appeared
  window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
}

document.querySelectorAll('[data-show]').forEach((btn) => {
  btn.addEventListener('click', () => showView(btn.dataset.show));
});

// ── Password visibility toggles ───────────────────────────
document.querySelectorAll('[data-pw-toggle]').forEach((btn) => {
  btn.addEventListener('click', () => {
    // find the sibling input (closest .input-group's input)
    const group = btn.closest('.input-group');
    const input = group?.querySelector(
      'input[type="password"], input[type="text"]',
    );
    if (!input) return;
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.innerHTML = show
      ? '<i data-lucide="eye-off"></i>'
      : '<i data-lucide="eye"></i>';
    window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
  });
});

// ── Helpers ───────────────────────────────────────────────
function setMsg(el, msg, isError = true) {
  if (!el) return;
  el.textContent = msg || '';
  el.classList.toggle('hidden', !msg);
  if (!isError) {
    el.style.color = 'var(--success)';
    el.style.background = 'var(--success-soft)';
    el.style.borderColor = 'rgba(34,197,94,0.2)';
  } else {
    el.style.color = '';
    el.style.background = '';
    el.style.borderColor = '';
  }
}

function setLoading(btn, textEl, loading, label = 'Submit') {
  if (!btn) return;
  btn.disabled = loading;
  btn.classList.toggle('btn--loading', loading);
  if (textEl) textEl.textContent = loading ? 'جارٍ التحميل…' : label;
  const existing = btn.querySelector('.spinner');
  if (loading && !existing) {
    const sp = document.createElement('span');
    sp.className = 'spinner';
    btn.prepend(sp);
  } else if (!loading && existing) {
    existing.remove();
  }
}

// ── Sign In ───────────────────────────────────────────────
const loginSubmit = document.querySelector('[data-login-submit]');
const loginBtnText = document.querySelector('[data-login-btn-text]');
const loginError = document.querySelector('[data-login-error]');
const loginEmail = document.querySelector('#login-email');
const loginPw = document.querySelector('#login-password');

loginSubmit?.addEventListener('click', async () => {
  setMsg(loginError, null);
  setLoading(loginSubmit, loginBtnText, true, 'تسجيل الدخول');
  try {
    const { res, data } = await login(loginEmail.value.trim(), loginPw.value);
    if (!res.ok) {
      setMsg(loginError, data?.message || 'بيانات الدخول غير صحيحة.');
    } else {
      window.location.href = '/dashboard';
    }
  } catch {
    setMsg(loginError, 'تعذّر الاتصال بالخادم. حاول مرة أخرى.');
  } finally {
    setLoading(loginSubmit, loginBtnText, false, 'تسجيل الدخول');
  }
});

// Allow Enter key on login fields
[loginEmail, loginPw].forEach((el) =>
  el?.addEventListener(
    'keydown',
    (e) => e.key === 'Enter' && loginSubmit?.click(),
  ),
);

// ── Register ──────────────────────────────────────────────
const regSubmit = document.querySelector('[data-reg-submit]');
const regBtnText = document.querySelector('[data-reg-btn-text]');
const regError = document.querySelector('[data-reg-error]');
const regSuccess = document.querySelector('[data-reg-success]');
const regName = document.querySelector('#reg-name');
const regEmail = document.querySelector('#reg-email');
const regPw = document.querySelector('#reg-password');
const regPwConfirm = document.querySelector('#reg-password-confirm');

regSubmit?.addEventListener('click', async () => {
  setMsg(regError, null);
  setMsg(regSuccess, null);

  const name = regName?.value.trim();
  const email = regEmail?.value.trim();
  const password = regPw?.value;
  const passwordConfirm = regPwConfirm?.value;

  if (!name || !email || !password || !passwordConfirm) {
    setMsg(regError, 'يرجى ملء جميع الحقول.');
    return;
  }
  if (password.length < 8) {
    setMsg(regError, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.');
    return;
  }
  if (password !== passwordConfirm) {
    setMsg(regError, 'كلمتا المرور غير متطابقتين.');
    return;
  }

  setLoading(regSubmit, regBtnText, true, 'إنشاء حساب');
  try {
    const res = await fetch('/api/v1/auth/signup', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, passwordConfirm }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(regError, data?.message || 'فشل إنشاء الحساب. حاول مرة أخرى.');
    } else {
      setMsg(
        regSuccess,
        '✓ تم إنشاء الحساب! تحقق من بريدك الإلكتروني لتفعيل الحساب.',
        false,
      );
      showAlert(
        'success',
        'Check your inbox to verify your email before signing in.',
        { title: 'تم إنشاء الحساب!' },
      );
      regName.value = '';
      regEmail.value = '';
      regPw.value = '';
      regPwConfirm.value = '';
    }
  } catch {
    setMsg(regError, 'تعذّر الاتصال بالخادم. حاول مرة أخرى.');
  } finally {
    setLoading(regSubmit, regBtnText, false, 'إنشاء حساب');
  }
});

// ── Forgot Password ───────────────────────────────────────
const forgotSubmit = document.querySelector('[data-forgot-submit]');
const forgotBtnText = document.querySelector('[data-forgot-btn-text]');
const forgotError = document.querySelector('[data-forgot-error]');
const forgotSuccess = document.querySelector('[data-forgot-success]');
const forgotEmail = document.querySelector('#forgot-email');

forgotSubmit?.addEventListener('click', async () => {
  setMsg(forgotError, null);
  setMsg(forgotSuccess, null);

  const email = forgotEmail?.value.trim();
  if (!email) {
    setMsg(forgotError, 'يرجى إدخال بريدك الإلكتروني.');
    return;
  }

  setLoading(forgotSubmit, forgotBtnText, true, 'إرسال رابط الاسترداد');
  try {
    const res = await fetch('/api/v1/auth/forgetPassword', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMsg(
        forgotError,
        data?.message || 'تعذّر إرسال بريد الاسترداد. حاول مرة أخرى.',
      );
    } else {
      setMsg(
        forgotSuccess,
        '✓ تم إرسال رابط الاسترداد! تحقق من صندوق الوارد.',
        false,
      );
      showAlert('info', 'إذا كان البريد مسجلاً، ستصلك رسالة استرداد قريباً.', {
        title: 'تم إرسال البريد',
      });
      forgotEmail.value = '';
    }
  } catch {
    setMsg(forgotError, 'تعذّر الاتصال بالخادم. حاول مرة أخرى.');
  } finally {
    setLoading(forgotSubmit, forgotBtnText, false, 'إرسال رابط الاسترداد');
  }
});
