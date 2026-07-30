import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { SakuraPetals } from '@/components/shared/SakuraPetals';
import { useSettingsStore } from '@/store/settingsStore';

export default function Onboarding() {
  const navigate = useNavigate();
  const completeOnboarding = useSettingsStore((s) => s.completeOnboarding);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-gradient-to-b from-[#FFF1E4] to-[var(--color-bg)] px-6 pb-10 pt-16 text-center">
      <SakuraPetals count={6} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mx-auto mb-10 flex h-52 w-52 items-center justify-center"
      >
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
          className="relative flex h-44 w-44 items-center justify-center rounded-full gradient-primary shadow-[var(--shadow-glow)]"
        >
          {/* Maneki-neko (lucky cat) simplified illustration */}
          <svg viewBox="0 0 100 100" className="h-28 w-28">
            <ellipse cx="50" cy="72" rx="30" ry="22" fill="white" />
            <circle cx="50" cy="42" r="26" fill="white" />
            <path d="M28 24 L34 8 L42 26 Z" fill="white" />
            <path d="M72 24 L66 8 L58 26 Z" fill="white" />
            <circle cx="41" cy="42" r="3.5" fill="#222222" />
            <circle cx="59" cy="42" r="3.5" fill="#222222" />
            <path d="M46 50 Q50 54 54 50" stroke="#222222" strokeWidth="2" fill="none" strokeLinecap="round" />
            <ellipse cx="30" cy="46" rx="4" ry="3" fill="#FF9736" />
            <ellipse cx="70" cy="46" rx="4" ry="3" fill="#FF9736" />
            <motion.path
              d="M74 60 Q90 55 90 38"
              stroke="white"
              strokeWidth="7"
              fill="none"
              strokeLinecap="round"
              animate={{ rotate: [0, 14, 0] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformOrigin: '74px 60px' }}
            />
            <circle cx="50" cy="20" r="6" fill="#FF6B00" />
          </svg>
        </motion.div>
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="relative z-10 text-3xl font-black leading-tight text-[var(--color-text)]"
      >
        All your sales<br /><span className="gradient-text">in one place</span>
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="relative z-10 mx-auto mt-4 max-w-xs text-[15px] text-[var(--color-muted)]"
      >
        Track orders, manage products and grow your business effortlessly.
      </motion.p>

      <div className="relative z-10 mt-auto flex flex-col items-center gap-4">
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all ${i === 0 ? 'w-6 bg-[var(--color-primary)]' : 'w-1.5 bg-[var(--color-border)]'}`}
            />
          ))}
        </div>
        <Button
          size="lg"
          className="w-full max-w-xs"
          rightIcon={<ArrowRight className="h-4 w-4" />}
          onClick={() => {
            completeOnboarding();
            navigate('/');
          }}
        >
          Get Started
        </Button>
      </div>
    </div>
  );
}
