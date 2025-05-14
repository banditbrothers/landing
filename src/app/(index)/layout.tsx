"use client";

import { useVariants } from "@/hooks/useVariants";

export default function IndexLayout({ children }: { children: React.ReactNode }) {
  useVariants();

  return <>{children}</>;
}
