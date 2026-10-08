import { Bell, ShoppingCart, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { SyncStatusBadge } from '@/components/shared/SyncStatusBadge';
import { useCartStore, selectCartCount } from '@/store/cartStore';
import { useNotificationStore } from '@/store/notificationStore';
import { formatTime } from '@/utils/format';
import { cn } from '@/utils/cn';
import { useState } from 'react';

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const cartCount = useCartStore(selectCartCount);
  const carts = useCartStore((s) => s.carts);
  const activeCart = useCartStore((s) => s.carts.find((cart) => cart.id === s.activeCartId));
  const toggleCart = useCartStore((s) => s.toggleCart);
  const notifications = useNotificationStore((s) => s.notifications);
  const markAllRead = useNotificationStore((s) => s.markAllRead);
  const [showNotifications, setShowNotifications] = useState(false);
  const unread = notifications.filter((item) => !item.read).length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-[var(--color-border)]/60 bg-[var(--color-bg)]/90 px-4 py-4 backdrop-blur-md sm:px-6 sm:py-5">
      <div className="min-w-0">
        <h1 className="text-xl font-extrabold text-[var(--color-text)] sm:text-2xl">{title}</h1>
        {subtitle && <p className="text-sm text-[var(--color-muted)]">{subtitle}</p>}
        {carts.length > 1 && activeCart && (
          <p className="mt-1 truncate text-xs font-semibold text-[var(--color-primary)]">Active: {activeCart.customerName}</p>
        )}
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden sm:block"><SyncStatusBadge /></div>
        <div className="relative">
          <button onClick={() => { setShowNotifications((value) => !value); if (!showNotifications) markAllRead(); }} className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)] transition-transform hover:scale-105 active:scale-95">
            <Bell className="h-5 w-5" />
            {unread > 0 && <span className="absolute right-2 top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-primary)] px-1 text-[9px] font-bold text-white">{unread}</span>}
          </button>
          {showNotifications && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} className="absolute right-0 top-14 z-50 w-[min(88vw,360px)] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-2xl">
              <div className="flex items-center justify-between border-b border-[var(--color-border)] px-4 py-3">
                <p className="text-sm font-bold">Notifications</p>
                <button onClick={() => setShowNotifications(false)}><X className="h-4 w-4 text-[var(--color-muted)]" /></button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? <p className="px-4 py-8 text-center text-sm text-[var(--color-muted)]">No notifications yet.</p> : notifications.map((item) => (
                  <div key={item.id} className="border-b border-[var(--color-border)]/70 px-4 py-3 last:border-b-0">
                    <p className={cn('text-sm font-bold', item.tone === 'warning' && 'text-[var(--color-warning)]', item.tone === 'success' && 'text-[var(--color-success)]')}>{item.title}</p>
                    <p className="mt-0.5 text-xs text-[var(--color-muted)]">{item.message}</p>
                    <p className="mt-1 text-[10px] text-[var(--color-muted)]">{formatTime(item.createdAt)}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
        <button data-cart-fly-target onClick={toggleCart} className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)] transition-transform hover:scale-105 active:scale-95">
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && <motion.span key={cartCount} initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full gradient-primary text-[10px] font-bold text-white">{cartCount}</motion.span>}
        </button>
      </div>
    </header>
  );
}
