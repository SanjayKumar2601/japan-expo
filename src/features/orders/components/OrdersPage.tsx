import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, Receipt, Search } from 'lucide-react';
import { TopBar } from '@/components/layouts/TopBar';
import { PageTransition } from '@/components/shared/PageTransition';
import { EmptyState } from '@/components/shared/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { useOrders } from '../hooks/useOrders';
import { formatDate, formatTime, formatYen } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { PaymentMethod } from '@/types';

const filters: { id: PaymentMethod | 'all'; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'cash', label: 'Cash' },
  { id: 'upi', label: 'UPI' },
  { id: 'card', label: 'Card' },
];

export default function OrdersPage() {
  const { data: orders, isLoading } = useOrders();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<PaymentMethod | 'all'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!orders) return [];
    return orders.filter((o) => {
      const matchesFilter = filter === 'all' || o.paymentMethod === filter;
      const matchesSearch =
        o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        (o.customerName ?? '').toLowerCase().includes(search.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [orders, filter, search]);

  return (
    <PageTransition>
      <TopBar title="Orders" subtitle="All sales, synced and pending" />
      <div className="space-y-4 px-4 pb-28 sm:px-6 md:pb-8">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[var(--color-muted)]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search orders..."
            className="h-12 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-card)] pl-11 pr-4 text-[15px] outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={cn(
                'shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                filter === f.id
                  ? 'gradient-primary text-white'
                  : 'border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-muted)]',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<Receipt className="h-10 w-10" />}
            title="No orders found"
            description="Looks like you haven't made any sales yet. Your orders will sync automatically."
          />
        ) : (
          <ul className="space-y-3">
            {filtered.map((order, i) => {
              const isOpen = expanded === order.id;
              return (
                <motion.li
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)]"
                >
                  <button
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                    className="flex w-full items-center justify-between px-4 py-3.5"
                  >
                    <div className="flex items-center gap-3 text-left">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-xs font-bold text-[var(--color-primary)]">
                        {order.orderNumber.replace('#', '')}
                      </div>
                      <div>
                        <p className="text-sm font-bold">
                          {order.orderNumber} · {order.customerName ?? 'Guest'}
                        </p>
                        <p className="text-xs text-[var(--color-muted)]">
                          {formatDate(order.createdAt)} · {formatTime(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-extrabold">{formatYen(order.total)}</p>
                        <Badge tone={order.synced ? 'success' : 'warning'}>{order.synced ? 'Synced' : 'Pending'}</Badge>
                      </div>
                      <motion.span animate={{ rotate: isOpen ? 180 : 0 }}>
                        <ChevronDown className="h-4 w-4 text-[var(--color-muted)]" />
                      </motion.span>
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-[var(--color-border)] px-4"
                      >
                        <ul className="space-y-2 py-3">
                          {order.items.map((item) => (
                            <li key={item.productId} className="flex items-center gap-3 text-sm">
                              <img src={item.imageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                              <span className="flex-1 text-[var(--color-muted)]">
                                {item.quantity} × {item.productName}
                              </span>
                              <span className="font-semibold">{formatYen(item.price * item.quantity)}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="flex justify-between border-t border-[var(--color-border)] py-3 text-sm font-bold">
                          <span>Total Amount</span>
                          <span>{formatYen(order.total)}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.li>
              );
            })}
          </ul>
        )}
      </div>
    </PageTransition>
  );
}
