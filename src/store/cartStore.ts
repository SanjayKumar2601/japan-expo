import { create } from 'zustand';
import type { CartItem, Product } from '@/types';

export interface CartSession {
  id: string;
  customerName: string;
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
}

interface AddRequest {
  product: Product;
  quantity: number;
}

interface CartState {
  carts: CartSession[];
  activeCartId: string;
  isOpen: boolean;
  addRequest: AddRequest | null;
  lastAddedProductId: string | null;
  createCart: (customerName: string) => string;
  renameCart: (cartId: string, customerName: string) => void;
  switchCart: (cartId: string) => void;
  deleteCart: (cartId: string) => void;
  requestAdd: (product: Product, quantity?: number) => void;
  closeAddRequest: () => void;
  addItemToCart: (cartId: string, product: Product, quantity?: number) => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  incrementItem: (productId: string) => void;
  decrementItem: (productId: string) => void;
  clearCart: (cartId?: string) => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const STORAGE_KEY = 'expo-sales-carts-v2';

function makeId(prefix = 'cart') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID()}`;
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function now() {
  return new Date().toISOString();
}

function createDefaultCart(): CartSession {
  const timestamp = now();
  return {
    id: makeId(),
    customerName: 'Walk-in Customer',
    items: [],
    createdAt: timestamp,
    updatedAt: timestamp,
  };
}

function loadInitialState() {
  if (typeof window === 'undefined') {
    const cart = createDefaultCart();
    return { carts: [cart], activeCartId: cart.id };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as { carts?: CartSession[]; activeCartId?: string };
      if (Array.isArray(parsed.carts) && parsed.carts.length > 0) {
        const activeCartId = parsed.carts.some((cart) => cart.id === parsed.activeCartId)
          ? parsed.activeCartId!
          : parsed.carts[0].id;
        return { carts: parsed.carts, activeCartId };
      }
    }
  } catch {
    // Fall through to a fresh cart if local storage is unavailable/corrupt.
  }

  const cart = createDefaultCart();
  return { carts: [cart], activeCartId: cart.id };
}

function persist(carts: CartSession[], activeCartId: string) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ carts, activeCartId }));
  } catch {
    // Cart state still works in memory if storage is full/unavailable.
  }
}

const initial = loadInitialState();

export const useCartStore = create<CartState>((set) => ({
  ...initial,
  isOpen: false,
  addRequest: null,
  lastAddedProductId: null,

  createCart: (customerName) => {
    const name = customerName.trim() || 'Walk-in Customer';
    const cart: CartSession = {
      id: makeId(),
      customerName: name,
      items: [],
      createdAt: now(),
      updatedAt: now(),
    };

    set((state) => {
      const carts = [...state.carts, cart];
      persist(carts, cart.id);
      return { carts, activeCartId: cart.id };
    });

    return cart.id;
  },

  renameCart: (cartId, customerName) =>
    set((state) => {
      const name = customerName.trim() || 'Walk-in Customer';
      const carts = state.carts.map((cart) =>
        cart.id === cartId ? { ...cart, customerName: name, updatedAt: now() } : cart,
      );
      persist(carts, state.activeCartId);
      return { carts };
    }),

  switchCart: (cartId) =>
    set((state) => {
      if (!state.carts.some((cart) => cart.id === cartId)) return state;
      persist(state.carts, cartId);
      return { activeCartId: cartId, isOpen: false };
    }),

  deleteCart: (cartId) =>
    set((state) => {
      if (state.carts.length <= 1) return state;
      const carts = state.carts.filter((cart) => cart.id !== cartId);
      const activeCartId = state.activeCartId === cartId ? carts[0].id : state.activeCartId;
      persist(carts, activeCartId);
      return { carts, activeCartId };
    }),

  requestAdd: (product, quantity = 1) => set({ addRequest: { product, quantity } }),
  closeAddRequest: () => set({ addRequest: null }),

  addItemToCart: (cartId, product, quantity = 1) =>
    set((state) => {
      const carts = state.carts.map((cart) => {
        if (cart.id !== cartId) return cart;
        const existing = cart.items.find((item) => item.product.id === product.id);
        const items = existing
          ? cart.items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            )
          : [...cart.items, { product, quantity }];
        return { ...cart, items, updatedAt: now() };
      });
      persist(carts, state.activeCartId);
      return { carts, lastAddedProductId: product.id, addRequest: null };
    }),

  addItem: (product, quantity = 1) =>
    set((state) => {
      const cartId = state.activeCartId;
      const carts = state.carts.map((cart) => {
        if (cart.id !== cartId) return cart;
        const existing = cart.items.find((item) => item.product.id === product.id);
        const items = existing
          ? cart.items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item,
            )
          : [...cart.items, { product, quantity }];
        return { ...cart, items, updatedAt: now() };
      });
      persist(carts, state.activeCartId);
      return { carts, lastAddedProductId: product.id };
    }),

  removeItem: (productId) =>
    set((state) => {
      const carts = state.carts.map((cart) =>
        cart.id === state.activeCartId
          ? { ...cart, items: cart.items.filter((item) => item.product.id !== productId), updatedAt: now() }
          : cart,
      );
      persist(carts, state.activeCartId);
      return { carts };
    }),

  incrementItem: (productId) =>
    set((state) => {
      const carts = state.carts.map((cart) =>
        cart.id === state.activeCartId
          ? {
              ...cart,
              items: cart.items.map((item) =>
                item.product.id === productId ? { ...item, quantity: item.quantity + 1 } : item,
              ),
              updatedAt: now(),
            }
          : cart,
      );
      persist(carts, state.activeCartId);
      return { carts };
    }),

  decrementItem: (productId) =>
    set((state) => {
      const carts = state.carts.map((cart) =>
        cart.id === state.activeCartId
          ? {
              ...cart,
              items: cart.items
                .map((item) =>
                  item.product.id === productId ? { ...item, quantity: item.quantity - 1 } : item,
                )
                .filter((item) => item.quantity > 0),
              updatedAt: now(),
            }
          : cart,
      );
      persist(carts, state.activeCartId);
      return { carts };
    }),

  clearCart: (cartId) =>
    set((state) => {
      const targetId = cartId ?? state.activeCartId;
      const carts = state.carts.map((cart) =>
        cart.id === targetId ? { ...cart, items: [], updatedAt: now() } : cart,
      );
      persist(carts, state.activeCartId);
      return { carts };
    }),

  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),
  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
}));

export const selectActiveCart = (state: CartState) =>
  state.carts.find((cart) => cart.id === state.activeCartId) ?? state.carts[0];

export const selectCartTotal = (state: CartState) => {
  const cart = selectActiveCart(state);
  return cart?.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0) ?? 0;
};

export const selectCartCount = (state: CartState) => {
  const cart = selectActiveCart(state);
  return cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
};

export const selectTotalCartCount = (state: CartState) =>
  state.carts.reduce((sum, cart) => sum + cart.items.reduce((count, item) => count + item.quantity, 0), 0);
