import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Minus, Plus, Trash2, ShoppingBag, UserRound, ChevronDown, Pencil, Trash } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatYen } from '@/utils/format';
import { useToastStore } from '@/store/toastStore';

export function CartDrawer() {
  const {
    items,
    isOpen,
    total,
    count,
    closeCart,
    incrementItem,
    decrementItem,
    removeItem,
    carts,
    activeCart,
    activeCartId,
    switchCart,
    createCart,
    renameCart,
    deleteCart,
    clearCart,
  } = useCart();
  const navigate = useNavigate();
  const showToast = useToastStore((s) => s.show);
  const [showCarts, setShowCarts] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(activeCart?.customerName ?? '');

  function handleDeleteCart() {
    if (!activeCart || carts.length <= 1) return;
    if (!window.confirm(`Delete ${activeCart.customerName}'s cart? This cannot be undone.`)) return;
    deleteCart(activeCart.id);
    showToast('Customer cart deleted', 'info');
  }

  function handleClearCart() {
    if (!activeCart || items.length === 0) return;
    if (!window.confirm(`Clear all items from ${activeCart.customerName}'s cart?`)) return;
    clearCart();
    showToast('Cart cleared', 'info');
  }

  function handleRename() {
    if (!activeCart) return;
    renameCart(activeCart.id, name);
    setEditingName(false);
    showToast('Customer cart renamed', 'success');
  }

  function handleNewCart() {
    const customer = window.prompt('Customer name');
    if (!customer?.trim()) return;
    createCart(customer);
    setShowCarts(false);
    showToast(`New cart created for ${customer.trim()}`, 'success');
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeCart} className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 34 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-[var(--color-bg)] shadow-2xl"
          >
            <div className="border-b border-[var(--color-border)] px-5 py-4">
              <div className="flex items-center justify-between">
                <button onClick={() => setShowCarts((value) => !value)} className="min-w-0 text-left">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted)]">Active customer</p>
                  <span className="mt-0.5 flex items-center gap-1 text-lg font-extrabold">
                    <UserRound className="h-4 w-4 text-[var(--color-primary)]" />
                    <span className="max-w-[240px] truncate">{activeCart?.customerName}</span>
                    <ChevronDown className="h-4 w-4 text-[var(--color-muted)]" />
                  </span>
                </button>
                <button onClick={closeCart} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {showCarts && (
                <div className="mt-3 space-y-2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-2">
                  {carts.map((cart) => (
                    <button
                      key={cart.id}
                      onClick={() => {
                        switchCart(cart.id);
                        setShowCarts(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left ${cart.id === activeCartId ? 'bg-[var(--color-primary)]/10' : 'hover:bg-black/5'}`}
                    >
                      <span className="text-sm font-semibold">{cart.customerName}</span>
                      <span className="text-xs text-[var(--color-muted)]">{cart.items.reduce((sum, item) => sum + item.quantity, 0)} items</span>
                    </button>
                  ))}
                  <Button size="sm" variant="outline" className="w-full" onClick={handleNewCart}>+ New customer cart</Button>
                </div>
              )}

              <div className="mt-3 flex gap-2">
                {editingName ? (
                  <>
                    <input value={name} onChange={(event) => setName(event.target.value)} className="min-w-0 flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2 text-sm outline-none" autoFocus />
                    <Button size="sm" onClick={handleRename}>Save</Button>
                  </>
                ) : (
                  <>
                    <button onClick={() => { setName(activeCart?.customerName ?? ''); setEditingName(true); }} className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-xs font-semibold text-[var(--color-muted)] hover:bg-black/5">
                      <Pencil className="h-3.5 w-3.5" /> Rename
                    </button>
                    {carts.length > 1 && (
                      <button onClick={handleDeleteCart} className="flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-xs font-semibold text-[var(--color-danger)] hover:bg-[var(--color-danger)]/10">
                        <Trash className="h-3.5 w-3.5" /> Delete cart
                      </button>
                    )}
                    {items.length > 0 && (
                      <button onClick={handleClearCart} className="ml-auto flex items-center gap-1.5 rounded-xl px-2 py-1.5 text-xs font-semibold text-[var(--color-muted)] hover:bg-black/5">
                        <Trash2 className="h-3.5 w-3.5" /> Clear
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              {items.length === 0 ? (
                <EmptyState
                  icon={<ShoppingBag className="h-10 w-10" />}
                  title="This cart is empty"
                  description="Add products and choose this customer cart when prompted."
                  actionLabel="Browse Products"
                  onAction={() => { closeCart(); navigate('/products'); }}
                />
              ) : (
                <ul className="space-y-3">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li key={item.product.id} layout initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 40, height: 0, marginBottom: 0 }} className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-3">
                        <img src={item.product.imageUrl} alt={item.product.name} className="h-16 w-16 shrink-0 rounded-xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-bold">{item.product.name}</p>
                          <p className="text-sm font-semibold text-[var(--color-primary)]">{formatYen(item.product.price)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => decrementItem(item.product.id)} className="flex h-7 w-7 items-center justify-center rounded-full border border-[var(--color-border)] active:scale-90"><Minus className="h-3.5 w-3.5" /></button>
                          <span className="w-4 text-center text-sm font-bold">{item.quantity}</span>
                          <button onClick={() => incrementItem(item.product.id)} className="flex h-7 w-7 items-center justify-center rounded-full gradient-primary text-white active:scale-90"><Plus className="h-3.5 w-3.5" /></button>
                        </div>
                        <button onClick={() => removeItem(item.product.id)} className="ml-1 text-[var(--color-muted)] hover:text-[var(--color-danger)]"><Trash2 className="h-4 w-4" /></button>
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
                <Button size="lg" className="w-full" onClick={() => { closeCart(); navigate('/checkout'); }}>Checkout {activeCart?.customerName ? `· ${activeCart.customerName}` : ''} →</Button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
