import { apiFetch } from '../api.js';
import { showAlert } from '../alert.js';
import { fmtDate, fmtCurrency, hashColor } from '../utils/format.js';

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
  created: document.querySelector('[data-created]'),
  history: document.querySelector('[data-history]'),
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
  } catch (e) {
    showAlert('error', e?.message || 'فشل تحميل المريض', { title: 'خطأ' });
  }
}

await load();
