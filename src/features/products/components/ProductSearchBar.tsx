import { Search, SlidersHorizontal } from 'lucide-react';

interface ProductSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onFilterClick?: () => void;
}

export function ProductSearchBar({ value, onChange, onFilterClick }: ProductSearchBarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[var(--color-muted)]" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Search products..."
          className="h-12 w-full rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-card)] pl-11 pr-4 text-[15px] outline-none transition-all focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
        />
      </div>
      <button
        onClick={onFilterClick}
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-input)] border border-[var(--color-border)] bg-[var(--color-card)] text-[var(--color-text)] transition-transform hover:scale-105 active:scale-95"
      >
        <SlidersHorizontal className="h-4.5 w-4.5" />
      </button>
    </div>
  );
}
