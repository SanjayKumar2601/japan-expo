import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center px-6 py-16 text-center"
    >
      <motion.div
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="mb-6 flex h-28 w-28 items-center justify-center rounded-full gradient-primary text-white shadow-[var(--shadow-glow)]"
      >
        {icon}
      </motion.div>
      <h3 className="mb-2 text-lg font-bold text-[var(--color-text)]">{title}</h3>
      <p className="mb-6 max-w-xs text-sm text-[var(--color-muted)]">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} size="md">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}
