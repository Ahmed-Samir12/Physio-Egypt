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
async function loadDashboard(date) {
  const tbody = document.querySelector('[data-appointments-body]');
  if (tbody) renderTableSkeleton(tbody, 6, 7);

  const params = date ? `?date=${date}` : '';

  try {
    const res = await apiFetch(`/employee/dashboard${params}`);
    if (!res) return;
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.message || 'فشل تحميل لوحة التحكم');

    const payload = json?.data || json;
    const today = payload?.today || {};
    const allTime = payload?.allTime || {};

    // Update stat labels to reflect selected date if different from today
    const isToday = !date || date === todayStr();
    setStat(
      'todayBookings',
      isToday ? 'حجوزات اليوم' : 'حجوزات اليوم المحدد',
      today?.bookingsCount ?? 0,
      false,
    );
    setStat(
      'todayDeposits',
      isToday ? 'عربون اليوم' : 'عربون اليوم المحدد',
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
const dateInput = document.getElementById('dashDateFilter');
const filterBtn = document.getElementById('dashDateBtn');
const todayBtn = document.getElementById('dashTodayBtn');

// Set default to today
if (dateInput) dateInput.value = todayStr();

filterBtn?.addEventListener('click', () =>
  loadDashboard(dateInput?.value || ''),
);
todayBtn?.addEventListener('click', () => {
  if (dateInput) dateInput.value = todayStr();
  loadDashboard('');
});

// Also load on Enter in date input
dateInput?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') loadDashboard(dateInput.value || '');
});

await loadDashboard('');
