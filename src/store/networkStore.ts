import { create } from 'zustand';
import type { SyncState } from '@/types';

interface NetworkState {
  isOnline: boolean;
  syncState: SyncState;
  pendingCount: number;
  setOnline: (online: boolean) => void;
  setSyncState: (state: SyncState) => void;
  setPendingCount: (count: number) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  isOnline: navigator.onLine,
  syncState: navigator.onLine ? 'online' : 'offline',
  pendingCount: 0,
  setOnline: (online) =>
    set({ isOnline: online, syncState: online ? 'online' : 'offline' }),
  setSyncState: (syncState) => set({ syncState }),
  setPendingCount: (pendingCount) => set({ pendingCount }),
}));
