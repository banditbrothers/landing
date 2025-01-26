import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type CartState = {
  items: {
    designId: string;
    quantity: number;
  }[];
  updateCartItem: (id: string, quantity?: number) => void;
  removeCartItem: (id: string) => void;
  clearCart: () => void;
};

export const useCart = create<CartState>()(
  persist(
    set => ({
      items: [],

      updateCartItem: (id, quantity = 1) => {
        set(state => {
          const itemExists = state.items.some(item => item.designId === id);
          if (itemExists) {
            return {
              items: state.items.map(item =>
                item.designId === id ? { ...item, quantity: item.quantity + quantity } : item
              ),
            };
          } else {
            return {
              items: [...state.items, { designId: id, quantity }],
            };
          }
        });
      },

      removeCartItem: id => set(state => ({ items: state.items.filter(i => i.designId !== id) })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
