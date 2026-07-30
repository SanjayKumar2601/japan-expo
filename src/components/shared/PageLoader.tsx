import { motion } from 'framer-motion';

export function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
        className="h-10 w-10 rounded-full border-4 border-[var(--color-primary)]/20 border-t-[var(--color-primary)]"
      />
    </div>
  );
}
