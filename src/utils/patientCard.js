import path from 'path';
import { promises as fs } from 'fs';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let logoBase64 = '';

const CLINIC = {
  name: process.env.CLINIC_NAME || 'فيزيو إيجيبت',
  phone: process.env.CLINIC_PHONE || '01106500395',
  address:
    process.env.CLINIC_ADDRESS ||
    'خدمات العلاج الطبيعي المنزلي · جميع محافظات مصر',
};

export const buildCardHTML = ({
  patient,
  booking,
  nonce = '',
  autoPrint = false,
}) => {
  try {
    const logoPath = path.join(__dirname, '../public/images/icon.jpeg');
    logoBase64 = `data:image/jpeg;base64,${readFileSync(logoPath).toString('base64')}`;
  } catch {
    /* no logo */
  }

  const date = new Date(booking.appointmentDate).toLocaleDateString('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const paymentBadge = {
    unpaid: { label: 'غير مدفوع', color: '#dc2626', bg: '#fef2f2' },
    partial: { label: 'مدفوع جزئياً', color: '#b45309', bg: '#fffbeb' },
    paid: { label: 'مدفوع بالكامل', color: '#15803d', bg: '#f0fdf4' },
  }[booking.paymentStatus] || {
    label: 'غير مدفوع',
    color: '#475569',
    bg: '#f8fafc',
  };

  const statusBadge = {
    confirmed: { label: 'مؤكد', color: '#0284c7', bg: '#f0f9ff' },
    pending: { label: 'قيد الانتظار', color: '#b45309', bg: '#fffbeb' },
    done: { label: 'مكتمل', color: '#15803d', bg: '#f0fdf4' },
    cancelled: { label: 'ملغى', color: '#dc2626', bg: '#fef2f2' },
    retrieval: { label: 'مسترد', color: '#15803d', bg: '#f0fdf4' },
  }[booking.status] || { label: '—', color: '#475569', bg: '#f8fafc' };

  const remaining =
    booking.remaining ??
    Math.max(0, (booking.totalPrice ?? 0) - (booking.deposit ?? 0));

  const companionRow = booking.companion
    ? `<div class="field">
         <span class="field-label">المرافق</span>
         <span class="field-value">${booking.companion}</span>
       </div>`
    : '';

  const complaintRow = patient.complaint
    ? `<div class="field">
         <span class="field-label">الشكوى</span>
         <span class="field-value">${patient.complaint}</span>
       </div>`
    : '';

  const notesRow = patient.notes
    ? `<div class="field" style="align-items:flex-start">
         <span class="field-label" style="padding-top:2px">ملاحظات</span>
         <span class="field-value" style="text-align:right;white-space:pre-wrap">${patient.notes}</span>
       </div>`
    : '';

  const whatsappRow = patient.whatsappNumber
    ? `<div class="field">
         <span class="field-label">واتساب</span>
         <span class="field-value" dir="ltr">${patient.whatsappNumber}</span>
       </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>بطاقة المريض - ${patient.name} - ${patient.patientId} - ${patient.phone}</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/>
<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&display=swap" rel="stylesheet"/>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body {
    font-family:'Cairo',Arial,sans-serif;
    background:#f0f7ff;
    display:flex; justify-content:center; align-items:flex-start;
    padding:28px; min-height:100vh;
    direction:rtl;
  }
  .card {
    background:#fff; width:440px; max-width:100%; border-radius:20px; overflow:hidden;
    margin:0 auto;
    border:1px solid #e2e8f0;
    box-shadow:0 8px 40px rgba(14,165,233,0.13), 0 2px 8px rgba(0,0,0,0.06);
    print-color-adjust:exact; -webkit-print-color-adjust:exact;
  }
  /* ── Header ── */
  .card-header {
    background:linear-gradient(135deg,#0ea5e9 0%,#6366f1 100%);
    color:#fff; padding:22px 24px;
    display:flex; align-items:center; gap:14px;
  }
  .clinic-logo {
    width:52px; height:52px; border-radius:12px;
    object-fit:cover; border:2.5px solid rgba(255,255,255,0.35);
    flex-shrink:0; background:#fff;
  }
  .clinic-logo-ph {
    width:52px; height:52px; border-radius:12px;
    background:rgba(255,255,255,0.18);
    border:2px solid rgba(255,255,255,0.3);
    display:flex; align-items:center; justify-content:center;
    font-size:24px; flex-shrink:0;
  }
  .clinic-name  { font-size:19px; font-weight:800; letter-spacing:0; }
  .clinic-tag   { font-size:11px; opacity:0.85; margin-top:3px; }
  .clinic-phone { font-size:12px; opacity:0.75; margin-top:4px; direction:ltr; text-align:right; }
  /* ── Body ── */
  .card-body { padding:20px 24px; }
  .section-title {
    font-size:10px; font-weight:800; text-transform:uppercase;
    letter-spacing:0.06em; color:#94a3b8;
    margin-bottom:10px; margin-top:18px;
    display:flex; align-items:center; gap:6px;
  }
  .section-title:first-child { margin-top:0; }
  .section-title::before { content:''; flex:1; height:1px; background:#f1f5f9; }
  .field {
    display:flex; justify-content:space-between;
    align-items:center; margin-bottom:8px;
    gap:8px;
  }
  .field-label { font-size:15px; color:#64748b; white-space:nowrap; }
  .field-value { font-size:15px; color:#0f172a; font-weight:600; text-align:left; }
  .divider { border:none; border-top:1px solid #f1f5f9; margin:14px 0; }
  .badge {
    display:inline-block; padding:6px 11px;
    border-radius:999px; font-size:17px; font-weight:700;
  }
  /* ── Payment rows ── */
  .amount-row {
    display:flex; justify-content:space-between; align-items:center;
    padding:9px 0; border-bottom:1px solid #f8fafc;
  }
  .amount-row:last-child { border-bottom:none; }
  .amount-label { font-size:13px; color:#64748b; }
  .amount-value { font-size:14px; font-weight:700; color:#0f172a; }
  .remaining-value { color:#dc2626; }
  .paid-value { color:#15803d; }
  /* ── Footer ── */
  .card-footer {
    background:linear-gradient(135deg,#f0f9ff,#f8fafc);
    border-top:1px solid #e2e8f0;
    padding:14px 24px; text-align:center;
    font-size:12px; color:#94a3b8;
    line-height:1.7;
  }
  .booking-ref {
    font-family:monospace; font-size:10px; color:#cbd5e1;
    margin-top:4px; direction:ltr;
  }
  .print-btn {
    display:block; margin:14px auto 0;
    padding:9px 24px; border-radius:999px;
    background:linear-gradient(135deg,#0ea5e9,#6366f1);
    color:#fff; border:none; font-family:'Cairo',sans-serif;
    font-size:13px; font-weight:700; cursor:pointer;
    letter-spacing:0;
  }
  /* ── Watermark strip ── */
  .card-watermark {
    background:linear-gradient(135deg,#0ea5e9,#6366f1);
    height:4px;
  }
  @page {
    size: A4 portrait;
    margin: 10mm;
  }
  @media print {
    body { background:#fff; padding:0; }
    .card { border:none; border-radius:0; width:100%; box-shadow:none; }
    .print-btn { display:none !important; }
  }
</style>
</head>
<body>
<script nonce="${nonce}">
  document.addEventListener('DOMContentLoaded', function() {
    var btn = document.getElementById('print-btn');
    if (btn) btn.addEventListener('click', function() { window.print(); });
    ${autoPrint ? `setTimeout(function() { window.print(); }, 800);` : ''}
  });
</script>
<div class="card">
  <div class="card-watermark"></div>
  <div class="card-header">
    ${
      logoBase64
        ? `<img class="clinic-logo" src="${logoBase64}" alt="فيزيو إيجيبت"/>`
        : `<div class="clinic-logo-ph">🏥</div>`
    }
    <div style="flex:1">
      <div class="clinic-name">${CLINIC.name}</div>
      <div class="clinic-tag">خدمات العلاج الطبيعي المنزلي · جميع محافظات مصر</div>
      <div class="clinic-phone">📞 ${CLINIC.phone}</div>
    </div>
  </div>

  <div class="card-body">

    <div class="section-title">بيانات المريض</div>
    <div class="field">
      <span class="field-label">الاسم الكامل</span>
      <span class="field-value">${patient.name || '—'}</span>
    </div>
    <div class="field">
      <span class="field-label">رقم المريض</span>
      <span class="field-value">${patient.patientId || '—'}</span>
    </div>
    <div class="field">
      <span class="field-label">رقم الهاتف</span>
      <span class="field-value" style="direction:ltr">${patient.phone || '—'}</span>
    </div>
    <div class="field">
      <span class="field-label">العمر</span>
      <span class="field-value">${patient.age ? `${patient.age} سنة` : '—'}</span>
    </div>
    <div class="field">
      <span class="field-label">الجنس</span>
      <span class="field-value">${patient.gender === 'male' ? 'ذكر' : patient.gender === 'female' ? 'أنثى' : '—'}</span>
    </div>
    <div class="field">
      <span class="field-label">العنوان</span>
      <span class="field-value">${
        patient.address && typeof patient.address === 'object'
          ? [
              patient.address.street,
              patient.address.city,
              patient.address.governorate,
            ]
              .filter(Boolean)
              .join('، ') || '—'
          : patient.address || '—'
      }</span>
    </div>
    <div class="field">
      <span class="field-label">الجنسية</span>
      <span class="field-value">${patient.nationality || '—'}</span>
    </div>
    ${complaintRow}
    ${whatsappRow}
    ${companionRow}
    ${notesRow}

    <hr class="divider"/>

    <div class="section-title">بيانات الموعد</div>
    <div class="field">
      <span class="field-label">التاريخ</span>
      <span class="field-value">${date}</span>
    </div>
    <div class="field">
      <span class="field-label">الوقت</span>
      <span class="field-value" style="direction:ltr">${booking.appointmentTime || '—'}</span>
    </div>
    <div class="field">
      <span class="field-label">نوع الخدمة</span>
      <span class="field-value">${booking.serviceType || '—'}</span>
    </div>
    <div class="field">
      <span class="field-label">حالة الحجز</span>
      <span class="field-value">
        <span class="badge" style="color:${statusBadge.color};background:${statusBadge.bg}">
          ${statusBadge.label}
        </span>
      </span>
    </div>

    <hr class="divider"/>

    <div class="section-title">بيانات الدفع</div>
    <div class="amount-row">
      <span class="amount-label">إجمالي السعر</span>
      <span class="amount-value">${booking.totalPrice ?? 0} جنيه</span>
    </div>
    <div class="amount-row">
      <span class="amount-label">المبلغ المدفوع (عربون)</span>
      <span class="amount-value paid-value">${booking.deposit ?? 0} جنيه</span>
    </div>
    <div class="amount-row">
      <span class="amount-label">المبلغ المتبقي</span>
      <span class="amount-value remaining-value">${remaining} جنيه</span>
    </div>
    <div class="amount-row">
      <span class="amount-label">حالة الدفع</span>
      <span class="amount-value">
        <span class="badge" style="color:${paymentBadge.color};background:${paymentBadge.bg}">
          ${paymentBadge.label}
        </span>
      </span>
    </div>
  </div>

  <div class="card-footer">
    <div class="booking-ref">Booking #${booking._id}</div>
    <div style="margin-top:2px;font-size:11px">
      ${new Date().toLocaleString('ar-EG')}
    </div>
    <button class="print-btn" id="print-btn">🖨️ طباعة البطاقة</button>
  </div>
</div>
</body>
</html>`;
};

