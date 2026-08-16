"use client";

import { LazyMotion, domAnimation } from "motion/react";
import { SearchDialog } from "@/components/dialogs/SearchDialog";
import { CartSheet } from "@/components/sheets/CartSheet";

const LATEST_CART_VERSION = "4";

if (typeof window !== "undefined") {
  const cartVersion = localStorage.getItem("cartVersion");
  if (!cartVersion || cartVersion !== LATEST_CART_VERSION) {
    localStorage.setItem("cartVersion", LATEST_CART_VERSION);
    localStorage.removeItem("cart");
    window.location.reload();
  }
}

export function IndexClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <LazyMotion features={domAnimation} strict>
        {children}
      </LazyMotion>
      <SearchDialog />
      <CartSheet />
    </>
  );
}
