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
const pendingBody = document.querySelector('[data-pending-body]');
const pendingSection = document.querySelector('[data-pending-section]');

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

// ── Load pending (unapproved) registrations ───────────────
async function loadPendingUsers() {
  if (!pendingBody) return;
  renderTableSkeleton(pendingBody, 3, 5);

  try {
    const res = await apiFetch('/admin/users?pending=1', { method: 'GET' });
    if (!res) return;
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.message || 'فشل تحميل الطلبات المعلقة');

    const users = json?.data?.users || [];
    pendingBody.innerHTML = '';

    if (!users.length) {
      if (pendingSection) pendingSection.style.display = 'none';
      return;
    }

    if (pendingSection) pendingSection.style.display = '';

    users.forEach((u) => {
      const id = u?._id || u?.id;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><strong>${esc(u?.name) || '—'}</strong></td>
        <td class="secondary">${esc(u?.email) || '—'}</td>
        <td>${fmtDate(u?.createdAt)}</td>
        <td style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="btn btn-success btn-sm" type="button" data-approve="${id}">
            <i data-lucide="user-check"></i> قبول
          </button>
          <button class="btn btn-danger btn-sm" type="button" data-reject="${id}">
            <i data-lucide="user-x"></i> رفض
          </button>
        </td>
      `;
      pendingBody.appendChild(tr);
    });

    window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
  } catch (e) {
    showAlert('error', e?.message || 'فشل تحميل الطلبات المعلقة');
  }
}

// ── Load approved/active users ────────────────────────────
async function loadUsers() {
  if (body) renderTableSkeleton(body, 6, 7);
  try {
    const res = await apiFetch('/admin/users?all=1', { method: 'GET' });
    if (!res) return;
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.message || 'فشل تحميل المستخدمين');

    // Filter out unapproved accounts — they show in the pending section
    const users = (json?.data?.users || []).filter(
      (u) => u?.isApproved !== false,
    );
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

      // Delete button — admin only, not for self
      const deleteBtn =
        myRole === 'admin' && !isSelf
          ? `<button class="btn btn-danger btn-sm" type="button" data-delete-user="${id}" data-user-name="${esc(u?.name)}" title="حذف نهائي">
               <i data-lucide="trash-2"></i> حذف
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
        <td style="display:flex;gap:6px;flex-wrap:wrap">${toggleBtn}${roleBtn}${deleteBtn}</td>
      `;
      body.appendChild(tr);
    });

    window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
  } catch (e) {
    showAlert('error', e?.message || 'فشل تحميل المستخدمين');
  }
}

document.addEventListener('click', (e) => {
  // ── Approve ─────────────────────────────────────────────
  const approveBtn = e.target?.closest?.('[data-approve]');
  if (approveBtn) {
    const id = approveBtn.getAttribute('data-approve');
    openModal({
      title: 'قبول طلب التسجيل؟',
      body: 'سيتمكن هذا المستخدم من تسجيل الدخول فور التأكيد.',
      confirmText: 'قبول',
      onConfirm: async () => {
        const res = await apiFetch(
          `/admin/users/${encodeURIComponent(id)}/approve`,
          { method: 'PATCH' },
        );
        if (!res) return;
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.message || 'فشل قبول الطلب');
        showAlert('success', 'تم قبول الحساب وتفعيله.', { title: 'تم' });
        await Promise.all([loadPendingUsers(), loadUsers()]);
      },
    });
    return;
  }

  // ── Reject ──────────────────────────────────────────────
  const rejectBtn = e.target?.closest?.('[data-reject]');
  if (rejectBtn) {
    const id = rejectBtn.getAttribute('data-reject');
    openModal({
      title: 'رفض طلب التسجيل؟',
      body: 'سيتم حذف هذا الحساب نهائياً ولن يتمكن المستخدم من الدخول.',
      confirmText: 'رفض وحذف',
      danger: true,
      onConfirm: async () => {
        const res = await apiFetch(
          `/admin/users/${encodeURIComponent(id)}/reject`,
          { method: 'DELETE' },
        );
        if (!res) return;
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.message || 'فشل رفض الطلب');
        showAlert('warning', 'تم رفض وحذف الحساب.', { title: 'تم' });
        await loadPendingUsers();
      },
    });
    return;
  }

  // ── Delete user (permanent) — admin only ────────────────
  const deleteUserBtn = e.target?.closest?.('[data-delete-user]');
  if (deleteUserBtn) {
    const id = deleteUserBtn.getAttribute('data-delete-user');
    const name = deleteUserBtn.getAttribute('data-user-name') || 'هذا المستخدم';
    openModal({
      title: 'حذف المستخدم نهائياً؟',
      body: `سيتم حذف حساب "${name}" وجميع حجوزاته بشكل نهائي ولا يمكن التراجع عن هذا الإجراء.`,
      confirmText: 'حذف نهائي',
      danger: true,
      onConfirm: async () => {
        const res = await apiFetch(`/admin/users/${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });
        if (!res) return;
        const json = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(json?.message || 'فشل حذف المستخدم');
        showAlert('warning', `تم حذف حساب "${name}" نهائياً.`, {
          title: 'تم الحذف',
        });
        await loadUsers();
      },
    });
    return;
  }

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
        if (newRole === currentRole) return;

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

await loadPendingUsers();
await loadUsers();
