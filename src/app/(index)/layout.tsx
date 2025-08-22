"use client";

import { SearchDialog } from "@/components/dialogs/SearchDialog";
import { LoadingScreen } from "@/components/misc/Loading";
import { CartSheet } from "@/components/sheets/CartSheet";
import { useVariants } from "@/hooks/useVariants";

const LATEST_CART_VERSION = "1";

// Check and update cart version immediately when module loads on client
if (typeof window !== "undefined") {
  const cartVersion = localStorage.getItem("cartVersion");
  if (!cartVersion || cartVersion !== LATEST_CART_VERSION) {
    localStorage.setItem("cartVersion", LATEST_CART_VERSION);
    localStorage.removeItem("cart");
    window.location.reload();
  }
}

export default function IndexLayout({ children }: { children: React.ReactNode }) {
  const { data: variants } = useVariants();

  if (!variants || variants.length === 0) return <LoadingScreen />;
  return (
    <>
      {children}
      <SearchDialog />
      <CartSheet />
    </>
  );
}
