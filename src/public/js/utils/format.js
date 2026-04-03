const dtf = new Intl.DateTimeFormat('en-EG', { year: 'numeric', month: 'short', day: '2-digit' });
const ttf = new Intl.DateTimeFormat('en-EG', { hour: '2-digit', minute: '2-digit' });
const ctf = new Intl.NumberFormat('en-EG', { style: 'currency', currency: 'EGP' });

function fmtDate(value) {
  const d = value ? new Date(value) : null;
  if (!d || Number.isNaN(d.getTime())) return '-';
  return dtf.format(d);
}

function fmtTime(value) {
  const d = value ? new Date(value) : null;
  if (!d || Number.isNaN(d.getTime())) return '-';
  return ttf.format(d);
}

function fmtCurrency(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return ctf.format(0);
  return ctf.format(n);
}

function debounce(fn, ms) {
  let t = null;
  return (...args) => {
    window.clearTimeout(t);
    t = window.setTimeout(() => fn(...args), ms);
  };
}

function hashColor(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  const hue = h % 360;
  return `hsl(${hue} 80% 60% / 0.95)`;
}

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand('copy');
  ta.remove();
  return ok;
}

export { fmtDate, fmtTime, fmtCurrency, debounce, hashColor, copyText };

