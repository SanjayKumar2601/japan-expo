export type PaymentMethod = 'cash' | 'upi' | 'card' | 'qr';

export type OrderStatus = 'completed' | 'pending' | 'refunded' | 'cancelled';

export interface Category {
  id: string;
  name: string;
  nameJa?: string;
  icon: string;
  itemCount: number;
}

export interface Product {
  id: string;
  name: string;
  nameJa?: string;
  categoryId: string;
  categoryName: string;
  price: number;
  stock: number;
  imageUrl: string;
  description?: string;
  isFavorite?: boolean;
  soldCount?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  paymentMethod: PaymentMethod;
  customerName?: string;
  notes?: string;
  status: OrderStatus;
  createdAt: string;
  synced: boolean;
}

export interface DashboardSummary {
  revenueToday: number;
  revenueChangePercent: number;
  ordersToday: number;
  ordersChangePercent: number;
  avgOrderValue: number;
  avgOrderChangePercent: number;
  paymentSplit: { method: PaymentMethod; amount: number }[];
  recentOrders: Order[];
  pendingSyncCount: number;
}

export interface AnalyticsData {
  revenue: number;
  orders: number;
  profit: number;
  avgOrderValue: number;
  revenueChangePercent: number;
  ordersChangePercent: number;
  profitChangePercent: number;
  paymentSplit: { method: PaymentMethod; percent: number }[];
  topProducts: { product: Product; unitsSold: number; revenue: number }[];
  weeklyRevenue: { day: string; revenue: number }[];
}

export interface AppSettings {
  theme: 'light' | 'dark';
  language: 'en' | 'ja';
  soundEnabled: boolean;
  lastSyncedAt: string | null;
  sheetsConnected: boolean;
  version: string;
}

export type SyncState = 'online' | 'offline' | 'syncing';
