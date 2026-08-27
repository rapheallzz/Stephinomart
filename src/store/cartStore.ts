import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItem, Product } from "@/lib/types";

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  lastAddedId: string | null;
  open: () => void;
  close: () => void;
  toggle: () => void;
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
  totalItems: () => number;
  totalPrice: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      lastAddedId: null,

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((s) => ({ isOpen: !s.isOpen })),

      addItem: (product, quantity = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.id === product.id);
          const cappedQty = Math.min(
            (existing?.quantity ?? 0) + quantity,
            product.stock
          );

          const items = existing
            ? state.items.map((i) =>
                i.id === product.id ? { ...i, quantity: cappedQty } : i
              )
            : [
                ...state.items,
                {
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                  quantity: Math.min(quantity, product.stock),
                  stock: product.stock,
                },
              ];

          return { items, isOpen: true, lastAddedId: product.id };
        });
      },

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      setQuantity: (id, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.id !== id)
              : state.items.map((i) =>
                  i.id === id
                    ? { ...i, quantity: Math.min(quantity, i.stock) }
                    : i
                ),
        })),

      clear: () => set({ items: [] }),

      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalPrice: () =>
        get().items.reduce((sum, i) => sum + i.quantity * i.price, 0),
    }),
    { name: "ecommerce-cart" }
  )
);
