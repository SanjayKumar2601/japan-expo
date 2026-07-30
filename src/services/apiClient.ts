import axios from 'axios';

/**
 * Base client for the Google Apps Script Web App.
 * Set VITE_APPS_SCRIPT_URL in .env once the script is deployed, then flip
 * USE_LIVE_BACKEND to true in googleSheets.ts.
 */
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_APPS_SCRIPT_URL ?? '',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Centralized error normalization so features never see axios internals.
    const message =
      error?.response?.data?.message ?? error?.message ?? 'Network request failed';
    return Promise.reject(new Error(message));
  },
);
