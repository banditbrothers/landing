import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { shared } from "use-broadcast-ts";
import { Coupon } from "@/types/coupon";

type CartState = {
  cart: {
    variantId: string;
    size: string;
    quantity: number;
  }[];
  updateCartItem: (id: string, quantity?: number, size?: string) => void;
  removeCartItem: (id: string, size?: string) => void;
  clearCart: () => void;

  isCartOpen: boolean;
  closeCart: () => void;
  openCart: () => void;

  coupon: Coupon | null;
  setCoupon: (coupon: Coupon | null) => void;
  clearCoupon: () => void;
};

export const useCart = create<CartState>()(
  shared(
    persist(
      set => ({
        cart: [],
        coupon: null,
        isCartOpen: false,

        closeCart: () => set({ isCartOpen: false }),
        openCart: () => set({ isCartOpen: true }),

        updateCartItem: (id, quantity = 1, size = "one-size") => {
          set(state => {
            const itemExists = state.cart.find(item => item.variantId === id && item.size === size);
            if (itemExists) {
              return {
                cart: state.cart.map(item => {
                  if (item.variantId !== id || item.size !== size) return item;

                  const newQuantity = item.quantity + quantity;
                  if (newQuantity > 0) return { ...item, quantity: newQuantity };
                  else return { ...item, quantity: 1 };
                }),
              };
            } else {
              const newQuantity = quantity > 0 ? quantity : 1;
              return { cart: [{ variantId: id, size, quantity: newQuantity }, ...state.cart] };
            }
          });
        },

        removeCartItem: (id, size) => set(state => ({
          cart: state.cart.filter(item => {
            if (size) {
              return !(item.variantId === id && item.size === size);
            }
            return item.variantId !== id;
          })
        })),
        clearCart: () => set({ cart: [] }),

        setCoupon: coupon => set({ coupon }),
        clearCoupon: () => set({ coupon: null }),
      }),
      { 
        name: "cart", 
        storage: createJSONStorage(() => localStorage),
      }
    ),
    { name: "cart" }
  )
);
