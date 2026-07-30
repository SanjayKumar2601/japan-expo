import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatTime, formatYen } from '@/utils/format';
import type { Order } from '@/types';

export function RecentOrdersCard({ orders }: { orders: Order[] }) {
  const navigate = useNavigate();

  return (
    <Card padding="md">
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <button onClick={() => navigate('/orders')} className="text-xs font-semibold text-[var(--color-primary)]">
          View all
        </button>
      </CardHeader>
      <ul className="divide-y divide-[var(--color-border)]">
        {orders.map((order, i) => (
          <motion.li
            key={order.id}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-xs font-bold text-[var(--color-primary)]">
                {order.orderNumber.replace('#', '')}
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  {order.orderNumber} · {order.customerName}
                </p>
                <p className="text-xs text-[var(--color-muted)]">{formatTime(order.createdAt)}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-[var(--color-text)]">{formatYen(order.total)}</p>
              <Badge tone={order.status === 'completed' ? 'success' : 'warning'} className="mt-0.5">
                {order.status}
              </Badge>
            </div>
          </motion.li>
        ))}
      </ul>
    </Card>
  );
}
