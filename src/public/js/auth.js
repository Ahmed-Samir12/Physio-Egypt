import { apiFetch, clearAccessToken, logout } from './api.js';
import { showAlert } from './alert.js';

async function getMe() {
  const res = await apiFetch('/auth/me', { method: 'GET' });
  if (!res) return null;
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  return data;
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
    if (!me) {
      clearAccessToken();
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
    clearAccessToken();
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

export { requireAuth, wireGlobalAuthUI, getMe, setUserUI };
