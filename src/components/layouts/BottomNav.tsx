import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { navItems } from './navConfig';
import { cn } from '@/utils/cn';

export function BottomNav() {
  return (
    <nav className="glass fixed inset-x-0 bottom-0 z-40 border-t border-[var(--color-border)] px-2 pb-[env(safe-area-inset-bottom)] pt-2 md:hidden">
      <div className="flex items-center justify-around">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className="relative flex flex-1 flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-semibold"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="bottomnav-active"
                    className="absolute top-0 h-1 w-8 rounded-full gradient-primary"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <motion.span
                  animate={{ scale: isActive ? 1.1 : 1, y: isActive ? -1 : 0 }}
                  className={cn(
                    'flex h-6 w-6 items-center justify-center',
                    isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)]',
                  )}
                >
                  <Icon className="h-5 w-5" />
                </motion.span>
                <span className={isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-muted)]'}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
