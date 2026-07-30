import { useMemo } from 'react';
import { motion } from 'framer-motion';

const COLORS = ['#FF6B00', '#FF9736', '#2CB67D', '#4D7CFE', '#7E57FF', '#F4A300'];

export function Confetti({ count = 40 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 320,
        rotate: Math.random() * 360,
        color: COLORS[i % COLORS.length],
        delay: Math.random() * 0.3,
        size: 6 + Math.random() * 6,
      })),
    [count],
  );

  return (
    <div className="pointer-events-none absolute inset-0 flex items-start justify-center overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: -20, x: 0, opacity: 1, rotate: 0 }}
          animate={{ y: 400, x: p.x, opacity: 0, rotate: p.rotate }}
          transition={{ duration: 1.6 + Math.random() * 0.6, delay: p.delay, ease: 'easeIn' }}
          style={{
            position: 'absolute',
            top: '10%',
            width: p.size,
            height: p.size * 0.4,
            backgroundColor: p.color,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
}
