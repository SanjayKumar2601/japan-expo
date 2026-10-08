import { create } from 'zustand';
import type { PosNotification } from '@/types';

const STORAGE_KEY = 'expo-pos-notifications-v1';

function makeId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function load(): PosNotification[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PosNotification[]) : [];
  } catch {
    return [];
  }
}

function persist(notifications: PosNotification[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, 30)));
  } catch {
    // Ignore storage failures.
  }
}

interface NotificationState {
  notifications: PosNotification[];
  add: (title: string, message: string, tone?: PosNotification['tone']) => void;
  markAllRead: () => void;
  clear: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: load(),
  add: (title, message, tone = 'info') =>
    set((state) => {
      const notifications = [
        {
          id: makeId(),
          title,
          message,
          createdAt: new Date().toISOString(),
          read: false,
          tone,
        },
        ...state.notifications,
      ].slice(0, 30);
      persist(notifications);
      return { notifications };
    }),
  markAllRead: () =>
    set((state) => {
      const notifications = state.notifications.map((item) => ({ ...item, read: true }));
      persist(notifications);
      return { notifications };
    }),
  clear: () => {
    persist([]);
    return { notifications: [] };
  },
}));
