"use server";

import { Collections } from "@/constants/collections";
import { firestore } from "@/lib/firebase-admin";
import { Order } from "@/types/order";

export const migrateOrders = async () => {
  return false;
  const orders = await firestore().collection(Collections.orders).get();
  const batch = firestore().batch();

  orders.docs.forEach(doc => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const order = doc.data() as Order;
    // order.total = order.amount;
    // order.subtotal = 0;
    // order.discount = 0;
    // order.shipping = 0;
    // if (order.paymentMode === "rzp") {
    //   order.rzp.paymentMethod = null;
    // }
    // order.products = order.products.map(product => ({
    //   id: product.designId,
    //   name: DESIGNS_OBJ[product.designId].name,
    //   image: DESIGNS_OBJ[product.designId].image,
    //   quantity: product.quantity,
    //   price: DESIGNS_OBJ[product.designId].price,
    // }));
    // order.amount = firestore.FieldValue.delete();
    // batch.update(doc.ref, order);
  });

  await batch.commit();
};
