import { DESIGNS_OBJ, PRODUCTS_OBJ } from "@/data/products";
import { ProductVariant } from "@/types/product";

export const getSKU = (productId: string, designId: string) => {
  return `${productId.toUpperCase()}-${designId.toUpperCase().replaceAll("-", "_")}`;
};

export const getProductVariantName = (productVariant: ProductVariant, config: { includeProductName?: boolean } = { includeProductName: false }) => {
  if(!productVariant) return "";
  return productVariant.name ?? `${DESIGNS_OBJ[productVariant.designId].name} ${config.includeProductName ? PRODUCTS_OBJ[productVariant.productId].name : ""}`;
};

export const getProductVariantPrice = (productVariant: ProductVariant) => {
  if(!productVariant) throw new Error("Product variant is required to calculate price");
  return productVariant.price ?? PRODUCTS_OBJ[productVariant.productId].basePrice;
};
