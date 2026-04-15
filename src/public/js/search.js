/**
 * search.js — Global search bar
 * Searches patients and bookings simultaneously on Enter or 400ms debounce.
 * Results show in a keyboard-navigable dropdown.
 */
import { apiFetch } from './api.js';

export function initGlobalSearch() {
  const input = document.querySelector('[data-global-search]');
  const dropdown = document.querySelector('[data-search-dropdown]');
  if (!input || !dropdown) return;

  let timer = null;
  let lastQ = '';
  let active = false;

  // ── DOM helpers ────────────────────────────────────────
  function hide() {
    dropdown.classList.remove('is-open');
    dropdown.innerHTML = '';
    active = false;
  }

  function show(html) {
    dropdown.innerHTML = html;
    dropdown.classList.add('is-open');
    window.lucide?.createIcons?.({ attrs: { 'stroke-width': 1.8 } });
    active = true;
  }

  function row(icon, label, sub, href) {
    // Escape HTML to prevent XSS in result labels
    const esc = (s) =>
      String(s || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    return `<a class="search-row" href="${esc(href)}" tabindex="0">
      <span class="search-row-icon"><i data-lucide="${icon}"></i></span>
      <span class="search-row-text">
        <span class="search-row-label">${esc(label)}</span>
        <span class="search-row-sub">${esc(sub)}</span>
      </span>
      <i data-lucide="arrow-right" class="search-row-arr"></i>
    </a>`;
  }

  // ── Main search ────────────────────────────────────────
  async function doSearch(q) {
    q = q.trim();
    if (!q || q.length < 2) {
      hide();
      return;
    }
    if (q === lastQ && active) return;
    lastQ = q;

    show(
      `<div class="search-loading"><span class="search-spin"></span> جارٍ البحث…</div>`,
    );

    try {
      const [pRes, bRes] = await Promise.allSettled([
        apiFetch(`/patients?search=${encodeURIComponent(q)}&limit=6`),
        apiFetch(`/bookings?search=${encodeURIComponent(q)}&limit=5`),
      ]);

      let html = '';

      // ── Patients ─────────────────────────────────────
      const patients =
        pRes.status === 'fulfilled' && pRes.value?.ok
          ? (await pRes.value.json().catch(() => ({}))).data?.patients || []
          : [];

      if (patients.length) {
        html += `<div class="search-section-label">المرضى</div>`;
        patients.forEach((p) => {
          const sub =
            [p.phone, p.nationality].filter(Boolean).join(' · ') || '—';
          html += row('user', p.name || '—', sub, `/patients/${p._id}`);
        });
      }

      // ── Bookings ─────────────────────────────────────
      const bookings =
        bRes.status === 'fulfilled' && bRes.value?.ok
          ? (await bRes.value.json().catch(() => ({}))).data?.bookings || []
          : [];

      if (bookings.length) {
        html += `<div class="search-section-label">الحجوزات</div>`;
        bookings.forEach((b) => {
          const pName = b.patient?.name || '—';
          const date = b.appointmentDate
            ? new Date(b.appointmentDate).toLocaleDateString('ar-EG', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })
            : '—';
          const sub = `${date} · ${b.serviceType || '—'}`;
          html += row('calendar-check', pName, sub, `/bookings/${b._id}`);
        });
      }

      // ── Empty state ───────────────────────────────────
      if (!html) {
        const escQ = String(q)
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');
        html = `<div class="search-empty">
    <i data-lucide="search-x"></i>
    لا توجد نتائج لـ "<strong>${escQ}</strong>"
  </div>`;
      }

      show(html);
    } catch {
      show(
        `<div class="search-empty"><i data-lucide="wifi-off"></i> تعذّر البحث</div>`,
      );
    }
  }

  // ── Event wiring ───────────────────────────────────────
  input.addEventListener('input', () => {
    clearTimeout(timer);
    const q = input.value.trim();
    if (!q) {
      hide();
      lastQ = '';
      return;
    }
    timer = setTimeout(() => doSearch(q), 380);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      clearTimeout(timer);
      doSearch(input.value);
    }
    if (e.key === 'Escape') {
      hide();
      input.blur();
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const rows = dropdown.querySelectorAll('.search-row');
      if (rows.length) rows[0].focus();
    }
  });

  // Keyboard navigation inside dropdown
  dropdown.addEventListener('keydown', (e) => {
    const rows = [...dropdown.querySelectorAll('.search-row')];
    const i = rows.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      rows[Math.min(i + 1, rows.length - 1)]?.focus();
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      i > 0 ? rows[i - 1].focus() : input.focus();
    }
    if (e.key === 'Escape') {
      hide();
      input.focus();
    }
  });

  // Close when clicking outside
  document.addEventListener('click', (e) => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) hide();
  });

  // Reopen on focus if there's an existing query
  input.addEventListener('focus', () => {
    if (input.value.trim().length >= 2 && !active) doSearch(input.value);
  });
}
