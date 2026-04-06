import { apiFetch } from '../api.js';
import { showAlert } from '../alert.js';
import { debounce, hashColor } from '../utils/format.js';
import { renderCardsSkeleton } from '../components/skeleton.js';
import { initReveal } from '../components/reveal.js';
import { openModal } from '../components/modal.js';
import { requireAuth } from '../auth.js';

const me = await requireAuth();
const myRole = me?.data?.user?.role || me?.user?.role || me?.role;
const canDelete = myRole === 'admin' || myRole === 'mini-admin';

const grid = document.querySelector('[data-patient-grid]');
const searchEl = document.querySelector('[data-patients-search]');
const totalEl = document.querySelector('[data-total]');
const pageInfo = document.querySelector('[data-page-info]');
const prevBtn = document.querySelector('[data-prev]');
const nextBtn = document.querySelector('[data-next]');

let state = { page: 1, limit: 12, search: '', total: 0 };

function normalize(json) {
  const payload = json?.data || json || {};
  const list = payload?.patients || payload?.results || payload?.data || [];
  const total =
    payload?.total ||
    payload?.totalResults ||
    payload?.count ||
    payload?.pagination?.total ||
    0;
  return { list: Array.isArray(list) ? list : [], total: Number(total) || 0 };
}

function initialsOf(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0]?.toUpperCase())
    .join('');
}

function genderLabel(g) {
  const s = String(g || '').toLowerCase();
  if (s === 'male') return 'ذكر';
  if (s === 'female') return 'أنثى';
  return g || '—';
}

function setPager() {
  const totalPages = Math.max(1, Math.ceil((state.total || 0) / state.limit));
  if (pageInfo) pageInfo.textContent = `الصفحة ${state.page} من ${totalPages}`;
  if (prevBtn) prevBtn.disabled = state.page <= 1;
  if (nextBtn) nextBtn.disabled = state.page >= totalPages;
}

function render(list) {
  if (!grid) return;
  grid.innerHTML = '';

  if (!list.length) {
    grid.innerHTML = `
      <div class="empty-state" style="grid-column:1/-1">
        <div class="empty-illus" aria-hidden="true">👥</div>
        <div style="font-weight:700;font-family:var(--font-display);margin-top:.5rem">لا يوجد مرضى</div>
        <div class="secondary" style="margin-top:.25rem">جرّب بحثاً مختلفاً.</div>
      </div>`;
    return;
  }

  list.forEach((p, i) => {
    const id = p?._id || p?.id;
    const name = p?.name || '—';
    const phone = p?.phone || '—';
    const gender = genderLabel(p?.gender);
    const age = p?.age != null ? `${p.age} سنة` : '—';
    const init = initialsOf(name) || 'م';
    const color = hashColor(name);
    const nationality = p?.nationality || '';
    const pid = p?.patientId || '';

    const card = document.createElement('div');
    card.className = 'card card-pad patient-card reveal';
    card.style.setProperty('--d', `${Math.min(320, i * 35)}ms`);
    card.innerHTML = `
      <div class="patient-head">
        <div class="initials" style="background:${color}">${init}</div>
        <div style="min-width:0;flex:1">
          <div style="font-family:var(--font-display);font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${name}</div>
          <div class="secondary" style="margin-top:.1rem;font-size:.83rem;direction:ltr;text-align:right">${phone}</div>
        </div>
      </div>
      <div class="patient-meta">
        <span class="badge ${p?.gender === 'female' ? 'badge-red' : 'badge-blue'}">${gender}</span>
        <span class="badge badge-muted">${age}</span>
        ${pid ? `<span class="badge badge-muted" data-copy-pid="${pid}" title="انقر لنسخ رقم المريض" style="cursor:pointer;user-select:none">📋 ${pid}</span>` : ''}
        ${nationality ? `<span class="badge badge-muted">🌍 ${nationality}</span>` : ''}
      </div>
      <div style="display:flex;gap:.5rem;flex-wrap:wrap">
        <a class="btn btn-primary btn-sm" href="/patients/${id}">
          <i data-lucide="user"></i> عرض
        </a>
        <a class="btn btn-ghost btn-sm" href="/bookings/new">
          <i data-lucide="calendar-plus"></i> حجز
        </a>
        ${
          canDelete
            ? `<button class="btn btn-danger btn-sm" type="button" data-delete-patient="${id}" data-patient-name="${name}">
          <i data-lucide="trash-2"></i>
        </button>`
            : ''
        }
      </div>
    `;
    grid.appendChild(card);
  });

  window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
  initReveal();
}

// ── Event delegation ─────────────────────────────────────────
grid?.addEventListener('click', async (e) => {
  // Copy patient ID
  const pidBadge = e.target?.closest('[data-copy-pid]');
  if (pidBadge) {
    const pid = pidBadge.dataset.copyPid;
    try {
      await navigator.clipboard.writeText(pid);
      showAlert('success', `تم نسخ ${pid}`);
    } catch {
      showAlert('error', 'فشل النسخ، يرجى المحاولة مرة أخرى');
    }
    return;
  }

  // Delete patient
  const deleteBtn = e.target?.closest('[data-delete-patient]');
  if (deleteBtn) {
    const id = deleteBtn.dataset.deletePatient;
    const name = deleteBtn.dataset.patientName || 'هذا المريض';
    openModal({
      title: 'حذف المريض؟',
      body: `سيتم حذف سجل "${name}" نهائياً بما في ذلك جميع بياناته. لا يمكن التراجع عن هذا.`,
      confirmText: 'حذف نهائي',
      onConfirm: async () => {
        const res = await apiFetch(`/patients/${encodeURIComponent(id)}`, {
          method: 'DELETE',
        });
        if (!res) return;
        if (!res.ok) {
          const json = await res.json().catch(() => ({}));
          throw new Error(json?.message || 'فشل حذف المريض');
        }
        showAlert('warning', `تم حذف سجل "${name}".`, { title: 'تم الحذف' });
        await fetchPatients();
      },
    });
  }
});

async function fetchPatients() {
  if (grid) renderCardsSkeleton(grid, 9);
  try {
    const qs = new URLSearchParams({
      page: String(state.page),
      limit: String(state.limit),
    });
    if (state.search.trim()) qs.set('search', state.search.trim());

    const res = await apiFetch(`/patients?${qs}`);
    if (!res) return;
    const json = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(json?.message || 'فشل تحميل المرضى');

    const { list, total } = normalize(json);
    state.total = total || list.length;
    if (totalEl) totalEl.textContent = `${state.total} مريض (مؤكد)`;
    render(list);
    setPager();
  } catch (e) {
    showAlert('error', e?.message || 'فشل تحميل المرضى', { title: 'خطأ' });
  }
}

searchEl?.addEventListener(
  'input',
  debounce(() => {
    state.search = searchEl.value || '';
    state.page = 1;
    fetchPatients();
  }, 300),
);

prevBtn?.addEventListener('click', () => {
  state.page = Math.max(1, state.page - 1);
  fetchPatients();
});
nextBtn?.addEventListener('click', () => {
  state.page++;
  fetchPatients();
});

await fetchPatients();
