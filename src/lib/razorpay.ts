import "server-only";
// Not "use server": a public createRzpOrder would let anyone attach any order's id to a payment of their choosing.
import Razorpay from "razorpay";

export const rzp = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RZP_KEY_ID!,
  key_secret: process.env.RZP_KEY_SECRET!,
});

export const createRzpOrder = (amount: number, dbId: string) =>
  rzp.orders.create({ notes: { dbId }, amount: Math.round(amount * 100), currency: "INR" });
