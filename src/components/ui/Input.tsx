import { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/utils/cn';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-[var(--color-text)]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-muted)]">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'h-12 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-white px-4 text-[15px] text-[var(--color-text)] placeholder:text-[var(--color-muted)] outline-none transition-all duration-200 focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10',
              leftIcon && 'pl-11',
              error && 'border-[var(--color-danger)] focus:border-[var(--color-danger)] focus:ring-[var(--color-danger)]/10',
              className,
            )}
            {...props}
          />
        </div>
        {error && <p className="mt-1.5 text-xs font-medium text-[var(--color-danger)]">{error}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';
