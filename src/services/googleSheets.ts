
/**
 * services/googleSheets.ts
 *
 * Backend access layer for the Expo Sales Tracker.
 *
 * React -> this service -> Spring Boot -> SQLite
 */

import { apiClient } from './apiClient';
import { offlineDb } from './db';

import type {
  AnalyticsData,
  AppSettings,
  Category,
  DashboardSummary,
  Order,
  Product,
} from '@/types';

const USE_LIVE_BACKEND = true;

/**
 * -------------------------------------------------------------------------
 * Categories
 * -------------------------------------------------------------------------
 */
export async function getCategories(): Promise<Category[]> {
  if (USE_LIVE_BACKEND) {
    const response = await apiClient.get<Category[]>('/categories');
    return response.data;
  }

  return [];
}

/**
 * -------------------------------------------------------------------------
 * Products
 * -------------------------------------------------------------------------
 */
export async function getProducts(): Promise<Product[]> {
  if (USE_LIVE_BACKEND) {
    const response = await apiClient.get<Product[]>('/products');
    return response.data;
  }

  return [];
}

/**
 * -------------------------------------------------------------------------
 * Dashboard
 * -------------------------------------------------------------------------
 */
export async function getDashboard(): Promise<DashboardSummary> {
  if (USE_LIVE_BACKEND) {
    const response =
      await apiClient.get<DashboardSummary>('/dashboard');

    return response.data;
  }

  throw new Error('Backend is not enabled');
}

/**
 * -------------------------------------------------------------------------
 * Orders
 * -------------------------------------------------------------------------
 */
export async function getOrders(): Promise<Order[]> {
  if (USE_LIVE_BACKEND) {
    const response = await apiClient.get<Order[]>('/orders');
    return response.data;
  }

  const cached = await offlineDb.getCachedOrders();
  const pending = await offlineDb.getPendingOrders();

  const merged = [...pending, ...cached].filter(
    (order, index, orders) =>
      orders.findIndex((item) => item.id === order.id) === index,
  );

  return merged.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() -
      new Date(a.createdAt).getTime(),
  );
}

/**
 * -------------------------------------------------------------------------
 * Create Order
 * -------------------------------------------------------------------------
 */
export async function createOrder(input: {
  items: Order['items'];
  total: number;
  paymentMethod: Order['paymentMethod'];
  customerName?: string;
  notes?: string;
}): Promise<Order> {
  /**
   * Online:
   * React -> Spring Boot -> SQLite
   */
  if (USE_LIVE_BACKEND && navigator.onLine) {
    const response = await apiClient.post<Order>(
      '/orders',
      input,
    );

    await offlineDb.cacheOrder({
      ...response.data,
      synced: true,
    });

    return response.data;
  }

  /**
   * Offline:
   * Save the order locally and sync it when the backend becomes available.
   */
  const stored = Number(
    localStorage.getItem('expo:lastOrderNumber') ?? '1052',
  );

  const next = stored + 1;

  localStorage.setItem(
    'expo:lastOrderNumber',
    String(next),
  );

  const order: Order = {
    id: 'local-' + Date.now(),
    orderNumber: '#' + next,
    items: input.items,
    total: input.total,
    paymentMethod: input.paymentMethod,
    customerName: input.customerName,
    notes: input.notes,
    status: 'completed',
    createdAt: new Date().toISOString(),
    synced: false,
  };

  await offlineDb.queueOrder(order);

  return order;
}

/**
 * -------------------------------------------------------------------------
 * Analytics
 * -------------------------------------------------------------------------
 */
export async function getAnalytics(): Promise<AnalyticsData> {
  if (USE_LIVE_BACKEND) {
    const response =
      await apiClient.get<AnalyticsData>('/analytics');

    return response.data;
  }

  throw new Error('Backend is not enabled');
}

/**
 * -------------------------------------------------------------------------
 * Sync pending offline orders
 * -------------------------------------------------------------------------
 */
export async function syncPendingOrders(): Promise<{
  syncedCount: number;
}> {
  const pending = await offlineDb.getPendingOrders();

  if (pending.length === 0) {
    return {
      syncedCount: 0,
    };
  }

  if (USE_LIVE_BACKEND && navigator.onLine) {
    let syncedCount = 0;

    for (const order of pending) {
      try {
        const response = await apiClient.post<Order>(
          '/orders',
          {
            items: order.items,
            total: order.total,
            paymentMethod: order.paymentMethod,
            customerName: order.customerName,
            notes: order.notes,
          },
        );

        await offlineDb.removePendingOrder(order.id);

        await offlineDb.cacheOrder({
          ...response.data,
          synced: true,
        });

        syncedCount++;
      } catch (error) {
        console.error(
          'Failed to sync order:',
          order.id,
          error,
        );

        break;
      }
    }

    return {
      syncedCount,
    };
  }

  return {
    syncedCount: 0,
  };
}

/**
 * -------------------------------------------------------------------------
 * Settings
 * -------------------------------------------------------------------------
 */
export async function getSettings(): Promise<AppSettings> {
  if (USE_LIVE_BACKEND) {
    const response =
      await apiClient.get<AppSettings>('/settings');

    return response.data;
  }

  throw new Error('Backend is not enabled');
}

export async function updateSettings(
  patch: Partial<AppSettings>,
): Promise<AppSettings> {
  if (USE_LIVE_BACKEND) {
    const response = await apiClient.patch<AppSettings>(
      '/settings',
      patch,
    );

    return response.data;
  }

  throw new Error('Backend is not enabled');
}
