"use server";

import { Collections } from "@/constants/collections";
import { firestore } from "@/lib/firebase";

export const migrateOrders = async () => {
  return false;
  const orders = await firestore().collection(Collections.orders).get();
  const batch = firestore().batch();

  orders.docs.forEach(doc => {
    const order = doc.data();

    order.paymentMode = "cash";
    order.cash = { amount: order.amount! * 100, paymentStatus: "paid" };
    order.status = order.payment.status;

    batch.update(doc.ref, order);
  });

  await batch.commit();
};
