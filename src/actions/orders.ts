"use server";

import { Collections } from "@/constants/collections";
import { firestore } from "@/lib/firebase";
import { Order } from "@/types/order";
import { createOrder as createRzpOrder } from "./payments/rzp";
export const getOrders = async (): Promise<Order[]> => {
  const orders = await firestore().collection(Collections.orders).orderBy("createdAt", "desc").get();
  return orders.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
};

export const createOrder = async (order: Partial<Order>) => {
  const orderRef = firestore().collection(Collections.orders).doc();
  const dbId = orderRef.id;

  const newOrder = { ...order };
  if (newOrder.paymentMode === "rzp") {
    const rzpOrder = await createRzpOrder(order.amount!, dbId);

    newOrder.status = "initiated";
    newOrder.rzp = {
      orderId: rzpOrder.id,
      amount: +rzpOrder.amount,
      currency: rzpOrder.currency,
      paymentId: null,
      paymentStatus: null,
    };
  } else if (newOrder.paymentMode === "cash") {
    newOrder.status = "paid";
    newOrder.cash = { amount: +order.amount! * 100, paymentStatus: "paid" };
  }

  await orderRef.create(newOrder);
  return { ...newOrder, id: orderRef.id } as Order;
};

export const updateOrder = async (orderId: string, order: object) => {
  await firestore().collection(Collections.orders).doc(orderId).update(order);
  return true;
};

export const removeOrder = async (orderId: string) => {
  await firestore().collection(Collections.orders).doc(orderId).delete();
  return true;
};
