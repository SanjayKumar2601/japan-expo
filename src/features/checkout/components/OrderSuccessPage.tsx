import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, ArrowRight, Download, Printer } from 'lucide-react';
import { Confetti } from '@/components/shared/Confetti';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { formatYen } from '@/utils/format';
import { downloadReceipt, getOrAskDeviceUser, printReceipt } from '@/services/receipt';
import { useToastStore } from '@/store/toastStore';
import type { Order } from '@/types';

export default function OrderSuccessPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const showToast = useToastStore((s) => s.show);
  const order = (location.state as Order | undefined) ?? undefined;

  if (!order) {
    navigate('/', { replace: true });
    return null;
  }

  async function handleDownload() {
    const user = getOrAskDeviceUser();
    if (!user) return;
    try {
      await downloadReceipt(order, user);
      showToast('Receipt downloaded', 'success');
    } catch (error) {
      console.error(error);
      showToast('Could not create receipt', 'error');
    }
  }

  async function handlePrint() {
    const user = getOrAskDeviceUser();
    if (!user) return;
    try {
      await printReceipt(order, user);
    } catch (error) {
      console.error(error);
      showToast('Could not open printable receipt', 'error');
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden px-6 pb-10 pt-16 text-center">
      <Confetti />
      <motion.div initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 260, damping: 16 }} className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[var(--color-success)] text-white shadow-[0_20px_40px_rgba(44,182,125,0.3)]">
        <CheckCircle2 className="h-12 w-12" />
      </motion.div>
      <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-extrabold">Sale Completed!</motion.h1>
      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1 text-sm text-[var(--color-muted)]">Order {order.orderNumber}</motion.p>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mt-8 w-full max-w-sm">
        <Card padding="lg">
          <p className="text-4xl font-black text-[var(--color-primary)]">{formatYen(order.total)}</p>
          <p className="mb-4 text-xs uppercase tracking-wide text-[var(--color-muted)]">{order.paymentMethod} {order.customerName ? `· ${order.customerName}` : ''}</p>
          <ul className="space-y-2 border-t border-[var(--color-border)] pt-4 text-left text-sm">
            {order.items.map((item) => (
              <li key={item.productId} className="flex justify-between gap-3">
                <span className="text-[var(--color-muted)]">{item.quantity} × {item.productName}</span>
                <span className="font-semibold">{formatYen((item.salePrice ?? item.price) * item.quantity)}</span>
              </li>
            ))}
          </ul>
        </Card>
      </motion.div>

      <div className="mt-6 grid w-full max-w-sm grid-cols-2 gap-3">
        <Button variant="outline" onClick={handleDownload} leftIcon={<Download className="h-4 w-4" />}>Receipt PNG</Button>
        <Button variant="outline" onClick={handlePrint} leftIcon={<Printer className="h-4 w-4" />}>Print / PDF</Button>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 w-full max-w-sm">
        <Button size="lg" className="w-full" rightIcon={<ArrowRight className="h-4 w-4" />} onClick={() => navigate('/products')}>New Sale</Button>
      </motion.div>
    </div>
  );
}
