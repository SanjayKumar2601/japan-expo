import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Heart, Minus, Plus } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { formatYen } from '@/utils/format';
import { useCartStore } from '@/store/cartStore';

export default function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: products, isLoading } = useProducts();
  const [qty, setQty] = useState(1);
  const [favorite, setFavorite] = useState(false);
  const requestAdd = useCartStore((s) => s.requestAdd);

  const product = products?.find((p) => p.id === id);
  const outOfStock = product ? product.stock <= 0 : false;

  if (isLoading) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <Skeleton className="aspect-square w-full" />
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6 text-center">
        <div>
          <p className="mb-3 text-lg font-bold">Product not found</p>
          <Button onClick={() => navigate('/products')}>Back to Products</Button>
        </div>
      </div>
    );
  }

  function handleAddToCart() {
    if (!product) return;
    requestAdd(product, qty);
  }

  return (
    <div className="pb-28 md:pb-8">
      <div className="relative">
        <motion.img
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          src={product.imageUrl}
          alt={product.name}
          className="aspect-square w-full object-cover sm:aspect-[16/9] sm:rounded-b-[var(--radius-card)]"
        />
        <button
          onClick={() => navigate(-1)}
          className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          onClick={() => setFavorite((f) => !f)}
          className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 backdrop-blur-sm"
        >
          <Heart className="h-5 w-5" fill={favorite ? '#E5484D' : 'none'} stroke={favorite ? '#E5484D' : '#777777'} />
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="-mt-6 rounded-t-[28px] bg-[var(--color-bg)] px-5 pt-6 sm:mt-0 sm:rounded-none sm:px-6"
      >
        <Badge tone="primary">{product.categoryName}</Badge>
        <h1 className="mt-2 text-2xl font-extrabold text-[var(--color-text)]">{product.name}</h1>
        {product.nameJa && <p className="text-sm text-[var(--color-muted)]">{product.nameJa}</p>}
        <p className="mt-3 text-3xl font-black text-[var(--color-primary)]">{formatYen(product.price)}</p>

        <p className="mt-4 text-sm leading-relaxed text-[var(--color-muted)]">
          {product.description ?? 'A beautifully crafted item, perfect as a keepsake from the expo.'}
        </p>

        <div className="mt-4 flex items-center gap-2 text-sm">
          <span className={`h-2 w-2 rounded-full ${outOfStock ? 'bg-gray-400' : product.stock > 5 ? 'bg-[var(--color-success)]' : 'bg-[var(--color-warning)]'}`} />
          <span className="text-[var(--color-muted)]">{outOfStock ? 'Out of stock' : `${product.stock} in stock`}</span>
        </div>

        <div className="mt-6 flex items-center gap-4">
          <span className="text-sm font-semibold">Quantity</span>
          <div className="flex items-center gap-3 rounded-full border border-[var(--color-border)] px-3 py-1.5">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex h-7 w-7 items-center justify-center active:scale-90">
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-5 text-center font-bold">{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
              className="flex h-7 w-7 items-center justify-center active:scale-90"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </motion.div>

      <div className="fixed inset-x-0 bottom-16 z-30 border-t border-[var(--color-border)] bg-[var(--color-bg)]/95 px-5 py-4 backdrop-blur-md sm:sticky sm:bottom-0 sm:mt-6 md:bottom-0">
        <Button size="lg" className="w-full" onClick={handleAddToCart} disabled={outOfStock}>
          Add to Cart · {formatYen(product.price * qty)}
        </Button>
      </div>
    </div>
  );
}
