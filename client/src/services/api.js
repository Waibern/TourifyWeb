import axios from 'axios';

const localApi = `http://${window.location.hostname}:5000/api`;
const apiBase = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '/api' : localApi);
const api = axios.create({baseURL: apiBase});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('tourify_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
