import { getOrder, updateOrder } from "@/actions/orders";
import { sendDiscordOrderMessage } from "@/lib/discord";
import { getDiscordOrderMessage } from "@/utils/discordMessages";
import { validateWebhookSignature } from "razorpay/dist/utils/razorpay-utils";

export async function POST(request: Request) {
  try {
    const signature = request.headers.get("X-Razorpay-Signature")!;
    const text = await request.text();

    const isValid = validateWebhookSignature(text, signature, process.env.RZP_WEBHOOK_SECRET!);
    if (!isValid) return new Response("Invalid signature", { status: 400 });

    const data = JSON.parse(text);

    switch (data.event) {
      case "order.paid": {
        const dbId = data.payload.order.entity.notes.dbId;
        const orderStatus = data.payload.order.entity.status;

        const paymentId = data.payload.payment.entity.id;
        const paymentStatus = data.payload.payment.entity.status;

        const updateOrderPromise = updateOrder(dbId, {
          "rzp.paymentId": paymentId,
          "rzp.paymentStatus": paymentStatus,
          status: orderStatus,
        });

        const sendDiscordMessagePromise = new Promise(async resolve => {
          const order = await getOrder(dbId);
          await sendDiscordOrderMessage(getDiscordOrderMessage(order));
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
    }

    return new Response("Success!", { status: 200 });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return new Response(`Webhook error: ${error.message}`, {
      status: 400,
    });
  }
}
