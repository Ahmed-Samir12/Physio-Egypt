let refreshPromise = null; // deduplicate concurrent refresh attempts

// ─── Silent refresh ──────────────────────────────────────────────────────────

async function silentRefresh() {
  if (refreshPromise) return refreshPromise;

  refreshPromise = fetch('/api/v1/auth/refresh', {
    method: 'POST',
    credentials: 'include', // sends refreshToken cookie automatically
  }).then((res) => {
    if (!res.ok) throw new Error('refresh_failed');
  });

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

// ─── Core fetch wrapper ──────────────────────────────────────────────────────

async function apiFetch(endpoint, options = {}, _retry = false) {
  const res = await fetch(`/api/v1${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: !(options.body instanceof FormData)
      ? { 'Content-Type': 'application/json', ...(options.headers || {}) }
      : options.headers || {},
  });

  // Rate limited — never treat as an auth failure, never redirect to login
  if (res.status === 429) {
    console.warn(`[apiFetch] Rate limited on ${endpoint}`);
    return res;
  }

  if (res.status === 401 && !_retry) {
    try {
      await silentRefresh();
      return apiFetch(endpoint, options, true);
    } catch {
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

  return { res, data };
}

async function logout() {
  await fetch('/api/v1/auth/logout', {
    method: 'DELETE',
    credentials: 'include',
  }).catch(() => {});

  window.location.href = '/login';
}

export { apiFetch, login, logout };
