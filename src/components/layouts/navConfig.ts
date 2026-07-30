import { LayoutGrid, ShoppingBag, Receipt, BarChart3, Settings } from 'lucide-react';

export const navItems = [
  { to: '/', label: 'Home', icon: LayoutGrid, end: true },
  { to: '/products', label: 'Products', icon: ShoppingBag },
  { to: '/orders', label: 'Orders', icon: Receipt },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/settings', label: 'Settings', icon: Settings },
];
