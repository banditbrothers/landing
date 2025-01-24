"use server";

import { getTimestamp } from "@/utils/timestamp";
import { Coupon } from "@/types/order";
import { Collections } from "@/constants/collections";
import { firestore } from "@/lib/firebase";

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
  return { id: coupon.id, ...coupon.data() } as Coupon;
};

export const addCoupon = async (coupon: Omit<Coupon, "id">): Promise<Coupon> => {
  const ref = await firestore().collection(Collections.coupons).add(coupon);
  return { id: ref.id, ...coupon };
};

export const deleteCoupon = async (couponId: string) => {
  await firestore().collection(Collections.coupons).doc(couponId).delete();
  return true;
};

export const updateCoupon = async (couponId: string, coupon: Partial<Coupon>) => {
  await firestore().collection(Collections.coupons).doc(couponId).update(coupon);
  return true;
};

export const getCoupons = async (): Promise<Coupon[]> => {
  const coupons = await firestore().collection(Collections.coupons).orderBy("createdAt", "desc").get();
  return coupons.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Coupon[];
};
