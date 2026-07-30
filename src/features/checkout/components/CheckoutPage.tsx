import { useMemo, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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

const checkoutSchema = z.object({
  customerName: z.string().trim().max(60, 'Name must be 60 characters or fewer').optional().or(z.literal('')),
  paymentMethod: z.enum(['cash', 'upi', 'card', 'qr'], { message: 'Choose a payment method' }),
  notes: z.string().trim().max(220, 'Notes must be 220 characters or fewer').optional().or(z.literal('')),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const paymentOptions: { id: PaymentMethod; label: string; icon: React.ReactNode; tone: string }[] = [
  { id: 'cash', label: 'Cash', icon: <Banknote className="h-5 w-5" />, tone: 'bg-[var(--color-success)]' },
  { id: 'upi', label: 'UPI', icon: <Smartphone className="h-5 w-5" />, tone: 'bg-[var(--color-blue)]' },
  { id: 'card', label: 'Credit Card', icon: <CreditCard className="h-5 w-5" />, tone: 'bg-[var(--color-purple)]' },
  { id: 'qr', label: 'QR Code', icon: <QrCode className="h-5 w-5" />, tone: 'bg-[var(--color-primary)]' },
];

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const { mutate, isPending } = useCreateOrder();
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [soldPrices, setSoldPrices] = useState<Record<string, string>>({});

  const defaultValues = useMemo<CheckoutFormValues>(
    () => ({ customerName: '', paymentMethod: 'cash', notes: '' }),
    [],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues,
  });

  if (items.length === 0 && !isPending) {
    navigate('/products', { replace: true });
    return null;
  }

  function onSubmit(values: CheckoutFormValues) {
    const normalizedItems = items.map((i) => {
      const rawValue = soldPrices[i.product.id];
      const parsed = Number(rawValue);
      const salePrice = Number.isFinite(parsed) && parsed >= 0 ? parsed : i.product.price;

      return {
        productId: i.product.id,
        productName: i.product.name,
        price: i.product.price,
        salePrice,
        quantity: i.quantity,
        imageUrl: i.product.imageUrl,
      };
    });

    const computedTotal = normalizedItems.reduce((sum, item) => sum + (item.salePrice ?? item.price) * item.quantity, 0);

    mutate(
      {
        items: normalizedItems,
        total: computedTotal,
        paymentMethod: values.paymentMethod as PaymentMethod,
        customerName: values.customerName?.trim() || undefined,
        notes: values.notes?.trim() || undefined,
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 px-4 sm:px-6">
        <div className="space-y-5">
          <Input
            label="Customer Name (optional)"
            placeholder="Enter customer name"
            error={errors.customerName?.message}
            {...register('customerName')}
          />

          <div>
            <p className="mb-2 text-sm font-semibold text-[var(--color-text)]">Payment Method</p>
            <div className="grid grid-cols-2 gap-3">
              {paymentOptions.map((opt) => {
                const isActive = method === opt.id;
                return (
                  <motion.button
                    key={opt.id}
                    type="button"
                    whileTap={{ scale: 0.96 }}
                    onClick={() => {
                      setMethod(opt.id);
                      setValue('paymentMethod', opt.id, { shouldValidate: true, shouldDirty: true });
                    }}
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
            {errors.paymentMethod && <p className="mt-2 text-xs font-medium text-[var(--color-danger)]">{errors.paymentMethod.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--color-text)]">Notes (optional)</label>
            <textarea
              rows={3}
              placeholder="Any special notes for this order..."
              className="w-full resize-none rounded-[var(--radius-input)] border border-[var(--color-border)] bg-white p-4 text-[15px] outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
              {...register('notes')}
            />
            {errors.notes && <p className="mt-2 text-xs font-medium text-[var(--color-danger)]">{errors.notes.message}</p>}
          </div>

          <Card padding="md">
            <p className="mb-3 text-sm font-bold">Order Summary</p>
            <ul className="space-y-2 text-sm">
              {items.map((i) => {
                const salePrice = Number(soldPrices[i.product.id]);
                const effectiveSalePrice = Number.isFinite(salePrice) && salePrice >= 0 ? salePrice : i.product.price;

                return (
                  <li key={i.product.id} className="space-y-2 rounded-xl border border-[var(--color-border)]/70 bg-[var(--color-card)]/70 p-3">
                    <div className="flex justify-between text-[var(--color-muted)]">
                      <span>
                        {i.quantity} × {i.product.name}
                      </span>
                      <span className="font-medium text-[var(--color-text)]">{formatYen(effectiveSalePrice * i.quantity)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[var(--color-muted)]">Current price</span>
                      <span className="text-[var(--color-muted)] line-through">{formatYen(i.product.price)}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <label className="font-semibold text-[var(--color-text)]" htmlFor={`sold-price-${i.product.id}`}>
                        Sold at
                      </label>
                      <input
                        id={`sold-price-${i.product.id}`}
                        type="number"
                        min="0"
                        inputMode="numeric"
                        value={soldPrices[i.product.id] ?? i.product.price}
                        onChange={(event: ChangeEvent<HTMLInputElement>) => {
                          const next = event.target.value;
                          setSoldPrices((prev) => ({ ...prev, [i.product.id]: next }));
                        }}
                        className="w-24 rounded-lg border border-[var(--color-border)] bg-white px-2 py-1.5 text-right text-sm font-semibold text-[var(--color-text)] outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/10"
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="mt-3 flex justify-between border-t border-[var(--color-border)] pt-3 text-base font-extrabold">
              <span>Total Amount</span>
              <span>{formatYen(items.reduce((sum, item) => {
                const saleValue = Number(soldPrices[item.product.id]);
                const effective = Number.isFinite(saleValue) && saleValue >= 0 ? saleValue : item.product.price;
                return sum + effective * item.quantity;
              }, 0))}</span>
            </div>
          </Card>
        </div>

        <div className="fixed inset-x-0 bottom-16 z-30 border-t border-[var(--color-border)] bg-[var(--color-bg)]/95 px-5 py-4 backdrop-blur-md md:bottom-0">
          <Button
            size="lg"
            className="w-full"
            isLoading={isPending}
            type="submit"
            leftIcon={!isPending ? <Check className="h-4 w-4" /> : undefined}
          >
            {isPending ? 'Processing Sale…' : 'Complete Sale'}
          </Button>
        </div>
      </form>
    </div>
  );
}
