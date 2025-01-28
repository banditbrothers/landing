import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type CartState = {
  cart: {
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
      cart: [],

      updateCartItem: (id, quantity = 1) => {
        set(state => {
          const itemExists = state.cart.some(item => item.designId === id);
          if (itemExists) {
            return {
              cart: state.cart.map(item => {
                if (item.designId !== id) return item;

                const newQuantity = item.quantity + quantity;
                if (newQuantity > 0) return { ...item, quantity: newQuantity };
                else return { ...item, quantity: 1 };
              }),
            };
          } else {
            const newQuantity = quantity > 0 ? quantity : 1;
            return { cart: [{ designId: id, quantity: newQuantity }, ...state.cart] };
          }
        });
      },

      removeCartItem: id => set(state => ({ cart: state.cart.filter(i => i.designId !== id) })),

      clearCart: () => set({ cart: [] }),
    }),
    {
      name: "cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
