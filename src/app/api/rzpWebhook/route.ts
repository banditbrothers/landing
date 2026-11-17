import { getOrder } from "@/actions/orders";
import { Collections } from "@/constants/collections";
import { firestore } from "@/lib/firebase-admin";
import { sendDiscordOrderMessage } from "@/actions/discord";
import { deductStockForOrder } from "@/actions/stock";
import { sendWhatsappOrderConfirmation } from "@/actions/whatsapp";
import { getDiscordOrderMessage, getDiscordPaymentLinkPaidMessage } from "@/utils/discordMessages";
import { Order } from "@/types/order";
import { isProduction } from "@/utils/misc";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils";

// Server-side so revenue is counted even if the customer closes the tab after paying.
// distinct_id = email, matching identifyUser() at checkout.
const captureOrderPaid = (order: Order, payment: { id: string; method: string }) =>
  isProduction &&
  fetch(`${process.env.NEXT_PUBLIC_POSTHOG_HOST}/i/v0/e/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: process.env.NEXT_PUBLIC_POSTHOG_KEY,
      event: "order_paid",
      distinct_id: order.email,
      properties: {
        order_id: order.id,
        revenue: order.total,
        currency: "INR",
        payment_id: payment.id,
        payment_method: payment.method,
        is_international: !!order.isInternational,
        coupon_code: order.couponCode,
        num_items: order.variants.reduce((sum, v) => sum + v.quantity, 0),
      },
    }),
  }).catch(error => console.error("PostHog order_paid capture failed", order.id, error));

// updateOrder is admin-only; the webhook is authenticated by its signature instead
const updateOrder = (id: string, data: object) => firestore().collection(Collections.orders).doc(id).update(data);

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("X-Razorpay-Signature")!;
    const text = await request.text();

    const isValid = validateWebhookSignature(text, signature, process.env.RZP_WEBHOOK_SECRET!);
    if (!isValid) return new Response("Invalid signature", { status: 401 });

    const data = JSON.parse(text);
    if (data.event !== "payment.captured" && data.event !== "payment.failed") {
      return new Response("Event not handled", { status: 200 });
    }

    const payment = data.payload.payment.entity;
    const dbId = payment.notes?.dbId;
    const order = dbId ? await getOrder(dbId) : null;
    if (!order) {
      console.error("Webhook: no order for dbId, skipping...", dbId);
      return new Response("Order not found", { status: 200 });
    }

    if (data.event === "payment.failed") {
      if (order.status === "paid") return new Response("Order already paid, skipping...", { status: 200 });
      await updateOrder(dbId, {
        "rzp.paymentId": payment.id,
        "rzp.paymentStatus": payment.status,
        status: "payment-failed",
      });
      return new Response("Success!", { status: 200 });
    }

    // payment.captured. A payment for less than the order total (e.g. one tagged with another order's id) never marks it paid.
    if (payment.amount < Math.round(order.total * 100)) {
      console.error("Webhook: payment below order total, not marking paid", dbId, payment.id, payment.amount);
      return new Response("Amount mismatch", { status: 200 });
    }

    // Razorpay retries webhooks, so only the first one notifies.
    const alreadyPaid = order.status === "paid";
    const rzp = {
      orderId: payment.order_id,
      amount: payment.amount,
      currency: payment.currency,
      paymentId: payment.id,
      paymentStatus: payment.status,
      paymentMethod: payment.method,
      isInternational: payment.international,
    };
    await updateOrder(dbId, { rzp, paymentMode: "rzp", status: "paid" });

    // Idempotent: guarded by order.stockDeducted, so webhook retries don't double-deduct
    await deductStockForOrder(dbId).catch(error => console.error("Error deducting stock for order", dbId, error));

    if (!alreadyPaid) {
      const paidOrder = { ...order, paymentMode: "rzp" as const, rzp, status: "paid" as const };
      const message = order.isInternational
        ? getDiscordPaymentLinkPaidMessage(paidOrder)
        : getDiscordOrderMessage(paidOrder);
      await sendDiscordOrderMessage(message);
      await sendWhatsappOrderConfirmation(paidOrder);
      await captureOrderPaid(paidOrder, payment);
    }

    return new Response("Success!", { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return new Response(`Webhook error: ${error.message}`, { status: 400 });
  }
}
