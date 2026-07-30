import { AnimatePresence, motion } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatYen } from '@/utils/format';

export function CartDrawer() {
  const { items, isOpen, total, count, closeCart, incrementItem, decrementItem, removeItem } = useCart();
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-[var(--color-bg)] shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-5">
              <h2 className="text-lg font-extrabold">Your Cart</h2>
              <button
                onClick={closeCart}
                className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <EmptyState
                  icon={<ShoppingBag className="h-10 w-10" />}
                  title="Your cart is empty"
                  description="Add some beautiful items from the catalogue to get started."
                  actionLabel="Browse Products"
                  onAction={() => {
                    closeCart();
                    navigate('/products');
                  }}
                />
              ) : (
                <ul className="space-y-3">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.product.id}
                        layout
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0 }}
                        className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-3"
                      >
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="h-16 w-16 shrink-0 rounded-xl object-cover"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold">{item.product.name}</p>
                          <p className="text-sm font-semibold text-[var(--color-primary)]">
                            {formatYen(item.product.price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => decrementItem(item.product.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-border)] active:scale-90"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-4 text-center text-sm font-bold">{item.quantity}</span>
                          <button
                            onClick={() => incrementItem(item.product.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-full gradient-primary text-white active:scale-90"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="ml-1 text-[var(--color-muted)] hover:text-[var(--color-danger)]"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-[var(--color-border)] px-5 py-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-[var(--color-muted)]">Total ({count} items)</span>
                  <span className="text-xl font-extrabold">{formatYen(total)}</span>
                </div>
                <Button
                  size="lg"
                  className="w-full"
                  onClick={() => {
                    closeCart();
                    navigate('/checkout');
                  }}
                >
                  Checkout →
                </Button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
