/**
 * api.js  –  Centralised Axios instance for the EM Dashboard API.
 *
 * Automatically injects the JWT from AuthContext into every request.
 * Usage:
 *   import api from '../utils/api';
 *   const res = await api.get('/booth/status');
 */
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
});

// Attach JWT from localStorage before every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nc_token');
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
});

// Centralised error handling
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Token expired — clear storage and reload
      localStorage.removeItem('nc_token');
      localStorage.removeItem('nc_auth_user');
      window.location.reload();
    }
    return Promise.reject(err);
  }
);

export default api;
