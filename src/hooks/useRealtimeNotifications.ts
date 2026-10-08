import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNotificationStore } from '@/store/notificationStore';
import { useToastStore } from '@/store/toastStore';

type PosEvent = {
  id: string;
  type: string;
  message: string;
  createdAt: string;
  operatorName?: string | null;
  orderNumber?: string | null;
  total?: number | null;
  paymentMethod?: string | null;
  customerName?: string | null;
  productId?: string | null;
  productName?: string | null;
  stock?: number | null;
  lowStockThreshold?: number | null;
};

function eventsUrl() {
  const apiBase = import.meta.env.VITE_BACKEND_URL ??
    `${window.location.protocol}//${window.location.hostname}:8080/api`;
  return `${apiBase.replace(/\/$/, '')}/events`;
}

function titleAndTone(event: PosEvent): { title: string; tone: 'success' | 'warning' | 'info' } {
  switch (event.type) {
    case 'SALE_COMPLETED':
      return { title: 'Sale completed', tone: 'success' };
    case 'PRODUCT_OUT_OF_STOCK':
      return { title: 'Out of stock', tone: 'warning' };
    case 'PRODUCT_LOW_STOCK':
      return { title: 'Low stock', tone: 'warning' };
    case 'PRODUCT_CREATED':
      return { title: 'New product', tone: 'info' };
    case 'PRODUCT_DELETED':
      return { title: 'Product deleted', tone: 'warning' };
    case 'PRODUCT_UPDATED':
      return { title: 'Product updated', tone: 'info' };
    default:
      return { title: 'POS update', tone: 'info' };
  }
}

export function useRealtimeNotifications() {
  const queryClient = useQueryClient();
  const addNotification = useNotificationStore((s) => s.add);
  const showToast = useToastStore((s) => s.show);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof EventSource === 'undefined') return;

    const source = new EventSource(eventsUrl());
    const eventTypes = [
      'SALE_COMPLETED',
      'PRODUCT_OUT_OF_STOCK',
      'PRODUCT_LOW_STOCK',
      'PRODUCT_CREATED',
      'PRODUCT_UPDATED',
      'PRODUCT_DELETED',
    ];

    const handleEvent = (raw: Event) => {
      const messageEvent = raw as MessageEvent<string>;
      try {
        const event = JSON.parse(messageEvent.data) as PosEvent;
        const { title, tone } = titleAndTone(event);
        addNotification(title, event.message, tone);
        showToast(event.message, tone === 'warning' ? 'info' : tone === 'success' ? 'success' : 'info');

        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        queryClient.invalidateQueries({ queryKey: ['dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['analytics'] });
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      } catch (error) {
        console.error('[POS] Invalid realtime event', error);
      }
    };

    eventTypes.forEach((type) => source.addEventListener(type, handleEvent));
    source.onerror = () => {
      // EventSource automatically reconnects while the backend is unavailable.
    };

    return () => {
      eventTypes.forEach((type) => source.removeEventListener(type, handleEvent));
      source.close();
    };
  }, [addNotification, queryClient, showToast]);
}
