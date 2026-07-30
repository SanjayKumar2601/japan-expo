import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/Card';
import { AnimatedCounter } from '@/components/shared/AnimatedCounter';
import { formatPercent } from '@/utils/format';
import { cn } from '@/utils/cn';

interface StatCardProps {
  label: string;
  value: number;
  formatter?: (v: number) => string;
  changePercent?: number;
  icon?: ReactNode;
  accent?: 'primary' | 'blue' | 'purple' | 'success';
}

const accentClasses = {
  primary: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
  blue: 'bg-[var(--color-blue)]/10 text-[var(--color-blue)]',
  purple: 'bg-[var(--color-purple)]/10 text-[var(--color-purple)]',
  success: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
};

export function StatCard({ label, value, formatter, changePercent, icon, accent = 'primary' }: StatCardProps) {
  return (
    <Card hoverLift padding="md" className="min-w-0">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold text-[var(--color-muted)]">{label}</span>
        {icon && (
          <span className={cn('flex h-8 w-8 items-center justify-center rounded-xl', accentClasses[accent])}>
            {icon}
          </span>
        )}
      </div>
      <div className="text-2xl font-extrabold text-[var(--color-text)] sm:text-[26px]">
        <AnimatedCounter value={value} formatter={formatter} />
      </div>
      {changePercent !== undefined && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className={cn(
            'mt-1.5 text-xs font-semibold',
            changePercent >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]',
          )}
        >
          {changePercent >= 0 ? '↑' : '↓'} {formatPercent(Math.abs(changePercent))} vs yesterday
        </motion.p>
      )}
    </Card>
  );
}
