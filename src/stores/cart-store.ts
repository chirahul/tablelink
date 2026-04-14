import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, MenuAddon, MenuVariant } from "@/lib/types";

type CartState = {
  items: CartItem[];
  restaurantId: string | null;
  tableId: string | null;
};

type CartActions = {
  addItem: (item: Omit<CartItem, "id">) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  setContext: (restaurantId: string, tableId: string) => void;
  getSubtotal: () => number;
  getTax: (taxRate: number) => number;
  getTotal: (taxRate: number) => number;
  getItemCount: () => number;
};

export const useCartStore = create<CartState & CartActions>()(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      tableId: null,

      setContext: (restaurantId: string, tableId: string) => {
        const state = get();
        // Clear cart if switching restaurants
        if (state.restaurantId && state.restaurantId !== restaurantId) {
          set({ items: [], restaurantId, tableId });
        } else {
          set({ restaurantId, tableId });
        }
      },

      addItem: (item) => {
        const id = crypto.randomUUID();
        set((state) => ({
          items: [...state.items, { ...item, id }],
        }));
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => {
        set({ items: [], restaurantId: null, tableId: null });
      },

      getSubtotal: () => {
        return get().items.reduce((total, item) => {
          const addonTotal = item.addons.reduce((sum, addon) => sum + addon.price, 0);
          return total + (item.price + addonTotal) * item.quantity;
        }, 0);
      },

      getTax: (taxRate: number) => {
        return get().getSubtotal() * (taxRate / 100);
      },

      getTotal: (taxRate: number) => {
        const subtotal = get().getSubtotal();
        return subtotal + subtotal * (taxRate / 100);
      },

      getItemCount: () => {
        return get().items.reduce((count, item) => count + item.quantity, 0);
      },
    }),
    {
      name: "tablelink-cart",
    }
  )
);
