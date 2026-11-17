"use server";

import { requireAdmin } from "@/lib/admin-auth";
import { rzp } from "@/lib/razorpay";
import { Order } from "@/types/order";

export const createPaymentLinkForInternationalOrder = async (order: Order, amount: number) => {
  await requireAdmin();
  const paymentLinkData = await rzp.paymentLink.create({
    amount: Math.round(amount * 100),
    currency: "INR",
    notes: { dbId: order.id },
    customer: { name: order.name, email: order.email, contact: order.phone },
  });

  return paymentLinkData.short_url;
};
