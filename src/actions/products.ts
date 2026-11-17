"use server";

import { requireAdmin } from "@/lib/admin-auth";
import { Collections } from "@/constants/collections";
import { firestore } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { revalidateCatalog } from "@/lib/catalog";
import { ProductVariant } from "@/types/product";

export const getVariantsAdmin = async (): Promise<ProductVariant[]> => {
  await requireAdmin();
  const variants = await firestore().collection(Collections.variants).get();

  return variants.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as ProductVariant[];
};

// For order and review pages: the variants an order references, even ones no longer in the storefront catalog
// (unavailable, or of an inactive product). Public by nature; variants hold nothing private.
export const getVariantsByIds = async (ids: string[]): Promise<ProductVariant[]> => {
  const unique = [...new Set(ids)].slice(0, 50);
  if (!unique.length) return [];
  const docs = await firestore().getAll(...unique.map(id => firestore().collection(Collections.variants).doc(id)));
  return docs.filter(d => d.exists).map(d => ({ id: d.id, ...d.data() }) as ProductVariant);
};

export const createVariant = async (
  variantId: string,
  variantData: Omit<ProductVariant, "id">
): Promise<ProductVariant> => {
  await requireAdmin();
  try {
    await firestore().collection(Collections.variants).doc(variantId).set(variantData);
    revalidateCatalog();

    return { id: variantId, ...variantData };
  } catch (error) {
    console.error("Error creating variant:", error);
    throw new Error("Failed to create variant");
  }
};

// null removes a field: price falls back to the product's basePrice, description to the product's copy
export const updateVariant = async (
  variantId: string,
  updates: Omit<Partial<ProductVariant>, "price" | "description"> & {
    price?: number | null;
    description?: string | null;
  }
) => {
  await requireAdmin();
  try {
    await firestore()
      .collection(Collections.variants)
      .doc(variantId)
      .update(Object.fromEntries(Object.entries(updates).map(([k, v]) => [k, v === null ? FieldValue.delete() : v])));
    revalidateCatalog();

    return { success: true };
  } catch (error) {
    console.error("Error updating variant:", error);
    throw new Error("Failed to update variant");
  }
};

export const deleteVariant = async (variantId: string) => {
  await requireAdmin();
  try {
    await firestore().collection(Collections.variants).doc(variantId).delete();
    revalidateCatalog();

    return { success: true };
  } catch (error) {
    console.error("Error deleting variant:", error);
    throw new Error("Failed to delete variant");
  }
};
