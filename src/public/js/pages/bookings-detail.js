import { apiFetch } from '../api.js';
import { showAlert } from '../alert.js';
import { fmtCurrency, fmtDate } from '../utils/format.js';
import { openModal } from '../components/modal.js';

const bookingId = window.location.pathname.split('/').pop();
const $ = (s) => document.querySelector(s);

const els = {
  pName: $('[data-patient-name]'),
  pGender: $('[data-patient-gender]'),
  pAge: $('[data-patient-age]'),
  pId: $('[data-patient-id]'),
  pNationality: $('[data-patient-nationality]'),
  pComplaint: $('[data-complaint-val]'),
  copyPhone: $('[data-call-phone]'),
  waLink: $('[data-whatsapp-link]'),
  companionRow: $('[data-companion-row]'),
  companionName: $('[data-companion-name]'),
  bDate: $('[data-booking-date]'),
  bTime: $('[data-booking-time]'),
  bService: $('[data-booking-service]'),
  bCreatedBy: $('[data-booking-createdby]'),
  statusSelect: $('[data-status-select]'),
  confirmBtn: $('[data-confirm-btn]'),
  cancelBtn: $('[data-cancel]'),
  total: $('[data-total]'),
  deposit: $('[data-deposit]'),
  remaining: $('[data-remaining]'),
  printCard: $('[data-print-card]'),
  downloadCard: $('[data-download-card]'),
  shareCardWa: $('[data-share-card-wa]'),
};

// Cached booking data for WhatsApp sharing
let _booking = null;
let _patient = null;

// ── Timeline ──────────────────────────────────────────────
function setTimeline(status) {
  const s = String(status || '').toLowerCase();
  document
    .querySelectorAll('[data-step]')
    .forEach((el) => el.classList.remove('is-on'));
  const steps = ['pending', 'confirmed', 'done', 'retrieval'];
  const idx = steps.indexOf(s);
  steps.forEach((step, i) => {
    if (i <= idx) $(`[data-step="${step}"]`)?.classList.add('is-on');
  });
  if (els.confirmBtn)
    els.confirmBtn.style.display = s === 'pending' ? '' : 'none';
}

// ── Remaining ─────────────────────────────────────────────
function updateRemaining() {
  const r = Math.max(
    0,
    (Number(els.total?.value) || 0) - (Number(els.deposit?.value) || 0),
  );
  if (els.remaining) {
    els.remaining.textContent = fmtCurrency(r);
    els.remaining
      .closest?.('.remaining-card')
      ?.classList.toggle('remaining-zero', r === 0);
  }
}

