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

// ── Cached data for PDF export ────────────────────────────────────────────────
let _employee = {};
let _stats = {};
let _allBookings = [];

async function load() {
  const body = $('[data-emp-bookings-body]');
  if (body) renderTableSkeleton(body, 8, 7);

  const fromEl = $('[data-from]');
  const toEl = $('[data-to]');
  const statusEl = $('[data-status-filter]');
  const from = fromEl?.value || '';
  const to = toEl?.value || '';
  const status = statusEl?.value || '';

  const params = new URLSearchParams({ limit: 1000 });
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  if (status) params.set('status', status);

  try {
    const res = await apiFetch(
      `/admin/employees/${encodeURIComponent(employeeId)}?${params}`,
    );
    if (!res) return;
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.message || 'فشل تحميل بيانات الموظف');

    const payload = json?.data || json;
    _employee = payload?.employee || {};
    _stats = payload?.stats || {};
    _allBookings = Array.isArray(payload?.bookings) ? payload.bookings : [];

    // Employee info
    const setText = (sel, val) => {
      const el = $(sel);
      if (el) el.textContent = val;
    };
    setText('[data-emp-name]', _employee.name || '—');
    setText('[data-emp-email]', _employee.email || '—');
    setText('[data-emp-role]', _employee.role || '—');
    setText('[data-emp-total-bookings]', String(_stats.totalBookings ?? 0));
    setText('[data-emp-total-revenue]', fmtCurrency(_stats.totalRevenue ?? 0));
    setText(
      '[data-emp-total-deposits]',
      fmtCurrency(_stats.totalDeposits ?? 0),
    );

    // Bookings table
    if (body) {
      body.innerHTML = '';
      if (!_allBookings.length) {
        body.innerHTML = `<tr><td colspan="7"><div class="empty-state"><div class="empty-illus">📋</div><div style="font-weight:700">لا توجد حجوزات</div></div></td></tr>`;
      } else {
        for (const b of _allBookings) {
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

// ── PDF export ────────────────────────────────────────────────────────────────

function buildEmployeePrintHTML(employee, stats, bookings) {
  const name = employee?.name || '—';
  const email = employee?.email || '—';
  const role = employee?.role || '—';
  const joined = fmtDate(employee?.createdAt);

  const totalBookings = stats?.totalBookings || 0;
  const totalRevenue = stats?.totalRevenue || 0;
  const totalDeposits = stats?.depositsCollected || stats?.totalDeposits || 0;
  const totalRemaining = totalRevenue - totalDeposits;

  const statusLabelMap = {
    confirmed: 'مؤكد',
    pending: 'قيد الانتظار',
    done: 'مكتمل',
    cancelled: 'ملغى',
    retrieval: 'مسترد',
  };
  const payLabel = { paid: 'مدفوع', partial: 'جزئي', unpaid: 'غير مدفوع' };

  const badgeColor = (s) => {
    s = String(s || '').toLowerCase();
    if (s === 'confirmed') return '#16a34a';
    if (s === 'pending') return '#d97706';
    if (s === 'done') return '#2563eb';
    if (s === 'cancelled' || s === 'canceled') return '#dc2626';
    if (s === 'retrieval') return '#16a34a';
    return '#64748b';
  };
  const payColor = (p) => {
    p = String(p || '').toLowerCase();
    if (p === 'paid') return '#16a34a';
    if (p === 'partial') return '#d97706';
    return '#64748b';
  };

  const bookingRows = bookings.length
    ? bookings
        .map((b) => {
          const status = String(b?.status || 'pending').toLowerCase();
          const payment = String(b?.paymentStatus || 'unpaid').toLowerCase();
          const remaining = Math.max(
            0,
            (b?.totalPrice || 0) - (b?.deposit || 0),
          );
          return `
          <tr>
            <td>${b?.patient?.name || '—'}</td>
            <td>${b?.patient?.phone || '—'}</td>
            <td>${fmtDate(b?.appointmentDate)}</td>
            <td>${b?.appointmentTime || '—'}</td>
            <td>${b?.serviceType || '—'}</td>
            <td><span style="background:${badgeColor(status)};color:#fff;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700">${statusLabelMap[status] || status}</span></td>
            <td><span style="background:${payColor(payment)};color:#fff;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700">${payLabel[payment] || payment}</span></td>
            <td style="text-align:left">${fmtCurrency(b?.totalPrice || 0)}</td>
            <td style="text-align:left;color:${remaining > 0 ? '#dc2626' : '#16a34a'};font-weight:700">${fmtCurrency(remaining)}</td>
          </tr>`;
        })
        .join('')
    : `<tr><td colspan="9" style="text-align:center;color:#94a3b8;padding:24px">لا يوجد حجوزات</td></tr>`;

  const initials =
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((x) => x[0]?.toUpperCase())
      .join('') || 'E';

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${name}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
    *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'DM Sans',Arial,sans-serif;background:#fff;color:#0f172a;font-size:13px;line-height:1.5;-webkit-print-color-adjust:exact;print-color-adjust:exact}
    .page{width:210mm;min-height:297mm;padding:20mm 16mm;margin:0 auto}
    .header{display:flex;justify-content:space-between;align-items:flex-start;padding-bottom:14px;border-bottom:2px solid #7c3aed;margin-bottom:20px}
    .header-brand{display:flex;align-items:center;gap:10px}
    .header-logo{width:40px;height:40px;border-radius:10px;background:#7c3aed;display:grid;place-items:center;color:#fff;font-size:18px;font-weight:800}
    .header-name{font-size:18px;font-weight:800;color:#0f172a;letter-spacing:-0.03em}
    .header-sub{font-size:11px;color:#64748b;margin-top:1px}
    .header-right{text-align:left}
    .header-label{font-size:11px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:.06em}
    .header-date{font-size:11px;color:#64748b;margin-top:2px}
    .profile{display:flex;gap:16px;align-items:center;background:#f5f3ff;border-radius:14px;padding:16px 18px;margin-bottom:18px}
    .avatar{width:64px;height:64px;border-radius:16px;display:grid;place-items:center;font-size:22px;font-weight:800;color:#fff;background:#7c3aed;flex-shrink:0}
    .profile-name{font-size:20px;font-weight:800;color:#0f172a;letter-spacing:-0.03em}
    .profile-email{font-size:13px;color:#7c3aed;font-weight:600;margin-top:3px}
    .badge{font-size:11px;font-weight:700;padding:2px 10px;border-radius:20px;background:#ede9fe;color:#5b21b6;display:inline-block}
    .stats-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px}
    .stat-card{background:#f8faff;border:1px solid #e2e8f0;border-radius:10px;padding:12px 14px;text-align:center}
    .stat-label{font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8;margin-bottom:4px}
    .stat-value{font-size:18px;font-weight:800;color:#0f172a;letter-spacing:-0.03em}
    .stat-value.green{color:#16a34a} .stat-value.red{color:#dc2626}
    .section-title{font-size:14px;font-weight:800;color:#0f172a;letter-spacing:-0.02em;margin-bottom:10px;display:flex;align-items:center;gap:8px}
    .section-title::before{content:'';display:inline-block;width:3px;height:16px;background:#7c3aed;border-radius:2px}
    table{width:100%;border-collapse:collapse;font-size:11px}
    thead th{background:#7c3aed;color:#fff;font-weight:700;font-size:10px;padding:8px;text-align:right}
    thead th:first-child{border-radius:0 8px 0 0} thead th:last-child{border-radius:8px 0 0 0}
    tbody td{padding:7px 8px;border-bottom:1px solid #f1f5f9;vertical-align:middle}
    tbody tr:last-child td{border-bottom:none}
    tbody tr:nth-child(even) td{background:#f8faff}
    .footer{margin-top:24px;padding-top:12px;border-top:1px solid #e2e8f0;display:flex;justify-content:space-between;align-items:center;color:#94a3b8;font-size:10px}
    @media print{body{background:#fff}.page{padding:12mm 12mm}@page{size:A4;margin:0}}
  </style>
</head>
<body>
  <div class="page">
    <div class="header">
      <div class="header-brand">
        <div class="header-logo">P</div>
        <div>
          <div class="header-name">Physio Egypt</div>
          <div class="header-sub">تقرير أداء موظف</div>
        </div>
      </div>
      <div class="header-right">
        <div class="header-label">تاريخ الإصدار</div>
        <div class="header-date">${new Date().toLocaleDateString('ar-EG')}</div>
      </div>
    </div>
    <div class="profile">
      <div class="avatar">${initials}</div>
      <div style="flex:1">
        <div class="profile-name">${name}</div>
        <div class="profile-email">${email}</div>
        <span class="badge" style="margin-top:6px">${role}</span>
      </div>
      <div style="text-align:left">
        <div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.06em">تاريخ الانضمام</div>
        <div style="font-size:13px;font-weight:700;margin-top:2px">${joined}</div>
      </div>
    </div>
    <div class="stats-grid">
      <div class="stat-card"><div class="stat-label">إجمالي الحجوزات</div><div class="stat-value">${totalBookings}</div></div>
      <div class="stat-card"><div class="stat-label">إجمالي الإيرادات</div><div class="stat-value green">${fmtCurrency(totalRevenue)}</div></div>
      <div class="stat-card"><div class="stat-label">إجمالي العربون</div><div class="stat-value green">${fmtCurrency(totalDeposits)}</div></div>
      <div class="stat-card"><div class="stat-label">إجمالي المتبقي</div><div class="stat-value ${totalRemaining > 0 ? 'red' : 'green'}">${fmtCurrency(totalRemaining)}</div></div>
    </div>
    <div class="section-title">سجل الحجوزات (${bookings.length})</div>
    <table>
      <thead><tr><th>المريض</th><th>الهاتف</th><th>التاريخ</th><th>الوقت</th><th>الخدمة</th><th>الحالة</th><th>الدفع</th><th>الإجمالي</th><th>المتبقي</th></tr></thead>
      <tbody>${bookingRows}</tbody>
    </table>
    <div class="footer">
      <span>Physio Egypt · نظام إدارة العيادة</span>
      <span>${name} · ${email}</span>
    </div>
  </div>
</body>
</html>`;
}

function exportPDF() {
  if (!_employee?.name) {
    showAlert('error', 'البيانات لم تُحمَّل بعد. انتظر قليلاً.', {
      title: 'خطأ',
    });
    return;
  }
  const html = buildEmployeePrintHTML(_employee, _stats, _allBookings);
  const win = window.open(
    '',
    '_blank',
    'width=1000,height=1200,scrollbars=yes',
  );
  if (!win) {
    showAlert(
      'error',
      'تعذّر فتح نافذة الطباعة. يرجى السماح بالنوافذ المنبثقة.',
      { title: 'خطأ' },
    );
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.document.title = `تقرير - ${_employee?.name || employeeId}`;
  win.addEventListener('load', () => setTimeout(() => win.print(), 400));
}

// ── Events ────────────────────────────────────────────────────────────────────
$('[data-filter-btn]')?.addEventListener('click', load);
$('[data-export-employee-pdf]')?.addEventListener('click', exportPDF);

await load();
