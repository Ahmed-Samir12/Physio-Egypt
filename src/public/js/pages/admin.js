import { apiFetch } from '../api.js';
import { showAlert } from '../alert.js';
import { fmtCurrency, fmtDate } from '../utils/format.js';
import { renderTableSkeleton } from '../components/skeleton.js';
import { requireAuth } from '../auth.js';

await requireAuth({ allowRoles: ['admin'] });

const statsMap = {
  todayBookings: { label: 'حجوزات اليوم', fmt: (v) => String(v ?? 0) },
  todayDeposits: { label: 'عربون اليوم', fmt: (v) => fmtCurrency(v ?? 0) },
  allBookings: { label: 'إجمالي الحجوزات', fmt: (v) => String(v ?? 0) },
  allRevenue: { label: 'إجمالي الإيرادات', fmt: (v) => fmtCurrency(v ?? 0) },
};

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
  if (s === 'cancelled' || s === 'canceled') return 'badge badge-red';
  if (s === 'done') return 'badge badge-blue';
  if (s === 'retrieval') return 'badge badge-green';
  return 'badge badge-muted';
}

let donutChart = null;
let allBookings = [];

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
    el.textContent = fmt(typeof to === 'number' ? Math.round(to * eased) : to);
    if (t < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function updateDonut(counts) {
  const {
    pending = 0,
    confirmed = 0,
    done = 0,
    cancelled = 0,
    retrieval = 0,
  } = counts;
  ['pending', 'confirmed', 'done', 'retrieval', 'cancelled'].forEach((k) => {
    const el = document.querySelector(`[data-status-${k}]`);
    if (el) animateNumber(el, counts[k] || 0);
  });

  const canvas = document.getElementById('donutChart');
  if (!canvas || !window.Chart) return;

  const data = [pending, confirmed, done, retrieval, cancelled];
  const colors = ['#f59e0b', '#22c55e', '#6366f1', '#16a34a', '#ef4444'];
  const labels = ['قيد الانتظار', 'مؤكد', 'مكتمل', 'مسترد', 'ملغى'];

  if (donutChart) {
    donutChart.data.datasets[0].data = data;
    donutChart.update('active');
    return;
  }

  // In ES modules, `window.Chart` exists but the bare `Chart` identifier isn't in scope.
  donutChart = new window.Chart(canvas, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [
        { data, backgroundColor: colors, borderWidth: 0, hoverOffset: 6 },
      ],
    },
    options: {
      cutout: '70%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: { label: (ctx) => ` ${ctx.label}: ${ctx.parsed}` },
        },
      },
      animation: { duration: 700, easing: 'easeOutQuart' },
    },
  });
}

