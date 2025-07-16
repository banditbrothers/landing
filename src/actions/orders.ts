"use server";

import { Collections } from "@/constants/collections";
import { firestore } from "@/lib/firebase-admin";
import { Order } from "@/types/order";
import { createOrder as createRzpOrder } from "./payments/rzp";
import { sendDiscordOrderMessage } from "@/actions/discord";
import { getDiscordOrderMessage } from "@/utils/discordMessages";

export const getOrders = async (): Promise<Order[]> => {
  const orders = await firestore()
    .collection(Collections.orders)
    .where("status", "!=", "cancelled")
    .orderBy("createdAt", "desc")
    .get();
  return orders.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
};

export const getUserDetailsFromOrders = async (): Promise<{ name: string; phone: string }[]> => {
  const orders = await firestore()
    .collection(Collections.orders)
    .where("status", "!=", "cancelled")
    .orderBy("createdAt", "desc")
    .get();
  
  // Extract unique user details based on phone number to avoid duplicates
  const userDetailsMap = new Map<string, { name: string; phone: string }>();
  
  orders.docs.forEach(doc => {
    const order = doc.data() as Order;
    if (!userDetailsMap.has(order.phone)) {
      userDetailsMap.set(order.phone, {
        name: order.name,
        phone: order.phone
      });
    }
  });
  
  return Array.from(userDetailsMap.values());
};

export const getOrder = async (id: string) => {
  const order = await firestore().collection(Collections.orders).doc(id).get();

  if (!order.exists) return null;
  return { id: order.id, ...order.data() } as Order;
};

export const createOrder = async (order: Partial<Order>) => {
  const orderRef = firestore().collection(Collections.orders).doc();
  const dbId = orderRef.id;

  const newOrder = { ...order };
  if (newOrder.paymentMode === "rzp") {
    const rzpOrder = await createRzpOrder(order.total!, dbId);

    newOrder.status = "initiated";
    newOrder.rzp = {
      orderId: rzpOrder.id,
      amount: +rzpOrder.amount,
      currency: rzpOrder.currency,
      paymentId: null,
      paymentStatus: null,
      paymentMethod: null,
    };
  } else if (newOrder.paymentMode === "cash") {
    newOrder.status = "paid";
    newOrder.cash = { amount: +order.total! * 100, paymentStatus: "paid" };
  }

  await orderRef.create(newOrder);
  const orderWithId = { ...newOrder, id: orderRef.id } as Order;

  if (newOrder.paymentMode === "cash") {
    try {
      await sendDiscordOrderMessage(getDiscordOrderMessage(orderWithId));
    } catch (error) {
      console.error("Error sending Discord message:", error);
    }
  }
  return orderWithId;
};

export const updateOrder = async (orderId: string, order: object) => {
  await firestore().collection(Collections.orders).doc(orderId).update(order);
  return true;
};

export const removeOrder = async (orderId: string) => {
  await firestore().collection(Collections.orders).doc(orderId).delete();
  return true;
};
