// Zustand cart store — persist to localStorage

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, CartItemOption, CartItemTopping } from "@/types/order";

interface CartState {
  items: CartItem[];
  tableCode: string | null;

  // Actions
  addItem: (
    productId: string,
    productName: string,
    variantId: string,
    variantSize: string,
    basePrice: number,
    options: CartItemOption[],
    toppings: CartItemTopping[],
    note?: string
  ) => void;
  updateQuantity: (id: string, delta: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  setTableCode: (code: string) => void;

  // Computed
  totalAmount: () => number;
  itemCount: () => number;
}

let _idCounter = 0;
function genId(): string {
  return `cart_${Date.now()}_${++_idCounter}`;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      tableCode: null,

      addItem: (productId, productName, variantId, variantSize, basePrice, options, toppings, note = "") => {
        const toppingTotal = toppings.reduce((sum, t) => sum + t.price * t.quantity, 0);
        const totalPrice = (basePrice + toppingTotal);

        const item: CartItem = {
          id: genId(),
          productId,
          productName,
          variantId,
          variantSize,
          basePrice,
          options,
          toppings,
          quantity: 1,
          note,
          totalPrice,
        };

        set((state) => ({ items: [...state.items, item] }));
      },

      updateQuantity: (id, delta) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, quantity: Math.max(1, item.quantity + delta) }
              : item
          ),
        }));
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },

      clearCart: () => {
        set({ items: [] });
      },

      setTableCode: (code) => {
        set({ tableCode: code });
        localStorage.setItem("table", code);
      },

      totalAmount: () => {
        return get().items.reduce(
          (sum, item) => sum + item.totalPrice * item.quantity,
          0
        );
      },

      itemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },
    }),
    {
      name: "cart-storage", // localStorage key
      partialize: (state) => ({
        items: state.items,
        tableCode: state.tableCode,
      }),
    }
  )
);
