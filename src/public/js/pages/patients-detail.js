import { apiFetch } from '../api.js';
import { showAlert } from '../alert.js';
import { fmtDate, fmtCurrency, hashColor } from '../utils/format.js';
import { openModal } from '../components/modal.js';
import { requireAuth } from '../auth.js';

const patientId = window.location.pathname.split('/').pop();

const els = {
  big: document.querySelector('[data-big-initials]'),
  name: document.querySelector('[data-patient-name]'),
  phoneBtn: document.querySelector('[data-copy-phone]'),
  waLink: document.querySelector('[data-wa-link]'),
  gender: document.querySelector('[data-gender]'),
  age: document.querySelector('[data-age]'),
  address: document.querySelector('[data-address]'),
  nationality: document.querySelector('[data-nationality]'),
  notes: document.querySelector('[data-notes]'),
  patientId: document.querySelector('[data-patient-id]'),
  created: document.querySelector('[data-created]'),
  history: document.querySelector('[data-history]'),
  downloadBtn: document.querySelector('[data-download-card]'),
};

function initialsOf(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase())
    .join('');
}

function genderLabel(g) {
  return g === 'male' ? 'ذكر' : g === 'female' ? 'أنثى' : g || '—';
}

function badgeForStatus(s) {
  s = String(s || '').toLowerCase();
  if (s === 'confirmed') return 'badge badge-green';
  if (s === 'pending') return 'badge badge-amber';
  if (s === 'cancelled' || s === 'canceled') return 'badge badge-red';
  if (s === 'done') return 'badge badge-blue';
  return 'badge badge-muted';
}

const statusLabel = {
  confirmed: 'مؤكد',
  pending: 'قيد الانتظار',
  done: 'مكتمل',
  cancelled: 'ملغى',
};

const payLabel = { paid: 'مدفوع', partial: 'جزئي', unpaid: 'غير مدفوع' };

function payBadge(p) {
  const s = String(p || '').toLowerCase();
  if (s === 'paid') return 'badge badge-green';
  if (s === 'partial') return 'badge badge-amber';
  return 'badge badge-muted';
}

