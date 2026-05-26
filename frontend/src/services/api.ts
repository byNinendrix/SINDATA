import axios from 'axios';

const runtimeHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const runtimeProtocol = typeof window !== 'undefined' ? window.location.protocol : 'http:';
const defaultApiBaseURL = `${runtimeProtocol}//${runtimeHost}:3334/api`;

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const requestUrl = String(error?.config?.url ?? '');
    const isAuthLoginRequest = requestUrl.includes('/auth/login');

    if (status === 401 && !isAuthLoginRequest) {
      localStorage.removeItem('sindata_token');
      localStorage.removeItem('sindata_user');

      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
