"use server";

import { getCatalog } from "@/lib/catalog";

// Client refetch path for useVariants; served from the server cache, not Firestore.
export const fetchCatalog = async () => {
  const variants = await getCatalog();
  if (!variants) throw new Error("Failed to fetch catalog");
  return variants;
};
