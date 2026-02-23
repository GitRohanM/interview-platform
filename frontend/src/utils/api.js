// frontend/src/utils/api.js
// Central API client — handles auth headers, token refresh, and errors

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// ── Token storage (memory + localStorage for persistence)
let accessToken = localStorage.getItem('accessToken') || null;

const setToken = (token) => {
  accessToken = token;
  if (token) localStorage.setItem('accessToken', token);
  else localStorage.removeItem('accessToken');
};

// ── Core fetch wrapper with auth + auto-refresh
const apiFetch = async (endpoint, options = {}) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...options.headers,
    },
    credentials: 'include', // Send cookies (refresh token)
    ...options,
  };

  // Don't set Content-Type for FormData (multipart)
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  let response = await fetch(`${BASE_URL}${endpoint}`, config);

  // ── Auto-refresh access token if expired
  if (response.status === 401) {
    const data = await response.json();
    if (data.code === 'TOKEN_EXPIRED') {
      try {
        const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
          method: 'POST',
          credentials: 'include',
        });
        if (refreshRes.ok) {
          const refreshData = await refreshRes.json();
          setToken(refreshData.accessToken);
          // Retry original request with new token
          config.headers['Authorization'] = `Bearer ${refreshData.accessToken}`;
          response = await fetch(`${BASE_URL}${endpoint}`, config);
        } else {
          // Refresh failed — force logout
          setToken(null);
          window.dispatchEvent(new Event('auth:logout'));
          throw new Error('Session expired. Please login again.');
        }
      } catch {
        setToken(null);
        window.dispatchEvent(new Event('auth:logout'));
        throw new Error('Session expired. Please login again.');
      }
    }
  }

  const responseData = await response.json();

  if (!response.ok) {
    throw new Error(responseData.message || 'Something went wrong.');
  }

  return responseData;
};

// ── Auth API
export const authAPI = {
  register: (data) => apiFetch('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: async (data) => {
    const res = await apiFetch('/auth/login', { method: 'POST', body: JSON.stringify(data) });
    setToken(res.accessToken);
    return res;
  },
  logout: async () => {
    await apiFetch('/auth/logout', { method: 'POST' });
    setToken(null);
  },
  getMe: () => apiFetch('/auth/me'),
  setToken,
  getToken: () => accessToken,
};

// ── Interview API
export const interviewAPI = {
  startSession: (data) => apiFetch('/interviews/start', { method: 'POST', body: JSON.stringify(data) }),
  submitAnswer: (sessionId, data) => apiFetch(`/interviews/${sessionId}/answer`, { method: 'POST', body: JSON.stringify(data) }),
  completeSession: (sessionId) => apiFetch(`/interviews/${sessionId}/complete`, { method: 'POST' }),
  getSessions: (params = '') => apiFetch(`/interviews/sessions${params}`),
  getSession: (id) => apiFetch(`/interviews/sessions/${id}`),
  getFollowUp: (data) => apiFetch('/interviews/followup', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Questions API
export const questionsAPI = {
  getQuestions: (params = '') => apiFetch(`/questions${params}`),
  getRoles: () => apiFetch('/questions/roles'),
};

// ── Resume API
export const resumeAPI = {
  analyze: (formData) => apiFetch('/resume/analyze', { method: 'POST', body: formData }),
  getHistory: () => apiFetch('/resume/history'),
};

// ── Analytics API
export const analyticsAPI = {
  getOverview: () => apiFetch('/analytics/overview'),
  getSessions: (params = '') => apiFetch(`/analytics/sessions${params}`),
};

// ── User API
export const userAPI = {
  updateProfile: (data) => apiFetch('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
  changePassword: (data) => apiFetch('/users/password', { method: 'PUT', body: JSON.stringify(data) }),
  askCoach: (data) => apiFetch('/users/coach', { method: 'POST', body: JSON.stringify(data) }),
};
