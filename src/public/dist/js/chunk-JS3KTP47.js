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
async function apiFetch(endpoint, options = {}) {
  if (!accessToken) {
    try {
      await silentRefresh();
    } catch {
    }
  }
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

export {
  apiFetch,
  login,
  logout,
  clearAccessToken
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vanMvYXBpLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJsZXQgYWNjZXNzVG9rZW4gPSBudWxsO1xubGV0IHJlZnJlc2hQcm9taXNlID0gbnVsbDsgLy8gZGVkdXBsaWNhdGUgY29uY3VycmVudCByZWZyZXNoIGF0dGVtcHRzXG5cbmFzeW5jIGZ1bmN0aW9uIHNpbGVudFJlZnJlc2goKSB7XG4gIC8vIE9ubHkgb25lIHJlZnJlc2ggYXQgYSB0aW1lXG4gIGlmIChyZWZyZXNoUHJvbWlzZSkgcmV0dXJuIHJlZnJlc2hQcm9taXNlO1xuXG4gIHJlZnJlc2hQcm9taXNlID0gZmV0Y2goJy9hcGkvdjEvYXV0aC9yZWZyZXNoJywge1xuICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgIGNyZWRlbnRpYWxzOiAnaW5jbHVkZScsXG4gIH0pXG4gICAgLnRoZW4oKHIpID0+IHtcbiAgICAgIGlmICghci5vaykgdGhyb3cgbmV3IEVycm9yKCdyZWZyZXNoX2ZhaWxlZCcpO1xuICAgICAgcmV0dXJuIHIuanNvbigpO1xuICAgIH0pXG4gICAgLnRoZW4oKGRhdGEpID0+IHtcbiAgICAgIGFjY2Vzc1Rva2VuID0gZGF0YS5hY2Nlc3NUb2tlbjtcbiAgICAgIHJldHVybiBhY2Nlc3NUb2tlbjtcbiAgICB9KVxuICAgIC5maW5hbGx5KCgpID0+IHtcbiAgICAgIHJlZnJlc2hQcm9taXNlID0gbnVsbDtcbiAgICB9KTtcblxuICByZXR1cm4gcmVmcmVzaFByb21pc2U7XG59XG5cbmFzeW5jIGZ1bmN0aW9uIGFwaUZldGNoKGVuZHBvaW50LCBvcHRpb25zID0ge30pIHtcbiAgLy8gSWYgd2UgaGF2ZSBubyBhY2Nlc3MgdG9rZW4geWV0LCB0cnkgYSBzaWxlbnQgcmVmcmVzaCBmaXJzdCAoaGFuZGxlcyBwYWdlIHJlbG9hZClcbiAgaWYgKCFhY2Nlc3NUb2tlbikge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBzaWxlbnRSZWZyZXNoKCk7XG4gICAgfSBjYXRjaCB7XG4gICAgICAvLyBObyB2YWxpZCBzZXNzaW9uIOKAlCBsZXQgdGhlIGFjdHVhbCByZXF1ZXN0IGZhaWwgbmF0dXJhbGx5XG4gICAgfVxuICB9XG5cbiAgY29uc3QgbWFrZVJlcXVlc3QgPSBhc3luYyAodG9rZW4pID0+IHtcbiAgICByZXR1cm4gZmV0Y2goYC9hcGkvdjEke2VuZHBvaW50fWAsIHtcbiAgICAgIC4uLm9wdGlvbnMsXG4gICAgICBjcmVkZW50aWFsczogJ2luY2x1ZGUnLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAuLi4odG9rZW4gPyB7IEF1dGhvcml6YXRpb246IGBCZWFyZXIgJHt0b2tlbn1gIH0gOiB7fSksXG4gICAgICAgIC4uLihvcHRpb25zLmhlYWRlcnMgfHwge30pLFxuICAgICAgfSxcbiAgICB9KTtcbiAgfTtcblxuICBsZXQgcmVzID0gYXdhaXQgbWFrZVJlcXVlc3QoYWNjZXNzVG9rZW4pO1xuXG4gIGlmIChyZXMuc3RhdHVzID09PSA0MDEpIHtcbiAgICB0cnkge1xuICAgICAgYXdhaXQgc2lsZW50UmVmcmVzaCgpO1xuICAgICAgcmVzID0gYXdhaXQgbWFrZVJlcXVlc3QoYWNjZXNzVG9rZW4pO1xuICAgIH0gY2F0Y2gge1xuICAgICAgYWNjZXNzVG9rZW4gPSBudWxsO1xuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL2xvZ2luJztcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICByZXR1cm4gcmVzO1xufVxuXG5hc3luYyBmdW5jdGlvbiBsb2dpbihlbWFpbCwgcGFzc3dvcmQpIHtcbiAgY29uc3QgcmVzID0gYXdhaXQgZmV0Y2goJy9hcGkvdjEvYXV0aC9sb2dpbicsIHtcbiAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICBjcmVkZW50aWFsczogJ2luY2x1ZGUnLFxuICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyB9LFxuICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgZW1haWwsIHBhc3N3b3JkIH0pLFxuICB9KTtcblxuICBjb25zdCBkYXRhID0gYXdhaXQgcmVzLmpzb24oKS5jYXRjaCgoKSA9PiAoe30pKTtcbiAgaWYgKHJlcy5vaykge1xuICAgIGFjY2Vzc1Rva2VuID0gZGF0YS5hY2Nlc3NUb2tlbjtcbiAgfVxuXG4gIHJldHVybiB7IHJlcywgZGF0YSB9O1xufVxuXG5hc3luYyBmdW5jdGlvbiBsb2dvdXQoKSB7XG4gIGF3YWl0IGZldGNoKCcvYXBpL3YxL2F1dGgvbG9nb3V0Jywge1xuICAgIG1ldGhvZDogJ0RFTEVURScsXG4gICAgY3JlZGVudGlhbHM6ICdpbmNsdWRlJyxcbiAgfSkuY2F0Y2goKCkgPT4ge30pO1xuXG4gIGFjY2Vzc1Rva2VuID0gbnVsbDtcbiAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL2xvZ2luJztcbn1cblxuZnVuY3Rpb24gc2V0QWNjZXNzVG9rZW4odG9rZW4pIHtcbiAgYWNjZXNzVG9rZW4gPSB0b2tlbjtcbn1cblxuZnVuY3Rpb24gY2xlYXJBY2Nlc3NUb2tlbigpIHtcbiAgYWNjZXNzVG9rZW4gPSBudWxsO1xufVxuXG5leHBvcnQgeyBhcGlGZXRjaCwgbG9naW4sIGxvZ291dCwgc2V0QWNjZXNzVG9rZW4sIGNsZWFyQWNjZXNzVG9rZW4gfTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBQSxJQUFJLGNBQWM7QUFDbEIsSUFBSSxpQkFBaUI7QUFFckIsZUFBZSxnQkFBZ0I7QUFFN0IsTUFBSSxlQUFnQixRQUFPO0FBRTNCLG1CQUFpQixNQUFNLHdCQUF3QjtBQUFBLElBQzdDLFFBQVE7QUFBQSxJQUNSLGFBQWE7QUFBQSxFQUNmLENBQUMsRUFDRSxLQUFLLENBQUMsTUFBTTtBQUNYLFFBQUksQ0FBQyxFQUFFLEdBQUksT0FBTSxJQUFJLE1BQU0sZ0JBQWdCO0FBQzNDLFdBQU8sRUFBRSxLQUFLO0FBQUEsRUFDaEIsQ0FBQyxFQUNBLEtBQUssQ0FBQyxTQUFTO0FBQ2Qsa0JBQWMsS0FBSztBQUNuQixXQUFPO0FBQUEsRUFDVCxDQUFDLEVBQ0EsUUFBUSxNQUFNO0FBQ2IscUJBQWlCO0FBQUEsRUFDbkIsQ0FBQztBQUVILFNBQU87QUFDVDtBQUVBLGVBQWUsU0FBUyxVQUFVLFVBQVUsQ0FBQyxHQUFHO0FBRTlDLE1BQUksQ0FBQyxhQUFhO0FBQ2hCLFFBQUk7QUFDRixZQUFNLGNBQWM7QUFBQSxJQUN0QixRQUFRO0FBQUEsSUFFUjtBQUFBLEVBQ0Y7QUFFQSxRQUFNLGNBQWMsT0FBTyxVQUFVO0FBQ25DLFdBQU8sTUFBTSxVQUFVLFFBQVEsSUFBSTtBQUFBLE1BQ2pDLEdBQUc7QUFBQSxNQUNILGFBQWE7QUFBQSxNQUNiLFNBQVM7QUFBQSxRQUNQLGdCQUFnQjtBQUFBLFFBQ2hCLEdBQUksUUFBUSxFQUFFLGVBQWUsVUFBVSxLQUFLLEdBQUcsSUFBSSxDQUFDO0FBQUEsUUFDcEQsR0FBSSxRQUFRLFdBQVcsQ0FBQztBQUFBLE1BQzFCO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUVBLE1BQUksTUFBTSxNQUFNLFlBQVksV0FBVztBQUV2QyxNQUFJLElBQUksV0FBVyxLQUFLO0FBQ3RCLFFBQUk7QUFDRixZQUFNLGNBQWM7QUFDcEIsWUFBTSxNQUFNLFlBQVksV0FBVztBQUFBLElBQ3JDLFFBQVE7QUFDTixvQkFBYztBQUNkLGFBQU8sU0FBUyxPQUFPO0FBQ3ZCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFFQSxTQUFPO0FBQ1Q7QUFFQSxlQUFlLE1BQU0sT0FBTyxVQUFVO0FBQ3BDLFFBQU0sTUFBTSxNQUFNLE1BQU0sc0JBQXNCO0FBQUEsSUFDNUMsUUFBUTtBQUFBLElBQ1IsYUFBYTtBQUFBLElBQ2IsU0FBUyxFQUFFLGdCQUFnQixtQkFBbUI7QUFBQSxJQUM5QyxNQUFNLEtBQUssVUFBVSxFQUFFLE9BQU8sU0FBUyxDQUFDO0FBQUEsRUFDMUMsQ0FBQztBQUVELFFBQU0sT0FBTyxNQUFNLElBQUksS0FBSyxFQUFFLE1BQU0sT0FBTyxDQUFDLEVBQUU7QUFDOUMsTUFBSSxJQUFJLElBQUk7QUFDVixrQkFBYyxLQUFLO0FBQUEsRUFDckI7QUFFQSxTQUFPLEVBQUUsS0FBSyxLQUFLO0FBQ3JCO0FBRUEsZUFBZSxTQUFTO0FBQ3RCLFFBQU0sTUFBTSx1QkFBdUI7QUFBQSxJQUNqQyxRQUFRO0FBQUEsSUFDUixhQUFhO0FBQUEsRUFDZixDQUFDLEVBQUUsTUFBTSxNQUFNO0FBQUEsRUFBQyxDQUFDO0FBRWpCLGdCQUFjO0FBQ2QsU0FBTyxTQUFTLE9BQU87QUFDekI7QUFNQSxTQUFTLG1CQUFtQjtBQUMxQixnQkFBYztBQUNoQjsiLAogICJuYW1lcyI6IFtdCn0K
