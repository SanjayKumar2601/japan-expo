import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Confetti } from '@/components/shared/Confetti';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatYen } from '@/utils/format';
import type { Order } from '@/types';

export default function OrderSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const order = (location.state as Order | undefined) ?? undefined;

  if (!order) {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden px-6 pb-10 pt-16 text-center">
      <Confetti />

      <motion.div
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 16 }}
        className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-success)] text-white shadow-[0_20px_40px_rgba(44,182,125,0.3)]"
      >
        <motion.div initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <CheckCircle2 className="h-12 w-12" />
        </motion.div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="text-2xl font-extrabold text-[var(--color-text)]"
      >
        Sale Completed!
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mt-1 text-sm text-[var(--color-muted)]"
      >
        Order {order.orderNumber}
      </motion.p>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="mt-8 w-full max-w-sm">
        <Card padding="lg">
          <p className="text-4xl font-black text-[var(--color-primary)]">{formatYen(order.total)}</p>
          <p className="mb-4 text-xs uppercase tracking-wide text-[var(--color-muted)]">
            {order.paymentMethod} {order.customerName ? `· ${order.customerName}` : ''}
          </p>
          <ul className="space-y-2 border-t border-[var(--color-border)] pt-4 text-left text-sm">
            {order.items.map((item) => (
              <li key={item.productId} className="flex justify-between">
                <span className="text-[var(--color-muted)]">
                  {item.quantity} × {item.productName}
                </span>
                <span className="font-semibold">{formatYen(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-8 w-full max-w-sm">
        <Button size="lg" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />} onClick={() => navigate('/products')}>
          New Sale
        </Button>
      </motion.div>
    </div>
  );
}
