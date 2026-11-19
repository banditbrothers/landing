"use client";

import { createContext, createElement, ReactNode, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCatalog } from "@/actions/catalog";
import { ProductVariant } from "@/types/product";

export const VARIANTS_QUERY_KEY = ["variants"];

// Catalog rendered by the server into the page (src/app/(index)/layout.tsx). null = server fetch failed.
const ServerVariantsContext = createContext<ProductVariant[] | null>(null);

export const ServerVariantsProvider = ({
  variants,
  children,
}: {
  variants: ProductVariant[] | null;
  children: ReactNode;
}) => createElement(ServerVariantsContext, { value: variants }, children);

export const useVariants = () => {
  const serverVariants = useContext(ServerVariantsContext);

  const query = useQuery({
    queryKey: VARIANTS_QUERY_KEY,
    queryFn: fetchCatalog,
    // Variants carry live stock: refetches on mount/focus once older than this
    staleTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: true, // global default is off; stock should catch up when a customer returns to the tab
    // Server data counts as fresh (updatedAt defaults to now). Without it, start empty and not ready so the queryFn runs.
    initialData: serverVariants ?? [],
    ...(serverVariants ? {} : { initialDataUpdatedAt: 0 }),
    experimental_prefetchInRender: true,
  });

  return {
    ...query,
    // A real fetch, server data or a cache hit sets this above 0
    isReady: query.dataUpdatedAt > 0,
  };
};
