import axios from 'axios';

const runtimeHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const runtimeProtocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
const defaultApiBaseURL = `${runtimeProtocol}//${runtimeHost}:3333/api`;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL?.trim() || defaultApiBaseURL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sindata_token');

  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