async function load() {
  try {
    // Patient + their booking history returned together from the API
    const res = await apiFetch(`/patients/${encodeURIComponent(patientId)}`);
    if (!res) return;
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.message || 'فشل تحميل المريض');

    const p = json?.data?.patient || json?.data || json;
    const bookings = json?.data?.bookings || [];
    const name = p?.name || '—';
    const phone = p?.phone || '—';
    const color = hashColor(name);
    const init = initialsOf(name) || 'م';

    // ── Avatar ─────────────────────────────────────────────
    if (els.big) {
      els.big.textContent = init;
      els.big.style.background = color;
      els.big.style.color = '#fff';
    }

    // ── Patient info ──────────────────────────────────────
    if (els.name) els.name.textContent = name;
    if (els.gender) els.gender.textContent = genderLabel(p?.gender);
    if (els.age) els.age.textContent = p?.age != null ? `${p.age} سنة` : '—';
    if (els.address) els.address.textContent = p?.address || '—';
    if (els.nationality) els.nationality.textContent = p?.nationality || '—';
    if (els.notes) els.notes.textContent = p?.notes || '—';
    if (els.created) els.created.textContent = fmtDate(p?.createdAt);

    if (els.patientId) {
      if (p?.patientId) {
        els.patientId.textContent = `📋 ${p.patientId}`;
        els.patientId.classList.remove('hidden');
        els.patientId.style.cursor = 'pointer';
        els.patientId.title = 'انقر لنسخ رقم المريض';
        els.patientId.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(p.patientId);
            showAlert('success', `تم نسخ ${p.patientId}`);
          } catch {
            showAlert('error', 'فشل النسخ');
          }
        });
      } else {
        els.patientId.textContent = '—';
        els.patientId.classList.add('hidden');
      }
    }

    // ── Phone tap-to-call ─────────────────────────────────
    if (els.phoneBtn) {
      els.phoneBtn.textContent = phone;
      els.phoneBtn.addEventListener('click', () => {
        if (phone && phone !== '—') {
          const cleaned = phone.replace(/\D/g, '');
          window.location.href = `tel:+${cleaned.startsWith('20') ? cleaned : '20' + cleaned}`;
        }
      });
    }

    // ── WhatsApp direct chat (prefer whatsappNumber) ──────
    const waNum = (p?.whatsappNumber || phone || '').replace(/\D/g, '');
    if (els.waLink && waNum) {
      els.waLink.href = `https://wa.me/${waNum}`;
      els.waLink.classList.remove('hidden');
    }

    // ── Booking history ───────────────────────────────────
    const list = Array.isArray(bookings)
      ? [...bookings].sort(
          (a, b) =>
            new Date(b?.appointmentDate || 0) -
            new Date(a?.appointmentDate || 0),
        )
      : [];

    if (els.history) {
      els.history.innerHTML = '';

      if (!list.length) {
        els.history.innerHTML = `
          <div class="empty-state">
            <div class="empty-illus" aria-hidden="true">📋</div>
            <div style="font-weight:700;font-family:var(--font-display);margin-top:.5rem">
              لا يوجد حجوزات
            </div>
            <div class="secondary" style="margin-top:.25rem">
              لا يوجد تاريخ حجوزات لهذا المريض.
            </div>
          </div>`;
      } else {
        list.forEach((b) => {
          const id = b?._id || b?.id;
          const status = String(b?.status || 'pending').toLowerCase();
          const payment = String(b?.paymentStatus || 'unpaid').toLowerCase();

          const companion = b?.companion
            ? `<span class="badge badge-muted" style="font-size:.75rem">👥 ${b.companion}</span>`
            : '';

          const remaining = Math.max(
            0,
            (b?.totalPrice || 0) - (b?.deposit || 0),
          );

          const item = document.createElement('div');
          item.className = 'history-item';
          item.innerHTML = `
            <div style="display:grid;gap:.3rem;flex:1;min-width:0">
              <div style="font-family:var(--font-display);font-weight:700;font-size:.95rem">
                ${b?.serviceType || 'خدمة'}
              </div>
              <div class="history-date">
                ${fmtDate(b?.appointmentDate || b?.date)}
                · <span class="tnum">${b?.appointmentTime || ''}</span>
              </div>
              <div style="display:flex;gap:.35rem;flex-wrap:wrap;margin-top:.15rem;align-items:center">
                <span class="${badgeForStatus(status)}">
                  ${statusLabel[status] || b?.status || '—'}
                </span>
                <span class="${payBadge(payment)}">
                  ${payLabel[payment] || payment}
                </span>
                ${companion}
              </div>
              <div style="font-size:.8rem;color:var(--text-muted);margin-top:.1rem">
                إجمالي: <strong>${fmtCurrency(b?.totalPrice || 0)}</strong>
                &nbsp;·&nbsp; متبقي:
                <strong style="color:${remaining > 0 ? 'var(--danger)' : 'var(--success)'}">
                  ${fmtCurrency(remaining)}
                </strong>
              </div>
            </div>
            <a class="btn btn-ghost btn-sm" href="/bookings/${id}" style="flex-shrink:0">
              <i data-lucide="eye"></i> عرض
            </a>`;
          els.history.appendChild(item);
        });
      }
    }

    window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });

    // Wire download button now that we have the data
    if (els.downloadBtn) {
      els.downloadBtn.disabled = false;
      els.downloadBtn.addEventListener('click', () =>
        downloadPatientCard(p, bookings, color),
      );
    }
  } catch (e) {
    showAlert('error', e?.message || 'فشل تحميل المريض', { title: 'خطأ' });
  }
}

// ── Patient card PDF generator ─────────────────────────────────────────────
// Opens a styled print window with all patient data, then triggers the
// browser's print dialog. The document title is set to the patientId
// (e.g. PT-00001) so the browser suggests it as the filename when saving PDF.
// No external libraries needed — RTL/Arabic is handled natively by the browser.

