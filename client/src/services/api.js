import axios from 'axios';

const api = axios.create({
  // In production with separate hosts (e.g. Vercel + Railway), set VITE_API_URL
  // to the absolute backend URL (e.g. https://bookvault-api.railway.app/api).
  // In dev or same-host deployments, the relative '/api' path works via the
  // Vite proxy (dev) or Express static file serving (same-host prod).
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('bookvault_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If unauthorized, clear token and emit or trigger redirect if not already on login
      if (!window.location.pathname.includes('/login')) {
        localStorage.removeItem('bookvault_token');
        localStorage.removeItem('bookvault_user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
