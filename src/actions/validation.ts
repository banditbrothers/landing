"use server";

import { getTimestamp } from "@/utils/misc";
import { getCoupon } from "./firestore";

export const validateCoupon = async (code: string) => {
  const coupon = await getCoupon(code);

  if (!coupon) return { error: "Coupon not found", isValid: false, coupon: null };
  if (!coupon.isActive) return { error: "Coupon is not active", isValid: false, coupon: null };
  if (coupon.expiresAt < getTimestamp()) return { error: "Coupon has expired", isValid: false, coupon: null };

  return { error: null, isValid: true, coupon };
};
