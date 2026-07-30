import { useEffect, useRef } from 'react';
import { animate, useMotionValue, useTransform, motion } from 'framer-motion';

interface AnimatedCounterProps {
  value: number;
  formatter?: (value: number) => string;
  className?: string;
  duration?: number;
}

export function AnimatedCounter({
  value,
  formatter = (v) => Math.round(v).toLocaleString(),
  className,
  duration = 1.2,
}: AnimatedCounterProps) {
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => formatter(latest));
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(motionValue, value, { duration, ease: [0.16, 1, 0.3, 1] });
    return controls.stop;
  }, [value, motionValue, duration]);

  return <motion.span ref={ref} className={className}>{rounded}</motion.span>;
}
