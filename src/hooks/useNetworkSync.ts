import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNetworkStore } from '@/store/networkStore';
import { useToastStore } from '@/store/toastStore';
import { syncPendingOrders } from '@/services/backendApi';
import { offlineDb } from '@/services/db';

export function useNetworkSync() {
  const { setOnline, setSyncState, setPendingCount } = useNetworkStore();
  const showToast = useToastStore((s) => s.show);
  const queryClient = useQueryClient();

  useEffect(() => {
    let cancelled = false;

    async function refreshPendingCount() {
      const pending = await offlineDb.getPendingOrders();
      if (!cancelled) setPendingCount(pending.length);
    }

    async function runSync() {
      setSyncState('syncing');
      const { syncedCount } = await syncPendingOrders();
      if (cancelled) return;
      setSyncState('online');
      await refreshPendingCount();
      if (syncedCount > 0) {
        showToast(`Synced ${syncedCount} order${syncedCount > 1 ? 's' : ''} to Backend`, 'success');
        queryClient.invalidateQueries({ queryKey: ['orders'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      }
    }

    function handleOnline() {
      setOnline(true);
      runSync();
    }
    function handleOffline() {
      setOnline(false);
      showToast("You're offline. Sales will sync automatically.", 'info');
    }

    refreshPendingCount();
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      cancelled = true;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