function buildPrintHTML(p, bookings, color) {
  const name = p?.name || '—';
  const phone = p?.phone || '—';
  const pid = p?.patientId || '—';
  const age = p?.age != null ? `${p.age} سنة` : '—';
  const gender =
    p?.gender === 'male' ? 'ذكر' : p?.gender === 'female' ? 'أنثى' : '—';
  const address = p?.address || '—';
  const nationality = p?.nationality || '—';
  const notes = p?.notes || '—';
  const complaint = p?.complaint || '—';
  const created = fmtDate(p?.createdAt);

  const initials =
    name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((x) => x[0]?.toUpperCase())
      .join('') || 'م';

  const statusLabel = {
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
            <td>${fmtDate(b?.appointmentDate || b?.date)}</td>
            <td>${b?.appointmentTime || '—'}</td>
            <td>${b?.serviceType || '—'}</td>
            <td>
              <span style="background:${badgeColor(status)};color:#fff;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700">
                ${statusLabel[status] || status}
              </span>
            </td>
            <td>
              <span style="background:${payColor(payment)};color:#fff;padding:2px 8px;border-radius:20px;font-size:11px;font-weight:700">
                ${payLabel[payment] || payment}
              </span>
            </td>
            <td style="text-align:left">${fmtCurrency(b?.totalPrice || 0)}</td>
            <td style="text-align:left;color:${remaining > 0 ? '#dc2626' : '#16a34a'};font-weight:700">
              ${fmtCurrency(remaining)}
            </td>
          </tr>`;
        })
        .join('')
    : `<tr><td colspan="7" style="text-align:center;color:#94a3b8;padding:24px">لا يوجد تاريخ حجوزات</td></tr>`;

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${pid}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'DM Sans', Arial, sans-serif;
      background: #fff;
      color: #0f172a;
      font-size: 13px;
      line-height: 1.5;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .page {
      width: 210mm;
      min-height: 297mm;
      padding: 20mm 16mm;
      margin: 0 auto;
    }

    /* ── Header ─────────────── */
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding-bottom: 14px;
      border-bottom: 2px solid #0ea5e9;
      margin-bottom: 20px;
    }
    .header-brand { display: flex; align-items: center; gap: 10px; }
    .header-logo {
      width: 40px; height: 40px; border-radius: 10px;
      background: #0ea5e9; display: grid; place-items: center;
      color: #fff; font-size: 18px; font-weight: 800;
    }
    .header-name  { font-size: 18px; font-weight: 800; color: #0f172a; letter-spacing: -0.03em; }
    .header-sub   { font-size: 11px; color: #64748b; margin-top: 1px; }
    .header-right { text-align: left; }
    .header-pid   {
      font-size: 22px; font-weight: 800; color: #0ea5e9;
      letter-spacing: -0.04em; font-variant-numeric: tabular-nums;
    }
    .header-date  { font-size: 11px; color: #64748b; margin-top: 2px; }

    /* ── Patient profile ─────── */
    .profile {
      display: flex;
      gap: 16px;
      align-items: center;
      background: #f0f7ff;
      border-radius: 14px;
      padding: 16px 18px;
      margin-bottom: 18px;
    }
    .avatar {
      width: 64px; height: 64px; border-radius: 16px;
      display: grid; place-items: center;
      font-size: 22px; font-weight: 800; color: #fff;
      flex-shrink: 0;
    }
    .profile-name  { font-size: 20px; font-weight: 800; color: #0f172a; letter-spacing: -0.03em; }
    .profile-phone { font-size: 13px; color: #0ea5e9; font-weight: 600; margin-top: 3px; direction: ltr; text-align: right; }
    .badges { display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px; }
    .badge {
      font-size: 11px; font-weight: 700; padding: 2px 10px;
      border-radius: 20px; background: #e0f2fe; color: #0369a1;
    }

    /* ── Info grid ───────────── */
    .info-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 10px;
      margin-bottom: 20px;
    }
    .info-card {
      background: #f8faff;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 10px 12px;
    }
    .info-label {
      font-size: 10px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 0.06em; color: #94a3b8; margin-bottom: 3px;
    }
    .info-value { font-size: 13px; font-weight: 600; color: #0f172a; }

    /* ── Bookings table ──────── */
    .section-title {
      font-size: 14px; font-weight: 800; color: #0f172a;
      letter-spacing: -0.02em; margin-bottom: 10px;
      display: flex; align-items: center; gap: 8px;
    }
    .section-title::before {
      content: '';
      display: inline-block;
      width: 3px; height: 16px;
      background: #0ea5e9;
      border-radius: 2px;
    }
    table {
      width: 100%; border-collapse: collapse; font-size: 12px;
    }
    thead th {
      background: #0ea5e9; color: #fff;
      font-weight: 700; font-size: 11px;
      padding: 8px 10px; text-align: right;
    }
    thead th:first-child { border-radius: 0 8px 0 0; }
    thead th:last-child  { border-radius: 8px 0 0 0; }
    tbody td {
      padding: 8px 10px; border-bottom: 1px solid #f1f5f9;
      vertical-align: middle;
    }
    tbody tr:last-child td { border-bottom: none; }
    tbody tr:nth-child(even) td { background: #f8faff; }

    /* ── Footer ─────────────── */
    .footer {
      margin-top: 24px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: #94a3b8;
      font-size: 10px;
    }

    @media print {
      body { background: #fff; }
      .page { padding: 12mm 12mm; }
      @page { size: A4; margin: 0; }
    }
  </style>
</head>
<body>
  <div class="page">

    <!-- Header -->
    <div class="header">
      <div class="header-brand">
        <div class="header-logo">P</div>
        <div>
          <div class="header-name">Physio Egypt</div>
          <div class="header-sub">Home Physio Services</div>
        </div>
      </div>
      <div class="header-right">
        <div class="header-pid">${pid}</div>
        <div class="header-date">تاريخ الإصدار: ${new Date().toLocaleDateString('ar-EG')}</div>
      </div>
    </div>

    <!-- Patient profile -->
    <div class="profile">
      <div class="avatar" style="background:${color}">${initials}</div>
      <div style="flex:1">
        <div class="profile-name">${name}</div>
        <div class="profile-phone">${phone}</div>
        <div class="badges">
          <span class="badge">${gender}</span>
          <span class="badge">${age}</span>
          ${nationality && nationality !== '—' ? `<span class="badge">${nationality}</span>` : ''}
        </div>
      </div>
      <div style="text-align:left">
        <div style="font-size:10px;color:#94a3b8;font-weight:700;text-transform:uppercase;letter-spacing:.06em">تاريخ التسجيل</div>
        <div style="font-size:13px;font-weight:700;margin-top:2px">${created}</div>
      </div>
    </div>

    <!-- Info grid -->
    <div class="info-grid">
      <div class="info-card">
        <div class="info-label">العنوان</div>
        <div class="info-value">${address}</div>
      </div>
      <div class="info-card">
        <div class="info-label">الشكوى</div>
        <div class="info-value">${complaint}</div>
      </div>
      <div class="info-card">
        <div class="info-label">ملاحظات</div>
        <div class="info-value">${notes}</div>
      </div>
    </div>

    <!-- Booking history -->
    <div class="section-title">تاريخ الحجوزات (${bookings.length})</div>
    <table>
      <thead>
        <tr>
          <th>التاريخ</th>
          <th>الوقت</th>
          <th>الخدمة</th>
          <th>الحالة</th>
          <th>الدفع</th>
          <th>الإجمالي</th>
          <th>المتبقي</th>
        </tr>
      </thead>
      <tbody>${bookingRows}</tbody>
    </table>

    <!-- Footer -->
    <div class="footer">
      <span>Physio Egypt · نظام إدارة العيادة</span>
      <span>${pid} · ${name}</span>
    </div>

  </div>
</body>
</html>`;
}

function downloadPatientCard(p, bookings, color) {
  const pid = p?.patientId || 'patient-card';
  const html = buildPrintHTML(p, bookings, color);
  const win = window.open('', '_blank', 'width=900,height=1100,scrollbars=yes');
  if (!win) {
    showAlert(
      'error',
      'تعذّر فتح نافذة الطباعة. يرجى السماح بالنوافذ المنبثقة لهذا الموقع.',
      { title: 'خطأ' },
    );
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  win.document.title = pid;
  // Trigger print from parent — no inline script needed in the popup so no CSP issue
  win.addEventListener('load', () => {
    setTimeout(() => win.print(), 400);
  });
}

await load();

// Role check — show delete button for admins only
const me = await requireAuth();
const myRole = me?.data?.user?.role || me?.user?.role || me?.role;
const deleteBtn = document.querySelector('[data-delete-patient-btn]');
if (deleteBtn && (myRole === 'admin' || myRole === 'mini-admin')) {
  deleteBtn.classList.remove('hidden');
  deleteBtn.addEventListener('click', () => {
    const name =
      document.querySelector('[data-patient-name]')?.textContent ||
      'هذا المريض';
    openModal({
      title: 'حذف المريض؟',
      body: `سيتم حذف سجل "${name}" نهائياً بما في ذلك جميع بياناته. لا يمكن التراجع عن هذا.`,
      confirmText: 'حذف نهائي',
      onConfirm: async () => {
        const res = await apiFetch(
          `/patients/${encodeURIComponent(patientId)}`,
          { method: 'DELETE' },
        );
        if (!res) return;
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json?.message || 'فشل حذف المريض');
        }
        showAlert('warning', 'تم حذف سجل المريض.', { title: 'تم الحذف' });
        setTimeout(() => (window.location.href = '/patients'), 1200);
      },
    });
  });
}
