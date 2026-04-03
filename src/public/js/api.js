let accessToken = (() => {
  try {
    return localStorage.getItem('__at__') || null;
  } catch {
    return null;
  }
})();

let refreshPromise = null; // deduplicate concurrent refresh attempts

// ─── Helpers ─────────────────────────────────────────────────────────────────

function decodeJwtExp(token) {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;

    // base64url → base64 → bytes → UTF-8 string
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    const json = new TextDecoder().decode(bytes);

    const { exp } = JSON.parse(json);
    return typeof exp === 'number' ? exp : null;
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const exp = decodeJwtExp(token);
  if (!exp) return true;
  return Date.now() / 1000 >= exp;
}

function shouldRefreshNearExpiry(token, bufferSeconds = 60) {
  const exp = decodeJwtExp(token);
  if (!exp) return false;
  const now = Date.now() / 1000;
  return exp - now <= bufferSeconds;
}

// ─── Internal token setter (keeps sessionStorage in sync) ────────────────────

function _persistToken(token) {
  accessToken = token;
  try {
    if (token) localStorage.setItem('__at__', token);
    else localStorage.removeItem('__at__');
  } catch {
    /*  */
  }
}

// ─── Silent refresh ──────────────────────────────────────────────────────────

async function silentRefresh() {
  // Deduplicate: if a refresh is already in-flight, reuse its promise
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const res = await fetch('/api/v1/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (!res.ok) throw new Error('refresh_failed');

    const data = await res.json();
    _persistToken(data.accessToken); // save to memory + sessionStorage

    return accessToken;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

// ─── Core fetch wrapper ──────────────────────────────────────────────────────

async function apiFetch(endpoint, options = {}, _retry = false) {
  // 1. No token in memory or storage → try to get one from the refresh cookie.
  //    This only runs when the user has NO stored token (e.g. first visit,
  //    logged-out state, or sessionStorage was cleared).
  if (!accessToken && !_retry) {
    try {
      await silentRefresh();
    } catch {
      /* will fail gracefully below with 401 */
    }
  }

  // 2. Token exists but is expired or about to expire → proactive refresh.
  //    "Near expiry" (within 60 s) avoids race conditions on slow networks.
  //    "Already expired" avoids sending a token we know will be rejected.
  if (
    accessToken &&
    !_retry &&
    !refreshPromise &&
    (isTokenExpired(accessToken) || shouldRefreshNearExpiry(accessToken))
  ) {
    try {
      await silentRefresh();
    } catch {
      _persistToken(null);
    }
  }

  const makeRequest = () =>
    fetch(`/api/v1${endpoint}`, {
      ...options,
      credentials: 'include',
      headers: {
        ...(options.headers || {}),
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        'Content-Type': 'application/json',
      },
    });

  let res = await makeRequest();

  // 3. Fallback: unexpected 401 (e.g. token was invalidated server-side).
  //    Try one refresh and one retry before redirecting to login.
  if (res.status === 401 && !_retry) {
    try {
      await silentRefresh();
      return apiFetch(endpoint, options, true);
    } catch {
      _persistToken(null);
      window.location.href = '/login';
      return;
    }
  }

  return res;
}

// ─── Auth helpers ─────────────────────────────────────────────────────────────

async function login(email, password) {
  const res = await fetch('/api/v1/auth/login', {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => ({}));
  if (res.ok) {
    _persistToken(data.accessToken); // save to memory + sessionStorage
  }

  return { res, data };
}

async function logout() {
  await fetch('/api/v1/auth/logout', {
    method: 'DELETE',
    credentials: 'include',
  }).catch(() => {});

  _persistToken(null); // clear from memory + sessionStorage
  window.location.href = '/login';
}

// ─── Public token accessors ───────────────────────────────────────────────────

function setAccessToken(token) {
  _persistToken(token);
}

function clearAccessToken() {
  _persistToken(null);
}

function getAccessToken() {
  return accessToken;
}

export {
  apiFetch,
  login,
  logout,
  setAccessToken,
  clearAccessToken,
  getAccessToken,
};
