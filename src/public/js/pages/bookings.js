import { apiFetch } from '../api.js';
import { showAlert } from '../alert.js';
import { debounce, copyText, fmtDate } from '../utils/format.js';
import { renderTableSkeleton } from '../components/skeleton.js';

const body = document.querySelector('[data-bookings-body]');
const searchEl = document.querySelector('[data-bookings-search]');
const dateEl = document.querySelector('[data-date]');
const pageInfo = document.querySelector('[data-page-info]');
const prevBtn = document.querySelector('[data-prev]');
const nextBtn = document.querySelector('[data-next]');
const chips = [...document.querySelectorAll('[data-chip]')];

let state = {
  page: 1,
  limit: 10,
  status: 'all',
  date: '',
  search: '',
  total: 0,
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

function setChips() {
  chips.forEach((c) =>
    c.classList.toggle(
      'is-active',
      c.getAttribute('data-chip') === state.status,
    ),
  );
}

function setPager() {
  const totalPages = Math.max(1, Math.ceil((state.total || 0) / state.limit));
  if (pageInfo)
    pageInfo.textContent = `الصفحة ${state.page} من ${totalPages} · ${state.total || 0} إجمالي`;
  if (prevBtn) prevBtn.disabled = state.page <= 1;
  if (nextBtn) nextBtn.disabled = state.page >= totalPages;
}

function normalize(json) {
  const payload = json?.data || json || {};
  const list =
    payload?.bookings ||
    payload?.results ||
    payload?.data?.bookings ||
    payload?.data ||
    [];
  const total =
    payload?.total ||
    payload?.totalResults ||
    payload?.count ||
    payload?.resultsCount ||
    payload?.pagination?.total ||
    0;
  return { list: Array.isArray(list) ? list : [], total: Number(total) || 0 };
}

function renderRows(list) {
  if (!body) return;
  body.innerHTML = '';

  if (!list.length) {
    body.innerHTML = `
      <tr><td colspan="7">
        <div class="empty-state">
          <div class="empty-illus" aria-hidden="true">📋</div>
          <div style="font-weight:700;font-family:var(--font-display);margin-top:.5rem">لا يوجد حجوزات</div>
          <div class="secondary" style="margin-top:.25rem">جرّب فلتراً أو تاريخاً مختلفاً.</div>
        </div>
      </td></tr>`;
    return;
  }

  list.forEach((b) => {
    const id = b?._id || b?.id;
    const patient = b?.patient || b?.patientId || {};
    const pName = patient?.name || b?.patientName || '—';
    const phone = patient?.phone || b?.phone || '—';
    const date = b?.appointmentDate || b?.date || b?.createdAt;
    const time = b?.appointmentTime || b?.time || '—';
    const service = b?.serviceType || b?.service || '—';
    const status = b?.status || '—';
    const label = statusLabel[String(status).toLowerCase()] || status;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${fmtDate(date)}</td>
      <td class="tnum">${time}</td>
      <td><a href="/patients/${patient?._id || ''}" style="font-weight:600;color:var(--accent)">${pName}</a></td>
      <td style="position:relative">
        <button class="btn btn-ghost btn-sm" type="button" data-copy="${String(phone)}" dir="ltr">${phone}</button>
      </td>
      <td>${service}</td>
      <td><span class="${badgeForStatus(status)}">${label}</span></td>
      <td>
        <div class="actions">
          <a class="btn btn-ghost btn-sm" href="/bookings/${id}">
            <i data-lucide="eye"></i> عرض
          </a>
        </div>
      </td>
    `;
    body.appendChild(tr);
  });

  window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
}

async function fetchBookings() {
  if (body) renderTableSkeleton(body, 7, 7);
  setChips();

  try {
    const qs = new URLSearchParams({
      page: String(state.page),
      limit: String(state.limit),
    });
    if (state.status !== 'all') qs.set('status', state.status);
    if (state.date) qs.set('date', state.date);
    if (state.search.trim()) qs.set('search', state.search.trim());

    const res = await apiFetch(`/bookings?${qs}`);
    if (!res) return;
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.message || 'فشل تحميل الحجوزات');

    const { list, total } = normalize(json);
    state.total = total || list.length;
    renderRows(list);
    setPager();
  } catch (e) {
    showAlert('error', e?.message || 'فشل تحميل الحجوزات', { title: 'خطأ' });
  }
}

// Phone copy
document.addEventListener('click', async (e) => {
  const btn = e.target?.closest?.('[data-copy]');
  if (!btn) return;
  const text = btn.getAttribute('data-copy') || '';
  try {
    await copyText(text);
    showAlert('success', 'تم نسخ رقم الهاتف.', { title: 'تم النسخ!' });
  } catch {
    showAlert('error', 'تعذّر النسخ.', { title: 'فشل' });
  }
});

chips.forEach((c) =>
  c.addEventListener('click', () => {
    state.status = c.getAttribute('data-chip');
    state.page = 1;
    fetchBookings();
  }),
);

dateEl?.addEventListener('change', () => {
  state.date = dateEl.value || '';
  state.page = 1;
  fetchBookings();
});

searchEl?.addEventListener(
  'input',
  debounce(() => {
    state.search = searchEl.value || '';
    state.page = 1;
    fetchBookings();
  }, 300),
);

prevBtn?.addEventListener('click', () => {
  state.page = Math.max(1, state.page - 1);
  fetchBookings();
});
nextBtn?.addEventListener('click', () => {
  state.page++;
  fetchBookings();
});

await fetchBookings();
