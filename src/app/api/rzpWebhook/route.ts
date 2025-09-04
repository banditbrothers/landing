import { getOrder, updateOrder } from "@/actions/orders";
import { sendDiscordOrderMessage } from "@/actions/discord";
import { getDiscordOrderMessage, getDiscordPaymentLinkPaidMessage } from "@/utils/discordMessages";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils";

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("X-Razorpay-Signature")!;
    const text = await request.text();

    const isValid = validateWebhookSignature(text, signature, process.env.RZP_WEBHOOK_SECRET!);
    if (!isValid) return new Response("Invalid signature", { status: 401 });

    const data = JSON.parse(text);

    switch (data.event) {
      case "payment.captured": {
        const dbId = data.payload.payment.entity.notes.dbId;

        if (!dbId) {
          console.error("No dbId found in webhook data, skipping...", data);
          return new Response("No dbId found!", { status: 200 });
        };

        const paymentId = data.payload.payment.entity.id;
        const paymentStatus = data.payload.payment.entity.status;
        const paymentMethod = data.payload.payment.entity.method;
        const amount = data.payload.payment.entity.amount;
        const currency = data.payload.payment.entity.currency;
        const orderId = data.payload.payment.entity.order_id;
        const isInternational = data.payload.payment.entity.international;

        const updateOrderPromise = updateOrder(dbId, {
          "rzp.paymentId": paymentId,
          "rzp.paymentStatus": paymentStatus,
          "rzp.paymentMethod": paymentMethod,
          "rzp.amount": amount,
          "rzp.currency": currency,
          "rzp.orderId": orderId,
          "rzp.isInternational": isInternational,
          paymentMode: "rzp",
          status: "paid",
        });

        const sendDiscordMessagePromise = new Promise(async resolve => {
          const order = await getOrder(dbId);
          if (!order) return;

          // @ts-expect-error - order.rzp is defined in the order type
          order.rzp = {};
          order.paymentMode = "rzp";
          if (order.paymentMode === "rzp") order.rzp.paymentMethod = paymentMethod;

          let message;
          if (order.isInternational) message = getDiscordPaymentLinkPaidMessage(order);
          else message = getDiscordOrderMessage(order);

          if (!message) return;
          await sendDiscordOrderMessage(message);
          resolve(true);
        });

        await Promise.allSettled([updateOrderPromise, sendDiscordMessagePromise]);
        break;
      }

      case "payment.failed": {
        const dbId = data.payload.payment.entity.notes.dbId;

        const paymentId = data.payload.payment.entity.id;
        const paymentStatus = data.payload.payment.entity.status;
        await updateOrder(dbId, {
          "rzp.paymentId": paymentId,
          "rzp.paymentStatus": paymentStatus,
          status: "payment-failed",
        });
        break;
      }

      default: {
        return new Response("Event not handled", { status: 200 });
      }
    }

    return new Response("Success!", { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return new Response(`Webhook error: ${error.message}`, {
      status: 400,
    });
  }
}
