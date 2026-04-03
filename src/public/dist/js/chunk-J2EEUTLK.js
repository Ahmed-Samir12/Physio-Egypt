// src/public/js/alert.js
var DEFAULTS = {
  duration: 4500,
  // ms before auto-dismiss
  maxStack: 4
  // max alerts visible at once
};
var CONFIG = {
  success: {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
             <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
           </svg>`,
    label: "Success",
    color: "#16a34a",
    bg: "#f0fdf4",
    bar: "linear-gradient(90deg,#22c55e,#16a34a)",
    border: "rgba(34,197,94,0.28)",
    iconBg: "rgba(34,197,94,0.12)"
  },
  error: {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
             <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
           </svg>`,
    label: "Error",
    color: "#dc2626",
    bg: "#fff5f5",
    bar: "linear-gradient(90deg,#ef4444,#dc2626)",
    border: "rgba(239,68,68,0.28)",
    iconBg: "rgba(239,68,68,0.1)"
  },
  warning: {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
             <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
             <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
           </svg>`,
    label: "Warning",
    color: "#b45309",
    bg: "#fffbeb",
    bar: "linear-gradient(90deg,#f59e0b,#b45309)",
    border: "rgba(245,158,11,0.28)",
    iconBg: "rgba(245,158,11,0.1)"
  },
  info: {
    icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
             <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
           </svg>`,
    label: "Info",
    color: "#0284c7",
    bg: "#f0f9ff",
    bar: "linear-gradient(90deg,#38bdf8,#0284c7)",
    border: "rgba(14,165,233,0.28)",
    iconBg: "rgba(14,165,233,0.1)"
  }
};
function getRoot() {
  let root = document.getElementById("alert-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "alert-root";
    root.setAttribute("aria-live", "polite");
    root.setAttribute("aria-atomic", "false");
    Object.assign(root.style, {
      position: "fixed",
      top: "1.1rem",
      right: "1.1rem",
      zIndex: "99999",
      display: "flex",
      flexDirection: "column",
      gap: "0.6rem",
      maxWidth: "min(420px, calc(100vw - 2rem))",
      width: "100%",
      pointerEvents: "none"
    });
    document.body.appendChild(root);
  }
  return root;
}
function showAlert(type = "info", message = "", options = {}) {
  const cfg = CONFIG[type] || CONFIG.info;
  const { title = cfg.label, duration = DEFAULTS.duration, action = null } = options;
  const root = getRoot();
  const existing = root.querySelectorAll(".cms-alert");
  if (existing.length >= DEFAULTS.maxStack) {
    dismiss(existing[0]);
  }
  const el = document.createElement("div");
  el.className = "cms-alert";
  el.setAttribute("role", "status");
  Object.assign(el.style, {
    position: "relative",
    display: "grid",
    gridTemplateColumns: "44px 1fr auto",
    gap: "0",
    alignItems: "center",
    background: cfg.bg,
    border: `1px solid ${cfg.border}`,
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 4px 24px rgba(0,0,0,0.10), 0 1px 4px rgba(0,0,0,0.06)",
    pointerEvents: "auto",
    cursor: "default",
    opacity: "0",
    transform: "translateX(18px) scale(0.97)",
    transition: "opacity 0.28s cubic-bezier(0.4,0,0.2,1), transform 0.28s cubic-bezier(0.4,0,0.2,1)",
    willChange: "transform, opacity",
    userSelect: "none",
    minWidth: "280px"
  });
  const stripe = document.createElement("div");
  Object.assign(stripe.style, {
    position: "absolute",
    left: "0",
    top: "0",
    bottom: "0",
    width: "4px",
    background: cfg.bar,
    borderRadius: "14px 0 0 14px"
  });
  const iconCol = document.createElement("div");
  Object.assign(iconCol.style, {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: "18px",
    paddingRight: "2px"
  });
  const iconWrap = document.createElement("div");
  Object.assign(iconWrap.style, {
    width: "32px",
    height: "32px",
    borderRadius: "8px",
    background: cfg.iconBg,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: "0",
    color: cfg.color
  });
  iconWrap.innerHTML = cfg.icon;
  const svg = iconWrap.querySelector("svg");
  if (svg) Object.assign(svg.style, { width: "17px", height: "17px" });
  iconCol.appendChild(iconWrap);
  const textCol = document.createElement("div");
  Object.assign(textCol.style, {
    padding: "13px 10px 13px 10px",
    minWidth: "0"
  });
  const titleEl = document.createElement("div");
  Object.assign(titleEl.style, {
    fontFamily: "'DM Sans', sans-serif",
    fontWeight: "700",
    fontSize: "0.88rem",
    color: "#0f172a",
    letterSpacing: "-0.01em",
    lineHeight: "1.3"
  });
  titleEl.textContent = title;
  const msgEl = document.createElement("div");
  Object.assign(msgEl.style, {
    fontFamily: "'DM Sans', sans-serif",
    fontSize: "0.83rem",
    color: "#475569",
    marginTop: "2px",
    lineHeight: "1.45",
    wordBreak: "break-word"
  });
  msgEl.textContent = message;
  textCol.appendChild(titleEl);
  textCol.appendChild(msgEl);
  if (action?.label && action?.fn) {
    const actBtn = document.createElement("button");
    Object.assign(actBtn.style, {
      background: "none",
      border: "none",
      color: cfg.color,
      fontFamily: "'DM Sans', sans-serif",
      fontWeight: "700",
      fontSize: "0.8rem",
      cursor: "pointer",
      marginTop: "5px",
      padding: "0",
      display: "block",
      textDecoration: "underline",
      textUnderlineOffset: "2px"
    });
    actBtn.textContent = action.label;
    actBtn.addEventListener("click", () => {
      action.fn();
      dismiss(el);
    });
    textCol.appendChild(actBtn);
  }
  const closeCol = document.createElement("div");
  Object.assign(closeCol.style, {
    padding: "0 10px 0 0",
    alignSelf: "flex-start",
    paddingTop: "9px"
  });
  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.setAttribute("aria-label", "Dismiss");
  closeBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" style="width:15px;height:15px;display:block"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
  Object.assign(closeBtn.style, {
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "5px",
    borderRadius: "6px",
    color: "#94a3b8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "color 0.15s, background 0.15s"
  });
  closeBtn.addEventListener("mouseenter", () => {
    closeBtn.style.color = "#0f172a";
    closeBtn.style.background = "rgba(0,0,0,0.06)";
  });
  closeBtn.addEventListener("mouseleave", () => {
    closeBtn.style.color = "#94a3b8";
    closeBtn.style.background = "none";
  });
  closeBtn.addEventListener("click", () => dismiss(el));
  closeCol.appendChild(closeBtn);
  const bar = document.createElement("div");
  Object.assign(bar.style, {
    position: "absolute",
    bottom: "0",
    left: "0",
    right: "0",
    height: "3px",
    background: cfg.bar,
    transformOrigin: "left",
    borderRadius: "0 0 14px 14px",
    transition: `transform ${duration}ms linear`,
    transform: "scaleX(1)",
    opacity: "0.55"
  });
  el.appendChild(stripe);
  el.appendChild(iconCol);
  el.appendChild(textCol);
  el.appendChild(closeCol);
  el.appendChild(bar);
  root.appendChild(el);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      el.style.opacity = "1";
      el.style.transform = "translateX(0) scale(1)";
      bar.style.transform = "scaleX(0)";
    });
  });
  let timer = setTimeout(() => dismiss(el), duration);
  el.addEventListener("mouseenter", () => {
    clearTimeout(timer);
    bar.style.transition = "none";
  });
  el.addEventListener("mouseleave", () => {
    bar.style.transition = `transform 1200ms linear`;
    bar.style.transform = "scaleX(0)";
    timer = setTimeout(() => dismiss(el), 1200);
  });
  return el;
}
function dismiss(el) {
  if (!el || el._dismissing) return;
  el._dismissing = true;
  el.style.opacity = "0";
  el.style.transform = "translateX(18px) scale(0.95)";
  el.style.maxHeight = el.offsetHeight + "px";
  setTimeout(() => {
    el.style.maxHeight = "0";
    el.style.marginBottom = "0";
    el.style.overflow = "hidden";
    el.style.transition += ", max-height 0.2s ease, margin 0.2s ease";
    setTimeout(() => el.remove(), 220);
  }, 260);
}
function showToast(message, type = "info", title = null) {
  showAlert(type, message, title ? { title } : {});
}
function dismissAll() {
  document.querySelectorAll(".cms-alert").forEach(dismiss);
}

