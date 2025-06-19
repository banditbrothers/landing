"use server";

import { Collections } from "@/constants/collections";
import { firestore } from "@/lib/firebase-admin";
import { ProductVariant } from "@/types/product";

export const getVariantsAdmin = async (): Promise<ProductVariant[]> => {
  const variants = await firestore()
    .collection(Collections.variants)
    .get();
  
  return variants.docs.map(doc => ({ 
    id: doc.id, 
    ...doc.data() 
  })) as ProductVariant[];
};

export const createVariant = async (variantId: string, variantData: Omit<ProductVariant, 'id'>): Promise<ProductVariant> => {
  try {
    await firestore()
      .collection(Collections.variants)
      .doc(variantId)
      .set(variantData);
    
    return { id: variantId, ...variantData };
  } catch (error) {
    console.error("Error creating variant:", error);
    throw new Error("Failed to create variant");
  }
};

export const updateVariant = async (variantId: string, updates: Partial<ProductVariant>) => {
  try {
    await firestore()
      .collection(Collections.variants)
      .doc(variantId)
      .update(updates);
    
    return { success: true };
  } catch (error) {
    console.error("Error updating variant:", error);
    throw new Error("Failed to update variant");
  }
};

export const updateVariantMockupImage = async (variantId: string, newImageUrl: string) => {
  try {
    const variantRef = firestore().collection(Collections.variants).doc(variantId);
    const variant = await variantRef.get();
    
    if (!variant.exists) {
      throw new Error("Variant not found");
    }
    
    const variantData = variant.data() as ProductVariant;
    const updatedImages = {
      ...variantData.images,
      mockup: [newImageUrl, ...(variantData.images.mockup || [])]
    };
    
    await variantRef.update({ images: updatedImages });
    
    return { success: true };
  } catch (error) {
    console.error("Error updating variant mockup image:", error);
    throw new Error("Failed to update variant mockup image");
  }
};

export const deleteVariant = async (variantId: string) => {
  try {
    await firestore()
      .collection(Collections.variants)
      .doc(variantId)
      .delete();
    
    return { success: true };
  } catch (error) {
    console.error("Error deleting variant:", error);
    throw new Error("Failed to delete variant");
  }
}; 