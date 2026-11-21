"use server";

import { requireAdmin } from "@/lib/admin-auth";
import { getTimestamp } from "@/utils/timestamp";
import { Coupon } from "@/types/coupon";
import { Collections } from "@/constants/collections";
import { firestore } from "@/lib/firebase-admin";

export const validateCoupon = async (code: string) => {
  const coupon = await getCoupon(code);

  if (!coupon) return { error: "Coupon not found", isValid: false, coupon: null };
  if (!coupon.isActive) return { error: "Coupon is not active", isValid: false, coupon: null };
  if (coupon.expiresAt && coupon.expiresAt < getTimestamp())
    return { error: "Coupon has expired", isValid: false, coupon: null };

  return { error: null, isValid: true, coupon };
};

export const getCoupon = async (code: string) => {
  const formattedCode = code.toUpperCase();
  const couponRef = await firestore().collection(Collections.coupons).where("code", "==", formattedCode).get();
  if (couponRef.empty) return null;

  const coupon = couponRef.docs[0];

  const couponData = coupon.data();
  return {
    id: coupon.id,
    ...couponData,
    applicableVariants: couponData.applicableVariants || [],
    cashAndFreeShipping: formattedCode === process.env.CASH_AND_FREE_SHIPPING_COUPON_CODE?.toUpperCase(),
  } as Coupon;
};

export const addCoupon = async (coupon: Omit<Coupon, "id">): Promise<Coupon | { error: string }> => {
  await requireAdmin();
  const { discount, discountType, minOrderAmount } = coupon;
  if (!(discount > 0) || (discountType === "percentage" && discount > 100))
    return { error: "Discount must be above 0 (and at most 100 for a percentage)" };
  if (!(minOrderAmount >= 0)) return { error: "Min amount can't be negative" };
  // getCoupon looks codes up with where("code", "=="), so a duplicate would make one of them unreachable
  if (await getCoupon(coupon.code)) return { error: `A coupon with code ${coupon.code.toUpperCase()} already exists` };

  const ref = await firestore().collection(Collections.coupons).add(coupon);
  return { id: ref.id, ...coupon };
};

export const updateCoupon = async (couponId: string, coupon: Partial<Coupon>) => {
  await requireAdmin();
  await firestore().collection(Collections.coupons).doc(couponId).update(coupon);
  return true;
};

export const getCoupons = async (): Promise<Coupon[]> => {
  await requireAdmin();
  const coupons = await firestore().collection(Collections.coupons).orderBy("createdAt", "desc").get();
  return coupons.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Coupon[];
};
