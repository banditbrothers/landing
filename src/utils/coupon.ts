import { Coupon } from "@/types/coupon";
import { CartItem } from "@/types/order";
import { ProductVariant } from "@/types/product";
import { formatCurrency } from "./price";
import { getProductVariantPrice } from "./product";
import { getCartSubtotal } from "./cart";

/**
 * Calculates the subtotal for items that are applicable for the coupon
 */
const getApplicableSubtotal = (
  cart: CartItem[],
  variants: ProductVariant[],
  coupon: Coupon
): number => {
  // If no applicableVariants specified or empty array, apply to all items
  if (!coupon.applicableVariants || coupon.applicableVariants.length === 0) {
    return getCartSubtotal(cart, variants);
  }

  // Only include items with variants in the applicableVariants list
  return cart.reduce((total, item) => {
    if (!coupon.applicableVariants.includes(item.variantId)) return total;
    
    const variant = variants.find(v => v.id === item.variantId);
    if (!variant) return total;
    
    return total + getProductVariantPrice(variant) * item.quantity;
  }, 0);
};

export const validateCouponInCart = (
  coupon: Coupon | null,
  cart: CartItem[],
  variants: ProductVariant[]
): { error: true; message: string } | { error: false; message: null } => {
  if (!coupon) return { error: false, message: null };

  // Check if coupon is applicable to at least one item in cart
  if (coupon.applicableVariants && coupon.applicableVariants.length > 0) {
    const hasApplicableVariant = cart.some(item =>
      coupon.applicableVariants.includes(item.variantId)
    );

    if (!hasApplicableVariant) {
      return {
        error: true,
        message: "This coupon is not applicable to any items in your cart",
      };
    }
  }

  const applicableSubtotal = getApplicableSubtotal(cart, variants, coupon);

  if (applicableSubtotal < coupon.minOrderAmount)
    return {
      error: true,
      message: `Minimum Order Amount for applicable items should be more than ${formatCurrency(coupon.minOrderAmount)} to apply this coupon`,
    };
  
  return { error: false, message: null };
};

export const getDiscountAmount = (
  cart: CartItem[],
  variants: ProductVariant[],
  coupon: Coupon | null
) => {
  if (!coupon) return 0;

  const applicableSubtotal = getApplicableSubtotal(cart, variants, coupon);

  if (coupon.discountType === "fixed") return coupon.discount;
  else if (coupon.discountType === "percentage") 
    return (applicableSubtotal * coupon.discount) / 100;

  return 0;
};
