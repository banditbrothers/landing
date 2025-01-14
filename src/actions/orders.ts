"use server";

import { Collections } from "@/constants/collections";
import { firestore } from "@/lib/firebase";
import { Order } from "@/types/order";

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
