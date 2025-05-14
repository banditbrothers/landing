import { DESIGNS_OBJ, PRODUCTS_OBJ } from "@/data/products";
import { ProductVariant } from "@/types/product";

/**
 * Formats a number as currency in INR format
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "₹1,234.56")
 */
export function formatCurrency(amount: number, decimalPlaces = 0): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(amount);
}

export const getProductVariantPrice = (productVariant: ProductVariant) => {
  return productVariant.price || PRODUCTS_OBJ[productVariant.productId].basePrice;
};
