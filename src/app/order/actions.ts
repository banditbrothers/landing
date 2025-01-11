"use server";

import { firestore } from "@/lib/firebase";
import { Order } from "@/types/order";

export const createOrder = async (order: Partial<Order>) => {
  const orderRef = await firestore().collection("orders").add(order);
  console.log("added order", orderRef.id);
  return orderRef.id;
};
