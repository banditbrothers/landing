"use server";

import { getTimestamp } from "@/utils/misc";
import { Coupon } from "@/types/order";
import { addMonths } from "date-fns";
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

export const createDemoCoupons = async () => {
  return false;
  const now = Date.now();
  const oneMonthFromNow = Math.floor(addMonths(now, 1).getTime() / 1000);

  const fixedCoupon: Partial<Coupon> = {
    code: "DEMO100",
    name: "₹100 Off",
    description: "Get ₹100 off on your order",
    discountType: "fixed",
    minOrderAmount: 500,
    discount: 100,
    createdAt: getTimestamp(),
    expiresAt: oneMonthFromNow,
    isActive: true,
  };

  const percentageCoupon: Partial<Coupon> = {
    code: "DEMO20",
    name: "20% Off",
    description: "Get 20% off on your order",
    discountType: "percentage",
    minOrderAmount: 1000,
    discount: 20,
    createdAt: getTimestamp(),
    expiresAt: oneMonthFromNow,
    isActive: true,
  };

  await firestore().collection(Collections.coupons).add(fixedCoupon);
  await firestore().collection(Collections.coupons).add(percentageCoupon);

  return true;
};
