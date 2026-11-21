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

// The cart is open exactly when the current history entry says so: opening pushes a flagged entry (same URL),
// so the phone's back button closes it. Not in the store: per tab, and a store copy can disagree with history.
const CART_HISTORY_KEY = "cartOpen";
const CART_HISTORY_EVENT = "cart-history-change"; // pushState/replaceState don't fire popstate

const isCartOpenNow = () => !!window.history.state?.[CART_HISTORY_KEY];

const subscribeToCartOpen = (onChange: () => void) => {
  window.addEventListener("popstate", onChange);
  window.addEventListener(CART_HISTORY_EVENT, onChange);
  return () => {
    window.removeEventListener("popstate", onChange);
    window.removeEventListener(CART_HISTORY_EVENT, onChange);
  };
};

export const useIsCartOpen = () => useSyncExternalStore(subscribeToCartOpen, isCartOpenNow, () => false);

export const openCart = () => {
  if (isCartOpenNow()) return;
  track("cart_viewed");
  // Spread Next's own history state, or its popstate handler hard-reloads the page
  window.history.pushState({ ...window.history.state, [CART_HISTORY_KEY]: true }, "");
  window.dispatchEvent(new Event(CART_HISTORY_EVENT));
};

export const closeCart = () => {
  if (isCartOpenNow()) window.history.back();
};

/** For links out of the cart, which then `replace` this entry: going back as well would race their navigation */
export const closeCartForNavigation = () => {
  if (!isCartOpenNow()) return;
  window.history.replaceState({ ...window.history.state, [CART_HISTORY_KEY]: false }, "");
  window.dispatchEvent(new Event(CART_HISTORY_EVENT));
};

/** False on the server and until the cart has loaded from localStorage, so pages don't flash an empty cart. */
// `persist` is undefined on the server (no localStorage), hence the `?.`
export const useCartHydrated = () =>
  useSyncExternalStore(
    onChange => useCart.persist?.onFinishHydration(onChange) ?? (() => {}),
    () => useCart.persist?.hasHydrated() ?? false,
    () => false
  );
