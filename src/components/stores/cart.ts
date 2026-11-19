import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { shared } from "use-broadcast-ts";
import { Coupon } from "@/types/coupon";
import { track } from "@/utils/analytics";
import { DEFAULT_SIZE } from "@/data/products";

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
        openCart: () => {
          track("cart_viewed");
          set({ isCartOpen: true });
        },

        updateCartItem: (id, quantity = 1, size = DEFAULT_SIZE) => {
          if (quantity < 0) track("cart_item_removed", { variant_id: id, size, quantity: -quantity });
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

        removeCartItem: (id, size) => {
          track("cart_item_removed", { variant_id: id, size, removed_line: true });
          set(state => ({
            cart: state.cart.filter(item => {
              if (size) {
                return !(item.variantId === id && item.size === size);
              }
              return item.variantId !== id;
            }),
          }));
        },
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

/** False on the server and until the cart has loaded from localStorage, so pages don't flash an empty cart. */
// `persist` is undefined on the server (no localStorage), hence the `?.`
export const useCartHydrated = () =>
  useSyncExternalStore(
    onChange => useCart.persist?.onFinishHydration(onChange) ?? (() => {}),
    () => useCart.persist?.hasHydrated() ?? false,
    () => false
  );
