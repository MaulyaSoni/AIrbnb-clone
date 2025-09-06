import axios from 'axios';

// Dynamically set baseURL: use .env if provided, fallback to dev/prod defaults
const api = axios.create({
  baseURL:
    process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === 'production'
      ? 'https://your-backend-domain.com/api' // 🔹 change when deployed
      : 'http://localhost:5001/api'),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // allow cookies if backend uses them
});

// 🔹 Request interceptor → add JWT if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔹 Response interceptor → global error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const { response } = error;

    // Expired session / invalid token
    if (response?.status === 401) {
      localStorage.removeItem('token');
      window.dispatchEvent(
        new CustomEvent('auth-error', { detail: 'Session expired, please log in again.' })
      );
    }

    // Forbidden
    if (response?.status === 403) {
      console.warn('Access denied:', response.data?.message || 'Forbidden');
    }

    return Promise.reject(error);
  }
);

export default api;
