import { Coupon } from "@/types/coupon";

export const validateCouponInCart = (
  coupon: Coupon | null,
  subtotal: number
): { error: true; message: string } | { error: false; message: null } => {
  if (!coupon) return { error: false, message: null };
  if (subtotal < coupon.minOrderAmount)
    return {
      error: true,
      message: `Minimum Order Amount should be more than ₹${coupon.minOrderAmount} to apply this coupon`,
    };
  return { error: false, message: null };
};

export const getDiscountAmount = (subtotal: number, coupon: Coupon | null) => {
  if (!coupon) return 0;

  if (coupon.discountType === "fixed") return coupon.discount;
  else if (coupon.discountType === "percentage") return (subtotal * coupon.discount) / 100;

  return 0;
};
