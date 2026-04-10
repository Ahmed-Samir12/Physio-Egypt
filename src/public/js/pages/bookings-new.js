import { apiFetch } from '../api.js';
import { showAlert } from '../alert.js';
import { debounce } from '../utils/format.js';

const form = document.querySelector('#bookingForm');
const phoneEl = document.querySelector('[data-phone]');
const foundEl = document.querySelector('[data-found]');
const nameEl = document.querySelector('[data-name]');
const ageEl = document.querySelector('[data-age]');
const addressEl = document.querySelector('[data-address]');
const nationalityEl = document.querySelector('[data-nationality]');
const companionEl = document.querySelector('[data-companion]');
const complaintEl = document.querySelector('[data-complaint]');
const whatsappNumEl = document.querySelector('[data-whatsapp-number]');
const pnotesEl = document.querySelector('[data-pnotes]');
const genderWrap = document.querySelector('[data-gender]');
const patientIdEl = document.querySelector('[data-patient-id]');

const dateEl = document.querySelector('[data-date]');
const timeEl = document.querySelector('[data-time]');
const serviceEl = document.querySelector('[data-service]');
const totalEl = document.querySelector('[data-total]');
const depositEl = document.querySelector('[data-deposit]');
const remainingEl = document.querySelector('[data-remaining]');
const notesEl = document.querySelector('[data-notes]');

const submitBtn = document.querySelector('[data-submit]');
const btnText = document.querySelector('[data-btn-text]');

function setLoading(isLoading) {
  if (!submitBtn) return;
  submitBtn.classList.toggle('btn--loading', isLoading);
  submitBtn.disabled = isLoading;
  if (btnText)
    btnText.textContent = isLoading ? 'جاري الإنشاء…' : 'إنشاء الحجز';
  const sp = submitBtn.querySelector('.spinner');
  if (isLoading && !sp) {
    const s = document.createElement('span');
    s.className = 'spinner';
    submitBtn.prepend(s);
  } else if (!isLoading && sp) sp.remove();
}

function cleanDigits(s) {
  return String(s || '').replace(/\D+/g, '');
}

function getFullPhone() {
  const d = cleanDigits(phoneEl.value);
  if (!d) return '';

  return d.startsWith('0') ? d : `0${d}`;
}

function setFound(isFound) {
  foundEl?.classList.toggle('hidden', !isFound);
}

function pillSync() {
  genderWrap?.querySelectorAll('.pill').forEach((pill) => {
    pill.classList.toggle(
      'is-active',
      Boolean(pill.querySelector('input')?.checked),
    );
  });
}
genderWrap?.addEventListener('change', pillSync);
pillSync();

function fmtEGP(n) {
  return n > 0 ? `${n} EGP` : '—';
}

function updateRemaining() {
  const rem = Math.max(
    0,
    (Number(totalEl?.value) || 0) - (Number(depositEl?.value) || 0),
  );
  if (remainingEl) remainingEl.textContent = fmtEGP(rem);
}
totalEl?.addEventListener('input', updateRemaining);
depositEl?.addEventListener('input', updateRemaining);
updateRemaining();

// ── Auto-fill patient from phone ──────────────────────────
const tryFindPatient = debounce(async () => {
  const digits = cleanDigits(phoneEl.value);
  if (digits.length < 10) {
    if (patientIdEl) patientIdEl.value = '';
    setFound(false);
    return;
  }
  try {
    const phone = getFullPhone();
    const res = await apiFetch(`/patients?search=${encodeURIComponent(phone)}`);
    if (!res) return;
    const json = await res.json().catch(() => ({}));
    if (!res.ok) return;
    const list =
      json?.data?.patients ||
      json?.data?.results ||
      json?.data ||
      json?.patients ||
      [];
    const p = Array.isArray(list) ? list[0] : null;
    if (!p) {
      if (patientIdEl) patientIdEl.value = '';
      setFound(false);
      return;
    }
    setFound(true);
    if (nameEl) nameEl.value = p?.name || '';
    if (ageEl) ageEl.value = p?.age ?? '';
    if (addressEl) addressEl.value = p?.address || '';
    if (nationalityEl) nationalityEl.value = p?.nationality || '';
    if (complaintEl) complaintEl.value = p?.complaint || '';
    if (whatsappNumEl) whatsappNumEl.value = p?.whatsappNumber || '';
    if (pnotesEl) pnotesEl.value = p?.notes || '';
    if (patientIdEl) patientIdEl.value = p?.patientId || '';
    const g = String(p?.gender || '').toLowerCase();
    genderWrap?.querySelectorAll('input[name="gender"]').forEach((r) => {
      r.checked = r.value === g;
    });
    pillSync();
  } catch {
    setFound(false);
  }
}, 500);

phoneEl?.addEventListener('blur', () => tryFindPatient());
phoneEl?.addEventListener('input', () => setFound(false));

// ── Submit ────────────────────────────────────────────────
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  setLoading(true);
  try {
    const gender =
      genderWrap?.querySelector('input[name="gender"]:checked')?.value || '';

    const payload = {
      patient: {
        phone: getFullPhone(),
        name: nameEl?.value?.trim() || '',
        age: ageEl?.value ? Number(ageEl.value) : undefined,
        gender: gender || undefined,
        address: addressEl?.value?.trim() || '',
        nationality: nationalityEl?.value?.trim() || '',
        complaint: complaintEl?.value?.trim() || '',
        whatsappNumber: whatsappNumEl?.value?.trim() || '',
        notes: pnotesEl?.value?.trim() || '',
      },
      booking: {
        appointmentDate: dateEl?.value || '',
        appointmentTime: timeEl?.value || '',
        serviceType: serviceEl?.value?.trim() || '',
        totalPrice: Number(totalEl?.value) || 0,
        deposit: Number(depositEl?.value) || 0,
        companion: companionEl?.value?.trim() || '',
        notes: notesEl?.value?.trim() || '',
      },
    };

    const res = await apiFetch('/bookings', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (!res) return;
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.message || 'فشل إنشاء الحجز');

    const b = json?.data?.booking || json?.data || json;
    const id = b?._id || b?.id;
    showAlert('success', 'تم جدولة الموعد بنجاح.', {
      title: 'تم إنشاء الحجز!',
    });

    setTimeout(() => {
      window.location.href = id ? `/bookings/${id}` : '/bookings';
    }, 4000);
  } catch (err) {
    showAlert('error', err?.message || 'فشل إنشاء الحجز', { title: 'خطأ' });
    setLoading(false);
  }
});
