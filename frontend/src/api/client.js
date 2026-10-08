let inMemoryToken = null;

export const setAuthToken = (token) => {
  inMemoryToken = token;
};

export const getAuthToken = () => inMemoryToken;

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (inMemoryToken) {
    headers['Authorization'] = `Bearer ${inMemoryToken}`;
  }

  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `HTTP error ${response.status}`;
    const err = new Error(errorMsg);
    err.status = response.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  auth: {
    register: (email, password) =>
      request('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    login: (email, password) =>
      request('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    me: () => request('/api/auth/me'),
  },
  monitors: {
    list: () => request('/api/monitors'),
    get: (id) => request(`/api/monitors/${id}`),
    create: (monitorData) =>
      request('/api/monitors', {
        method: 'POST',
        body: JSON.stringify(monitorData),
      }),
    update: (id, monitorData) =>
      request(`/api/monitors/${id}`, {
        method: 'PUT',
        body: JSON.stringify(monitorData),
      }),
    delete: (id) =>
      request(`/api/monitors/${id}`, {
        method: 'DELETE',
      }),
    getHistory: (id, period = '24h') =>
      request(`/api/monitors/${id}/history?period=${period}`),
  },
  publicStatus: {
    get: (id) => request(`/status/${id}/public`),
    getHistory: (id, period = '24h') =>
      request(`/api/status/${id}/public/history?period=${period}`),
  },
  billing: {
    createCheckout: () =>
      request('/api/billing/checkout', {
        method: 'POST',
      }),
  },
};
