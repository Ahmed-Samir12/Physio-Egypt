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
const myId = me?.data?.user?._id || me?.data?.user?.id || me?.user?._id;

const body = document.querySelector('[data-users-body]');

function roleBadge(role) {
  if (role === 'admin') return 'badge badge-red';
  if (role === 'mini-admin') return 'badge badge-amber';
  if (role === 'employee') return 'badge badge-blue';
  return 'badge badge-muted';
}

function roleLabel(role) {
  if (role === 'admin') return 'مدير';
  if (role === 'mini-admin') return 'مدير مساعد';
  if (role === 'employee') return 'موظف';
  return role || '—';
}

async function loadUsers() {
  if (body) renderTableSkeleton(body, 6, 7);
  try {
    const res = await apiFetch('/admin/users?all=1', { method: 'GET' });
    if (!res) return;
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.message || 'فشل تحميل المستخدمين');

    const users = json?.data?.users || [];
    const list = Array.isArray(users) ? users : [];

    if (!body) return;
    body.innerHTML = '';
    if (!list.length) {
      body.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-illus"></div><div class="title">لا يوجد مستخدمون</div></div></td></tr>`;
      return;
    }

    list.forEach((u) => {
      const id = u?._id || u?.id;
      const isActive = u?.isActive !== false;
      const isSelf = String(id) === String(myId);
      const canActOnThis = myRole === 'admin' || u?.role === 'employee';

      // Deactivate / Reactivate button
      const toggleBtn = isActive
        ? `<button class="btn btn-danger btn-sm" type="button" data-deactivate="${id}" ${!canActOnThis ? 'disabled title="لا يمكن تعطيل هذه الصلاحية"' : ''}>
             <i data-lucide="user-x"></i> تعطيل
           </button>`
        : `<button class="btn btn-success btn-sm" type="button" data-reactivate="${id}">
             <i data-lucide="user-check"></i> تفعيل
           </button>`;

      // Role change button — admin only, not for self
      const roleBtn =
        myRole === 'admin' && !isSelf
          ? `<button class="btn btn-ghost btn-sm" type="button" data-change-role="${id}" data-current-role="${esc(u?.role)}">
               <i data-lucide="shield"></i> الصلاحية
             </button>`
          : '';

      const tr = document.createElement('tr');
      tr.style.opacity = isActive ? '1' : '0.55';
      tr.innerHTML = `
        <td>${esc(u?.name) || '—'}</td>
        <td class="secondary">${esc(u?.email) || '—'}</td>
        <td><span class="${roleBadge(u?.role)}">${roleLabel(u?.role)}</span></td>
        <td>
          <span class="badge ${isActive ? 'badge-green' : 'badge-muted'}">
            ${isActive ? 'نشط' : 'معطّل'}
          </span>
        </td>
        <td>${fmtDate(u?.createdAt)}</td>
        <td style="display:flex;gap:6px;flex-wrap:wrap">${toggleBtn}${roleBtn}</td>
      `;
      body.appendChild(tr);
    });

    window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
  } catch (e) {
    showAlert('error', e?.message || 'فشل تحميل المستخدمين');
  }
}

document.addEventListener('click', (e) => {
  // ── Deactivate ──────────────────────────────────────────
  const deactivateBtn = e.target?.closest?.('[data-deactivate]');
  if (deactivateBtn) {
    const id = deactivateBtn.getAttribute('data-deactivate');
    openModal({
      title: 'تعطيل المستخدم؟',
      body: 'سيفقد هذا المستخدم صلاحية الدخول فور التأكيد.',
      confirmText: 'تأكيد التعطيل',
      danger: true,
      onConfirm: async () => {
        const res = await apiFetch(
          `/admin/users/${encodeURIComponent(id)}/deactivate`,
          { method: 'PATCH' },
        );
        if (!res) return;
        const json = await res.json().catch(() => ({}));
        if (!res.ok)
          throw new Error(json?.message || 'فشل إلغاء تفعيل المستخدم');
        showAlert('warning', 'تم إلغاء تفعيل حساب المستخدم.', { title: 'تم' });
        await loadUsers();
      },
    });
    return;
  }

  // ── Reactivate ──────────────────────────────────────────
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
    return;
  }

  // ── Change role ─────────────────────────────────────────
  const roleBtn = e.target?.closest?.('[data-change-role]');
  if (roleBtn) {
    const id = roleBtn.getAttribute('data-change-role');
    const currentRole = roleBtn.getAttribute('data-current-role');

    // Build a DOM node so we can get the select value in onConfirm
    const container = document.createElement('div');
    container.style.cssText = 'display:flex;flex-direction:column;gap:12px';

    const label = document.createElement('p');
    label.textContent = 'اختر الصلاحية الجديدة:';
    label.style.cssText = 'font-size:14px;color:var(--color-text-secondary)';

    const select = document.createElement('select');
    select.className = 'input';
    select.style.width = '100%';
    [
      { value: 'employee', label: 'موظف' },
      { value: 'mini-admin', label: 'مدير مساعد' },
      { value: 'admin', label: 'مدير' },
    ].forEach(({ value, label: optLabel }) => {
      const opt = document.createElement('option');
      opt.value = value;
      opt.textContent = optLabel;
      if (value === currentRole) opt.selected = true;
      select.appendChild(opt);
    });

    container.appendChild(label);
    container.appendChild(select);

    openModal({
      title: 'تغيير صلاحية المستخدم',
      body: container,
      confirmText: 'تأكيد التغيير',
      onConfirm: async () => {
        const newRole = select.value;
        if (newRole === currentRole) return; // nothing changed

        const res = await apiFetch(
          `/admin/users/${encodeURIComponent(id)}/role`,
          {
            method: 'PATCH',
            body: JSON.stringify({ role: newRole }),
          },
        );
        if (!res) return;
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.message || 'فشل تغيير الصلاحية');
        showAlert('success', `تم تغيير الصلاحية إلى ${roleLabel(newRole)}.`, {
          title: 'تم التحديث',
        });
        await loadUsers();
      },
    });
  }
});

await loadUsers();
