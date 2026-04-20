import { apiFetch } from '../api.js';
import { showAlert } from '../alert.js';
import { fmtCurrency } from '../utils/format.js';
import { renderTableSkeleton } from '../components/skeleton.js';

// ── Status helpers ────────────────────────────────────────
const statusLabel = {
  confirmed: 'مؤكد',
  pending: 'قيد الانتظار',
  done: 'مكتمل',
  cancelled: 'ملغى',
  retrieval: 'مسترد',
};
const payLabel = { paid: 'مدفوع', partial: 'جزئي', unpaid: 'غير مدفوع' };

function badgeForStatus(s) {
  s = String(s || '').toLowerCase();
  if (s === 'confirmed') return 'badge badge-green';
  if (s === 'pending') return 'badge badge-amber';
  if (s === 'cancelled' || s === 'canceled') return 'badge badge-red';
  if (s === 'done') return 'badge badge-blue';
  if (s === 'retrieval') return 'badge badge-green';
  return 'badge badge-muted';
}
function badgeForPayment(s) {
  s = String(s || '').toLowerCase();
  if (s === 'paid') return 'badge badge-green';
  if (s === 'partial') return 'badge badge-amber';
  return 'badge badge-muted';
}

// ── Animated counter ──────────────────────────────────────
function animateNumber(el, to, fmt = String) {
  if (!el) return;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches) {
    el.textContent = fmt(to);
    return;
  }
  const duration = 700,
    start = performance.now();
  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = fmt(Math.round(to * eased));
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

// ── Set stat card ─────────────────────────────────────────
function setStat(key, label, value, isCurrency = false) {
  const labelEl = document.querySelector(`[data-stat-label="${key}"]`);
  const valueEl = document.querySelector(`[data-stat-value="${key}"]`);
  if (labelEl) labelEl.textContent = label;
  if (!valueEl) return;
  if (isCurrency) {
    valueEl.textContent = fmtCurrency(value ?? 0);
  } else {
    animateNumber(valueEl, Number(value) || 0, (v) => String(v));
  }
}