// ── Build WhatsApp message text ───────────────────────────
function buildWhatsAppText(patient, booking) {
  const date = booking.appointmentDate
    ? new Date(booking.appointmentDate).toLocaleDateString('ar-EG', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

  const remaining = Math.max(
    0,
    (Number(els.total?.value) || booking.totalPrice || 0) -
      (Number(els.deposit?.value) || booking.deposit || 0),
  );

  const statusMap = {
    confirmed: 'مؤكد ✅',
    pending: 'قيد الانتظار ⏳',
    done: 'مكتمل ✔️',
    cancelled: 'ملغى ❌',
    retrieval: 'مسترد 💚',
  };

  const lines = [
    `🏥 *فيزيو إيجيبت*`,
    `خدمات العلاج الطبيعي المنزلي`,
    `📞 01106500395`,
    ``,
    `━━━━━━━━━━━━━━━━━━`,
    `🗓️ *تفاصيل الموعد*`,
    `━━━━━━━━━━━━━━━━━━`,
    `👤 المريض: *${patient.name || '—'}*`,
    `📱 الهاتف: ${patient.phone || '—'}`,
    `الشكوي: ${patient.complaint || '—'}`,
  ];

  if (patient.nationality) lines.push(`🌍 الجنسية: ${patient.nationality}`);
  if (booking.companion) lines.push(`👥 المرافق: ${booking.companion}`);

  lines.push(
    ``,
    `📅 التاريخ: *${date}*`,
    `⏰ الوقت: *${booking.appointmentTime || '—'}*`,
    `🩺 الخدمة: *${booking.serviceType || '—'}*`,
    `📋 الحالة: ${statusMap[booking.status] || booking.status || '—'}`,
    ``,
    `💰 *بيانات الدفع*`,
    `إجمالي السعر: ${booking.totalPrice ?? 0} جنيه`,
    `المدفوع (عربون): ${booking.deposit ?? 0} جنيه`,
    `المتبقي: *${remaining} جنيه*`,
    ``,
    `━━━━━━━━━━━━━━━━━━`,
    `يرجى التواجد في العنوان في الموعد المحدد 🙏`,
    `سيتواصل معك المعالج قبل الوصول`,
  );

  return lines.join('\n');
}

// ── Load booking ──────────────────────────────────────────
async function load() {
  try {
    const res = await apiFetch(`/bookings/${encodeURIComponent(bookingId)}`);
    if (!res) return;
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.message || 'فشل تحميل الحجز');

    const b = json?.data?.booking || json?.data || json;
    const p = b?.patient || b?.patientId || {};

    _booking = b;
    _patient = p;

    // Patient info
    if (els.pName) els.pName.textContent = p?.name || '—';
    if (els.pGender)
      els.pGender.textContent =
        p?.gender === 'male'
          ? 'ذكر'
          : p?.gender === 'female'
            ? 'أنثى'
            : p?.gender || '—';
    if (els.pAge) els.pAge.textContent = p?.age != null ? `${p.age} سنة` : '—';

    if (els.pId) els.pId.textContent = p?.patientId || '—';

    // Nationality badge
    const nationality = p?.nationality || '';
    if (nationality && els.pNationality) {
      els.pNationality.textContent = nationality;
      els.pNationality.classList.remove('hidden');
    }

    // Companion
    const companion = b?.companion || '';
    if (companion && els.companionRow && els.companionName) {
      els.companionName.textContent = companion;
      els.companionRow.classList.remove('hidden');
    }

    // Complaint (read-only)
    const complaint = p?.complaint || '';
    if (complaint && els.pComplaint) {
      els.pComplaint.textContent = complaint;
      els.pComplaint
        .closest?.('[data-complaint-row]')
        ?.classList.remove('hidden');
    }

    // Phone — tap to call
    const phone = p?.phone || b?.phone || '';
    if (els.copyPhone) {
      const phoneSpan =
        els.copyPhone.querySelector('[data-phone-display]') ||
        els.copyPhone.querySelector('span');
      if (phoneSpan) phoneSpan.textContent = phone || '—';
      els.copyPhone.addEventListener('click', () => {
        if (phone) {
          const cleaned = phone.replace(/\D/g, '');
          window.location.href = `tel:+${cleaned.startsWith('20') ? cleaned : '20' + cleaned}`;
        }
      });
    }

    // WhatsApp chat link — prefer whatsappNumber, fallback to phone
    const waNum = (p?.whatsappNumber || phone || '').replace(/\D/g, '');
    if (els.waLink && waNum) {
      els.waLink.href = `https://wa.me/${waNum}`;
      els.waLink.target = '_blank';
      els.waLink.rel = 'noopener noreferrer';
    }

    // Appointment
    if (els.bDate)
      els.bDate.textContent = fmtDate(b?.appointmentDate || b?.date);
    if (els.bTime) els.bTime.textContent = b?.appointmentTime || '—';
    if (els.bService) els.bService.textContent = b?.serviceType || '—';
    if (els.bCreatedBy)
      els.bCreatedBy.textContent =
        b?.createdBy?.name || b?.bookedBy?.name || '—';

    // Status
    const status = b?.status || 'pending';
    if (els.statusSelect) els.statusSelect.value = status.toLowerCase();
    setTimeline(status);

    // Payment
    if (els.total) els.total.value = b?.totalPrice ?? 0;
    if (els.deposit) els.deposit.value = b?.deposit ?? 0;
    updateRemaining();

    window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
  } catch (e) {
    showAlert('error', e?.message || 'فشل تحميل الحجز', { title: 'خطأ' });
  }
}

// ── Payment auto-save ─────────────────────────────────────
els.total?.addEventListener('input', updateRemaining);
els.deposit?.addEventListener('input', updateRemaining);