export const generateCardPDF = async ({ patient, booking }) => {
  const html = buildCardHTML({ patient, booking });

  let puppeteer;
  try {
    puppeteer = (await import('puppeteer')).default;
  } catch {
    return { html, pdf: null };
  }

  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const page = await browser.newPage();
    // Set a fixed viewport width matching the card; height will auto-expand
    await page.setViewport({ width: 500, height: 800, deviceScaleFactor: 2 });
    await page.setContent(html, { waitUntil: 'networkidle0' });
    // Shrink the PDF to the actual content height — eliminates blank space
    const bodyHandle = await page.$('body');
    const { height } = await bodyHandle.boundingBox();
    await bodyHandle.dispose();
    const pdf = await page.pdf({
      width: '500px',
      height: `${Math.ceil(height) + 40}px`,
      printBackground: true,
      margin: { top: '0', bottom: '0', left: '0', right: '0' },
    });
    return { html, pdf };
  } finally {
    await browser.close();
  }
};

export const saveCardToDisk = async ({ patient, booking }) => {
  const { html, pdf } = await generateCardPDF({ patient, booking });
  const dir = path.join(process.cwd(), 'generated-cards');
  await fs.mkdir(dir, { recursive: true });
  const base = `card_${booking._id}`;
  const htmlPath = path.join(dir, `${base}.html`);
  await fs.writeFile(htmlPath, html, 'utf8');
  let pdfPath = null;
  if (pdf) {
    pdfPath = path.join(dir, `${base}.pdf`);
    await fs.writeFile(pdfPath, pdf);
  }
  return { htmlPath, pdfPath };
};
