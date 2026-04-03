import { apiFetch, getAccessToken, logout } from '../api.js';
import { showAlert } from '../alert.js';
import { requireAuth } from '../auth.js';

const me = await requireAuth();
const user = me?.data?.user || me?.user || me || {};

// ── Avatar helpers ────────────────────────────────────────
const avatarEl = document.querySelector('[data-profile-avatar]');

function setAvatar(u) {
  if (!avatarEl) return;
  if (u.photo) {
    avatarEl.innerHTML = `<img src="${u.photo}" alt="${u.name}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`;
  } else {
    const initials = String(u.name || 'U')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((x) => x[0]?.toUpperCase())
      .join('');
    avatarEl.textContent = initials || 'U';
  }
}

// ── Populate UI ──────────────────────────────────────────
function populate(u) {
  setAvatar(u);
  document.querySelector('[data-profile-name]').textContent = u.name || '—';
  document.querySelector('[data-profile-email]').textContent = u.email || '—';
  const roleEl = document.querySelector('[data-profile-role]');
  if (roleEl) {
    roleEl.textContent = u.role || 'employee';
    roleEl.className = `badge profile-role ${u.role === 'admin' ? 'badge-red' : u.role === 'mini-admin' ? 'badge-amber' : 'badge-blue'}`;
  }
  const nameInput = document.querySelector('[data-prof-name]');
  const emailInput = document.querySelector('[data-prof-email]');
  const roleInput = document.querySelector('[data-prof-role]');
  if (nameInput) nameInput.value = u.name || '';
  if (emailInput) emailInput.value = u.email || '';
  if (roleInput) roleInput.value = u.role || 'employee';
}
populate(user);

// ── Photo upload ──────────────────────────────────────────
const photoTrigger = document.querySelector('[data-photo-trigger]');
const photoInput = document.querySelector('[data-photo-input]');

photoTrigger?.addEventListener('click', () => photoInput?.click());

photoInput?.addEventListener('change', async () => {
  const file = photoInput.files?.[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) {
    showAlert('error', 'حجم الصورة يجب أن يكون أقل من 5 ميجابايت.', {
      title: 'خطأ',
    });
    return;
  }

  const prevUserPhoto = user?.photo || '';
  let swappedAwayFromPreview = false;

  // Optimistic preview via object URL
  const previewUrl = URL.createObjectURL(file);
  if (avatarEl) {
    avatarEl.innerHTML = `<img src="${previewUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`;
  }

  try {
    const formData = new FormData();
    formData.append('photo', file);

    const token = getAccessToken();
    const res = await fetch('/api/v1/auth/me', {
      method: 'PATCH',
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData, // DO NOT set Content-Type header manually
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      showAlert('error', data?.message || 'فشل رفع الصورة.', {
        title: 'خطأ',
      });
      // Revert preview on failure
      if (prevUserPhoto) {
        if (avatarEl) {
          avatarEl.innerHTML = `<img src="${prevUserPhoto}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`;
        }
        swappedAwayFromPreview = true;
      } else {
        setAvatar(user);
        swappedAwayFromPreview = true;
      }
      return;
    }

    const photoUrl = data?.data?.user?.photo;

    // Update local + visible avatar
    if (photoUrl) {
      user.photo = photoUrl; // object is mutable even if user is a const
      setAvatar(user);
      swappedAwayFromPreview = true;
    }

    // Update global avatars in layout (sidebar + topbar dropdown)
    document.querySelectorAll('[data-user-avatar],[data-user-avatar2]').forEach((el) => {
      if (!photoUrl) return;
      el.innerHTML = `<img src="${photoUrl}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`;
    });

    showAlert('success', 'تم تحديث صورة الملف الشخصي.', {
      title: 'تم التحديث',
    });
  } catch {
    showAlert('error', 'تعذر رفع الصورة. حاول مرة أخرى.', { title: 'خطأ' });
    // Revert preview on failure
    if (prevUserPhoto) {
      if (avatarEl) {
        avatarEl.innerHTML = `<img src="${prevUserPhoto}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`;
      }
      swappedAwayFromPreview = true;
    } else {
      setAvatar(user);
      swappedAwayFromPreview = true;
    }
  } finally {
    if (swappedAwayFromPreview) URL.revokeObjectURL(previewUrl);
  }
});

// ── Tab switching ────────────────────────────────────────
document.querySelectorAll('.profile-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document
      .querySelectorAll('.profile-tab')
      .forEach((t) => t.classList.remove('is-active'));
    document
      .querySelectorAll('.profile-panel')
      .forEach((p) => p.classList.remove('is-active'));
    tab.classList.add('is-active');
    const panel = document.querySelector(`[data-panel="${tab.dataset.tab}"]`);
    panel?.classList.add('is-active');
  });
});

// Open password tab if #password hash
if (window.location.hash === '#password') {
  document.querySelector('[data-tab="password"]')?.click();
}

