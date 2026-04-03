import {
  showAlert
} from "./chunk-J2EEUTLK.js";

// src/public/js/components/modal.js
function getFocusable(root) {
  return [...root.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter(
    (el) => !el.classList.contains("hidden") && !el.hasAttribute("aria-hidden")
  );
}
function openModal({ title, body, confirmText = "Confirm", cancelText = "Cancel", danger = false, onConfirm } = {}) {
  const backdrop = document.createElement("div");
  backdrop.className = "modal-backdrop";
  backdrop.setAttribute("role", "dialog");
  backdrop.setAttribute("aria-modal", "true");
  const modal = document.createElement("div");
  modal.className = "modal";
  const header = document.createElement("header");
  const h = document.createElement("h3");
  h.textContent = title || "Confirm";
  const close = document.createElement("button");
  close.className = "icon-btn";
  close.type = "button";
  close.innerHTML = '<i data-lucide="x"></i>';
  close.setAttribute("aria-label", "Close");
  header.appendChild(h);
  header.appendChild(close);
  const b = document.createElement("div");
  b.className = "body";
  if (typeof body === "string") {
    b.textContent = body;
  } else if (body instanceof Node) {
    b.appendChild(body);
  } else {
    b.textContent = "Are you sure?";
  }
  const footer = document.createElement("footer");
  const cancel = document.createElement("button");
  cancel.className = "btn btn-ghost";
  cancel.type = "button";
  cancel.textContent = cancelText;
  const confirm = document.createElement("button");
  confirm.className = danger ? "btn btn-danger" : "btn btn-primary";
  confirm.type = "button";
  confirm.textContent = confirmText;
  footer.appendChild(cancel);
  footer.appendChild(confirm);
  modal.appendChild(header);
  modal.appendChild(b);
  modal.appendChild(footer);
  backdrop.appendChild(modal);
  document.body.appendChild(backdrop);
  if (window.lucide?.createIcons) window.lucide.createIcons({ attrs: { "stroke-width": 1.8 } });
  const prevActive = document.activeElement;
  function closeModal() {
    backdrop.classList.remove("is-in");
    window.setTimeout(() => backdrop.remove(), 220);
    if (prevActive && prevActive.focus) prevActive.focus();
    document.removeEventListener("keydown", onKeyDown);
  }
  function onKeyDown(e) {
    if (e.key === "Escape") closeModal();
    if (e.key !== "Tab") return;
    const focusables = getFocusable(backdrop);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const isShift = e.shiftKey;
    if (!isShift && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
    if (isShift && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    }
  }
  document.addEventListener("keydown", onKeyDown);
  backdrop.addEventListener("click", (e) => {
    if (e.target === backdrop) closeModal();
  });
  close.addEventListener("click", closeModal);
  cancel.addEventListener("click", closeModal);
  confirm.addEventListener("click", async () => {
    confirm.disabled = true;
    confirm.classList.add("btn--loading");
    try {
      await onConfirm?.();
      closeModal();
    } catch (err) {
      confirm.disabled = false;
      confirm.classList.remove("btn--loading");
      showAlert("error", err?.message || "فشل الإجراء", { title: "فشل الإجراء" });
    }
  });
  requestAnimationFrame(() => {
    backdrop.classList.add("is-in");
    const focusables = getFocusable(backdrop);
    (focusables[0] || confirm).focus();
  });
  return { close: closeModal };
}

export {
  openModal
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vanMvY29tcG9uZW50cy9tb2RhbC5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgc2hvd0FsZXJ0IH0gZnJvbSAnLi4vYWxlcnQuanMnO1xuXG5mdW5jdGlvbiBnZXRGb2N1c2FibGUocm9vdCkge1xuICByZXR1cm4gWy4uLnJvb3QucXVlcnlTZWxlY3RvckFsbCgnYVtocmVmXSwgYnV0dG9uOm5vdChbZGlzYWJsZWRdKSwgaW5wdXQsIHNlbGVjdCwgdGV4dGFyZWEsIFt0YWJpbmRleF06bm90KFt0YWJpbmRleD1cIi0xXCJdKScpXS5maWx0ZXIoXG4gICAgKGVsKSA9PiAhZWwuY2xhc3NMaXN0LmNvbnRhaW5zKCdoaWRkZW4nKSAmJiAhZWwuaGFzQXR0cmlidXRlKCdhcmlhLWhpZGRlbicpLFxuICApO1xufVxuXG5mdW5jdGlvbiBvcGVuTW9kYWwoeyB0aXRsZSwgYm9keSwgY29uZmlybVRleHQgPSAnQ29uZmlybScsIGNhbmNlbFRleHQgPSAnQ2FuY2VsJywgZGFuZ2VyID0gZmFsc2UsIG9uQ29uZmlybSB9ID0ge30pIHtcbiAgY29uc3QgYmFja2Ryb3AgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgYmFja2Ryb3AuY2xhc3NOYW1lID0gJ21vZGFsLWJhY2tkcm9wJztcbiAgYmFja2Ryb3Auc2V0QXR0cmlidXRlKCdyb2xlJywgJ2RpYWxvZycpO1xuICBiYWNrZHJvcC5zZXRBdHRyaWJ1dGUoJ2FyaWEtbW9kYWwnLCAndHJ1ZScpO1xuXG4gIGNvbnN0IG1vZGFsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIG1vZGFsLmNsYXNzTmFtZSA9ICdtb2RhbCc7XG5cbiAgY29uc3QgaGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaGVhZGVyJyk7XG4gIGNvbnN0IGggPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMycpO1xuICBoLnRleHRDb250ZW50ID0gdGl0bGUgfHwgJ0NvbmZpcm0nO1xuICBjb25zdCBjbG9zZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2J1dHRvbicpO1xuICBjbG9zZS5jbGFzc05hbWUgPSAnaWNvbi1idG4nO1xuICBjbG9zZS50eXBlID0gJ2J1dHRvbic7XG4gIGNsb3NlLmlubmVySFRNTCA9ICc8aSBkYXRhLWx1Y2lkZT1cInhcIj48L2k+JztcbiAgY2xvc2Uuc2V0QXR0cmlidXRlKCdhcmlhLWxhYmVsJywgJ0Nsb3NlJyk7XG4gIGhlYWRlci5hcHBlbmRDaGlsZChoKTtcbiAgaGVhZGVyLmFwcGVuZENoaWxkKGNsb3NlKTtcblxuICBjb25zdCBiID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gIGIuY2xhc3NOYW1lID0gJ2JvZHknO1xuICBpZiAodHlwZW9mIGJvZHkgPT09ICdzdHJpbmcnKSB7XG4gICAgYi50ZXh0Q29udGVudCA9IGJvZHk7XG4gIH0gZWxzZSBpZiAoYm9keSBpbnN0YW5jZW9mIE5vZGUpIHtcbiAgICBiLmFwcGVuZENoaWxkKGJvZHkpO1xuICB9IGVsc2Uge1xuICAgIGIudGV4dENvbnRlbnQgPSAnQXJlIHlvdSBzdXJlPyc7XG4gIH1cblxuICBjb25zdCBmb290ZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdmb290ZXInKTtcbiAgY29uc3QgY2FuY2VsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnYnV0dG9uJyk7XG4gIGNhbmNlbC5jbGFzc05hbWUgPSAnYnRuIGJ0bi1naG9zdCc7XG4gIGNhbmNlbC50eXBlID0gJ2J1dHRvbic7XG4gIGNhbmNlbC50ZXh0Q29udGVudCA9IGNhbmNlbFRleHQ7XG4gIGNvbnN0IGNvbmZpcm0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdidXR0b24nKTtcbiAgY29uZmlybS5jbGFzc05hbWUgPSBkYW5nZXIgPyAnYnRuIGJ0bi1kYW5nZXInIDogJ2J0biBidG4tcHJpbWFyeSc7XG4gIGNvbmZpcm0udHlwZSA9ICdidXR0b24nO1xuICBjb25maXJtLnRleHRDb250ZW50ID0gY29uZmlybVRleHQ7XG4gIGZvb3Rlci5hcHBlbmRDaGlsZChjYW5jZWwpO1xuICBmb290ZXIuYXBwZW5kQ2hpbGQoY29uZmlybSk7XG5cbiAgbW9kYWwuYXBwZW5kQ2hpbGQoaGVhZGVyKTtcbiAgbW9kYWwuYXBwZW5kQ2hpbGQoYik7XG4gIG1vZGFsLmFwcGVuZENoaWxkKGZvb3Rlcik7XG4gIGJhY2tkcm9wLmFwcGVuZENoaWxkKG1vZGFsKTtcbiAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChiYWNrZHJvcCk7XG5cbiAgaWYgKHdpbmRvdy5sdWNpZGU/LmNyZWF0ZUljb25zKSB3aW5kb3cubHVjaWRlLmNyZWF0ZUljb25zKHsgYXR0cnM6IHsgJ3N0cm9rZS13aWR0aCc6IDEuOCB9IH0pO1xuXG4gIGNvbnN0IHByZXZBY3RpdmUgPSBkb2N1bWVudC5hY3RpdmVFbGVtZW50O1xuXG4gIGZ1bmN0aW9uIGNsb3NlTW9kYWwoKSB7XG4gICAgYmFja2Ryb3AuY2xhc3NMaXN0LnJlbW92ZSgnaXMtaW4nKTtcbiAgICB3aW5kb3cuc2V0VGltZW91dCgoKSA9PiBiYWNrZHJvcC5yZW1vdmUoKSwgMjIwKTtcbiAgICBpZiAocHJldkFjdGl2ZSAmJiBwcmV2QWN0aXZlLmZvY3VzKSBwcmV2QWN0aXZlLmZvY3VzKCk7XG4gICAgZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIG9uS2V5RG93bik7XG4gIH1cblxuICBmdW5jdGlvbiBvbktleURvd24oZSkge1xuICAgIGlmIChlLmtleSA9PT0gJ0VzY2FwZScpIGNsb3NlTW9kYWwoKTtcbiAgICBpZiAoZS5rZXkgIT09ICdUYWInKSByZXR1cm47XG4gICAgY29uc3QgZm9jdXNhYmxlcyA9IGdldEZvY3VzYWJsZShiYWNrZHJvcCk7XG4gICAgaWYgKCFmb2N1c2FibGVzLmxlbmd0aCkgcmV0dXJuO1xuICAgIGNvbnN0IGZpcnN0ID0gZm9jdXNhYmxlc1swXTtcbiAgICBjb25zdCBsYXN0ID0gZm9jdXNhYmxlc1tmb2N1c2FibGVzLmxlbmd0aCAtIDFdO1xuICAgIGNvbnN0IGlzU2hpZnQgPSBlLnNoaWZ0S2V5O1xuICAgIGlmICghaXNTaGlmdCAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ID09PSBsYXN0KSB7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBmaXJzdC5mb2N1cygpO1xuICAgIH1cbiAgICBpZiAoaXNTaGlmdCAmJiBkb2N1bWVudC5hY3RpdmVFbGVtZW50ID09PSBmaXJzdCkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgbGFzdC5mb2N1cygpO1xuICAgIH1cbiAgfVxuXG4gIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCBvbktleURvd24pO1xuICBiYWNrZHJvcC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIChlKSA9PiB7XG4gICAgaWYgKGUudGFyZ2V0ID09PSBiYWNrZHJvcCkgY2xvc2VNb2RhbCgpO1xuICB9KTtcbiAgY2xvc2UuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbG9zZU1vZGFsKTtcbiAgY2FuY2VsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xvc2VNb2RhbCk7XG4gIGNvbmZpcm0uYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBhc3luYyAoKSA9PiB7XG4gICAgY29uZmlybS5kaXNhYmxlZCA9IHRydWU7XG4gICAgY29uZmlybS5jbGFzc0xpc3QuYWRkKCdidG4tLWxvYWRpbmcnKTtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgb25Db25maXJtPy4oKTtcbiAgICAgIGNsb3NlTW9kYWwoKTtcbiAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgIGNvbmZpcm0uZGlzYWJsZWQgPSBmYWxzZTtcbiAgICAgIGNvbmZpcm0uY2xhc3NMaXN0LnJlbW92ZSgnYnRuLS1sb2FkaW5nJyk7XG4gICAgICBzaG93QWxlcnQoJ2Vycm9yJywgZXJyPy5tZXNzYWdlIHx8ICfZgdi02YQg2KfZhNil2KzYsdin2KEnLCB7IHRpdGxlOiAn2YHYtNmEINin2YTYpdis2LHYp9ihJyB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIHJlcXVlc3RBbmltYXRpb25GcmFtZSgoKSA9PiB7XG4gICAgYmFja2Ryb3AuY2xhc3NMaXN0LmFkZCgnaXMtaW4nKTtcbiAgICBjb25zdCBmb2N1c2FibGVzID0gZ2V0Rm9jdXNhYmxlKGJhY2tkcm9wKTtcbiAgICAoZm9jdXNhYmxlc1swXSB8fCBjb25maXJtKS5mb2N1cygpO1xuICB9KTtcblxuICByZXR1cm4geyBjbG9zZTogY2xvc2VNb2RhbCB9O1xufVxuXG5leHBvcnQgeyBvcGVuTW9kYWwgfTtcblxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7QUFFQSxTQUFTLGFBQWEsTUFBTTtBQUMxQixTQUFPLENBQUMsR0FBRyxLQUFLLGlCQUFpQiwyRkFBMkYsQ0FBQyxFQUFFO0FBQUEsSUFDN0gsQ0FBQyxPQUFPLENBQUMsR0FBRyxVQUFVLFNBQVMsUUFBUSxLQUFLLENBQUMsR0FBRyxhQUFhLGFBQWE7QUFBQSxFQUM1RTtBQUNGO0FBRUEsU0FBUyxVQUFVLEVBQUUsT0FBTyxNQUFNLGNBQWMsV0FBVyxhQUFhLFVBQVUsU0FBUyxPQUFPLFVBQVUsSUFBSSxDQUFDLEdBQUc7QUFDbEgsUUFBTSxXQUFXLFNBQVMsY0FBYyxLQUFLO0FBQzdDLFdBQVMsWUFBWTtBQUNyQixXQUFTLGFBQWEsUUFBUSxRQUFRO0FBQ3RDLFdBQVMsYUFBYSxjQUFjLE1BQU07QUFFMUMsUUFBTSxRQUFRLFNBQVMsY0FBYyxLQUFLO0FBQzFDLFFBQU0sWUFBWTtBQUVsQixRQUFNLFNBQVMsU0FBUyxjQUFjLFFBQVE7QUFDOUMsUUFBTSxJQUFJLFNBQVMsY0FBYyxJQUFJO0FBQ3JDLElBQUUsY0FBYyxTQUFTO0FBQ3pCLFFBQU0sUUFBUSxTQUFTLGNBQWMsUUFBUTtBQUM3QyxRQUFNLFlBQVk7QUFDbEIsUUFBTSxPQUFPO0FBQ2IsUUFBTSxZQUFZO0FBQ2xCLFFBQU0sYUFBYSxjQUFjLE9BQU87QUFDeEMsU0FBTyxZQUFZLENBQUM7QUFDcEIsU0FBTyxZ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
