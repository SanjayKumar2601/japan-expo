import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Check, Heart } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { formatYen } from '@/utils/format';
import { useCart } from '@/features/cart/hooks/useCart';
import type { Product } from '@/types';

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const navigate = useNavigate();
  const requestAdd = useCart().requestAdd;
  const [justAdded, setJustAdded] = useState(false);
  const [favorite, setFavorite] = useState(product.isFavorite ?? false);

  function handleAdd(e: React.MouseEvent) {
    e.stopPropagation();
    const source = e.currentTarget.getBoundingClientRect();
    const event = new CustomEvent('cart:fly', {
      detail: {
        sourceRect: source,
        imageUrl: product.imageUrl,
      },
    });
    window.dispatchEvent(event);
    requestAdd(product, 1);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 900);
  }

  const outOfStock = product.stock <= 0;
  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.04, 0.4) }}
    >
      <Card
        hoverLift
        padding="none"
        onClick={() => navigate(`/products/${product.id}`)}
        className={`cursor-pointer overflow-hidden ${outOfStock ? 'opacity-60 grayscale' : ''}`}
      >
        <div className="relative aspect-square w-full overflow-hidden bg-[var(--color-bg)]">
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-110"
          />
          <button
            onClick={(e) => {
              e.stopPropagation();
              setFavorite((f) => !f);
            }}
            className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm"
          >
            <Heart
              className="h-4 w-4 transition-colors"
              fill={favorite ? '#E5484D' : 'none'}
              stroke={favorite ? '#E5484D' : '#777777'}
            />
          </button>
          {outOfStock ? (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">
              Out of stock
            </span>
          ) : lowStock && (
            <span className="absolute left-2.5 top-2.5 rounded-full bg-[var(--color-warning)] px-2 py-0.5 text-[10px] font-bold text-white">
              Low stock
            </span>
          )}
        </div>
        <div className="p-3">
          <p className="truncate text-sm font-bold text-[var(--color-text)]">{product.name}</p>
          <p className={`text-xs ${outOfStock ? 'font-semibold text-[var(--color-muted)]' : 'text-[var(--color-muted)]'}`}>
            {outOfStock ? 'Out of stock' : `Stock ${product.stock}`}
          </p>
          <p className="mb-2 text-[11px] font-medium text-[var(--color-muted)]">Item ID: {product.id}</p>
          <div className="flex items-center justify-between">
            <span className="text-sm font-extrabold text-[var(--color-primary)]">{formatYen(product.price)}</span>
            <motion.button
              onClick={handleAdd}
              whileTap={{ scale: 0.85 }}
              disabled={outOfStock}
              className="flex h-8 w-8 items-center justify-center rounded-full gradient-primary text-white shadow-[var(--shadow-card)] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:bg-none disabled:opacity-100"
            >
              <AnimatePresence mode="wait" initial={false}>
                {justAdded ? (
                  <motion.span key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Check className="h-4 w-4" />
                  </motion.span>
                ) : (
                  <motion.span key="plus" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Plus className="h-4 w-4" />
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}
