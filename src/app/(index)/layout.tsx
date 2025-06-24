"use client";

import { SearchDialog } from "@/components/dialogs/SearchDialog";
import { LoadingScreen } from "@/components/misc/Loading";
import { CartSheet } from "@/components/sheets/CartSheet";
import { useVariants } from "@/hooks/useVariants";
import { useEffect } from "react";

const LATEST_CART_VERSION = "1";

export default function IndexLayout({ children }: { children: React.ReactNode }) {
  const { data: variants } = useVariants();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cartVersion = localStorage.getItem("cartVersion");
      if (!cartVersion || cartVersion !== LATEST_CART_VERSION) {
        localStorage.setItem("cartVersion", LATEST_CART_VERSION);
        localStorage.removeItem("cart");
        window.location.reload();
      }
    }
  }, []);

  if (!variants || variants.length === 0) return <LoadingScreen />;
  return (
    <>
      {children}
      <SearchDialog />
      <CartSheet />
    </>
  );
}
