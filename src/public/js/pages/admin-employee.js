import { apiFetch } from '../api.js';
import { showAlert } from '../alert.js';
import { fmtCurrency, fmtDate } from '../utils/format.js';
import { renderTableSkeleton } from '../components/skeleton.js';
import { requireAuth } from '../auth.js';

await requireAuth({ allowRoles: ['admin'] });

const employeeId = window.location.pathname.split('/').pop();
const $ = (s) => document.querySelector(s);

const statusLabel = {
  confirmed: 'مؤكد',
  pending: 'قيد الانتظار',
  done: 'مكتمل',
  cancelled: 'ملغى',
  retrieval: 'مسترد',
};

function badgeForStatus(s) {
  s = String(s || '').toLowerCase();
  if (s === 'confirmed') return 'badge badge-green';
  if (s === 'pending') return 'badge badge-amber';
  if (s === 'cancelled') return 'badge badge-red';
  if (s === 'done') return 'badge badge-blue';
  if (s === 'retrieval') return 'badge badge-green';
  return 'badge badge-muted';
}

async function load() {
  const body = $('[data-emp-bookings-body]');
  if (body) renderTableSkeleton(body, 8, 7);

  const fromEl = $('[data-from]');
  const toEl = $('[data-to]');
  const from = fromEl?.value || '';
  const to = toEl?.value || '';

  const params = new URLSearchParams({ limit: 20 });
  if (from) params.set('from', from);
  if (to) params.set('to', to);

  try {
    const res = await apiFetch(
      `/admin/employees/${encodeURIComponent(employeeId)}?${params}`,
    );
    if (!res) return;
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.message || 'فشل تحميل بيانات الموظف');

    const payload = json?.data || json;
    const emp = payload?.employee || {};
    const stats = payload?.stats || {};
    const bookings = Array.isArray(payload?.bookings) ? payload.bookings : [];

    // Employee info
    const setText = (sel, val) => {
      const el = $(sel);
      if (el) el.textContent = val;
    };
    setText('[data-emp-name]', emp.name || '—');
    setText('[data-emp-email]', emp.email || '—');
    setText('[data-emp-role]', emp.role || '—');

    // Stats
    setText('[data-emp-total-bookings]', String(stats.totalBookings ?? 0));
    setText('[data-emp-total-revenue]', fmtCurrency(stats.totalRevenue ?? 0));
    setText('[data-emp-total-deposits]', fmtCurrency(stats.totalDeposits ?? 0));

    // Bookings table
    if (body) {
      body.innerHTML = '';
      if (!bookings.length) {
        body.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-illus">📋</div><div style="font-weight:700">لا توجد حجوزات</div><div class="secondary">جرّب تغيير نطاق التاريخ.</div></div></td></tr>`;
      } else {
        for (const b of bookings) {
          const id = b?._id || b?.id;
          const patient = b?.patient || {};
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${fmtDate(b?.appointmentDate)}</td>
            <td class="tnum">${b?.appointmentTime || '—'}</td>
            <td>${patient?.name || '—'}</td>
            <td>${b?.serviceType || '—'}</td>
            <td><span class="${badgeForStatus(b?.status)}">${statusLabel[String(b?.status || '').toLowerCase()] || b?.status || '—'}</span></td>
            <td class="tnum">${fmtCurrency(b?.totalPrice ?? 0)}</td>
            <td><a class="btn btn-ghost btn-sm" href="/bookings/${id}"><i data-lucide="eye"></i> عرض</a></td>
          `;
          body.appendChild(tr);
        }
      }
    }

    window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
  } catch (e) {
    showAlert('error', e?.message || 'فشل تحميل بيانات الموظف', {
      title: 'خطأ',
    });
  }
}

$('[data-filter-btn]')?.addEventListener('click', load);
await load();
