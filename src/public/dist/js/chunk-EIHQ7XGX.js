import {
  showAlert
} from "./chunk-J2EEUTLK.js";
import {
  apiFetch,
  clearAccessToken
} from "./chunk-JS3KTP47.js";

// src/public/js/auth.js
async function getMe() {
  const res = await apiFetch("/auth/me", { method: "GET" });
  if (!res) return null;
  if (!res.ok) return null;
  const data = await res.json().catch(() => null);
  return data;
}
function setUserUI(me) {
  if (!me) return;
  const u = me?.data?.user || me?.user || me;
  const name = u?.name || "User";
  const email = u?.email || "";
  const role = u?.role || "employee";
  document.querySelectorAll("[data-user-name]").forEach((el) => el.textContent = name);
  document.querySelectorAll("[data-user-email]").forEach((el) => el.textContent = email);
  document.querySelectorAll("[data-user-role]").forEach((el) => {
    el.textContent = role;
    el.className = el.className.replace(/badge-\w+/g, "");
    el.classList.add("badge", role === "admin" ? "badge-red" : role === "mini-admin" ? "badge-amber" : "badge-blue");
  });
  const initials = name.split(" ").filter(Boolean).slice(0, 2).map((x) => x[0]?.toUpperCase()).join("");
  const photo = u?.photo || "";
  document.querySelectorAll("[data-user-avatar],[data-user-avatar2]").forEach((el) => {
    if (photo) {
      el.innerHTML = `<img src="${photo}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">`;
    } else {
      el.textContent = initials || "U";
    }
  });
  document.querySelectorAll("[data-admin-only]").forEach((el) => {
    el.classList.toggle("hidden", role !== "admin");
  });
}
async function requireAuth({ allowRoles = null, redirectTo = "/login" } = {}) {
  try {
    const me = await getMe();
    if (!me) {
      clearAccessToken();
      window.location.href = redirectTo;
      return null;
    }
    setUserUI(me);
    const role = me?.data?.user?.role || me?.user?.role || me?.role || null;
    if (allowRoles && role && !allowRoles.includes(role)) {
      showAlert("error", "You do not have permission to view this page.", { title: "Access denied" });
      window.location.href = "/dashboard";
      return null;
    }
    return me;
  } catch {
    clearAccessToken();
    window.location.href = redirectTo;
    return null;
  }
}

