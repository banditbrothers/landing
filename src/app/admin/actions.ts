"use server";

import { firestore } from "@/lib/firebase";
import { Order } from "@/types/order";

export const getOrders = async (): Promise<Order[]> => {
  console.log("fetching orders");

  const orders = await firestore()
    .collection("orders")
    .orderBy("createdAt", "desc")
    .get();
  return orders.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Order[];
};
