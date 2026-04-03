// src/public/js/api.js
var accessToken = null;
var refreshPromise = null;
async function silentRefresh() {
  if (refreshPromise) return refreshPromise;
  refreshPromise = fetch("/api/v1/auth/refresh", {
    method: "POST",
    credentials: "include"
  }).then((r) => {
    if (!r.ok) throw new Error("refresh_failed");
    return r.json();
  }).then((data) => {
    accessToken = data.accessToken;
    return accessToken;
  }).finally(() => {
    refreshPromise = null;
  });
  return refreshPromise;
}
try {
  await silentRefresh();
} catch {
}
async function apiFetch(endpoint, options = {}) {
  const makeRequest = async (token) => {
    return fetch(`/api/v1${endpoint}`, {
      ...options,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...token ? { Authorization: `Bearer ${token}` } : {},
        ...options.headers || {}
      }
    });
  };
  let res = await makeRequest(accessToken);
  if (res.status === 401) {
    try {
      await silentRefresh();
      res = await makeRequest(accessToken);
    } catch {
      accessToken = null;
      window.location.href = "/login";
      return;
    }
  }
  return res;
}
async function login(email, password) {
  const res = await fetch("/api/v1/auth/login", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json().catch(() => ({}));
  if (res.ok) {
    accessToken = data.accessToken;
  }
  return { res, data };
}
async function logout() {
  await fetch("/api/v1/auth/logout", {
    method: "DELETE",
    credentials: "include"
  }).catch(() => {
  });
  accessToken = null;
  window.location.href = "/login";
}
function clearAccessToken() {
  accessToken = null;
}
function getAccessToken() {
  return accessToken;
}

export {
  apiFetch,
  login,
  logout,
  clearAccessToken,
  getAccessToken
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vanMvYXBpLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJsZXQgYWNjZXNzVG9rZW4gPSBudWxsO1xubGV0IHJlZnJlc2hQcm9taXNlID0gbnVsbDsgLy8gZGVkdXBsaWNhdGUgY29uY3VycmVudCByZWZyZXNoIGF0dGVtcHRzXG5cbmFzeW5jIGZ1bmN0aW9uIHNpbGVudFJlZnJlc2goKSB7XG4gIC8vIE9ubHkgb25lIHJlZnJlc2ggYXQgYSB0aW1lXG4gIGlmIChyZWZyZXNoUHJvbWlzZSkgcmV0dXJuIHJlZnJlc2hQcm9taXNlO1xuXG4gIHJlZnJlc2hQcm9taXNlID0gZmV0Y2goJy9hcGkvdjEvYXV0aC9yZWZyZXNoJywge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGNyZWRlbnRpYWxzOiAnaW5jbHVkZScsXG4gIH0pXG4gICAgLnRoZW4oKHIpID0+IHtcbiAgICAgIGlmICghci5vaykgdGhyb3cgbmV3IEVycm9yKCdyZWZyZXNoX2ZhaWxlZCcpO1xuICAgICAgcmV0dXJuIHIuanNvbigpO1xuICAgIH0pXG4gICAgLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgIGFjY2Vzc1Rva2VuID0gZGF0YS5hY2Nlc3NUb2tlbjtcbiAgICAgIHJldHVybiBhY2Nlc3NUb2tlbjtcbiAgICB9KVxuICAgIC5maW5hbGx5KCgpID0+IHtcbiAgICAgIHJlZnJlc2hQcm9taXNlID0gbnVsbDtcbiAgICB9KTtcblxuICByZXR1cm4gcmVmcmVzaFByb21pc2U7XG59XG5cbi8vIEVhZ2VybHkgbG9hZCBhY2Nlc3MgdG9rZW4gb25jZSBwZXIgcGFnZSBsb2FkLlxuLy8gSWYgdGhlcmUgaXMgbm8gYWN0aXZlIHNlc3Npb24sIGlnbm9yZSB0aGUgZmFpbHVyZS5cbnRyeSB7XG4gIGF3YWl0IHNpbGVudFJlZnJlc2goKTtcbn0gY2F0Y2gge1xuICAvLyBubyBzZXNzaW9uIHlldFxufVxuXG5hc3luYyBmdW5jdGlvbiBhcGlGZXRjaChlbmRwb2ludCwgb3B0aW9ucyA9IHt9KSB7XG4gIGNvbnN0IG1ha2VSZXF1ZXN0ID0gYXN5bmMgKHRva2VuKSA9PiB7XG4gICAgcmV0dXJuIGZldGNoKGAvYXBpL3YxJHtlbmRwb2ludH1gLCB7XG4gICAgICAuLi5vcHRpb25zLFxuICAgICAgY3JlZGVudGlhbHM6ICdpbmNsdWRlJyxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgLi4uKHRva2VuID8geyBBdXRob3JpemF0aW9uOiBgQmVhcmVyICR7dG9rZW59YCB9IDoge30pLFxuICAgICAgICAuLi4ob3B0aW9ucy5oZWFkZXJzIHx8IHt9KSxcbiAgICAgIH0sXG4gICAgfSk7XG4gIH07XG5cbiAgbGV0IHJlcyA9IGF3YWl0IG1ha2VSZXF1ZXN0KGFjY2Vzc1Rva2VuKTtcblxuICBpZiAocmVzLnN0YXR1cyA9PT0gNDAxKSB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IHNpbGVudFJlZnJlc2goKTtcbiAgICAgIHJlcyA9IGF3YWl0IG1ha2VSZXF1ZXN0KGFjY2Vzc1Rva2VuKTtcbiAgICB9IGNhdGNoIHtcbiAgICAgIGFjY2Vzc1Rva2VuID0gbnVsbDtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9sb2dpbic7XG4gICAgICByZXR1cm47XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIHJlcztcbn1cblxuYXN5bmMgZnVuY3Rpb24gbG9naW4oZW1haWwsIHBhc3N3b3JkKSB7XG4gIGNvbnN0IHJlcyA9IGF3YWl0IGZldGNoKCcvYXBpL3YxL2F1dGgvbG9naW4nLCB7XG4gICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgY3JlZGVudGlhbHM6ICdpbmNsdWRlJyxcbiAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicgfSxcbiAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGVtYWlsLCBwYXNzd29yZCB9KSxcbiAgfSk7XG5cbiAgY29uc3QgZGF0YSA9IGF3YWl0IHJlcy5qc29uKCkuY2F0Y2goKCkgPT4gKHt9KSk7XG4gIGlmIChyZXMub2spIHtcbiAgICBhY2Nlc3NUb2tlbiA9IGRhdGEuYWNjZXNzVG9rZW47XG4gIH1cblxuICByZXR1cm4geyByZXMsIGRhdGEgfTtcbn1cblxuYXN5bmMgZnVuY3Rpb24gbG9nb3V0KCkge1xuICBhd2FpdCBmZXRjaCgnL2FwaS92MS9hdXRoL2xvZ291dCcsIHtcbiAgICBtZXRob2Q6ICdERUxFVEUnLFxuICAgIGNyZWRlbnRpYWxzOiAnaW5jbHVkZScsXG4gIH0pLmNhdGNoKCgpID0+IHt9KTtcblxuICBhY2Nlc3NUb2tlbiA9IG51bGw7XG4gIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9sb2dpbic7XG59XG5cbmZ1bmN0aW9uIHNldEFjY2Vzc1Rva2VuKHRva2VuKSB7XG4gIGFjY2Vzc1Rva2VuID0gdG9rZW47XG59XG5cbmZ1bmN0aW9uIGNsZWFyQWNjZXNzVG9rZW4oKSB7XG4gIGFjY2Vzc1Rva2VuID0gbnVsbDtcbn1cblxuZnVuY3Rpb24gZ2V0QWNjZXNzVG9rZW4oKSB7XG4gIHJldHVybiBhY2Nlc3NUb2tlbjtcbn1cblxuZXhwb3J0IHsgYXBpRmV0Y2gsIGxvZ2luLCBsb2dvdXQsIHNldEFjY2Vzc1Rva2VuLCBjbGVhckFjY2Vzc1Rva2VuLCBnZXRBY2Nlc3NUb2tlbiB9O1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFBLElBQUksY0FBYztBQUNsQixJQUFJLGlCQUFpQjtBQUVyQixlQUFlLGdCQUFnQjtBQUU3QixNQUFJLGVBQWdCLFFBQU87QUFFM0IsbUJBQWlCLE1BQU0sd0JBQXdCO0FBQUEsSUFDN0MsUUFBUTtBQUFBLElBQ1IsYUFBYTtBQUFBLEVBQ2YsQ0FBQyxFQUNFLEtBQUssQ0FBQyxNQUFNO0FBQ1gsUUFBSSxDQUFDLEVBQUUsR0FBSSxPQUFNLElBQUksTUFBTSxnQkFBZ0I7QUFDM0MsV0FBTyxFQUFFLEtBQUs7QUFBQSxFQUNoQixDQUFDLEVBQ0EsS0FBSyxDQUFDLFNBQVM7QUFDZCxrQkFBYyxLQUFLO0FBQ25CLFdBQU87QUFBQSxFQUNULENBQUMsRUFDQSxRQUFRLE1BQU07QUFDYixxQkFBaUI7QUFBQSxFQUNuQixDQUFDO0FBRUgsU0FBTztBQUNUO0FBSUEsSUFBSTtBQUNGLFFBQU0sY0FBYztBQUN0QixRQUFRO0FBRVI7QUFFQSxlQUFlLFNBQVMsVUFBVSxVQUFVLENBQUMsR0FBRztBQUM5QyxRQUFNLGNBQWMsT0FBTyxVQUFVO0FBQ25DLFdBQU8sTUFBTSxVQUFVLFFBQVEsSUFBSTtBQUFBLE1BQ2pDLEdBQUc7QUFBQSxNQUNILGFBQWE7QUFBQSxNQUNiLFNBQVM7QUFBQSxRQUNQLGdCQUFnQjtBQUFBLFFBQ2hCLEdBQUksUUFBUSxFQUFFLGVBQWUsVUFBVSxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQUEsUUFDcEQsR0FBSSxRQUFRLFdBQVcsQ0FBQztBQUFBLE1BQzFCO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUVBLE1BQUksTUFBTSxNQUFNLFlBQVksV0FBVztBQUV2QyxNQUFJLElBQUksV0FBVyxLQUFLO0FBQ3RCLFFBQUk7QUFDRixZQUFNLGNBQWM7QUFDcEIsWUFBTSxNQUFNLFlBQVksV0FBVztBQUFBLElBQ3JDLFFBQVE7QUFDTixvQkFBYztBQUNkLGFBQU8sU0FBUyxPQUFPO0FBQ3ZCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFFQSxTQUFPO0FBQ1Q7QUFFQSxlQUFlLE1BQU0sT0FBTyxVQUFVO0FBQ3BDLFFBQU0sTUFBTSxNQUFNLE1BQU0sc0JBQXNCO0FBQUEsSUFDNUMsUUFBUTtBQUFBLElBQ1IsYUFBYTtBQUFBLElBQ2IsU0FBUyxFQUFFLGdCQUFnQixtQkFBbUI7QUFBQSxJQUM5QyxNQUFNLEtBQUssVUFBVSxFQUFFLE9BQU8sU0FBUyxDQUFDO0FBQUEsRUFDMUMsQ0FBQztBQUVELFFBQU0sT0FBTyxNQUFNLElBQUksS0FBSyxFQUFFLE1BQU0sT0FBTyxDQUFDLEVBQUU7QUFDOUMsTUFBSSxJQUFJLElBQUk7QUFDVixrQkFBYyxLQUFLO0FBQUEsRUFDckI7QUFFQSxTQUFPLEVBQUUsS0FBSyxLQUFLO0FBQ3JCO0FBRUEsZUFBZSxTQUFTO0FBQ3RCLFFBQU0sTUFBTSx1QkFBdUI7QUFBQSxJQUNqQyxRQUFRO0FBQUEsSUFDUixhQUFhO0FBQUEsRUFDZixDQUFDLEVBQUUsTUFBTSxNQUFNO0FBQUEsRUFBQyxDQUFDO0FBRWpCLGdCQUFjO0FBQ2QsU0FBTyxTQUFTLE9BQU87QUFDekI7QUFNQSxTQUFTLG1CQUFtQjtBQUMxQixnQkFBYztBQUNoQjtBQUVBLFNBQVMsaUJBQWlCO0FBQ3hCLFNBQU87QUFDVDsiLAogICJuYW1lcyI6IFtdCn0K
