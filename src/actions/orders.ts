"use server";

import { requireAdmin } from "@/lib/admin-auth";
import { Collections } from "@/constants/collections";
import { firestore } from "@/lib/firebase-admin";
import { Order } from "@/types/order";
import { createRzpOrder } from "@/lib/razorpay";
import { sendDiscordOrderMessage } from "@/actions/discord";
import { getDiscordOrderMessage } from "@/utils/discordMessages";
import { deductStockForOrder, getStockIssues } from "./stock";
import { validateCoupon } from "./coupons";
import { sendWhatsappOrderConfirmation } from "./whatsapp";
import { OrderInput, orderInputSchema } from "@/schemas";
import { Coupon } from "@/types/coupon";
import { getVariantsByIds } from "./products";
import { getCartSubtotal, getOrderTotal, getPaymentMode, getShippingCost } from "@/utils/cart";
import { toPaise } from "@/utils/price";
import { getDiscountAmount, validateCouponInCart } from "@/utils/coupon";
import { getProductVariantPrice } from "@/utils/product";
import { getTimestamp } from "@/utils/timestamp";
import { generateOrderId } from "@/utils/id";

const GRPC_ALREADY_EXISTS = 6;

export const getOrders = async (limit: number = 50): Promise<Order[]> => {
  await requireAdmin();
  const orders = await firestore()
    .collection(Collections.orders)
    .where("status", "!=", "cancelled")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  return orders.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
};

export const getOrder = async (id: string) => {
  const order = await firestore().collection(Collections.orders).doc(id).get();

  if (!order.exists) return null;
  return { id: order.id, ...order.data() } as Order;
};

// Public endpoint: the browser sends only who/where/what. Prices, discount, shipping, total, payment mode and
// status are all worked out here, so a tampered request can't change what gets charged or skip payment.
export const createOrder = async (input: OrderInput): Promise<Order | { error: string }> => {
  const parsed = orderInputSchema.safeParse(input);
  if (!parsed.success) return { error: "Please check your details and try again" };
  const { variants: items, couponCode, ...customer } = parsed.data;

  // Server-side stock check; the client's variant cache can be stale.
  // Returned (not thrown) because Next.js hides thrown error messages in production.
  const stockIssues = await getStockIssues(items);
  if (stockIssues.length) return { error: `${stockIssues.join(", ")}. Please update your cart.` };

  // The cart keeps its coupon in localStorage, so it may have expired or been switched off since it was applied
  let coupon: Coupon | null = null;
  if (couponCode) {
    const result = await validateCoupon(couponCode);
    if (result.error || !result.coupon) return { error: `${result.error}. Please remove the coupon and try again.` };
    coupon = result.coupon;
  }

  // getStockIssues has already checked every variant exists and is orderable
  const variants = await getVariantsByIds(items.map(i => i.variantId));
  const couponIssue = validateCouponInCart(coupon, items, variants);
  if (couponIssue.error) return { error: couponIssue.message };

  const isInternational = customer.address.country !== "IN";
  const paymentMode = getPaymentMode(coupon, isInternational);
  const total = getOrderTotal(items, variants, coupon);
  if (paymentMode === "rzp" && total < 1) return { error: "Order total is too low to pay online" };

  const newOrder = {
    ...customer,
    couponCode: coupon?.code ?? null,
    variants: items.map(item => ({
      ...item,
      price: getProductVariantPrice(variants.find(v => v.id === item.variantId)!),
    })),
    subtotal: getCartSubtotal(items, variants),
    discount: getDiscountAmount(items, variants, coupon),
    shipping: getShippingCost(items, variants, coupon),
    total,
    isInternational,
    paymentMode,
    status: paymentMode === "cash" ? "paid" : "initiated",
    createdAt: getTimestamp(),
    ...(paymentMode === "cash" && { cash: { amount: toPaise(total), paymentStatus: "paid" } }),
  } as Omit<Order, "id">;

  // The short id is the Firestore doc id. create() rejects a taken id, so retry with a fresh one.
  // A collision leaves an unpaid Razorpay order behind, which just expires.
  let orderId = "";
  for (let attempt = 1; ; attempt++) {
    orderId = generateOrderId();

    if (newOrder.paymentMode === "rzp") {
      const rzpOrder = await createRzpOrder(total, orderId);
      (newOrder as Extract<Order, { paymentMode: "rzp" }>).rzp = {
        orderId: rzpOrder.id,
        amount: +rzpOrder.amount,
        currency: rzpOrder.currency,
        isInternational,
        paymentId: null,
        paymentStatus: null,
        paymentMethod: null,
      };
    }

    try {
      await firestore().collection(Collections.orders).doc(orderId).create(newOrder);
      break;
    } catch (error) {
      if ((error as { code?: number }).code !== GRPC_ALREADY_EXISTS || attempt >= 3) throw error;
    }
  }
  const orderWithId = { ...newOrder, id: orderId } as Order;

  if (newOrder.paymentMode === "cash") {
    try {
      await deductStockForOrder(orderId);
    } catch (error) {
      console.error("Error deducting stock:", error);
    }
    // International (manual) orders get theirs when the payment link is paid, once the real total is known
    await sendWhatsappOrderConfirmation(orderWithId);
  }

  if (newOrder.paymentMode === "cash" || newOrder.paymentMode === "manual") {
    try {
      await sendDiscordOrderMessage(getDiscordOrderMessage(orderWithId));
    } catch (error) {
      console.error("Error sending Discord message:", error);
    }
  }
  return orderWithId;
};

// Public: the checkout calls this when the customer closes the Razorpay modal. Only an unpaid online order can move.
export const cancelOrder = async (orderId: string) => {
  const ref = firestore().collection(Collections.orders).doc(orderId);
  await firestore().runTransaction(async tx => {
    const order = (await tx.get(ref)).data() as Order | undefined;
    if (order?.status === "initiated" && order.paymentMode === "rzp") tx.update(ref, { status: "cancelled" });
  });
};
