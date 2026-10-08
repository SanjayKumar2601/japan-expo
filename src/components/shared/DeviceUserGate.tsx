import { useEffect, useState } from 'react';
import { UserRound, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { getDeviceUser, setDeviceUser } from '@/services/receipt';
import { Button } from '@/components/ui/Button';
import { useSettingsStore } from '@/store/settingsStore';

export function DeviceUserGate() {
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);
  const hasOnboarded = useSettingsStore((s) => s.hasOnboarded);

  useEffect(() => {
    const current = getDeviceUser();
    setName(current ?? '');
    setOpen(Boolean(hasOnboarded && !current));
  }, [hasOnboarded]);

  function save() {
    const value = name.trim();
    if (!value) return;
    setDeviceUser(value);
    setOpen(false);
    window.dispatchEvent(new Event('expo:device-user-changed'));
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/45 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        className="w-full max-w-md rounded-3xl bg-[var(--color-bg)] p-6 shadow-2xl"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl gradient-primary text-white shadow-[var(--shadow-glow)]">
          <UserRound className="h-7 w-7" />
        </div>

        <h2 className="mt-5 text-center text-2xl font-black">Welcome to Expo POS 👋</h2>
        <p className="mx-auto mt-2 max-w-sm text-center text-sm text-[var(--color-muted)]">
          What should we call the person using this device? This name is saved only on this device and appears on receipts.
        </p>

        <label className="mt-5 block text-sm font-semibold" htmlFor="device-user-name">
          Device / staff name
        </label>
        <input
          id="device-user-name"
          autoFocus
          value={name}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') save();
          }}
          placeholder="e.g. Sanjay"
          className="mt-2 w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] px-4 py-3.5 text-base outline-none focus:border-[var(--color-primary)] focus:ring-4 focus:ring-[var(--color-primary)]/10"
        />

        <Button
          size="lg"
          className="mt-5 w-full"
          disabled={!name.trim()}
          rightIcon={<ArrowRight className="h-4 w-4" />}
          onClick={save}
        >
          Continue
        </Button>
      </motion.div>
    </div>
  );
}
