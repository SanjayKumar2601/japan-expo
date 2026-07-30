import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronsLeft, ChevronsRight } from 'lucide-react';
import { navItems } from './navConfig';
import { cn } from '@/utils/cn';
import { BrandMark } from '@/components/shared/BrandMark';

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <motion.aside
      animate={{ width: collapsed ? 84 : 256 }}
      transition={{ type: 'spring', stiffness: 260, damping: 30 }}
      className="sticky top-0 hidden h-screen shrink-0 flex-col border-r border-[var(--color-border)] bg-[var(--color-card)] py-6 md:flex"
    >
      <div className={cn('mb-8 flex items-center gap-2.5 px-5', collapsed && 'justify-center px-0')}>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl gradient-primary text-white shadow-[var(--shadow-card)]">
          <BrandMark className="h-5 w-5" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <p className="whitespace-nowrap text-sm font-extrabold leading-tight text-[var(--color-text)]">
              Expo Sales
            </p>
            <p className="whitespace-nowrap text-xs text-[var(--color-muted)]">Tracker</p>
          </div>
        )}
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'group relative flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition-colors',
                isActive
                  ? 'text-[var(--color-primary)]'
                  : 'text-[var(--color-muted)] hover:bg-black/5 hover:text-[var(--color-text)]',
                collapsed && 'justify-center',
              )
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-2xl bg-[var(--color-primary)]/10"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <Icon className="relative z-10 h-5 w-5 shrink-0" />
                {!collapsed && <span className="relative z-10 whitespace-nowrap">{label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={() => setCollapsed((c) => !c)}
        className="mx-3 flex items-center justify-center gap-2 rounded-2xl border border-[var(--color-border)] py-2.5 text-xs font-semibold text-[var(--color-muted)] transition-colors hover:bg-black/5"
      >
        {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
        {!collapsed && 'Collapse'}
      </button>
    </motion.aside>
  );
}
