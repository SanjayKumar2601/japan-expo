import { useCartStore, selectActiveCart, selectCartCount, selectCartTotal, selectTotalCartCount } from '@/store/cartStore';

export function useCart() {
  const carts = useCartStore((s) => s.carts);
  const activeCartId = useCartStore((s) => s.activeCartId);
  const activeCart = useCartStore(selectActiveCart);
  const items = activeCart?.items ?? [];
  const isOpen = useCartStore((s) => s.isOpen);
  const count = useCartStore(selectCartCount);
  const total = useCartStore(selectCartTotal);
  const totalCartCount = useCartStore(selectTotalCartCount);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);
  const incrementItem = useCartStore((s) => s.incrementItem);
  const decrementItem = useCartStore((s) => s.decrementItem);
  const clearCart = useCartStore((s) => s.clearCart);
  const openCart = useCartStore((s) => s.openCart);
  const closeCart = useCartStore((s) => s.closeCart);
  const createCart = useCartStore((s) => s.createCart);
  const renameCart = useCartStore((s) => s.renameCart);
  const switchCart = useCartStore((s) => s.switchCart);
  const deleteCart = useCartStore((s) => s.deleteCart);
  const requestAdd = useCartStore((s) => s.requestAdd);

  return {
    carts,
    activeCart,
    activeCartId,
    items,
    isOpen,
    total,
    count,
    totalCartCount,
    addItem,
    removeItem,
    incrementItem,
    decrementItem,
    clearCart,
    openCart,
    closeCart,
    createCart,
    renameCart,
    switchCart,
    deleteCart,
    requestAdd,
  };
}
