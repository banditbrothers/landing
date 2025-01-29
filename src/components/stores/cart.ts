import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Coupon } from "@/types/coupon";

type CartState = {
  cart: {
    designId: string;
    quantity: number;
  }[];
  coupon: Coupon | null;
  updateCartItem: (id: string, quantity?: number) => void;
  removeCartItem: (id: string) => void;
  setCoupon: (coupon: Coupon | null) => void;
  clearCoupon: () => void;
};

export const useCart = create<CartState>()(
  persist(
    set => ({
      cart: [],
      coupon: null,

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

      setCoupon: coupon => set({ coupon }),

      clearCoupon: () => set({ coupon: null }),
    }),
    {
      name: "cart",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
