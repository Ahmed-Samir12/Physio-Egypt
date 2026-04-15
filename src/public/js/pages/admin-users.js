import { apiFetch } from '../api.js';
import { showAlert } from '../alert.js';
import { fmtDate } from '../utils/format.js';
import { renderTableSkeleton } from '../components/skeleton.js';
import { openModal } from '../components/modal.js';
import { requireAuth } from '../auth.js';

// helper
const esc = (s) =>
  String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

const me = await requireAuth({ allowRoles: ['admin', 'mini-admin'] });
const myRole = me?.data?.user?.role || me?.user?.role || me?.role;

const body = document.querySelector('[data-users-body]');

function roleBadge(role) {
  if (role === 'admin') return 'badge badge-red';
  if (role === 'mini-admin') return 'badge badge-amber';
  if (role === 'employee') return 'badge badge-blue';
  return 'badge badge-muted';
}

async function loadUsers() {
  if (body) renderTableSkeleton(body, 6, 6);
  try {
    const res = await apiFetch('/admin/users?all=1', { method: 'GET' });
    if (!res) return;
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.message || 'فشل تحميل المستخدمين');

    const payload = json?.data || json;
    const users = payload?.users || payload?.data || payload || [];
    const list = Array.isArray(users) ? users : [];

    if (!body) return;
    body.innerHTML = '';
    if (!list.length) {
      body.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-illus"></div><div class="title" style="font-family:var(--font-display);font-weight:700">لا يوجد مستخدمون</div><div class="msg">لا يوجد شيء للإدارة حتى الآن.</div></div></td></tr>`;
      return;
    }

    list.forEach((u) => {
      const id = u?._id || u?.id;
      const isActive = u?.isActive !== false;
      const canAct = myRole === 'admin' || u?.role === 'employee';

      const actionBtn = isActive
        ? `<button class="btn btn-danger btn-sm" type="button" data-deactivate="${id}" ${!canAct ? 'disabled title="لا يمكن تعطيل هذه الصلاحية"' : ''}>
             <i data-lucide="user-x"></i> تعطيل
           </button>`
        : `<button class="btn btn-success btn-sm" type="button" data-reactivate="${id}">
             <i data-lucide="user-check"></i> تفعيل
           </button>`;

      const tr = document.createElement('tr');
      tr.style.opacity = isActive ? '1' : '0.55';
      tr.innerHTML = `
        <td>${esc(u?.name) || '—'}</td>
        <td class="secondary">${esc(u?.email) || '—'}</td>
        <td><span class="${roleBadge(u?.role)}">${esc(u?.role) || '—'}</span></td>
        <td>
          <span class="badge ${isActive ? 'badge-green' : 'badge-muted'}">
            ${isActive ? 'نشط' : 'معطّل'}
          </span>
        </td>
        <td>${fmtDate(u?.createdAt)}</td>
        <td>${actionBtn}</td>
      `;
      body.appendChild(tr);
    });

    window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
  } catch (e) {
    showAlert('error', e?.message || 'فشل تحميل المستخدمين');
  }
}

document.addEventListener('click', (e) => {
  const deactivateBtn = e.target?.closest?.('[data-deactivate]');
  if (deactivateBtn) {
    const id = deactivateBtn.getAttribute('data-deactivate');
    openModal({
      title: 'تعطيل المستخدم؟',
      body: 'سيفقد هذا المستخدم صلاحية الدخول فور التأكيد.',
      confirmText: 'تأكيد التعطيل',
      onConfirm: async () => {
        const res = await apiFetch(
          `/admin/users/${encodeURIComponent(id)}/deactivate`,
          { method: 'PATCH' },
        );
        if (!res) return;
        const json = await res.json().catch(() => ({}));
        if (!res.ok)
          throw new Error(json?.message || 'فشل إلغاء تفعيل المستخدم');
        showAlert('warning', 'تم إلغاء تفعيل حساب المستخدم.', {
          title: 'تم إلغاء التفعيل',
        });
        await loadUsers();
      },
    });
    return;
  }

  const reactivateBtn = e.target?.closest?.('[data-reactivate]');
  if (reactivateBtn) {
    const id = reactivateBtn.getAttribute('data-reactivate');
    openModal({
      title: 'تفعيل المستخدم؟',
      body: 'سيستعيد هذا المستخدم صلاحية الدخول.',
      confirmText: 'تأكيد التفعيل',
      onConfirm: async () => {
        const res = await apiFetch(
          `/admin/users/${encodeURIComponent(id)}/reactivate`,
          { method: 'PATCH' },
        );
        if (!res) return;
        const json = await res.json().catch(() => ({}));
        if (!res.ok)
          throw new Error(json?.message || 'فشل إعادة تفعيل المستخدم');
        showAlert('success', 'تم إعادة تفعيل الحساب.', { title: 'تم التفعيل' });
        await loadUsers();
      },
    });
  }
});

await loadUsers();
