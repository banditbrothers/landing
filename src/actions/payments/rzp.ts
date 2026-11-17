"use server";

import { z } from "zod";
import { requireAdmin } from "@/lib/admin-auth";
import { rzp } from "@/lib/razorpay";
import { Collections } from "@/constants/collections";
import { firestore } from "@/lib/firebase-admin";
import { Order } from "@/types/order";

const amountsSchema = z.object({
  subtotal: z.number().positive(),
  shipping: z.number().min(0),
  discount: z.number().min(0),
});

// Saves the admin's amounts and creates a link for exactly that total, all on the server, so the order and the
// link can't disagree. The previous link is cancelled so the customer can't pay an outdated amount.
export const createPaymentLinkForInternationalOrder = async (
  orderId: string,
  amounts: z.input<typeof amountsSchema>
): Promise<{ order: Order } | { error: string }> => {
  await requireAdmin();
  const parsed = amountsSchema.safeParse(amounts);
  if (!parsed.success) return { error: "Please enter valid amounts" };
  const { subtotal, shipping, discount } = parsed.data;
  const total = Math.round((subtotal + shipping - discount) * 100) / 100;
  if (total < 1) return { error: "Total must be at least ₹1" };

  const ref = firestore().collection(Collections.orders).doc(orderId);
  const order = (await ref.get()).data() as Omit<Order, "id"> | undefined;
  if (!order?.isInternational) return { error: "Not an international order" };
  if (order.status === "paid") return { error: "This order is already paid" };

  if (order.paymentLink) {
    // Fails if it already expired or was cancelled, which is fine
    await rzp.paymentLink.cancel(order.paymentLink.id).catch(error => console.error("Cancel payment link:", error));
  }

  const link = await rzp.paymentLink.create({
    amount: Math.round(total * 100),
    currency: "INR",
    notes: { dbId: orderId },
    customer: { name: order.name, email: order.email, contact: order.phone },
  });
  const paymentLink = { id: link.id, url: link.short_url };
  await ref.update({ subtotal, shipping, discount, total, paymentLink });

  return { order: { ...order, id: orderId, subtotal, shipping, discount, total, paymentLink } as Order };
};
