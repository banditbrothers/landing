// One-off: set reviewRequestSentAt on prod orders that already have a review, so the review-request cron skips them.
// Uses the review's createdAt, falling back to now. Dry run by default; pass --apply to write.
// Usage: node --env-file=.env scripts/backfill-review-request-sent-at.mjs [--apply]
import admin from "firebase-admin";

const apply = process.argv.includes("--apply");
admin.initializeApp({ credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_ADMIN)) });
const db = admin.firestore();
const now = Math.floor(Date.now() / 1000);

const orders = (await db.collection("orders").get()).docs;
const reviews = new Map((await db.collection("reviews").get()).docs.map(d => [d.id, d.data()]));

const targets = orders.filter(d => d.data().reviewId && !d.data().reviewRequestSentAt);
const paidNoReview = orders.filter(d => d.data().status === "paid" && !d.data().reviewId && !d.data().reviewRequestSentAt);
const olderThan37d = paidNoReview.filter(d => d.data().createdAt < now - 37 * 86400);

console.log(`orders total: ${orders.length}`);
console.log(`with reviewId, no reviewRequestSentAt (to backfill): ${targets.length}`);
console.log(`  of which review doc missing (will use now): ${targets.filter(d => !reviews.get(d.data().reviewId)).length}`);
console.log(`paid, no review, not yet requested: ${paidNoReview.length} (older than 37 days: ${olderThan37d.length})`);
for (const d of targets) {
  const at = reviews.get(d.data().reviewId)?.createdAt ?? now;
  console.log(`  ${d.id}  review=${d.data().reviewId}  sentAt=${new Date(at * 1000).toISOString().slice(0, 10)}`);
}

if (apply) {
  const batch = db.batch(); // ponytail: single batch, caps at 500 writes
  for (const d of targets) batch.update(d.ref, { reviewRequestSentAt: reviews.get(d.data().reviewId)?.createdAt ?? now });
  await batch.commit();
  console.log(`updated ${targets.length} orders`);
} else console.log("dry run, nothing written. Re-run with --apply.");
