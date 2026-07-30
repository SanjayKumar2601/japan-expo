/**
 * services/googleSheets.ts
 * -------------------------------------------------------------------------
 * Single source of truth for backend access. The rest of the app NEVER
 * talks to Google Sheets, Apps Script, or Drive directly — every feature
 * calls the functions exported here.
 *
 * Today these functions run against local mock data + IndexedDB so the app
 * is fully usable offline and in development. When the Apps Script Web App
 * is deployed, swap the body of each function for an `apiClient` call
 * (see the commented block below) — no other file in the app needs to
 * change, including when migrating to Firebase later.
 *
 *   const res = await apiClient.get<DashboardSummary>('?action=getDashboard');
 *   return res.data;
 * -------------------------------------------------------------------------
 */
import { apiClient } from './apiClient';
import { offlineDb } from './db';
import { CATEGORIES, PRODUCTS, buildRecentOrders } from './mockData';
import type {
  AnalyticsData,
  AppSettings,
  Category,
  DashboardSummary,
  Order,
  Product,
} from '@/types';

// Toggle this on once VITE_APPS_SCRIPT_URL is configured and live.
const USE_LIVE_BACKEND = false;

function simulateLatency<T>(value: T, ms = 500): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

function generateOrderNumber(): string {
  const stored = Number(localStorage.getItem('expo:lastOrderNumber') ?? '1052');
  const next = stored + 1;
  localStorage.setItem('expo:lastOrderNumber', String(next));
  return `#${next}`;
}

export async function getCategories(): Promise<Category[]> {
  if (USE_LIVE_BACKEND) {
    const res = await apiClient.get<Category[]>('', { params: { action: 'getCategories' } });
    return res.data;
  }
  return simulateLatency(CATEGORIES, 300);
}

export async function getProducts(): Promise<Product[]> {
  if (USE_LIVE_BACKEND) {
    const res = await apiClient.get<Product[]>('', { params: { action: 'getProducts' } });
    return res.data;
  }
  return simulateLatency(PRODUCTS, 450);
}

export async function getDashboard(): Promise<DashboardSummary> {
  if (USE_LIVE_BACKEND) {
    const res = await apiClient.get<DashboardSummary>('', { params: { action: 'getDashboard' } });
    return res.data;
  }
  const recentOrders = buildRecentOrders();
  const pending = await offlineDb.getPendingOrders();
  return simulateLatency(
    {
      revenueToday: 428560,
      revenueChangePercent: 12.5,
      ordersToday: 53,
      ordersChangePercent: 8,
      avgOrderValue: 803,
      avgOrderChangePercent: 4.2,
      paymentSplit: [
        { method: 'cash', amount: 80000 },
        { method: 'upi', amount: 229000 },
        { method: 'card', amount: 55560 },
      ],
      recentOrders,
      pendingSyncCount: pending.length,
    },
    500,
  );
}

export async function getOrders(): Promise<Order[]> {
  if (USE_LIVE_BACKEND) {
    const res = await apiClient.get<Order[]>('', { params: { action: 'getOrders' } });
    return res.data;
  }
  const cached = await offlineDb.getCachedOrders();
  const pending = await offlineDb.getPendingOrders();
  const base = buildRecentOrders();
  const merged = [...pending, ...cached, ...base].filter(
    (order, index, arr) => arr.findIndex((o) => o.id === order.id) === index,
  );
  return simulateLatency(
    merged.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    350,
  );
}

export async function createOrder(input: {
  items: Order['items'];
  total: number;
  paymentMethod: Order['paymentMethod'];
  customerName?: string;
  notes?: string;
}): Promise<Order> {
  const order: Order = {
    id: `local-${Date.now()}`,
    orderNumber: generateOrderNumber(),
    items: input.items,
    total: input.total,
    paymentMethod: input.paymentMethod,
    customerName: input.customerName,
    notes: input.notes,
    status: 'completed',
    createdAt: new Date().toISOString(),
    synced: navigator.onLine && USE_LIVE_BACKEND,
  };

  if (USE_LIVE_BACKEND && navigator.onLine) {
    const res = await apiClient.post<Order>('', { action: 'createOrder', ...input });
    await offlineDb.cacheOrder(res.data);
    return res.data;
  }

  // Offline-first: always persist locally first, sync later.
  await offlineDb.queueOrder(order);
  return simulateLatency(order, 700);
}

export async function getAnalytics(): Promise<AnalyticsData> {
  if (USE_LIVE_BACKEND) {
    const res = await apiClient.get<AnalyticsData>('', { params: { action: 'getAnalytics' } });
    return res.data;
  }
  const topProducts = [...PRODUCTS]
    .sort((a, b) => (b.soldCount ?? 0) - (a.soldCount ?? 0))
    .slice(0, 5)
    .map((product) => ({
      product,
      unitsSold: product.soldCount ?? 0,
      revenue: (product.soldCount ?? 0) * product.price,
    }));

  return simulateLatency(
    {
      revenue: 42560,
      orders: 53,
      profit: 18750,
      avgOrderValue: 803,
      revenueChangePercent: 12.5,
      ordersChangePercent: 8,
      profitChangePercent: 10.2,
      paymentSplit: [
        { method: 'upi', percent: 68 },
        { method: 'cash', percent: 19 },
        { method: 'card', percent: 13 },
      ],
      topProducts,
      weeklyRevenue: [
        { day: 'Mon', revenue: 28000 },
        { day: 'Tue', revenue: 31500 },
        { day: 'Wed', revenue: 26800 },
        { day: 'Thu', revenue: 39200 },
        { day: 'Fri', revenue: 45100 },
        { day: 'Sat', revenue: 58900 },
        { day: 'Sun', revenue: 42560 },
      ],
    },
    500,
  );
}

export async function syncPendingOrders(): Promise<{ syncedCount: number }> {
  const pending = await offlineDb.getPendingOrders();
  if (pending.length === 0) return { syncedCount: 0 };

  if (USE_LIVE_BACKEND && navigator.onLine) {
    for (const order of pending) {
      await apiClient.post('', { action: 'createOrder', ...order });
      await offlineDb.removePendingOrder(order.id);
      await offlineDb.cacheOrder({ ...order, synced: true });
    }
    return { syncedCount: pending.length };
  }

  // Dev fallback: simulate a successful sync once "online" again.
  await simulateLatency(null, 800);
  for (const order of pending) {
    await offlineDb.removePendingOrder(order.id);
    await offlineDb.cacheOrder({ ...order, synced: true });
  }
  return { syncedCount: pending.length };
}

export async function getSettings(): Promise<AppSettings> {
  const stored = localStorage.getItem('expo:settings');
  if (stored) return JSON.parse(stored);
  const defaults: AppSettings = {
    theme: 'light',
    language: 'en',
    soundEnabled: true,
    lastSyncedAt: null,
    sheetsConnected: true,
    version: '1.0.0',
  };
  return simulateLatency(defaults, 150);
}

export async function updateSettings(patch: Partial<AppSettings>): Promise<AppSettings> {
  const current = await getSettings();
  const next = { ...current, ...patch };
  localStorage.setItem('expo:settings', JSON.stringify(next));
  return simulateLatency(next, 150);
}
