import "server-only";
import { unstable_cache, revalidateTag } from "next/cache";
import { Collections } from "@/constants/collections";
import { firestore } from "@/lib/firebase-admin";
import { ReviewWithoutEmail } from "@/types/review";
import { OrderedVariant } from "@/types/product";
import { SECONDS_PER_DAY } from "@/utils/timestamp";

const REVIEWS_TAG = "reviews";
// /reviews and variant pages set `export const revalidate` to the same value (it must be a literal there)
export const REVIEWS_CACHE_SECONDS = SECONDS_PER_DAY;

/** breakdown = review counts for 5★ → 1★ */
export type RatingSummary = { average: number; count: number; breakdown: number[] };

// One read per approved review, shared by /reviews and every variant page.
// Busted by revalidateReviews() when a review is approved/rejected.
// ponytail: whole collection in one cache entry; page it if approved reviews reach the thousands (2MB entry limit)
export const getApprovedReviews = unstable_cache(
  async () => {
    const snapshot = await firestore()
      .collection(Collections.reviews)
      .where("status", "==", "approved")
      .orderBy("createdAt", "desc")
      .get();
    return snapshot.docs.map(doc => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { email, ...rest } = doc.data();
      return { id: doc.id, ...rest } as ReviewWithoutEmail;
    });
  },
  ["approved-reviews"],
  { revalidate: REVIEWS_CACHE_SECONDS, tags: [REVIEWS_TAG] }
);

export const getRatingSummary = (reviews: ReviewWithoutEmail[]): RatingSummary => ({
  average: reviews.reduce((sum, r) => sum + r.rating, 0) / (reviews.length || 1),
  count: reviews.length,
  breakdown: [5, 4, 3, 2, 1].map(n => reviews.filter(r => r.rating === n).length),
});

/** Expire the reviews cache now; pages built from it re-render on their next request. */
export const revalidateReviews = () => revalidateTag(REVIEWS_TAG, { expire: 0 });

// variantId → other variantIds from the same paid orders, most often first.
// One read per paid order per day; new orders only change rankings slowly, so no tag.
// ponytail: scans every paid order; limit to recent orders if paid orders reach the tens of thousands
export const getBoughtTogether = unstable_cache(
  async () => {
    const snapshot = await firestore()
      .collection(Collections.orders)
      .where("status", "==", "paid")
      .select("variants")
      .get();
    const counts: Record<string, Record<string, number>> = {};
    for (const doc of snapshot.docs) {
      const ids = [...new Set(((doc.get("variants") ?? []) as OrderedVariant[]).map(v => v.variantId))];
      for (const a of ids) for (const b of ids) if (a !== b) (counts[a] ??= {})[b] = (counts[a][b] ?? 0) + 1;
    }
    return Object.fromEntries(
      Object.entries(counts).map(([id, others]) => [
        id,
        Object.entries(others)
          .sort((x, y) => y[1] - x[1])
          .slice(0, 12)
          .map(([other]) => other),
      ])
    );
  },
  ["bought-together"],
  { revalidate: SECONDS_PER_DAY }
);
