"use server";

import { getTimestamp } from "@/utils/misc";
import { Coupon } from "@/types/order";
import { addYears } from "date-fns";
import { Collections } from "@/constants/collections";
import { firestore } from "@/lib/firebase";

export const validateCoupon = async (code: string) => {
  const coupon = await getCoupon(code);

  if (!coupon) return { error: "Coupon not found", isValid: false, coupon: null };
  if (!coupon.isActive) return { error: "Coupon is not active", isValid: false, coupon: null };
  if (coupon.expiresAt < getTimestamp()) return { error: "Coupon has expired", isValid: false, coupon: null };

  return { error: null, isValid: true, coupon };
};

export const getCoupon = async (code: string) => {
  const formattedCode = code.toUpperCase();
  const couponRef = await firestore().collection(Collections.coupons).where("code", "==", formattedCode).get();
  if (couponRef.empty) return null;

  const coupon = couponRef.docs[0];
  return { id: coupon.id, ...coupon.data() } as Coupon;
};

export const createCoupon = async () => {
  return false;
  const now = Date.now();
  const oneYearFromNow = Math.floor(addYears(now, 1).getTime() / 1000);

  const finalCoupon: Omit<Coupon, "id"> = {
    code: "BROCODE",
    name: "15% Off",
    description: "Get 15% off on your order",
    discountType: "percentage",
    minOrderAmount: 0,
    discount: 15,
    createdAt: getTimestamp(),
    expiresAt: oneYearFromNow,
    isActive: true,
  };

  await firestore().collection(Collections.coupons).add(finalCoupon);

  return true;
};