// ── Today's date string ───────────────────────────────────
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ── Main loader ───────────────────────────────────────────
async function loadDashboard(from = '', to = '') {
  const tbody = document.querySelector('[data-appointments-body]');
  if (tbody) renderTableSkeleton(tbody, 6, 7);

  const qs = new URLSearchParams();
  if (from) qs.set('from', from);
  if (to) qs.set('to', to);
  const params = qs.toString() ? `?${qs}` : '';

  try {
    const res = await apiFetch(`/employee/dashboard${params}`);
    if (!res) return;
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.message || 'فشل تحميل لوحة التحكم');

    const payload = json?.data || json;
    const today = payload?.today || {};
    const allTime = payload?.allTime || {};

    // Update stat labels to reflect selected date if different from today
    const isToday = !from && !to;

    setStat(
      'todayBookings',
      isToday ? 'حجوزات اليوم' : 'حجوزات الفترة المحددة',
      today?.bookingsCount ?? 0,
      false,
    );

    setStat(
      'todayDeposits',
      isToday ? 'عربون اليوم' : 'عربون الفترة المحددة',
      today?.depositsCollected ?? 0,
      true,
    );

    setStat(
      'allBookings',
      'إجمالي الحجوزات',
      allTime?.totalBookings ?? 0,
      false,
    );

    setStat('allRevenue', 'إجمالي الإيرادات', allTime?.totalRevenue ?? 0, true);

    // ── Appointments table ──────────────────────────────
    const bookings = payload?.bookings || [];
    const rows = [...(Array.isArray(bookings) ? bookings : [])].sort((a, b) =>
      String(a?.appointmentTime || '').localeCompare(
        String(b?.appointmentTime || ''),
      ),
    );

    if (!tbody) return;
    tbody.innerHTML = '';

    if (!rows.length) {
      const msg = isToday
        ? 'لا توجد مواعيد مجدولة لليوم.'
        : 'لا توجد مواعيد في هذا اليوم.';
      tbody.innerHTML = `
        <tr><td colspan="7">
          <div class="empty-state">
            <div class="empty-illus" aria-hidden="true">📅</div>
            <div style="font-weight:700;font-family:var(--font-display);margin-top:.5rem">لا يوجد مواعيد</div>
            <div class="secondary" style="margin-top:.25rem">${msg}</div>
          </div>
        </td></tr>`;
      return;
    }

    for (const b of rows) {
      const patient = b?.patient || {};
      const pName = patient?.name || b?.patientName || '—';
      const phone = patient?.phone || b?.phone || '—';
      const service = b?.serviceType || b?.service || '—';
      const status = String(b?.status || '').toLowerCase();
      const payment = String(b?.paymentStatus || 'unpaid').toLowerCase();
      const time = b?.appointmentTime || b?.time || '—';
      const id = b?._id || b?.id;
      const patId = patient?._id;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="tnum" dir="ltr">${time}</td>
        <td>
          ${
            patId
              ? `<a href="/patients/${patId}" style="font-weight:600;color:var(--accent)">${pName}</a>`
              : `<span style="font-weight:600">${pName}</span>`
          }
        </td>
        <td>
          <button class="btn btn-ghost btn-sm" type="button" data-call="${phone}" dir="ltr">${phone}</button>
        </td>
        <td>${service}</td>
        <td><span class="${badgeForStatus(status)}">${statusLabel[status] || b?.status || '—'}</span></td>
        <td><span class="${badgeForPayment(payment)}">${payLabel[payment] || payment}</span></td>
        <td>
          <a class="btn btn-ghost btn-sm" href="/bookings/${id}">
            <i data-lucide="eye"></i> عرض
          </a>
        </td>
      `;
      tbody.appendChild(tr);
    }

    window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });

    // Phone tap-to-call
    tbody.addEventListener('click', (e) => {
      const btn = e.target?.closest('[data-call]');
      if (!btn) return;
      const phone = btn.getAttribute('data-call');
      if (phone && phone !== '—') {
        const cleaned = phone.replace(/\D/g, '');
        window.location.href = `tel:+${cleaned.startsWith('20') ? cleaned : '20' + cleaned}`;
      }
    });
  } catch (e) {
    showAlert('error', e?.message || 'فشل تحميل لوحة التحكم', { title: 'خطأ' });
  }
}

// ── Date filter controls ──────────────────────────────────
const dateFromInput = document.getElementById('dashDateFrom');
const dateToInput = document.getElementById('dashDateTo');
const filterBtn = document.getElementById('dashDateBtn');
const todayBtn = document.getElementById('dashTodayBtn');

// Default: today in both fields
if (dateFromInput) dateFromInput.value = todayStr();
if (dateToInput) dateToInput.value = todayStr();

filterBtn?.addEventListener('click', () =>
  loadDashboard(dateFromInput?.value || '', dateToInput?.value || ''),
);

todayBtn?.addEventListener('click', () => {
  if (dateFromInput) dateFromInput.value = todayStr();
  if (dateToInput) dateToInput.value = todayStr();
  loadDashboard(todayStr(), todayStr());
});

[dateFromInput, dateToInput].forEach((el) =>
  el?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') filterBtn?.click();
  }),
);

await loadDashboard(todayStr(), todayStr());

// ── Employee performance (mini-admin only) ────────────────
async function loadPerformance() {
  const perfBody = document.querySelector('[data-perf-body]');
  if (!perfBody) return; // not on mini-admin dashboard, skip

  renderTableSkeleton(perfBody, 5, 6);

  try {
    const res = await apiFetch('/admin/performance', { method: 'GET' });
    if (!res) return;
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return; // silently skip if not authorized

    const list = json?.data?.performance || [];
    perfBody.innerHTML = '';

    if (!list.length) {
      perfBody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="secondary">لا يوجد موظفون</div></div></td></tr>`;
      return;
    }

    for (const emp of list) {
      const id = emp?.employeeId;
      const roleBadge =
        emp.role === 'admin'
          ? 'badge badge-red'
          : emp.role === 'mini-admin'
            ? 'badge badge-amber'
            : 'badge badge-blue';
      const roleLabel =
        emp.role === 'admin'
          ? 'مدير'
          : emp.role === 'mini-admin'
            ? 'مدير مساعد'
            : 'موظف';

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td style="font-weight:600">${emp.name || '—'}</td>
        <td class="secondary" style="font-size:13px">${emp.email || '—'}</td>
        <td><span class="${roleBadge}">${roleLabel}</span></td>
        <td class="tnum">${emp.totalBookings ?? 0}</td>
        <td class="tnum">${emp.confirmedBookings ?? 0}</td>
        <td>
          <a class="btn btn-ghost btn-sm" href="/admin/employees/${id}">
            <i data-lucide="eye"></i> التفاصيل
          </a>
        </td>
      `;
      perfBody.appendChild(tr);
    }

    window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
  } catch {
    // Non-critical — don't show error, table just stays empty
  }
}

// Only run on mini-admin dashboard (page has [data-perf-body])
if (document.querySelector('[data-perf-body]')) {
  await loadPerformance();
}
