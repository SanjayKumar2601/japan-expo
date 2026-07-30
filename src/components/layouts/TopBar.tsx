import { Bell, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { SyncStatusBadge } from '@/components/shared/SyncStatusBadge';
import { useCartStore, selectCartCount } from '@/store/cartStore';

export function TopBar({ title, subtitle }: { title: string; subtitle?: string }) {
  const cartCount = useCartStore(selectCartCount);
  const toggleCart = useCartStore((s) => s.toggleCart);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-[var(--color-border)]/60 bg-[var(--color-bg)]/90 px-4 py-4 backdrop-blur-md sm:px-6 sm:py-5">
      <div>
        <h1 className="text-xl font-extrabold text-[var(--color-text)] sm:text-2xl">{title}</h1>
        {subtitle && <p className="text-sm text-[var(--color-muted)]">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="hidden sm:block">
          <SyncStatusBadge />
        </div>
        <button className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)] transition-transform hover:scale-105 active:scale-95">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-[var(--color-primary)]" />
        </button>
        <button
          data-cart-fly-target
          onClick={toggleCart}
          className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)] transition-transform hover:scale-105 active:scale-95"
        >
          <ShoppingCart className="h-5 w-5" />
          {cartCount > 0 && (
            <motion.span
              key={cartCount}
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full gradient-primary text-[10px] font-bold text-white"
            >
              {cartCount}
            </motion.span>
          )}
        </button>
      </div>
    </header>
  );
}