let paySaveT = null;
async function savePayment() {
  try {
    const payload = {
      totalPrice: Number(els.total?.value) || 0,
      deposit: Number(els.deposit?.value) || 0,
    };
    const res = await apiFetch(`/bookings/${encodeURIComponent(bookingId)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    if (!res) return;
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.message);
    showAlert('success', 'تم حفظ بيانات الدفع.', { title: 'تم التحديث' });
  } catch (e) {
    showAlert('error', e?.message || 'فشل تحديث الدفع.', { title: 'خطأ' });
  }
}
els.total?.addEventListener('blur', () => {
  clearTimeout(paySaveT);
  paySaveT = setTimeout(savePayment, 400);
});
els.deposit?.addEventListener('blur', () => {
  clearTimeout(paySaveT);
  paySaveT = setTimeout(savePayment, 400);
});

// ── Status change ─────────────────────────────────────────
async function patchStatus(status) {
  try {
    const res = await apiFetch(`/bookings/${encodeURIComponent(bookingId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    if (!res) return;
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.message);
    if (_booking) _booking.status = status;
    setTimeline(status);
    if (els.statusSelect) els.statusSelect.value = status;
    showAlert('success', `تم تغيير الحالة إلى "${status}".`, {
      title: 'تم التحديث',
    });
  } catch (e) {
    showAlert('error', e?.message || 'فشل تحديث الحالة.', { title: 'خطأ' });
  }
}
els.statusSelect?.addEventListener('change', () =>
  patchStatus(els.statusSelect.value),
);

// ── Confirm booking ───────────────────────────────────────
els.confirmBtn?.addEventListener('click', () => {
  openModal({
    title: 'تأكيد الحجز؟',
    body: 'سيتم تغيير حالة الحجز إلى "مؤكد".',
    confirmText: 'نعم، تأكيد',
    onConfirm: async () => {
      await patchStatus('confirmed');
    },
  });
});

// ── Cancel booking ────────────────────────────────────────
els.cancelBtn?.addEventListener('click', () => {
  openModal({
    title: 'إلغاء الحجز؟',
    body: 'سيتم إلغاء هذا الحجز ولا يمكن التراجع عن ذلك.',
    confirmText: 'نعم، إلغاء الحجز',
    danger: true,
    onConfirm: async () => {
      const res = await apiFetch(
        `/bookings/${encodeURIComponent(bookingId)}/cancel`,
        { method: 'PATCH' },
      );
      if (!res) return;
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.message);
      showAlert('warning', 'تم إلغاء هذا الحجز.', { title: 'تم الإلغاء' });
      setTimeout(() => window.location.reload(), 1200);
    },
  });
});

// ── Preview card ──────────────────────────────────────────
els.printCard?.addEventListener('click', () => {
  window.open(
    `/api/v1/bookings/${encodeURIComponent(bookingId)}/card`,
    '_blank',
    'width=500,height=720,scrollbars=yes',
  );
});

// ── Print card ────────────────────────────────────────────
els.downloadCard?.addEventListener('click', async () => {
  showAlert('info', 'جارٍ تحضير بطاقة المريض…', { title: 'تنزيل PDF' });
  try {
    const res = await fetch(
      `/api/v1/bookings/${encodeURIComponent(bookingId)}/card?pdf=1`,
    );
    if (!res.ok) throw new Error('فشل تحميل PDF');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `patient-card-${bookingId}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    showAlert('success', 'تم تنزيل بطاقة المريض PDF.', { title: 'تم التنزيل' });
  } catch (e) {
    showAlert('error', e?.message || 'فشل تنزيل PDF.', { title: 'خطأ' });
  }
});

// ── Share card via WhatsApp ───────────────────────────────
els.shareCardWa?.addEventListener('click', async () => {
  if (!_patient || !_booking) {
    showAlert('error', 'البيانات لم تُحمَّل بعد. انتظر قليلاً.', {
      title: 'خطأ',
    });
    return;
  }

  // Download PDF first
  try {
    const res = await fetch(
      `/api/v1/bookings/${encodeURIComponent(bookingId)}/card?pdf=1`,
    );
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `patient-card-${bookingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
    }
  } catch {
    /* non-blocking */
  }

  const waNum = (_patient.whatsappNumber || _patient.phone || '').replace(
    /\D/g,
    '',
  );
  const text = buildWhatsAppText(_patient, _booking);
  const encodedText = encodeURIComponent(text);
  const url = waNum
    ? `https://wa.me/${waNum}?text=${encodedText}`
    : `https://wa.me/?text=${encodedText}`;
  window.open(url, '_blank', 'noopener,noreferrer');
  showAlert('info', 'شارك الرسالة ثم أرفق البطاقة يدوياً (تم تنزيل PDF).', {
    title: 'مشاركة عبر واتساب',
  });
});

await load();
