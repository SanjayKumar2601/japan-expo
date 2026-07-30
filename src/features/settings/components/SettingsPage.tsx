import { motion } from 'framer-motion';
import { ChevronRight, Download, FileText, Info, Moon, RefreshCw, Sheet, Volume2 } from 'lucide-react';
import { TopBar } from '@/components/layouts/TopBar';
import { PageTransition } from '@/components/shared/PageTransition';
import { Card } from '@/components/ui/Card';
import { Toggle } from '@/components/ui/Toggle';
import { Button } from '@/components/ui/Button';
import { useSettingsStore } from '@/store/settingsStore';
import { useNetworkStore } from '@/store/networkStore';
import { useToastStore } from '@/store/toastStore';
import { syncPendingOrders } from '@/services/googleSheets';
import { useState } from 'react';

export default function SettingsPage() {
  const { theme, setTheme, soundEnabled, toggleSound } = useSettingsStore();
  const pendingCount = useNetworkStore((s) => s.pendingCount);
  const showToast = useToastStore((s) => s.show);
  const [syncing, setSyncing] = useState(false);

  async function handleSyncNow() {
    setSyncing(true);
    const { syncedCount } = await syncPendingOrders();
    setSyncing(false);
    showToast(syncedCount > 0 ? `Synced ${syncedCount} orders` : 'Everything is up to date', 'success');
  }

  return (
    <PageTransition>
      <TopBar title="Settings" subtitle="Manage your app preferences" />
      <div className="space-y-5 px-4 pb-28 sm:px-6 md:pb-8">
        <SettingsSection title="Preferences">
          <SettingsRow icon={<Moon className="h-4.5 w-4.5" />} label="Dark Mode">
            <Toggle checked={theme === 'dark'} onChange={(v) => setTheme(v ? 'dark' : 'light')} />
          </SettingsRow>
          <SettingsRow icon={<Volume2 className="h-4.5 w-4.5" />} label="Sound & Haptics">
            <Toggle checked={soundEnabled} onChange={toggleSound} />
          </SettingsRow>
        </SettingsSection>

        <SettingsSection title="Sync Catalogue">
          <SettingsRow icon={<Sheet className="h-4.5 w-4.5" />} label="Google Sheets Connection" chevron subtitle="Connected" />
          <SettingsRow icon={<Download className="h-4.5 w-4.5" />} label="Export Data" chevron subtitle="Export orders and reports" />
          <SettingsRow icon={<FileText className="h-4.5 w-4.5" />} label="Print Test" chevron subtitle="Test your receipt printer" />
        </SettingsSection>

        <Card padding="md">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold">Sync Now</p>
              <p className="text-xs text-[var(--color-muted)]">
                {pendingCount > 0 ? `${pendingCount} orders waiting to sync` : 'All caught up'}
              </p>
            </div>
            <motion.span
              animate={syncing ? { rotate: 360 } : {}}
              transition={syncing ? { repeat: Infinity, duration: 1, ease: 'linear' } : {}}
            >
              <RefreshCw className="h-5 w-5 text-[var(--color-primary)]" />
            </motion.span>
          </div>
          <Button className="w-full" isLoading={syncing} onClick={handleSyncNow}>
            Sync Now
          </Button>
        </Card>

        <SettingsSection title="About">
          <SettingsRow icon={<Info className="h-4.5 w-4.5" />} label="About App" chevron subtitle="Version 1.0.0" />
        </SettingsSection>
      </div>
    </PageTransition>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wide text-[var(--color-muted)]">{title}</p>
      <Card padding="none" className="divide-y divide-[var(--color-border)] overflow-hidden">
        {children}
      </Card>
    </div>
  );
}

function SettingsRow({
  icon,
  label,
  subtitle,
  chevron,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  chevron?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-4">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
          {icon}
        </span>
        <div>
          <p className="text-sm font-semibold text-[var(--color-text)]">{label}</p>
          {subtitle && <p className="text-xs text-[var(--color-muted)]">{subtitle}</p>}
        </div>
      </div>
      {children ?? (chevron && <ChevronRight className="h-4 w-4 text-[var(--color-muted)]" />)}
    </div>
  );
}
