// One-off: send the WhatsApp review request to paid prod orders older than the cron window (37+ days) that have
// no review and no request yet, then set reviewRequestSentAt so the cron never repeats them.
// Dry run by default. --apply sends; --limit=N sends only the first N (oldest first).
// Usage: node --env-file=.env scripts/send-old-review-requests.mjs [--apply] [--limit=N]
import admin from "firebase-admin";

const apply = process.argv.includes("--apply");
const limit = Number(process.argv.find(a => a.startsWith("--limit="))?.split("=")[1]) || Infinity;
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_ADMIN)) });
const db = admin.firestore();
const now = Math.floor(Date.now() / 1000);

// Copied from src/actions/whatsapp.ts (server-only, so not importable from plain node). Keep in sync.
const toWhatsappNumber = phone => {
  const digits = phone.replace(/\D/g, "").replace(/^0+/, "");
  return digits.length === 10 ? `91${digits}` : digits;
};
const firstName = name => name.trim().split(/\s+/)[0] || "Bandit";
const sendReviewRequest = async order => {
  const response = await fetch(`https://graph.facebook.com/v23.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: "POST",
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: toWhatsappNumber(order.phone),
      type: "template",
      template: {
        name: "review_request",
        language: { code: "en" },
        components: [
          { type: "body", parameters: [firstName(order.name), order.id].map(text => ({ type: "text", text })) },
          { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: order.id }] },
        ],
      },
    }),
  });
  if (!response.ok) console.error(`  failed ${order.id}:`, await response.text());
  return response.ok;
};

const orders = (await db.collection("orders").where("createdAt", "<", now - 37 * 86400).get()).docs
  .map(d => ({ ...d.data(), id: d.id }))
  .filter(o => o.status === "paid" && !o.reviewId && !o.reviewRequestSentAt && o.phone)
  .sort((a, b) => a.createdAt - b.createdAt)
  .slice(0, limit);

console.log(`eligible: ${orders.length}`);
for (const o of orders) console.log(`  ${new Date(o.createdAt * 1000).toISOString().slice(0, 10)}  ${o.id}  ${firstName(o.name)}`);
if (!apply) {
  console.log("dry run, nothing sent. Re-run with --apply (try --limit=1 first).");
  process.exit(0);
}

let sent = 0;
for (const o of orders) {
  if (!(await sendReviewRequest(o))) continue;
  await db.collection("orders").doc(o.id).update({ reviewRequestSentAt: Math.floor(Date.now() / 1000) });
  sent++;
  await new Promise(r => setTimeout(r, 1000)); // gentle pacing for Meta rate limits
}
console.log(`sent ${sent}/${orders.length}`);
