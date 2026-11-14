import "server-only";
import { unstable_cache, revalidateTag } from "next/cache";
import { Collections } from "@/constants/collections";
import { firestore } from "@/lib/firebase-admin";
import { ProductVariant } from "@/types/product";

const CATALOG_TAG = "variants";

// Throws on failure so an error is never cached as an empty catalog.
// Busted by revalidateCatalog() on every variant/stock write; the hourly revalidate only catches edits made outside the app (Firestore console).
const getCachedCatalog = unstable_cache(
  async () => {
    const snapshot = await firestore().collection(Collections.variants).where("isAvailable", "==", true).get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ProductVariant[];
  },
  ["catalog"],
  { revalidate: 3600, tags: [CATALOG_TAG] }
);

/** All available variants, cached on the server. null if Firestore failed. */
export const getCatalog = async (): Promise<ProductVariant[] | null> => {
  try {
    return await getCachedCatalog();
  } catch (error) {
    console.error("Error fetching catalog:", error);
    return null;
  }
};

/** Expire the catalog now; pages built from it re-render on their next request. */
export const revalidateCatalog = () => revalidateTag(CATALOG_TAG, { expire: 0 });
