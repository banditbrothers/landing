"use client";

import { SearchDialog } from "@/components/dialogs/SearchDialog";
import { LoadingScreen } from "@/components/misc/Loading";
import { CartSheet } from "@/components/sheets/CartSheet";
import { useVariants } from "@/hooks/useVariants";

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
