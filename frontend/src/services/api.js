import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  try {
    const session = JSON.parse(localStorage.getItem('spark_session'));
    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`;
    }
  } catch (_) {}
  return config;
});

export default api;