export {
  requireAuth
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vanMvYXV0aC5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiaW1wb3J0IHsgYXBpRmV0Y2gsIGNsZWFyQWNjZXNzVG9rZW4sIGxvZ291dCB9IGZyb20gJy4vYXBpLmpzJztcbmltcG9ydCB7IHNob3dBbGVydCB9IGZyb20gJy4vYWxlcnQuanMnO1xuXG5hc3luYyBmdW5jdGlvbiBnZXRNZSgpIHtcbiAgY29uc3QgcmVzID0gYXdhaXQgYXBpRmV0Y2goJy9hdXRoL21lJywgeyBtZXRob2Q6ICdHRVQnIH0pO1xuICBpZiAoIXJlcykgcmV0dXJuIG51bGw7XG4gIGlmICghcmVzLm9rKSByZXR1cm4gbnVsbDtcbiAgY29uc3QgZGF0YSA9IGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gbnVsbCk7XG4gIHJldHVybiBkYXRhO1xufVxuXG5mdW5jdGlvbiBzZXRVc2VyVUkobWUpIHtcbiAgaWYgKCFtZSkgcmV0dXJuO1xuICBjb25zdCB1ID0gbWU/LmRhdGE/LnVzZXIgfHwgbWU/LnVzZXIgfHwgbWU7XG4gIGNvbnN0IG5hbWUgID0gdT8ubmFtZSAgfHwgJ1VzZXInO1xuICBjb25zdCBlbWFpbCA9IHU/LmVtYWlsIHx8ICcnO1xuICBjb25zdCByb2xlICA9IHU/LnJvbGUgIHx8ICdlbXBsb3llZSc7XG5cbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtdXNlci1uYW1lXScpLmZvckVhY2goZWwgPT4gZWwudGV4dENvbnRlbnQgPSBuYW1lKTtcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtdXNlci1lbWFpbF0nKS5mb3JFYWNoKGVsID0+IGVsLnRleHRDb250ZW50ID0gZW1haWwpO1xuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS11c2VyLXJvbGVdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgZWwudGV4dENvbnRlbnQgPSByb2xlO1xuICAgIGVsLmNsYXNzTmFtZSA9IGVsLmNsYXNzTmFtZS5yZXBsYWNlKC9iYWRnZS1cXHcrL2csICcnKTtcbiAgICBlbC5jbGFzc0xpc3QuYWRkKCdiYWRnZScsIHJvbGUgPT09ICdhZG1pbicgPyAnYmFkZ2UtcmVkJyA6IHJvbGUgPT09ICdtaW5pLWFkbWluJyA/ICdiYWRnZS1hbWJlcicgOiAnYmFkZ2UtYmx1ZScpO1xuICB9KTtcblxuICBjb25zdCBpbml0aWFscyA9IG5hbWUuc3BsaXQoJyAnKS5maWx0ZXIoQm9vbGVhbikuc2xpY2UoMCwyKS5tYXAoeD0+eFswXT8udG9VcHBlckNhc2UoKSkuam9pbignJyk7XG4gIGNvbnN0IHBob3RvID0gdT8ucGhvdG8gfHwgJyc7XG4gIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJ1tkYXRhLXVzZXItYXZhdGFyXSxbZGF0YS11c2VyLWF2YXRhcjJdJykuZm9yRWFjaChlbCA9PiB7XG4gICAgaWYgKHBob3RvKSB7XG4gICAgICBlbC5pbm5lckhUTUwgPSBgPGltZyBzcmM9XCIke3Bob3RvfVwiIHN0eWxlPVwid2lkdGg6MTAwJTtoZWlnaHQ6MTAwJTtvYmplY3QtZml0OmNvdmVyO2JvcmRlci1yYWRpdXM6aW5oZXJpdDtcIj5gO1xuICAgIH0gZWxzZSB7XG4gICAgICBlbC50ZXh0Q29udGVudCA9IGluaXRpYWxzIHx8ICdVJztcbiAgICB9XG4gIH0pO1xuXG4gIC8vIEFkbWluIG5hdlxuICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCdbZGF0YS1hZG1pbi1vbmx5XScpLmZvckVhY2goZWwgPT4ge1xuICAgIGVsLmNsYXNzTGlzdC50b2dnbGUoJ2hpZGRlbicsIHJvbGUgIT09ICdhZG1pbicpO1xuICB9KTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gcmVxdWlyZUF1dGgoeyBhbGxvd1JvbGVzID0gbnVsbCwgcmVkaXJlY3RUbyA9ICcvbG9naW4nIH0gPSB7fSkge1xuICB0cnkge1xuICAgIGNvbnN0IG1lID0gYXdhaXQgZ2V0TWUoKTtcbiAgICBpZiAoIW1lKSB7XG4gICAgICBjbGVhckFjY2Vzc1Rva2VuKCk7XG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHJlZGlyZWN0VG87XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgc2V0VXNlclVJKG1lKTtcbiAgICBjb25zdCByb2xlID0gbWU/LmRhdGE/LnVzZXI/LnJvbGUgfHwgbWU/LnVzZXI/LnJvbGUgfHwgbWU/LnJvbGUgfHwgbnVsbDtcbiAgICBpZiAoYWxsb3dSb2xlcyAmJiByb2xlICYmICFhbGxvd1JvbGVzLmluY2x1ZGVzKHJvbGUpKSB7XG4gICAgICBzaG93QWxlcnQoJ2Vycm9yJywgJ1lvdSBkbyBub3QgaGF2ZSBwZXJtaXNzaW9uIHRvIHZpZXcgdGhpcyBwYWdlLicsIHsgdGl0bGU6ICdBY2Nlc3MgZGVuaWVkJyB9KTtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9kYXNoYm9hcmQnO1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiBtZTtcbiAgfSBjYXRjaCB7XG4gICAgY2xlYXJBY2Nlc3NUb2tlbigpO1xuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gcmVkaXJlY3RUbztcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5mdW5jdGlvbiB3aXJlR2xvYmFsQXV0aFVJKG1lKSB7XG4gIC8vIFNpZ24tb3V0IGJ1dHRvbnMgKG11bHRpcGxlIG1heSBleGlzdDogc2lkZWJhciArIHRvcGJhciBkcm9wZG93bilcbiAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnW2RhdGEtc2lnbi1vdXRdLFtkYXRhLXNpZ24tb3V0Ml0nKS5mb3JFYWNoKGJ0biA9PiB7XG4gICAgYnRuLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgKGUpID0+IHsgZS5wcmV2ZW50RGVmYXVsdCgpOyBsb2dvdXQoKTsgfSk7XG4gIH0pO1xuICAvLyBQb3B1bGF0ZSBkcm9wZG93biBoZWFkZXIgaWYgbWUgcGFzc2VkIGluXG4gIGlmIChtZSkgc2V0VXNlclVJKG1lKTtcbn1cblxuZXhwb3J0IHsgcmVxdWlyZUF1dGgs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
