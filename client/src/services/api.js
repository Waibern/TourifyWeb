import axios from "axios";

const localApi = `http://${window.location.hostname}:5000/api`;
// The API is deployed with the Vercel project, so production must stay
// same-origin. This also prevents an old external API URL from being baked
// into the Vite bundle.
const apiBase = import.meta.env.PROD
  ? "/api"
  : import.meta.env.VITE_API_URL || localApi;
const api = axios.create({ baseURL: apiBase });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("tourify_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
