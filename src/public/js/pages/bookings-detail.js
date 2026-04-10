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
  pNotes: $('[data-notes-val]'),
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
  // ── Edit booking fields ─────────────────────────────────
  editService: $('[data-edit-service]'),
  editDate: $('[data-edit-date]'),
  editTime: $('[data-edit-time]'),
  editCompanion: $('[data-edit-companion]'),
  editNotes: $('[data-edit-notes]'),
  saveBookingBtn: $('[data-save-booking-btn]'),
  // ── Edit patient fields ─────────────────────────────────
  editPName: $('[data-edit-p-name]'),
  editPPhone: $('[data-edit-p-phone]'),
  editPAge: $('[data-edit-p-age]'),
  editPGender: $('[data-edit-p-gender]'),
  editPNationality: $('[data-edit-p-nationality]'),
  editPComplaint: $('[data-edit-p-complaint]'),
  editPWhatsapp: $('[data-edit-p-whatsapp]'),
  editPNotes: $('[data-edit-p-notes]'),
  savePatientBtn: $('[data-save-patient-btn]'),
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

function toWaNum(raw) {
  const digits = (raw || '').replace(/\D/g, '');
  return digits.startsWith('0') ? '20' + digits.slice(1) : digits;
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
    confirmed: 'مؤكد',
    pending: 'قيد الانتظار',
    done: 'مكتمل',
    cancelled: 'ملغى',
    retrieval: 'مسترد',
  };

  const lines = [
    ` *فيزيو إيجيبت*`,
    `خدمات العلاج الطبيعي المنزلي`,
    ` 01106500395`,
    ``,
    `━━━━━━━━━━━━━━━━━━`,
    ` *تفاصيل الموعد*`,
    `━━━━━━━━━━━━━━━━━━`,
    ` المريض: *${patient.name || '—'}*`,
    ` الهاتف: ${patient.phone || '—'}`,
    `الشكوي: ${patient.complaint || '—'}`,
    `ملاحظات: ${patient.notes || '—'}`,
  ];

  if (patient.nationality) lines.push(` الجنسية: ${patient.nationality}`);
  if (booking.companion) lines.push(` المرافق: ${booking.companion}`);

  lines.push(
    ``,
    ` التاريخ: *${date}*`,
    ` الوقت: *${booking.appointmentTime || '—'}*`,
    ` الخدمة: *${booking.serviceType || '—'}*`,
    ` الحالة: ${statusMap[booking.status] || booking.status || '—'}`,
    ``,
    ` *بيانات الدفع*`,
    `إجمالي السعر: ${booking.totalPrice ?? 0} جنيه`,
    `المدفوع (عربون): ${booking.deposit ?? 0} جنيه`,
    `المتبقي: *${remaining} جنيه*`,
    ``,
    `━━━━━━━━━━━━━━━━━━`,
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

    if (els.pId) {
      const pid = p?.patientId;
      if (pid) {
        els.pId.textContent = `📋 ${pid}`;
        els.pId.style.cursor = 'pointer';
        els.pId.title = 'انقر لنسخ رقم المريض';
        els.pId.addEventListener('click', async () => {
          try {
            await navigator.clipboard.writeText(pid);
            showAlert('success', `تم نسخ ${pid}`);
          } catch {
            showAlert('error', 'فشل النسخ');
          }
        });
      } else {
        els.pId.textContent = '—';
      }
    }

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

    // Notes
    const notes = p?.notes || '';
    if (notes && els.pNotes) {
      els.pNotes.textContent = notes;
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
    const waNum = toWaNum(p?.whatsappNumber || phone || '');
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

    // ── Populate edit booking fields ────────────────────────
    if (els.editService) els.editService.value = b?.serviceType || '';
    if (els.editDate && b?.appointmentDate)
      els.editDate.value = new Date(b.appointmentDate)
        .toISOString()
        .slice(0, 10);
    if (els.editTime) els.editTime.value = b?.appointmentTime || '';
    if (els.editCompanion) els.editCompanion.value = b?.companion || '';
    if (els.editNotes) els.editNotes.value = b?.notes || '';

    // ── Populate edit patient fields ────────────────────────
    if (els.editPName) els.editPName.value = p?.name || '';
    if (els.editPPhone) els.editPPhone.value = p?.phone || '';
    if (els.editPAge) els.editPAge.value = p?.age ?? '';
    if (els.editPNationality) els.editPNationality.value = p?.nationality || '';
    if (els.editPComplaint) els.editPComplaint.value = p?.complaint || '';
    if (els.editPWhatsapp) els.editPWhatsapp.value = p?.whatsappNumber || '';
    if (els.editPNotes) els.editPNotes.value = p?.notes || '';
    // Gender pills for patient edit
    const gVal = String(p?.gender || '').toLowerCase();
    els.editPGender
      ?.querySelectorAll('input[name="edit-gender"]')
      .forEach((r) => {
        r.checked = r.value === gVal;
        r.closest('.pill')?.classList.toggle('is-active', r.checked);
      });
    els.editPGender?.addEventListener('change', () => {
      els.editPGender
        .querySelectorAll('.pill')
        .forEach((pill) =>
          pill.classList.toggle(
            'is-active',
            Boolean(pill.querySelector('input')?.checked),
          ),
        );
    });

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

// ── Download card as PDF (client-side via browser print) ──
els.downloadCard?.addEventListener('click', () => {
  showAlert('info', 'ستفتح نافذة الطباعة — اختر "حفظ كـ PDF"', {
    title: 'تنزيل PDF',
  });

  window.open(
    `/api/v1/bookings/${encodeURIComponent(bookingId)}/card?print=1`,
    'width=520,height=780,scrollbars=no',
  );
});

// ── Share card via WhatsApp ───────────────────────────────

els.shareCardWa?.addEventListener('click', () => {
  if (!_patient || !_booking) {
    showAlert('error', 'البيانات لم تُحمَّل بعد. انتظر قليلاً.', {
      title: 'خطأ',
    });
    return;
  }

  const waNum = toWaNum(_patient?.whatsappNumber || _patient.phone || '');
  const text = buildWhatsAppText(_patient, _booking);
  const url = waNum
    ? `https://wa.me/${waNum}?text=${encodeURIComponent(text)}`
    : `https://wa.me/?text=${encodeURIComponent(text)}`;

  window.open(url, '_blank', 'noopener,noreferrer');
});

// ── Save booking edits ────────────────────────────────────
els.saveBookingBtn?.addEventListener('click', async () => {
  const btn = els.saveBookingBtn;
  btn.disabled = true;
  try {
    const payload = {};
    if (els.editService?.value.trim())
      payload.serviceType = els.editService.value.trim();
    if (els.editDate?.value) payload.appointmentDate = els.editDate.value;
    if (els.editTime?.value) payload.appointmentTime = els.editTime.value;
    payload.companion = els.editCompanion?.value.trim() || '';
    payload.notes = els.editNotes?.value.trim() || '';

    const res = await apiFetch(`/bookings/${encodeURIComponent(bookingId)}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    if (!res) return;
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.message || 'فشل حفظ التعديلات');

    // Refresh cached booking & update display labels
    const b = json?.data?.booking || json?.data || json;
    _booking = b;
    if (els.bService) els.bService.textContent = b?.serviceType || '—';
    if (els.bDate) els.bDate.textContent = fmtDate(b?.appointmentDate);
    if (els.bTime) els.bTime.textContent = b?.appointmentTime || '—';
    if (els.companionName) els.companionName.textContent = b?.companion || '';
    if (els.companionRow)
      els.companionRow.classList.toggle('hidden', !b?.companion);

    showAlert('success', 'تم حفظ تعديلات الموعد.', { title: 'تم التحديث' });
  } catch (e) {
    showAlert('error', e?.message || 'فشل حفظ التعديلات', { title: 'خطأ' });
  } finally {
    btn.disabled = false;
  }
});

// ── Save patient edits ────────────────────────────────────
els.savePatientBtn?.addEventListener('click', async () => {
  if (!_patient?._id) {
    showAlert('error', 'لم يتم تحميل بيانات المريض بعد.', { title: 'خطأ' });
    return;
  }
  const btn = els.savePatientBtn;
  btn.disabled = true;
  try {
    const gender =
      els.editPGender?.querySelector('input[name="edit-gender"]:checked')
        ?.value || '';
    const payload = {
      name: els.editPName?.value.trim() || undefined,
      phone: els.editPPhone?.value.trim() || undefined,
      age: els.editPAge?.value ? Number(els.editPAge.value) : undefined,
      gender: gender || undefined,
      nationality: els.editPNationality?.value.trim() || '',
      complaint: els.editPComplaint?.value.trim() || '',
      whatsappNumber: els.editPWhatsapp?.value.trim() || '',
      notes: els.editPNotes?.value.trim() || '',
    };
    // Remove undefined keys — don't accidentally blank out fields
    Object.keys(payload).forEach(
      (k) => payload[k] === undefined && delete payload[k],
    );

    const res = await apiFetch(
      `/patients/${encodeURIComponent(_patient._id)}`,
      {
        method: 'PATCH',
        body: JSON.stringify(payload),
      },
    );
    if (!res) return;
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.message || 'فشل حفظ بيانات المريض');

    const p = json?.data?.patient || json?.data || json;
    _patient = p;

    // Refresh display in the info card at the top
    if (els.pName) els.pName.textContent = p?.name || '—';
    if (els.pAge) els.pAge.textContent = p?.age != null ? `${p.age} سنة` : '—';
    if (els.pGender)
      els.pGender.textContent =
        p?.gender === 'male' ? 'ذكر' : p?.gender === 'female' ? 'أنثى' : '—';
    if (els.pNationality) {
      els.pNationality.textContent = p?.nationality || '';
      els.pNationality.classList.toggle('hidden', !p?.nationality);
    }
    if (els.pComplaint) {
      els.pComplaint.textContent = p?.complaint || '';
      els.pComplaint
        .closest?.('[data-complaint-row]')
        ?.classList.toggle('hidden', !p?.complaint);
    }

    if (els.pNotes) {
      els.pNotes.textContent = p?.notes || '—';
    }

    const phoneSpan =
      els.copyPhone?.querySelector('[data-phone-display]') ||
      els.copyPhone?.querySelector('span');
    if (phoneSpan) phoneSpan.textContent = p?.phone || '—';
    const waNum = toWaNum(p?.whatsappNumber || p?.phone || '');
    if (els.waLink && waNum) els.waLink.href = `https://wa.me/${waNum}`;

    showAlert('success', 'تم حفظ بيانات المريض.', { title: 'تم التحديث' });
  } catch (e) {
    showAlert('error', e?.message || 'فشل حفظ بيانات المريض', { title: 'خطأ' });
  } finally {
    btn.disabled = false;
  }
});

await load();