function renderBookings(list) {
  const body = document.querySelector('[data-bookings-body]');
  if (!body) return;
  body.innerHTML = '';
  if (!list.length) {
    body.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-illus">📋</div><div style="font-weight:700;font-family:var(--font-display)">لا توجد حجوزات</div><div class="secondary" style="font-size:1rem">جرب تغيير النطاق </div></div></td></tr>`;
    return;
  }
  for (const b of list) {
    const id = b?._id || b?.id;
    const patient = b?.patient || {};
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${fmtDate(b?.appointmentDate || b?.date)}</td>
      <td class="tnum">${b?.appointmentTime || '—'}</td>
      <td>${patient?.name || b?.patientName || '—'}</td>
      <td>${b?.serviceType || '—'}</td>
      <td><span class="${badgeForStatus(b?.status)}">${statusLabel[String(b?.status || '').toLowerCase()] || b?.status || '—'}</span></td>
      <td class="tnum">${fmtCurrency(b?.totalPrice ?? 0)}</td>
      <td><a class="btn btn-ghost btn-sm" href="/bookings/${id}"><i data-lucide="eye"></i> View</a></td>
    `;
    body.appendChild(tr);
  }
  window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
}

function wireStatusFilter() {
  const chips = [...document.querySelectorAll('[data-status-chip]')];
  chips.forEach((c) =>
    c.addEventListener('click', () => {
      chips.forEach((x) => x.classList.remove('is-active'));
      c.classList.add('is-active');
      const s = c.getAttribute('data-status-chip');
      renderBookings(
        s === 'all'
          ? allBookings
          : allBookings.filter(
              (b) => String(b?.status || '').toLowerCase() === s,
            ),
      );
    }),
  );
}

async function loadAdminDashboard() {
  const perfBody = document.querySelector('[data-perf-body]');
  const bookingsBody = document.querySelector('[data-bookings-body]');
  if (perfBody) renderTableSkeleton(perfBody, 5, 6);
  if (bookingsBody) renderTableSkeleton(bookingsBody, 6, 7);

  try {
    const res = await apiFetch('/admin/dashboard', { method: 'GET' });
    if (!res) return;
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.message || 'فشل تحميل لوحة التحكم');

    const payload = json?.data || json;
    const today = payload?.today || {};

    // Stats mapping from API shape
    const allTime = payload?.allTime || {};
    const statsData = {
      todayBookings: today?.totalBookings ?? 0,
      todayDeposits: today?.totalDepositsCollected ?? 0,
      allBookings: allTime?.totalBookings ?? payload?.totalBookings ?? 0,
      allRevenue: allTime?.totalRevenue ?? today?.totalRevenue ?? 0,
    };

    Object.entries(statsMap).forEach(([k, meta]) => {
      const labelEl = document.querySelector(`[data-stat-label="${k}"]`);
      const valueEl = document.querySelector(`[data-stat-value="${k}"]`);
      if (labelEl) labelEl.textContent = meta.label;
      if (valueEl) {
        const raw = statsData[k] ?? 0;
        if (
          k.includes('Deposit') ||
          k.includes('Revenue') ||
          k === 'todayDeposits' ||
          k === 'allRevenue'
        ) {
          valueEl.textContent = meta.fmt(raw);
        } else {
          animateNumber(valueEl, Number(raw) || 0, meta.fmt);
        }
      }
    });

    // New stat cards: all-time deposits + projected revenue
    const allDepositsEl = document.querySelector(
      '[data-stat-value="allDeposits"]',
    );
    const projectedEl = document.querySelector(
      '[data-stat-value="projectedRevenue"]',
    );
    if (allDepositsEl)
      allDepositsEl.textContent = fmtCurrency(allTime?.totalDeposits ?? 0);
    if (projectedEl)
      projectedEl.textContent = fmtCurrency(payload?.projectedRevenue ?? 0);
    setText(
      '[data-retrieval-discount]',
      fmtCurrency(payload?.retrievalDiscount ?? 0),
    );
    setText('[data-net-projected]', fmtCurrency(payload?.netProjected ?? 0));

    // Revenue summary
    setText('[data-rev-today]', fmtCurrency(today?.totalRevenue ?? 0));
    setText(
      '[data-rev-deposits]',
      fmtCurrency(today?.totalDepositsCollected ?? 0),
    );
    setText('[data-rev-remaining]', fmtCurrency(today?.totalRemaining ?? 0));

    // Status breakdown
    const sbArr = Array.isArray(payload?.statusBreakdown)
      ? payload.statusBreakdown
      : [];
    const counts = {
      pending: 0,
      confirmed: 0,
      done: 0,
      retrieval: 0,
      cancelled: 0,
    };
    sbArr.forEach((row) => {
      const k = String(row?._id || '').toLowerCase();
      if (k in counts) counts[k] = row?.count ?? 0;
    });
    updateDonut(counts);

    // Performance table
    const perf = Array.isArray(payload?.employeePerformance)
      ? payload.employeePerformance
      : [];
    if (perfBody) {
      perfBody.innerHTML = '';
      if (!perf.length) {
        perfBody.innerHTML = `<tr><td colspan="6"><div class="empty-state"><div class="empty-illus">👥</div><div style="font-weight:700;font-family:var(--font-display)">لا يوجد بيانات</div></div></td></tr>`;
      } else {
        perf.forEach((row, i) => {
          const tr = document.createElement('tr');
          tr.style.cursor = 'pointer';
          tr.title = 'عرض تفاصيل الموظف';
          tr.innerHTML = `
            <td class="tnum rank-cell">${i + 1}</td>
            <td><strong>${row?.name || '—'}</strong></td>
            <td class="secondary">${row?.email || '—'}</td>
            <td class="tnum">${row?.totalBookings ?? 0}</td>
            <td class="tnum">${fmtCurrency(row?.totalRevenue ?? 0)}</td>
            <td class="tnum">${fmtCurrency(row?.depositsCollected ?? 0)}</td>
          `;
          if (row?.employeeId) {
            tr.addEventListener(
              'click',
              () =>
                (window.location.href = `/admin/employees/${row.employeeId}`),
            );
          }
          perfBody.appendChild(tr);
        });
      }
    }

    // Bookings list
    allBookings = Array.isArray(payload?.bookings) ? payload.bookings : [];
    renderBookings(allBookings);
    wireStatusFilter();
  } catch (e) {
    showAlert('error', e?.message || 'فشل تحميل لوحة التحكم', {
      title: 'خطأ في التحميل',
    });
  }
}

function setText(sel, val) {
  const el = document.querySelector(sel);
  if (el) el.textContent = val;
}

await loadAdminDashboard();
