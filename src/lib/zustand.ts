import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type CartState = {
  items: {
    designId: string;
    quantity: number;
  }[];
  updateCartItem: (id: string, quantity?: number) => void;
  setCart: (items: { designId: string; quantity: number }[]) => void;
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
              items: state.items.map(item => {
                if (item.designId !== id) return item;

                const newQuantity = item.quantity + quantity;
                if (newQuantity > 0) return { ...item, quantity: newQuantity };
                else return { ...item, quantity: 1 };
              }),
            };
          } else {
            if (quantity > 0) return { items: [...state.items, { designId: id, quantity }] };
            else return { items: [...state.items, { designId: id, quantity: 1 }] };
          }
        });
      },

      setCart: (items: { designId: string; quantity: number }[]) => set({ items }),

      removeCartItem: id => set(state => ({ items: state.items.filter(i => i.designId !== id) })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
