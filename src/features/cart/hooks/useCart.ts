import { useCartStore, selectCartTotal, selectCartCount } from '@/store/cartStore';

export function useCart() {
  const items = useCartStore((s) => s.items);
  const isOpen = useCartStore((s) => s.isOpen);
  const total = useCartStore(selectCartTotal);
  const count = useCartStore(selectCartCount);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const incrementItem = useCartStore((s) => s.incrementItem);
  const decrementItem = useCartStore((s) => s.decrementItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const openCart = useCartStore((s) => s.openCart);
  const closeCart = useCartStore((s) => s.closeCart);

  return {
    items,
    isOpen,
    total,
    count,
    addItem,
    removeItem,
    incrementItem,
    decrementItem,
    clearCart,
    openCart,
    closeCart,
  };
}
