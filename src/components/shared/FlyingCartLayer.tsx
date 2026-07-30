import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ShoppingBag } from 'lucide-react';

interface FlightItem {
  id: number;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  imageUrl?: string;
}

export function FlyingCartLayer() {
  const [flights, setFlights] = useState<FlightItem[]>([]);

  useEffect(() => {
    const handleFly = (event: Event) => {
      const customEvent = event as CustomEvent<{ sourceRect?: DOMRect; imageUrl?: string }>;
      const sourceRect = customEvent.detail?.sourceRect;
      const imageUrl = customEvent.detail?.imageUrl;

      if (!sourceRect) {
        return;
      }

      const target = document.querySelector('[data-cart-fly-target]') as HTMLElement | null;
      const targetRect = target?.getBoundingClientRect();

      if (!targetRect) {
        return;
      }

      const id = Date.now() + Math.random();
      const flight: FlightItem = {
        id,
        startX: sourceRect.left + sourceRect.width / 2,
        startY: sourceRect.top + sourceRect.height / 2,
        endX: targetRect.left + targetRect.width / 2,
        endY: targetRect.top + targetRect.height / 2,
        imageUrl,
      };

      setFlights((prev) => [...prev, flight]);
      window.setTimeout(() => {
        setFlights((prev) => prev.filter((item) => item.id !== id));
      }, 900);
    };

    window.addEventListener('cart:fly', handleFly as EventListener);
    return () => window.removeEventListener('cart:fly', handleFly as EventListener);
  }, []);

  return (
    <AnimatePresence>
      {flights.map((flight) => (
        <motion.div
          key={flight.id}
          initial={{ opacity: 0, scale: 0.45, left: flight.startX, top: flight.startY }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0.45, 1, 1, 0.8], left: flight.endX, top: flight.endY }}
          exit={{ opacity: 0, scale: 0.7 }}
          transition={{ duration: 0.9, ease: 'easeInOut' }}
          className="pointer-events-none fixed z-[90] flex h-14 w-14 -translate-x-1/2 -translate-y-1/2 items-center justify-center overflow-hidden rounded-full border border-white/70 bg-white shadow-[0_18px_45px_rgba(0,0,0,0.2)]"
        >
          {flight.imageUrl ? (
            <img src={flight.imageUrl} alt="Flying cart item" className="h-full w-full object-cover" />
          ) : (
            <ShoppingBag className="h-6 w-6 text-[var(--color-primary)]" />
          )}
        </motion.div>
      ))}
    </AnimatePresence>
  );
}
