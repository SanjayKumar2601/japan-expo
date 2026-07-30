import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';

export function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'flex h-7 w-12 items-center rounded-full p-1 transition-colors',
        checked ? 'gradient-primary justify-end' : 'justify-start bg-[var(--color-border)]',
      )}
    >
      <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 32 }} className="h-5 w-5 rounded-full bg-white shadow" />
    </button>
  );
}
