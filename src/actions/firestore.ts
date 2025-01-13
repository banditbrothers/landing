"use server";

import { Collections } from "@/constants/collections";
import { firestore } from "@/lib/firebase";
import { Coupon, Order } from "@/types/order";
import { getTimestamp } from "@/utils/misc";
import { addMonths } from "date-fns";

export const getOrders = async (): Promise<Order[]> => {
  const orders = await firestore().collection(Collections.orders).orderBy("createdAt", "desc").get();
  return orders.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Order[];
};

export const createOrder = async (order: Partial<Order>) => {
  const orderRef = await firestore().collection(Collections.orders).add(order);
  return { ...order, id: orderRef.id } as Order;
};

export const updateOrder = async (orderId: string, order: Partial<Order>) => {
  await firestore().collection(Collections.orders).doc(orderId).update(order);
  return true;
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
    isFixed: true,
    discount: 100,
    createdAt: getTimestamp(),
    expiresAt: oneMonthFromNow,
    isActive: true,
  };

  const percentageCoupon: Partial<Coupon> = {
    code: "DEMO20",
    name: "20% Off",
    description: "Get 20% off on your order",
    isFixed: false,
    discount: 20,
    createdAt: getTimestamp(),
    expiresAt: oneMonthFromNow,
    isActive: true,
  };

  await firestore().collection(Collections.coupons).add(fixedCoupon);
  await firestore().collection(Collections.coupons).add(percentageCoupon);

  return true;
};