export {
  showAlert,
  showToast,
  dismissAll
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vanMvYWxlcnQuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8qKlxuICogYWxlcnQuanMg4oCUIENsaW5pYyBDTVNcbiAqXG4gKiBzaG93QWxlcnQodHlwZSwgbWVzc2FnZSwgb3B0aW9ucz8pXG4gKiAgIHR5cGU6ICAgICdzdWNjZXNzJyB8ICdlcnJvcicgfCAnd2FybmluZycgfCAnaW5mbydcbiAqICAgbWVzc2FnZTogc3RyaW5nXG4gKiAgIG9wdGlvbnM6IHsgdGl0bGU/LCBkdXJhdGlvbj8sIGFjdGlvbj86IHsgbGFiZWwsIGZuIH0gfVxuICpcbiAqIEFsc28gZXhwb3J0cyBzaG93VG9hc3QoKSBhcyBhIGNvbXBhdCBhbGlhcyBzbyBleGlzdGluZyBwYWdlc1xuICogZG9uJ3QgbmVlZCB0byBiZSB0b3VjaGVkLlxuICovXG5cbi8vIOKUgOKUgCBDb25maWcg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG5jb25zdCBERUZBVUxUUyA9IHtcbiAgZHVyYXRpb246IDQ1MDAsICAgLy8gbXMgYmVmb3JlIGF1dG8tZGlzbWlzc1xuICBtYXhTdGFjazogNCwgICAgICAvLyBtYXggYWxlcnRzIHZpc2libGUgYXQgb25jZVxufTtcblxuY29uc3QgQ09ORklHID0ge1xuICBzdWNjZXNzOiB7XG4gICAgaWNvbjogYDxzdmcgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMi4yXCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCI+XG4gICAgICAgICAgICAgPHBhdGggZD1cIk0yMiAxMS4wOFYxMmExMCAxMCAwIDEgMS01LjkzLTkuMTRcIi8+PHBvbHlsaW5lIHBvaW50cz1cIjIyIDQgMTIgMTQuMDEgOSAxMS4wMVwiLz5cbiAgICAgICAgICAgPC9zdmc+YCxcbiAgICBsYWJlbDogJ1N1Y2Nlc3MnLFxuICAgIGNvbG9yOiAnIzE2YTM0YScsXG4gICAgYmc6ICAgICcjZjBmZGY0JyxcbiAgICBiYXI6ICAgJ2xpbmVhci1ncmFkaWVudCg5MGRlZywjMjJjNTVlLCMxNmEzNGEpJyxcbiAgICBib3JkZXI6J3JnYmEoMzQsMTk3LDk0LDAuMjgpJyxcbiAgICBpY29uQmc6J3JnYmEoMzQsMTk3LDk0LDAuMTIpJyxcbiAgfSxcbiAgZXJyb3I6IHtcbiAgICBpY29uOiBgPHN2ZyB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIyLjJcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3Ryb2tlLWxpbmVqb2luPVwicm91bmRcIj5cbiAgICAgICAgICAgICA8Y2lyY2xlIGN4PVwiMTJcIiBjeT1cIjEyXCIgcj1cIjEwXCIvPjxsaW5lIHgxPVwiMTJcIiB5MT1cIjhcIiB4Mj1cIjEyXCIgeTI9XCIxMlwiLz48bGluZSB4MT1cIjEyXCIgeTE9XCIxNlwiIHgyPVwiMTIuMDFcIiB5Mj1cIjE2XCIvPlxuICAgICAgICAgICA8L3N2Zz5gLFxuICAgIGxhYmVsOiAnRXJyb3InLFxuICAgIGNvbG9yOiAnI2RjMjYyNicsXG4gICAgYmc6ICAgICcjZmZmNWY1JyxcbiAgICBiYXI6ICAgJ2xpbmVhci1ncmFkaWVudCg5MGRlZywjZWY0NDQ0LCNkYzI2MjYpJyxcbiAgICBib3JkZXI6J3JnYmEoMjM5LDY4LDY4LDAuMjgpJyxcbiAgICBpY29uQmc6J3JnYmEoMjM5LDY4LDY4LDAuMSknLFxuICB9LFxuICB3YXJuaW5nOiB7XG4gICAgaWNvbjogYDxzdmcgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMi4yXCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCI+XG4gICAgICAgICAgICAgPHBhdGggZD1cIk0xMC4yOSAzLjg2TDEuODIgMThhMiAyIDAgMCAwIDEuNzEgM2gxNi45NGEyIDIgMCAwIDAgMS43MS0zTDEzLjcxIDMuODZhMiAyIDAgMCAwLTMuNDIgMHpcIi8+XG4gICAgICAgICAgICAgPGxpbmUgeDE9XCIxMlwiIHkxPVwiOVwiIHgyPVwiMTJcIiB5Mj1cIjEzXCIvPjxsaW5lIHgxPVwiMTJcIiB5MT1cIjE3XCIgeDI9XCIxMi4wMVwiIHkyPVwiMTdcIi8+XG4gICAgICAgICAgIDwvc3ZnPmAsXG4gICAgbGFiZWw6ICdXYXJuaW5nJyxcbiAgICBjb2xvcjogJyNiNDUzMDknLFxuICAgIGJnOiAgICAnI2ZmZmJlYicsXG4gICAgYmFyOiAgICdsaW5lYXItZ3JhZGllbnQoOTBkZWcsI2Y1OWUwYiwjYjQ1MzA5KScsXG4gICAgYm9yZGVyOidyZ2JhKDI0NSwxNTgsMTEsMC4yOCknLFxuICAgIGljb25CZzoncmdiYSgyNDUsMTU4LDExLDAuMSknLFxuICB9LFxuICBpbmZvOiB7XG4gICAgaWNvbjogYDxzdmcgdmlld0JveD1cIjAgMCAyNCAyNFwiIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiY3VycmVudENvbG9yXCIgc3Ryb2tlLXdpZHRoPVwiMi4yXCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1saW5lam9pbj1cInJvdW5kXCI+XG4gICAgICAgICAgICAgPGNpcmNsZSBjeD1cIjEyXCIgY3k9XCIxMlwiIHI9XCIxMFwiLz48bGluZSB4MT1cIjEyXCIgeTE9XCIxNlwiIHgyPVwiMTJcIiB5Mj1cIjEyXCIvPjxsaW5lIHgxPVwiMTJcIiB5MT1cIjhcIiB4Mj1cIjEyLjAxXCIgeTI9XCI4XCIvPlxuICAgICAgICAgICA8L3N2Zz5gLFxuICAgIGxhYmVsOiAnSW5mbycsXG4gICAgY29sb3I6ICcjMDI4NGM3JyxcbiAgICBiZzogICAgJyNmMGY5ZmYnLFxuICAgIGJhcjogICAnbGluZWFyLWdyYWRpZW50KDkwZGVnLCMzOGJkZjgsIzAyODRjNyknLFxuICAgIGJvcmRlcjoncmdiYSgxNCwxNjUsMjMzLDAuMjgpJyxcbiAgICBpY29uQmc6J3JnYmEoMTQsMTY1LDIzMywwLjEpJyxcbiAgfSxcbn07XG5cbi8vIOKUgOKUgCBET00gcm9vdCDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbmZ1bmN0aW9uIGdldFJvb3QoKSB7XG4gIGxldCByb290ID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2FsZXJ0LXJvb3QnKTtcbiAgaWYgKCFyb290KSB7XG4gICAgcm9vdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIHJvb3QuaWQgPSAnYWxlcnQtcm9vdCc7XG4gICAgcm9vdC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGl2ZScsICdwb2xpdGUnKTtcbiAgICByb290LnNldEF0dHJpYnV0ZSgnYXJpYS1hdG9taWMnLCAnZmFsc2UnKTtcbiAgICAvLyBTdHlsZXMgaW5qZWN0ZWQgaW5saW5lIHNvIG5vIGV4dHJhIENTUyBmaWxlIG5lZWRlZFxuICAgIE9iamVjdC5hc3NpZ24ocm9vdC5zdHlsZSwge1xuICAgICAgcG9zaXRpb246ICdmaXhlZCcsXG4gICAgICB0b3A6ICcxLjFyZW0nLFxuICAgICAgcmlnaHQ6ICcxLjFyZW0nLFxuICAgICAgekluZGV4OiAnOTk5OTknLFxuICAgICAgZGlzcGxheTogJ2ZsZXgnLFxuICAgICAgZmxleERpcmVjdGlvbjogJ2NvbHVtbicsXG4gICAgICBnYXA6ICcwLjZyZW0nLFxuICAgICAgbWF4V2lkdGg6ICdtaW4oNDIwcHgsIGNhbGMoMTAwdncgLSAycmVtKSknLFxuICAgICAgd2lkdGg6ICcxMDAlJyxcbiAgICAgIHBvaW50ZXJFdmVudHM6ICdub25lJyxcbiAgICB9KTtcbiAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKHJvb3QpO1xuICB9XG4gIHJldHVybiByb290O1xufVxuXG4vLyDilIDilIAgQ29yZSBidWlsZGVyIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuZnVuY3Rpb24gc2hvd0FsZXJ0KHR5cGUgPSAnaW5mbycsIG1lc3NhZ2UgPSAnJywgb3B0aW9ucyA9IHt9KSB7XG4gIGNvbnN0IGNmZyA9IENPTkZJR1t0eXBlXSB8fCBDT05GSUcuaW5mbztcbiAgY29uc3QgeyB0aXRsZSA9IGNmZy5sYWJlbCwgZHVyYXRpb24gPSBERUZBVUxUUy5kdXJhdGlvbiwgYWN0aW9uID0gbnVsbCB9ID0gb3B0aW9ucztcblxuICBjb25zdCByb290ID0gZ2V0Um9vdCgpO1xuXG4gIC8vIFRyaW0gb2xkZXN0IGlmIHRvbyBtYW55XG4gIGNvbnN0IGV4aXN0aW5nID0gcm9vdC5xdWVyeVNlbGVjdG9yQWxsKCcuY21zLWFsZXJ0Jyk7XG4gIGlmIChleGlzdGluZy5sZW5ndGggPj0gREVGQVVMVFMubWF4U3RhY2spIHtcbiAgICBkaXNtaXNzKGV4aXN0aW5nWzBdKTtcbiAgfVxuXG4gIC8vIOKUgOKUgCBCdWlsZCBlbGVtZW50IOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuICBjb25zdCBlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBlbC5jbGFzc05hbWUgPSAnY21zLWFsZXJ0JztcbiAgZWwuc2V0QXR0cmlidXRlKCdyb2xlJywgJ3N0YXR1cycpO1xuXG4gIE9iamVjdC5hc3NpZ24oZWwuc3R5bGUsIHtcbiAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJyxcbiAgICBkaXNwbGF5OiAnZ3JpZCcsXG4gICAgZ3JpZFRlbXBsYXRlQ29sdW1uczogJzQ0cHggMWZyIGF1dG8nLFxuICAgIGdhcDogJzAnLFxuICAgIGFsaWduSXRlbXM6ICdjZW50ZXInLFxuICAgIGJhY2tncm91bmQ6IGNmZy5iZyxcbiAgICBib3JkZXI6IGAxcHggc29saWQgJHtjZmcuYm9yZGVyfWAsXG4gICAgYm9yZGVyUmFkaXVzOiAnMTRweCcsXG4gICAgb3ZlcmZsb3c6ICdoaWRkZW4nLFxuICAgIGJveFNoYWRvdzogJzAgNHB4IDI0cHggcmdiYSgwLDAsMCwwLjEwKSwgMCAxcHggNHB4IHJnYmEoMCwwLDAsMC4wNiknLFxuICAgIHBvaW50ZXJFdmVudHM6ICdhdXRvJyxcbiAgICBjdXJzb3I6ICdkZWZhdWx0JyxcbiAgICBvcGFjaXR5OiAnMCcsXG4gICAgdHJhbnNmb3JtOiAndHJhbnNsYXRlWCgxOHB4KSBzY2FsZSgwLjk3KScsXG4gICAgdHJhbnNpdGlvbjogJ29wYWNpdHkgMC4yOHMgY3ViaWMtYmV6aWVyKDAuNCwwLDAuMiwxKSwgdHJhbnNmb3JtIDAuMjhzIGN1YmljLWJlemllcigwLjQsMCwwLjIsMSknLFxuICAgIHdpbGxDaGFuZ2U6ICd0cmFuc2Zvcm0sIG9wYWNpdHknLFxuICAgIHVzZXJTZWxlY3Q6ICdub25lJyxcbiAgICBtaW5XaWR0aDogJzI4MHB4JyxcbiAgfSk7XG5cbiAgLy8gTGVmdCBjb2xvdXIgc3RyaXBlXG4gIGNvbnN0IHN0cmlwZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBPYmplY3QuYXNzaWduKHN0cmlwZS5zdHlsZSwge1xuICAgIHBvc2l0aW9uOiAnYWJzb2x1dGUnLFxuICAgIGxlZnQ6ICcwJywgdG9wOiAnMCcsIGJvdHRvbTogJzAnLFxuICAgIHdpZHRoOiAnNHB4JyxcbiAgICBiYWNrZ3JvdW5kOiBjZmcuYmFyLFxuICAgIGJvcmRlclJhZGl1czogJzE0cHggMCAwIDE0cHgnLFxuICB9KTtcblxuICAvLyBJY29uIGNvbHVtblxuICBjb25zdCBpY29uQ29sID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIE9iamVjdC5hc3NpZ24oaWNvbkNvbC5zdHlsZSwge1xuICAgIGRpc3BsYXk6ICdmbGV4JyxcbiAgICBhbGlnbkl0ZW1zOiAnY2VudGVyJyxcbiAgICBqdXN0aWZ5Q29udGVudDogJ2NlbnRlcicsXG4gICAgcGFkZGluZ0xlZnQ6ICcxOHB4JyxcbiAgICBwYWRkaW5nUmlnaHQ6ICcycHgnLFxuICB9KTtcblxuICBjb25zdCBpY29uV3JhcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBPYmplY3QuYXNzaWduKGljb25XcmFwLnN0eWxlLCB7XG4gICAgd2lkdGg6ICczMnB4JywgaGVpZ2h0OiAnMzJweCcsXG4gICAgYm9yZGVyUmFkaXVzOiAnOHB4JyxcbiAgICBiYWNrZ3JvdW5kOiBjZmcuaWNvbkJnLFxuICAgIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICBmbGV4U2hyaW5rOiAnMCcsXG4gICAgY29sb3I6IGNmZy5jb2xvcixcbiAgfSk7XG4gIGljb25XcmFwLmlubmVySFRNTCA9IGNmZy5pY29uO1xuICBjb25zdCBzdmcgPSBpY29uV3JhcC5xdWVyeVNlbGVjdG9yKCdzdmcnKTtcbiAgaWYgKHN2ZykgT2JqZWN0LmFzc2lnbihzdmcuc3R5bGUsIHsgd2lkdGg6ICcxN3B4JywgaGVpZ2h0OiAnMTdweCcgfSk7XG5cbiAgaWNvbkNvbC5hcHBlbmRDaGlsZChpY29uV3JhcCk7XG5cbiAgLy8gVGV4dCBjb2x1bW5cbiAgY29uc3QgdGV4dENvbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBPYmplY3QuYXNzaWduKHRleHRDb2wuc3R5bGUsIHtcbiAgICBwYWRkaW5nOiAnMTNweCAxMHB4IDEzcHggMTBweCcsXG4gICAgbWluV2lkdGg6ICcwJyxcbiAgfSk7XG5cbiAgY29uc3QgdGl0bGVFbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICBPYmplY3QuYXNzaWduKHRpdGxlRWwuc3R5bGUsIHtcbiAgICBmb250RmFtaWx5OiBcIidETSBTYW5zJywgc2Fucy1zZXJpZlwiLFxuICAgIGZvbnRXZWlnaHQ6ICc3MDAnLFxuICAgIGZvbnRTaXplOiAnMC44OHJlbScsXG4gICAgY29sb3I6ICcjMGYxNzJhJyxcbiAgICBsZXR0ZXJTcGFjaW5nOiAnLTAuMDFlbScsXG4gICAgbGluZUhlaWdodDogJzEuMycsXG4gIH0pO1xuICB0aXRsZUVsLnRleHRDb250ZW50ID0gdGl0bGU7XG5cbiAgY29uc3QgbXNnRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgT2JqZWN0LmFzc2lnbihtc2dFbC5zdHlsZSwge1xuICAgIGZvbnRGYW1pbHk6IFwiJ0RNIFNhbnMnLCBzYW5zLXNlcmlmXCIsXG4gICAgZm9udFNpemU6ICcwLjgzcmVtJyxcbiAgICBjb2xvcjogJyM0NzU1NjknLFxuICAgIG1hcmdpblRvcDogJzJweCcsXG4gICAgbGluZUhlaWdodDogJzEuNDUnLFxuICAgIHdvcmRCcmVhazogJ2JyZWFrLXdvcmQnLFxuICB9KTtcbiAgbXNnRWwudGV4dENvbnRlbnQgPSBtZXNzYWdlO1xuXG4gIHRleHRDb2wuYXBwZW5kQ2hpbGQodGl0bGVFbCk7XG4gIHRleHRDb2wuYXBwZW5kQ2hpbGQobXNnRWwpO1xuXG4gIC8vIE9wdGlvbmFsIGFjdGlvbiBidXR0b25cbiAgaWYgKGFjdGlvbj8ubGFiZWwgJiYgYWN0aW9uPy5mbikge1xuICAgIGNvbnN0IGFjdEJ0biA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICAgIE9iamVjdC5hc3NpZ24oYWN0QnRuLnN0eWxlLCB7XG4gICAgICBiYWNrZ3JvdW5kOiAnbm9uZScsIGJvcmRlcjogJ25vbmUnLFxuICAgICAgY29sb3I6IGNmZy5jb2xvcixcbiAgICAgIGZvbnRGYW1pbHk6IFwiJ0RNIFNhbnMnLCBzYW5zLXNlcmlmXCIsXG4gICAgICBmb250V2VpZ2h0OiAnNzAwJyxcbiAgICAgIGZvbnRTaXplOiAnMC44cmVtJyxcbiAgICAgIGN1cnNvcjogJ3BvaW50ZXInLFxuICAgICAgbWFyZ2luVG9wOiAnNXB4JyxcbiAgICAgIHBhZGRpbmc6ICcwJyxcbiAgICAgIGRpc3BsYXk6ICdibG9jaycsXG4gICAgICB0ZXh0RGVjb3JhdGlvbjogJ3VuZGVybGluZScsXG4gICAgICB0ZXh0VW5kZXJsaW5lT2Zmc2V0OiAnMnB4JyxcbiAgICB9KTtcbiAgICBhY3RCdG4udGV4dENvbnRlbnQgPSBhY3Rpb24ubGFiZWw7XG4gICAgYWN0QnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKCkgPT4geyBhY3Rpb24uZm4oKTsgZGlzbWlzcyhlbCk7IH0pO1xuICAgIHRleHRDb2wuYXBwZW5kQ2hpbGQoYWN0QnRuKTtcbiAgfVxuXG4gIC8vIENsb3NlIGJ1dHRvbiBjb2x1bW5cbiAgY29uc3QgY2xvc2VDb2wgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgT2JqZWN0LmFzc2lnbihjbG9zZUNvbC5zdHlsZSwge1xuICAgIHBhZGRpbmc6ICcwIDEwcHggMCAwJyxcbiAgICBhbGlnblNlbGY6ICdmbGV4LXN0YXJ0JyxcbiAgICBwYWRkaW5nVG9wOiAnOXB4JyxcbiAgfSk7XG5cbiAgY29uc3QgY2xvc2VCdG4gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgY2xvc2VCdG4udHlwZSA9ICdidXR0b24nO1xuICBjbG9zZUJ0bi5zZXRBdHRyaWJ1dGUoJ2FyaWEtbGFiZWwnLCAnRGlzbWlzcycpO1xuICBjbG9zZUJ0bi5pbm5lckhUTUwgPSBgPHN2ZyB2aWV3Qm94PVwiMCAwIDI0IDI0XCIgZmlsbD1cIm5vbmVcIiBzdHJva2U9XCJjdXJyZW50Q29sb3JcIiBzdHJva2Utd2lkdGg9XCIyLjVcIiBzdHJva2UtbGluZWNhcD1cInJvdW5kXCIgc3R5bGU9XCJ3aWR0aDoxNXB4O2hlaWdodDoxNXB4O2Rpc3BsYXk6YmxvY2tcIj48bGluZSB4MT1cIjE4XCIgeTE9XCI2XCIgeDI9XCI2XCIgeTI9XCIxOFwiLz48bGluZSB4MT1cIjZcIiB5MT1cIjZcIiB4Mj1cIjE4XCIgeTI9XCIxOFwiLz48L3N2Zz5gO1xuICBPYmplY3QuYXNzaWduKGNsb3NlQnRuLnN0eWxlLCB7XG4gICAgYmFja2dyb3VuZDogJ25vbmUnLCBib3JkZXI6ICdub25lJyxcbiAgICBjdXJzb3I6ICdwb2ludGVyJywgcGFkZGluZzogJzVweCcsXG4gICAgYm9yZGVyUmFkaXVzOiAnNnB4JyxcbiAgICBjb2xvcjogJyM5NGEzYjgnLFxuICAgIGRpc3BsYXk6ICdmbGV4JywgYWxpZ25JdGVtczogJ2NlbnRlcicsIGp1c3RpZnlDb250ZW50OiAnY2VudGVyJyxcbiAgICB0cmFuc2l0aW9uOiAnY29sb3IgMC4xNXMsIGJhY2tncm91bmQgMC4xNXMnLFxuICB9KTtcbiAgY2xvc2VCdG4uYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsICgpID0+IHtcbiAgICBjbG9zZUJ0bi5zdHlsZS5jb2xvciA9ICcjMGYxNzJhJztcbiAgICBjbG9zZUJ0bi5zdHlsZS5iYWNrZ3JvdW5kID0gJ3JnYmEoMCwwLDAsMC4wNiknO1xuICB9KTtcbiAgY2xvc2VCdG4uYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsICgpID0+IHtcbiAgICBjbG9zZUJ0bi5zdHlsZS5jb2xvciA9ICcjOTRhM2I4JztcbiAgICBjbG9zZUJ0bi5zdHlsZS5iYWNrZ3JvdW5kID0gJ25vbmUnO1xuICB9KTtcbiAgY2xvc2VCdG4uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCAoKSA9PiBkaXNtaXNzKGVsKSk7XG5cbiAgY2xvc2VDb2wuYXBwZW5kQ2hpbGQoY2xvc2VCdG4pO1xuXG4gIC8vIFByb2dyZXNzIGJhclxuICBjb25zdCBiYXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgT2JqZWN0LmFzc2lnbihiYXIuc3R5bGUsIHtcbiAgICBwb3NpdGlvbjogJ2Fic29sdXRlJyxcbiAgICBib3R0b206ICcwJywgbGVmdDogJzAnLCByaWdodDogJzAnLFxuICAgIGhlaWdodDogJzNweCcsXG4gICAgYmFja2dyb3VuZDogY2ZnLmJhcixcbiAgICB0cmFuc2Zvcm1PcmlnaW46ICdsZWZ0JyxcbiAgICBib3JkZXJSYWRpdXM6ICcwIDAgMTRweCAxNHB4JyxcbiAgICB0cmFuc2l0aW9uOiBgdHJhbnNmb3JtICR7ZHVyYXRpb259bXMgbGluZWFyYCxcbiAgICB0cmFuc2Zvcm06ICdzY2FsZVgoMSknLFxuICAgIG9wYWNpdHk6ICcwLjU1JyxcbiAgfSk7XG5cbiAgLy8gQXNzZW1ibGVcbiAgZWwuYXBwZW5kQ2hpbGQoc3RyaXBlKTtcbiAgZWwuYXBwZW5kQ2hpbGQoaWNvbkNvbCk7XG4gIGVsLmFwcGVuZENoaWxkKHRleHRDb2wpO1xuICBlbC5hcHBlbmRDaGlsZChjbG9zZUNvbCk7XG4gIGVsLmFwcGVuZENoaWxkKGJhcik7XG5cbiAgcm9vdC5hcHBlbmRDaGlsZChlbCk7XG5cbiAgLy8g4pSA4pSAIEFuaW1hdGUgaW4g4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKCgpID0+IHtcbiAgICAgIGVsLnN0eWxlLm9wYWNpdHkgPSAnMSc7XG4gICAgICBlbC5zdHlsZS50cmFuc2Zvcm0gPSAndHJhbnNsYXRlWCgwKSBzY2FsZSgxKSc7XG4gICAgICAvLyBTdGFydCBwcm9ncmVzcyBiYXIgZHJhaW5cbiAgICAgIGJhci5zdHlsZS50cmFuc2Zvcm0gPSAnc2NhbGVYKDApJztcbiAgICB9KTtcbiAgfSk7XG5cbiAgLy8g4pSA4pSAIEF1dG8tZGlzbWlzcyDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbiAgbGV0IHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiBkaXNtaXNzKGVsKSwgZHVyYXRpb24pO1xuXG4gIC8vIFBhdXNlIG9uIGhvdmVyXG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlZW50ZXInLCAoKSA9PiB7XG4gICAgY2xlYXJUaW1lb3V0KHRpbWVyKTtcbiAgICBiYXIuc3R5bGUudHJhbnNpdGlvbiA9ICdub25lJztcbiAgfSk7XG4gIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCAoKSA9PiB7XG4gICAgYmFyLnN0eWxlLnRyYW5zaXRpb24gPSBgdHJhbnNmb3JtIDEyMDBtcyBsaW5lYXJgO1xuICAgIGJhci5zdHlsZS50cmFuc2Zvcm0gPSAnc2NhbGVYKDApJztcbiAgICB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4gZGlzbWlzcyhlbCksIDEyMDApO1xuICB9KTtcblxuICByZXR1cm4gZWw7XG59XG5cbi8vIOKUgOKUgCBEaXNtaXNzIOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgOKUgFxuZnVuY3Rpb24gZGlzbWlzcyhlbCkge1xuICBpZiAoIWVsIHx8IGVsLl9kaXNtaXNzaW5nKSByZXR1cm47XG4gIGVsLl9kaXNtaXNzaW5nID0gdHJ1ZTtcbiAgZWwuc3R5bGUub3BhY2l0eSA9ICcwJztcbiAgZWwuc3R5bGUudHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVgoMThweCkgc2NhbGUoMC45NSknO1xuICBlbC5zdHlsZS5tYXhIZWlnaHQgPSBlbC5vZmZzZXRIZWlnaHQgKyAncHgnO1xuICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICBlbC5zdHlsZS5tYXhIZWlnaHQgPSAnMCc7XG4gICAgZWwuc3R5bGUubWFyZ2luQm90dG9tID0gJzAnO1xuICAgIGVsLnN0eWxlLm92ZXJmbG93ID0gJ2hpZGRlbic7XG4gICAgZWwuc3R5bGUudHJhbnNpdGlvbiArPSAnLCBtYXgtaGVpZ2h0IDAuMnMgZWFzZSwgbWFyZ2luIDAuMnMgZWFzZSc7XG4gICAgc2V0VGltZW91dCgoKSA9PiBlbC5yZW1vdmUoKSwgMjIwKTtcbiAgfSwgMjYwKTtcbn1cblxuLy8g4pSA4pSAIENvbXBhdCBhbGlhcyAoZHJvcC1pbiBmb3Igb2xkIHNob3dUb2FzdCBjYWxscykg4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSA4pSAXG4vLyBzaG93VG9hc3QobWVzc2FnZSwgdHlwZSkg4oaSIHNob3dBbGVydCh0eXBlLCBtZXNzYWdlKVxuZnVuY3Rpb24gc2hvd1RvYXN0KG1lc3NhZ2UsIHR5cGUgPSAnaW5mbycsIHRpdGxlID0gbnVsbCkge1xuICBzaG93QWxlcnQodHlwZSwgbWVzc2FnZSwgdGl0bGUgPyB7IHRpdGxlIH0gOiB7fSk7XG59XG5cbi8vIOKUgOKUgCBEaXNtaXNzIGFsbCDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIDilIBcbmZ1bmN0aW9uIGRpc21pc3NBbGwoKSB7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5jbXMtYWxlcnQnKS5mb3JFYWNoKGRpc21pc3MpO1xufVxuXG5leHBvcnQgeyBzaG93QWxlcnQsIHNob3dUb2FzdCwgZGlzbWlzc0FsbCB9O1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQWFB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
