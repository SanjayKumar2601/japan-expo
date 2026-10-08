import axios from 'axios';

const backendBaseUrl =
  import.meta.env.VITE_BACKEND_URL ??
  `${window.location.protocol}//${window.location.hostname}:8080/api`;

export const apiClient = axios.create({
  baseURL: backendBaseUrl,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export function getAdminPassword(): string | null {
  return sessionStorage.getItem('expo-admin-password');
}

export function setAdminPassword(password: string): void {
  sessionStorage.setItem('expo-admin-password', password);
}

export function clearAdminPassword(): void {
  sessionStorage.removeItem('expo-admin-password');
}

export function adminHeaders() {
  const password = getAdminPassword();
  return password ? { 'X-Admin-Password': password } : {};
}