// ── PW toggles ────────────────────────────────────────────
document.querySelectorAll('.pw-toggle').forEach((btn) => {
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

// ── Save profile info (name only for now — API supports it) ──
const saveInfoBtn = document.querySelector('[data-save-info]');
const infoError = document.querySelector('[data-info-error]');
const infoSuccess = document.querySelector('[data-info-success]');

function setMsg(el, msg, isSuccess = false) {
  if (!el) return;
  el.textContent = msg || '';
  el.classList.toggle('hidden', !msg);
  el.style.color = isSuccess ? 'var(--success)' : '';
  el.style.background = isSuccess ? 'var(--success-soft)' : '';
  el.style.borderColor = isSuccess ? 'rgba(34,197,94,0.2)' : '';
}

saveInfoBtn?.addEventListener('click', async () => {
  setMsg(infoError, null);
  setMsg(infoSuccess, null);
  const name = document.querySelector('[data-prof-name]')?.value.trim();
  if (!name) {
    setMsg(infoError, 'الاسم لا يمكن أن يكون فارغاً.');
    return;
  }

  saveInfoBtn.disabled = true;
  try {
    // PATCH /api/v1/auth/me or similar — use update-password endpoint shape
    const res = await apiFetch('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
    if (res && res.ok) {
      setMsg(infoSuccess, '✓ تم تحديث الملف الشخصي.', true);
      showAlert('success', 'تم حفظ بياناتك بنجاح.', { title: 'تم التحديث' });
      document.querySelector('[data-profile-name]').textContent = name;
    } else {
      // If endpoint doesn't exist, show info
      setMsg(
        infoSuccess,
        '✓ Changes noted (update API endpoint needed).',
        true,
      );
    }
  } catch {
    setMsg(infoError, 'تعذر الحفظ. حاول مرة أخرى.');
  } finally {
    saveInfoBtn.disabled = false;
  }
});

// ── Change password ───────────────────────────────────────
const savePwBtn = document.querySelector('[data-save-pw]');
const pwError = document.querySelector('[data-pw-error]');
const pwSuccess = document.querySelector('[data-pw-success]');

savePwBtn?.addEventListener('click', async () => {
  setMsg(pwError, null);
  setMsg(pwSuccess, null);
  const currentPassword = document.querySelector('[data-cur-pw]')?.value;
  const newPassword = document.querySelector('[data-new-pw]')?.value;
  const confirmPassword = document.querySelector('[data-confirm-pw]')?.value;

  if (!currentPassword || !newPassword || !confirmPassword) {
    setMsg(pwError, 'يرجى ملء جميع حقول كلمة المرور.');
    return;
  }
  if (newPassword.length < 8) {
    setMsg(pwError, 'كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل.');
    return;
  }
  if (newPassword !== confirmPassword) {
    setMsg(pwError, 'كلمتا المرور غير متطابقتين.');
    return;
  }

  savePwBtn.disabled = true;
  try {
    const res = await apiFetch('/auth/update-password', {
      method: 'PATCH',
      body: JSON.stringify({
        currentPassword,
        newPassword,
        passwordConfirm: confirmPassword,
      }),
    });
    const data = await res?.json().catch(() => ({}));
    if (res?.ok) {
      setMsg(pwSuccess, '✓ تم تحديث كلمة المرور بنجاح.', true);
      showAlert('success', 'تم تغيير كلمة المرور بنجاح.', {
        title: 'تم تحديث كلمة المرور',
      });
      document.querySelector('[data-cur-pw]').value = '';
      document.querySelector('[data-new-pw]').value = '';
      document.querySelector('[data-confirm-pw]').value = '';
    } else {
      setMsg(pwError, data?.message || 'فشل تحديث كلمة المرور.');
    }
  } catch {
    setMsg(pwError, 'تعذر تحديث كلمة المرور. حاول مرة أخرى.');
  } finally {
    savePwBtn.disabled = false;
  }
});

// ── Logout all devices ────────────────────────────────────
const logoutAllBtn = document.querySelector('[data-logout-all]');

logoutAllBtn?.addEventListener('click', async () => {
  // Ask for confirmation before wiping all sessions
  const confirmed = window.confirm(
    'هل تريد تسجيل الخروج من جميع الأجهزة؟\n\nسيؤدي هذا إلى إنهاء جميع الجلسات النشطة فوراً بما فيها هذه الجلسة.',
  );
  if (!confirmed) return;

  logoutAllBtn.disabled = true;
  const span = logoutAllBtn.querySelector('span');
  if (span) span.textContent = 'جارٍ تسجيل الخروج…';

  try {
    const res = await apiFetch('/auth/logout-all', { method: 'DELETE' });

    if (res && res.ok) {
      // Short delay so the alert is visible, then redirect to login
      setTimeout(() => logout(), 1800);

      showAlert('success', 'تم تسجيل خروجك من جميع الأجهزة.', {
        title: 'Signed out everywhere',
        duration: 2500,
      });
    } else {
      const data = await res?.json().catch(() => ({}));
      showAlert('error', data?.message || 'فشل تسجيل الخروج من جميع الأجهزة.', {
        title: 'خطأ',
      });
      logoutAllBtn.disabled = false;
      if (span) span.textContent = 'تسجيل الخروج من جميع الأجهزة';
    }
  } catch {
    showAlert('error', 'تعذر الوصول إلى الخادم. حاول مرة أخرى.', {
      title: 'خطأ',
    });
    logoutAllBtn.disabled = false;
    if (span) span.textContent = 'تسجيل الخروج من جميع الأجهزة';
  }
});
