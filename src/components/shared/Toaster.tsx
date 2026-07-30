import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, XCircle, Info } from 'lucide-react';
import { useToastStore } from '@/store/toastStore';

const icons = {
  success: <CheckCircle2 className="h-5 w-5 text-[var(--color-success)]" />,
  error: <XCircle className="h-5 w-5 text-[var(--color-danger)]" />,
  info: <Info className="h-5 w-5 text-[var(--color-blue)]" />,
};

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-[100] flex flex-col items-center gap-2 px-4 sm:top-6">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -24, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="glass pointer-events-auto flex items-center gap-2.5 rounded-2xl border border-[var(--color-border)] px-4 py-3 shadow-[var(--shadow-lift)]"
          >
            {icons[toast.tone]}
            <span className="text-sm font-medium text-[var(--color-text)]">{toast.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
