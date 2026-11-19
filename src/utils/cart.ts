import { CartItem, Order } from "@/types/order";
import { ProductVariant } from "@/types/product";
import { exceedsStock, getProductVariantPrice } from "./product";
import { getDiscountAmount } from "./coupon";
import { Coupon } from "@/types/coupon";
import { MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING, SHIPPING_COST } from "@/constants/shipping";

export const getCartSubtotal = (cart: CartItem[], variants: ProductVariant[]) => {
  if (cart.length === 0) return 0;

  return cart.reduce((total, item) => {
    const variant = variants.find(v => v.id === item.variantId);
    if (!variant) return total;
    return total + getProductVariantPrice(variant) * item.quantity;
  }, 0);
};
// The one place that decides what counts towards MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING (shipping charge and every meter).
// Before the coupon, so applying one can never add shipping back. To judge after the coupon instead:
//   getCartSubtotal(cart, variants) - getDiscountAmount(cart, variants, coupon)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const getFreeShippingAmount = (cart: CartItem[], variants: ProductVariant[], coupon: Coupon | null) =>
  getCartSubtotal(cart, variants);

// Shared by checkout (display) and createOrder (what's actually charged), so the two can't drift
export const getShippingCost = (cart: CartItem[], variants: ProductVariant[], coupon: Coupon | null) => {
  if (cart.length === 0 || coupon?.cashAndFreeShipping) return 0;
  if (MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING === null) return SHIPPING_COST;
  return getFreeShippingAmount(cart, variants, coupon) >= MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING ? 0 : SHIPPING_COST;
};

export const getOrderTotal = (cart: CartItem[], variants: ProductVariant[], coupon: Coupon | null) =>
  Math.max(
    0,
    getCartSubtotal(cart, variants) -
      getDiscountAmount(cart, variants, coupon) +
      getShippingCost(cart, variants, coupon)
  );

export const getCartItemCount = (cart: CartItem[]) => cart.reduce((count, item) => count + item.quantity, 0);

export const cartHasStockIssue = (cart: CartItem[], variants: ProductVariant[]) =>
  cart.some(item => {
    const variant = variants.find(v => v.id === item.variantId);
    return !!variant && exceedsStock(variant, item.size, item.quantity);
  });

/** Every free-shipping meter reads this. null = free shipping is switched off. `extra` = an amount about to be added. */
export const getFreeShippingProgress = (
  cart: CartItem[],
  variants: ProductVariant[],
  coupon: Coupon | null,
  extra = 0
) => {
  if (MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING === null) return null;
  const amount = getFreeShippingAmount(cart, variants, coupon) + extra;
  return {
    left: Math.max(0, MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING - amount),
    pct: Math.min(100, (amount / MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING) * 100),
    unlocked: amount >= MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING,
  };
};

// Shared by checkout (the pay button) and createOrder (what's actually used)
export const getPaymentMode = (coupon: Coupon | null, isInternational: boolean): Order["paymentMode"] => {
  if (isInternational) return "manual";
  return coupon?.cashAndFreeShipping ? "cash" : "rzp";
};
