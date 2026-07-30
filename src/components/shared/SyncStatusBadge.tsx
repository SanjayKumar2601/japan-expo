import { motion } from 'framer-motion';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { useNetworkStore } from '@/store/networkStore';
import { cn } from '@/utils/cn';

export function SyncStatusBadge() {
  const { syncState, pendingCount } = useNetworkStore();

  const config = {
    online: { icon: Wifi, label: 'Synced', tone: 'text-[var(--color-success)] bg-[var(--color-success)]/10' },
    offline: { icon: WifiOff, label: `${pendingCount} pending`, tone: 'text-[var(--color-warning)] bg-[var(--color-warning)]/10' },
    syncing: { icon: RefreshCw, label: 'Syncing…', tone: 'text-[var(--color-blue)] bg-[var(--color-blue)]/10' },
  }[syncState];

  const Icon = config.icon;

  return (
    <div className={cn('flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold', config.tone)}>
      <motion.span
        animate={syncState === 'syncing' ? { rotate: 360 } : {}}
        transition={syncState === 'syncing' ? { repeat: Infinity, duration: 1, ease: 'linear' } : {}}
      >
        <Icon className="h-3.5 w-3.5" />
      </motion.span>
      {config.label}
    </div>
  );
}
