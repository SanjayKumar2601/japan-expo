import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export function FloatingActionButton() {
  const navigate = useNavigate();
  const location = useLocation();

  const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
  const normalizedPath = location.pathname.replace(basePath, '') || '/';
  const hiddenOn = ['/checkout', '/order-success', '/splash', '/onboarding'];
  if (hiddenOn.some((p) => normalizedPath.startsWith(p))) return null;

  return (
    <motion.button
      onClick={() => navigate('/products')}
      initial={{ scale: 0, rotate: -30 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.3 }}
      whileHover={{ scale: 1.08, rotate: 8 }}
      whileTap={{ scale: 0.9 }}
      className="fixed bottom-24 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full gradient-primary text-white shadow-[var(--shadow-glow)] md:bottom-8"
      aria-label="New sale"
    >
      <Plus className="h-6 w-6" />
    </motion.button>
  );
}
