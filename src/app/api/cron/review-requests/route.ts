import { Collections } from "@/constants/collections";
import { firestore } from "@/lib/firebase-admin";
import { sendWhatsappReviewRequest } from "@/actions/whatsapp";
import { getTimestamp } from "@/utils/timestamp";
import type { Order } from "@/types/order";

const DAY = 24 * 60 * 60;

// Run daily by Vercel Cron (vercel.json), which sends `Authorization: Bearer $CRON_SECRET`.
export async function GET(request: Request) {
  if (!process.env.CRON_SECRET || request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Orders 30–37 days old: the extra week catches up if a daily run is missed; reviewRequestSentAt stops repeats.
  // Filtering status in code avoids needing a composite Firestore index.
  const now = getTimestamp();
  const snapshot = await firestore()
    .collection(Collections.orders)
    .where("createdAt", ">=", now - 37 * DAY)
    .where("createdAt", "<=", now - 30 * DAY)
    .get();

  const orders = snapshot.docs
    .map(doc => ({ ...doc.data(), id: doc.id }) as Order)
    .filter(order => order.status === "paid" && !order.reviewId && !order.reviewRequestSentAt);

  let sent = 0;
  for (const order of orders) {
    if (!(await sendWhatsappReviewRequest(order))) continue;
    await firestore().collection(Collections.orders).doc(order.id).update({ reviewRequestSentAt: getTimestamp() });
    sent++;
  }

  return Response.json({ eligible: orders.length, sent });
}
