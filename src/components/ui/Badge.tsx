import type { HTMLAttributes } from 'react';
import { cn } from '@/utils/cn';

type Tone = 'primary' | 'success' | 'warning' | 'danger' | 'blue' | 'purple' | 'neutral';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

const toneClasses: Record<Tone, string> = {
  primary: 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]',
  success: 'bg-[var(--color-success)]/10 text-[var(--color-success)]',
  warning: 'bg-[var(--color-warning)]/10 text-[var(--color-warning)]',
  danger: 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]',
  blue: 'bg-[var(--color-blue)]/10 text-[var(--color-blue)]',
  purple: 'bg-[var(--color-purple)]/10 text-[var(--color-purple)]',
  neutral: 'bg-black/5 text-[var(--color-muted)]',
};

export function Badge({ tone = 'neutral', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold',
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  );
}
