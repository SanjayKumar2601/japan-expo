import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Banknote, Smartphone, CreditCard, QrCode, ArrowLeft, Check } from 'lucide-react';
import { useCart } from '@/features/cart/hooks/useCart';
import { useCreateOrder } from '../hooks/useCreateOrder';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { formatYen } from '@/utils/format';
import { cn } from '@/utils/cn';
import type { PaymentMethod } from '@/types';

const paymentOptions: { id: PaymentMethod; label: string; icon: React.ReactNode; tone: string }[] = [
  { id: 'cash', label: 'Cash', icon: <Banknote className="h-5 w-5" />, tone: 'bg-[var(--color-success)]' },
  { id: 'upi', label: 'UPI', icon: <Smartphone className="h-5 w-5" />, tone: 'bg-[var(--color-blue)]' },
  { id: 'card', label: 'Credit Card', icon: <CreditCard className="h-5 w-5" />, tone: 'bg-[var(--color-purple)]' },
  { id: 'qr', label: 'QR Code', icon: <QrCode className="h-5 w-5" />, tone: 'bg-[var(--color-primary)]' },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, total, clearCart } = useCart();
  const { mutate, isPending } = useCreateOrder();
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [customerName, setCustomerName] = useState('');
  const [notes, setNotes] = useState('');

  if (items.length === 0 && !isPending) {
    navigate('/products', { replace: true });
    return null;
  }

  function handleSubmit() {
    mutate(
      {
        items: items.map((i) => ({
          productId: i.product.id,
          productName: i.product.name,
          price: i.product.price,
          quantity: i.quantity,
          imageUrl: i.product.imageUrl,
        })),
        total,
        paymentMethod: method,
        customerName: customerName || undefined,
        notes: notes || undefined,
      },
      {
        onSuccess: (order) => {
          clearCart();
          navigate(`/order-success/${order.id}`, { state: order });
        },
      },
    );
  }

  return (
    <div className="pb-32 md:pb-8">
      <div className="flex items-center gap-3 px-4 py-5 sm:px-6">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-extrabold">Checkout</h1>
      </div>

      <div className="space-y-5 px-4 sm:px-6">
        <Input
          label="Customer Name (optional)"
          placeholder="Enter customer name"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
        />

        <div>
          <p className="mb-2 text-sm font-semibold text-[var(--color-text)]">Payment Method</p>
          <div className="grid grid-cols-2 gap-3">
            {paymentOptions.map((opt) => {
              const isActive = method === opt.id;
              return (
                <motion.button
                  key={opt.id}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setMethod(opt.id)}
                  className={cn(
                    'relative flex items-center gap-2.5 overflow-hidden rounded-2xl border-2 px-4 py-3.5 text-sm font-semibold transition-colors',
                    isActive
                      ? 'border-transparent text-white'
                      : 'border-[var(--color-border)] text-[var(--color-text)] hover:border-[var(--color-primary)]/40',
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="payment-bg"
                      className={cn('absolute inset-0', opt.tone)}
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span
                    className={cn(
                      'relative z-10 flex h-8 w-8 items-center justify-center rounded-xl',
                      isActive ? 'bg-white/20' : 'bg-black/5',
                    )}
                  >
                    {opt.icon}
                  </span>
                  <span className="relative z-10">{opt.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder="Any special notes for this order..."
            className="w-full resize-none rounded-[var(--radius-input)] border border-[var(--color-border)] bg-white p-4 text-[15px] outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
          />
        </div>

        <Card padding="md">
          <p className="mb-3 text-sm font-bold">Order Summary</p>
          <ul className="space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.product.id} className="flex justify-between text-[var(--color-muted)]">
                <span>
                  {i.quantity} × {i.product.name}
                </span>
                <span className="font-medium text-[var(--color-text)]">{formatYen(i.product.price * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex justify-between border-t border-[var(--color-border)] pt-3 text-base font-extrabold">
            <span>Total Amount</span>
            <span>{formatYen(total)}</span>
          </div>
        </Card>
      </div>

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-[var(--color-border)] bg-[var(--color-bg)]/95 px-5 py-4 backdrop-blur-md md:bottom-0">
        <Button
          size="lg"
          className="w-full"
          isLoading={isPending}
          onClick={handleSubmit}
          leftIcon={!isPending ? <Check className="h-4 w-4" /> : undefined}
        >
          {isPending ? 'Processing Sale…' : 'Complete Sale'}
        </Button>
      </div>
    </div>
  );
}
