import { getApprovedReviews, getRatingSummary } from "@/lib/reviews";
import ReviewsContent from "./content";

export const revalidate = 86400; // 24h, = REVIEWS_CACHE_SECONDS in lib/reviews.ts (Next needs a literal here)

export default async function ReviewsPage() {
  // Never break the page over reviews
  const reviews = await getApprovedReviews().catch(error => {
    console.error("Error fetching reviews:", error);
    return null;
  });
  return <ReviewsContent rating={reviews ? getRatingSummary(reviews) : null} reviews={reviews ?? []} />;
}
