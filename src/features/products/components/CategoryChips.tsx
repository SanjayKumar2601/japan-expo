import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { cn } from '@/utils/cn';
import type { Category } from '@/types';

interface CategoryChipsProps {
  categories: Category[];
  active: string;
  onSelect: (id: string) => void;
}

export function CategoryChips({ categories, active, onSelect }: CategoryChipsProps) {
  const all = [{ id: 'all', name: 'All', icon: 'LayoutGrid', itemCount: 0, nameJa: '' }, ...categories];

  return (
    <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
      {all.map((cat) => {
        const isActive = active === cat.id;
        const Icon = (Icons as unknown as Record<string, Icons.LucideIcon>)[
          cat.icon
            .split('-')
            .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
            .join('')
        ] ?? Icons.Circle;

        return (
          <motion.button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            whileTap={{ scale: 0.95 }}
            className={cn(
              'relative flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors',
              isActive ? 'text-white' : 'border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-muted)]',
            )}
          >
            {isActive && (
              <motion.span
                layoutId="category-active"
                className="absolute inset-0 rounded-full gradient-primary"
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
            )}
            <Icon className="relative z-10 h-3.5 w-3.5" />
            <span className="relative z-10">{cat.name}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
