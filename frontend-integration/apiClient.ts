import axios from 'axios';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL ?? 'http://localhost:8080/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message ?? error?.message ?? 'Network request failed';
    return Promise.reject(new Error(message));
  },
);
