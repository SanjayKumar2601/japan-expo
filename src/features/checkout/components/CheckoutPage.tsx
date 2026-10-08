import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
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
import { useToastStore } from '@/store/toastStore';
import { downloadReceipt, getOrAskDeviceUser } from '@/services/receipt';
import type { PaymentMethod } from '@/types';

const checkoutSchema = z.object({
  customerName: z.string().trim().max(60).optional().or(z.literal('')),
  paymentMethod: z.enum(['cash', 'upi', 'card', 'qr']),
  notes: z.string().trim().max(220).optional().or(z.literal('')),
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
  const { items, activeCart, activeCartId, carts, clearCart, deleteCart } = useCart();
  const { mutate, isPending } = useCreateOrder();
  const queryClient = useQueryClient();
  const showToast = useToastStore((s) => s.show);
  const [soldPrices, setSoldPrices] = useState<Record<string, string>>({});

  const defaultValues = useMemo<CheckoutFormValues>(() => ({ customerName: activeCart?.customerName ?? '', paymentMethod: 'cash', notes: '' }), [activeCart?.customerName]);

  const { register, getValues, setValue, watch, formState: { errors } } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues,
  });

  const method = watch('paymentMethod');

  if (!activeCart || items.length === 0) {
    navigate('/products', { replace: true });
    return null;
  }

  const total = items.reduce((sum, item) => {
    const parsed = Number(soldPrices[item.product.id]);
    const price = Number.isFinite(parsed) && parsed >= 0 ? parsed : item.product.price;
    return sum + price * item.quantity;
  }, 0);

  function submitSale(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isPending) return;

    const operator = getOrAskDeviceUser();
    if (!operator) {
      showToast('Enter your staff/user name to complete the sale.', 'error');
      return;
    }

    const values = getValues();
    const normalizedItems = items.map((item) => {
      const parsed = Number(soldPrices[item.product.id]);
      const salePrice = Number.isFinite(parsed) && parsed >= 0 ? parsed : item.product.price;
      return {
        productId: item.product.id,
        productName: item.product.name,
        price: item.product.price,
        salePrice,
        quantity: item.quantity,
        imageUrl: item.product.imageUrl,
      };
    });

    mutate(
      {
        items: normalizedItems,
        total,
        paymentMethod: values.paymentMethod,
        customerName: values.customerName?.trim() || activeCart.customerName,
        notes: values.notes?.trim() || undefined,
        operatorName: operator,
      },
      {
        onSuccess: async (order) => {
          queryClient.invalidateQueries({ queryKey: ['products'] });
          queryClient.invalidateQueries({ queryKey: ['dashboard'] });
          queryClient.invalidateQueries({ queryKey: ['analytics'] });
          if (carts.length > 1) deleteCart(activeCartId);
          else clearCart(activeCartId);
          try {
            await downloadReceipt(order, operator);
            showToast(`Receipt downloaded for ${order.orderNumber}`, 'success');
          } catch (error) {
            console.error('Receipt download failed', error);
            showToast('Sale completed, but receipt download failed.', 'error');
          }
          navigate(`/order-success/${order.id}`, { state: order });
        },
        onError: (error) => {
          console.error('[POS] Order creation failed:', error);
          showToast(error instanceof Error ? error.message : 'Could not complete sale.', 'error');
        },
      },
    );
  }

  return (
    <div className="pb-32 md:pb-8">
      <div className="flex items-center gap-3 px-4 py-5 sm:px-6">
        <button type="button" onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5"><ArrowLeft className="h-5 w-5" /></button>
        <div className="min-w-0">
          <h1 className="truncate text-xl font-extrabold">Checkout</h1>
          <p className="truncate text-xs text-[var(--color-muted)]">{activeCart.customerName}</p>
        </div>
      </div>

      <form onSubmit={submitSale} className="space-y-5 px-4 sm:px-6">
        <Input label="Customer Name" placeholder="Customer name" error={errors.customerName?.message} {...register('customerName')} />

        <div>
          <p className="mb-2 text-sm font-semibold">Payment Method</p>
          <div className="grid grid-cols-2 gap-3">
            {paymentOptions.map((option) => {
              const isActive = method === option.id;
              return (
                <motion.button key={option.id} type="button" whileTap={{ scale: 0.96 }} onClick={() => setValue('paymentMethod', option.id, { shouldValidate: true, shouldDirty: true })} className={cn('relative flex items-center gap-2.5 overflow-hidden rounded-2xl border-2 px-4 py-3.5 text-sm font-semibold', isActive ? 'border-transparent text-white' : 'border-[var(--color-border)] text-[var(--color-text)]')}>
                  {isActive && <motion.span layoutId="payment-bg" className={cn('absolute inset-0', option.tone)} transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
                  <span className={cn('relative z-10 flex h-8 w-8 items-center justify-center rounded-xl', isActive ? 'bg-white/20' : 'bg-black/5')}>{option.icon}</span>
                  <span className="relative z-10">{option.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Notes (optional)</label>
          <textarea rows={3} placeholder="Any special notes for this order..." className="w-full resize-none rounded-[var(--radius-input)] border border-[var(--color-border)] bg-white p-4 text-[15px] outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10" {...register('notes')} />
        </div>

        <Card padding="md">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">{activeCart.customerName}</p>
              <p className="text-xs text-[var(--color-muted)]">{items.length} products · {items.reduce((sum, item) => sum + item.quantity, 0)} units</p>
            </div>
            <p className="text-xl font-extrabold">{formatYen(total)}</p>
          </div>
          <ul className="space-y-2 border-t border-[var(--color-border)] pt-3">
            {items.map((item) => {
              const saleValue = Number(soldPrices[item.product.id]);
              const effective = Number.isFinite(saleValue) && saleValue >= 0 ? saleValue : item.product.price;
              return (
                <li key={item.product.id} className="rounded-xl border border-[var(--color-border)]/70 p-3">
                  <div className="flex justify-between gap-3 text-sm">
                    <span className="text-[var(--color-muted)]">{item.quantity} × {item.product.name}</span>
                    <span className="font-semibold">{formatYen(effective * item.quantity)}</span>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <label htmlFor={`sold-price-${item.product.id}`} className="font-semibold">Sold at</label>
                    <input id={`sold-price-${item.product.id}`} type="number" min="0" inputMode="numeric" value={soldPrices[item.product.id] ?? item.product.price} onChange={(event: ChangeEvent<HTMLInputElement>) => setSoldPrices((previous) => ({ ...previous, [item.product.id]: event.target.value }))} className="w-24 rounded-lg border border-[var(--color-border)] bg-white px-2 py-1.5 text-right text-sm font-semibold outline-none focus:border-[var(--color-primary)]" />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        <div className="fixed inset-x-0 bottom-16 z-30 border-t border-[var(--color-border)] bg-[var(--color-bg)]/95 px-5 py-4 backdrop-blur-md md:bottom-0">
          <Button size="lg" className="w-full" isLoading={isPending} type="submit" leftIcon={!isPending ? <Check className="h-4 w-4" /> : undefined}>
            {isPending ? 'Processing Sale…' : `Complete Sale · ${formatYen(total)}`}
          </Button>
        </div>
      </form>
    </div>
  );
}
