import { apiFetch, logout } from './api.js';
import { showAlert } from './alert.js';

let _mePromise = null;

async function getMe() {
  if (_mePromise) return _mePromise;

  _mePromise = (async () => {
    const res = await apiFetch('/auth/me', { method: 'GET' });
    if (!res) return null;
    // 429 = rate limited, not an auth failure — return a special marker
    if (res.status === 429) return '__rate_limited__';
    if (!res.ok) return null;
    return res.json().catch(() => null);
  })();

  return _mePromise;
}

function setUserUI(me) {
  if (!me) return;
  const u = me?.data?.user || me?.user || me;
  const name = u?.name || 'User';
  const email = u?.email || '';
  const role = u?.role || 'employee';

  document
    .querySelectorAll('[data-user-name]')
    .forEach((el) => (el.textContent = name));
  document
    .querySelectorAll('[data-user-email]')
    .forEach((el) => (el.textContent = email));
  document.querySelectorAll('[data-user-role]').forEach((el) => {
    el.textContent = role;
    el.className = el.className.replace(/badge-\w+/g, '');
    el.classList.add(
      'badge',
      role === 'admin'
        ? 'badge-red'
        : role === 'mini-admin'
          ? 'badge-amber'
          : 'badge-blue',
    );
  });

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase())
    .join('');
  const photo = u?.photo || '';
  document
    .querySelectorAll('[data-user-avatar],[data-user-avatar2]')
    .forEach((el) => {
      if (photo) {
        el.innerHTML = `<img src="${photo}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`;
      } else {
        el.textContent = initials || 'U';
      }
    });

  // Admin nav — visible for admin + mini-admin
  document.querySelectorAll('[data-admin-only]').forEach((el) => {
    el.classList.toggle('hidden', role !== 'admin' && role !== 'mini-admin');
  });
}

async function requireAuth({ allowRoles = null, redirectTo = '/login' } = {}) {
  try {
    const me = await getMe();

    // Rate limited — stay on the page, don't redirect anywhere
    if (me === '__rate_limited__') {
      showAlert('error', 'الطلبات كثيرة جداً، انتظر قليلاً ثم حدّث الصفحة.', {
        title: 'تم تجاوز الحد',
      });
      return null;
    }

    if (!me) {
      window.location.href = redirectTo;
      return null;
    }

    setUserUI(me);
    const role = me?.data?.user?.role || me?.user?.role || me?.role || null;
    if (allowRoles && role && !allowRoles.includes(role)) {
      showAlert('error', 'You do not have permission to view this page.', {
        title: 'Access denied',
      });
      window.location.href = '/dashboard';
      return null;
    }
    return me;
  } catch {
    window.location.href = redirectTo;
    return null;
  }
}

function wireGlobalAuthUI(me) {
  // Sign-out buttons (multiple may exist: sidebar + topbar dropdown)
  document
    .querySelectorAll('[data-sign-out],[data-sign-out2]')
    .forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        logout();
      });
    });
  // Populate dropdown header if me passed in
  if (me) setUserUI(me);
}

function clearMeCache() {
  _mePromise = null;
}

export { requireAuth, wireGlobalAuthUI, getMe, setUserUI, clearMeCache };
