import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || import.meta.env.REACT_APP_API_URL || '';

const api = axios.create({ 
  baseURL: `${API_URL}/api` 
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kci_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('kci_token');
      localStorage.removeItem('kci_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
