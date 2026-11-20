"use client";

import { SearchDialog } from "@/components/dialogs/SearchDialog";
import { CartSheet } from "@/components/sheets/CartSheet";

const LATEST_CART_VERSION = "4";

if (typeof window !== "undefined") {
  const cartVersion = localStorage.getItem("cartVersion");
  if (cartVersion !== LATEST_CART_VERSION) {
    localStorage.setItem("cartVersion", LATEST_CART_VERSION);
    // The cart store has already hydrated from localStorage by now, so a stale cart needs a reload to drop it.
    // First-time visitors have no cart, so they skip the reload.
    if (localStorage.getItem("cart") !== null) {
      localStorage.removeItem("cart");
      window.location.reload();
    }
  }
}

export function IndexClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <SearchDialog />
      <CartSheet />
    </>
  );
}
