import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BrandMark } from '@/components/shared/BrandMark';
import { SakuraPetals } from '@/components/shared/SakuraPetals';
import { useSettingsStore } from '@/store/settingsStore';

export default function Splash() {
  const navigate = useNavigate();
  const hasOnboarded = useSettingsStore((s) => s.hasOnboarded);

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate(hasOnboarded ? '/' : '/onboarding', { replace: true });
    }, 2200);
    return () => clearTimeout(timer);
  }, [navigate, hasOnboarded]);

  return (
    <div className="relative flex h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-b from-[#FFF1E4] via-[#FFF8F3] to-[#FFE4CC] px-6 text-center">
      <SakuraPetals count={12} />

      {/* Mt Fuji + sun illustration */}
      <motion.svg
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        viewBox="0 0 400 200"
        className="absolute bottom-0 w-full max-w-2xl opacity-80"
      >
        <circle cx="200" cy="90" r="55" fill="#FF6B00" opacity="0.85" />
        <path d="M0 200 L120 60 L160 110 L200 40 L260 130 L320 90 L400 200 Z" fill="#4D7CFE" opacity="0.15" />
        <path d="M60 200 L200 20 L340 200 Z" fill="#222222" opacity="0.08" />
      </motion.svg>

      <motion.div
        initial={{ scale: 0.6, opacity: 0, rotate: -10 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 14 }}
        className="relative z-10 mb-6 flex h-24 w-24 items-center justify-center rounded-[28px] gradient-primary text-white shadow-[var(--shadow-glow)]"
      >
        <BrandMark className="h-11 w-11" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="relative z-10 text-3xl font-black tracking-tight text-[var(--color-text)]"
      >
        EXPO<br />
        <span className="gradient-text">SALES TRACKER</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="relative z-10 mt-3 text-sm font-medium text-[var(--color-muted)]"
      >
        Smart POS for Japanese Expo
      </motion.p>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="relative z-10 mt-8 flex gap-4 text-xs font-semibold text-[var(--color-muted)]"
      >
        <span>⚡ Fast</span>
        <span>🛡️ Reliable</span>
        <span>📶 Offline Ready</span>
      </motion.div>

      <motion.div
        className="absolute bottom-10 h-1.5 w-40 overflow-hidden rounded-full bg-black/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <motion.div
          className="h-full gradient-primary"
          initial={{ width: '0%' }}
          animate={{ width: '100%' }}
          transition={{ duration: 1.8, ease: 'easeInOut' }}
        />
      </motion.div>
    </div>
  );
}
