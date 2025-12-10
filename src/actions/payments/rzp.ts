"use server";

import { Order } from "@/types/order";
import Razorpay from "razorpay";

const rzp = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RZP_KEY_ID!,
  key_secret: process.env.RZP_KEY_SECRET!,
});

export const createOrder = async (amount: number, dbId: string) => {
  const formattedAmount = BigInt(Math.ceil(amount * 100)).toString();
  const order = await rzp.orders.create({ notes: { dbId: dbId }, amount: formattedAmount, currency: "INR" });
  return order;
};

export const createPaymentLinkForInternationalOrder = async (order: Order, amount: number) => {
  const paymentLinkData = await rzp.paymentLink.create({
    amount: amount * 100,
    currency: "INR",
    notes: { dbId: order.id },
    customer: { name: order.name, email: order.email, contact: order.phone },
  });

  return paymentLinkData.short_url;
};
