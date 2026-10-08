import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, UserRound, X } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/components/ui/Button';
import { useToastStore } from '@/store/toastStore';

export function CartChooserModal() {
  const request = useCartStore((s) => s.addRequest);
  const carts = useCartStore((s) => s.carts);
  const addItemToCart = useCartStore((s) => s.addItemToCart);
  const createCart = useCartStore((s) => s.createCart);
  const closeAddRequest = useCartStore((s) => s.closeAddRequest);
  const switchCart = useCartStore((s) => s.switchCart);
  const showToast = useToastStore((s) => s.show);
  const [newCustomer, setNewCustomer] = useState('');

  if (!request) return null;

  function addTo(cartId: string) {
    addItemToCart(cartId, request.product, request.quantity);
    switchCart(cartId);
    showToast(`${request.quantity} × ${request.product.name} added to ${carts.find((cart) => cart.id === cartId)?.customerName ?? 'cart'}`, 'success');
  }

  function createAndAdd() {
    const name = newCustomer.trim();
    if (!name) return;
    const cartId = createCart(name);
    addItemToCart(cartId, request.product, request.quantity);
    showToast(`${request.quantity} × ${request.product.name} added to ${name}`, 'success');
    setNewCustomer('');
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] flex items-end justify-center bg-black/35 p-4 backdrop-blur-sm sm:items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={closeAddRequest}
      >
        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          onClick={(event) => event.stopPropagation()}
          className="w-full max-w-md overflow-hidden rounded-3xl bg-[var(--color-bg)] shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
            <div>
              <p className="text-lg font-extrabold">Add to which cart?</p>
              <p className="mt-0.5 text-xs text-[var(--color-muted)]">
                {request.quantity} × {request.product.name}
              </p>
            </div>
            <button onClick={closeAddRequest} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-black/5">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="max-h-[55vh] space-y-2 overflow-y-auto p-4">
            {carts.map((cart) => (
              <button
                key={cart.id}
                onClick={() => addTo(cart.id)}
                className="flex w-full items-center justify-between rounded-2xl border border-[var(--color-border)] bg-[var(--color-card)] p-4 text-left transition hover:border-[var(--color-primary)] active:scale-[0.99]"
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                    <UserRound className="h-5 w-5" />
                  </span>
                  <span>
                    <span className="block text-sm font-bold">{cart.customerName}</span>
                    <span className="block text-xs text-[var(--color-muted)]">
                      {cart.items.reduce((sum, item) => sum + item.quantity, 0)} items
                    </span>
                  </span>
                </span>
                <span className="text-xs font-semibold text-[var(--color-primary)]">Use cart →</span>
              </button>
            ))}
          </div>

          <div className="border-t border-[var(--color-border)] p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-bold">
              <Plus className="h-4 w-4" /> New customer cart
            </div>
            <div className="flex gap-2">
              <input
                autoFocus
                value={newCustomer}
                onChange={(event) => setNewCustomer(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') createAndAdd();
                }}
                placeholder="Customer name"
                className="min-w-0 flex-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] px-3 py-2.5 text-sm outline-none focus:border-[var(--color-primary)]"
              />
              <Button size="sm" onClick={createAndAdd} disabled={!newCustomer.trim()}>
                Add
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
