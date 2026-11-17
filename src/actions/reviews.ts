"use server";

import { requireAdmin } from "@/lib/admin-auth";
import { Collections } from "@/constants/collections";
import { firestore } from "@/lib/firebase-admin";
import { revalidateReviews } from "@/lib/reviews";
import { Review } from "@/types/review";
import { Order } from "@/types/order";
import { getTimestamp } from "@/utils/timestamp";
import { getDiscordReviewMessage } from "@/utils/discordMessages";
import { sendDiscordReviewMessage } from "./discord";
import { z } from "zod";

const reviewInputSchema = z.object({
  orderId: z.string().min(1),
  name: z.string().trim().min(2).max(100),
  title: z.string().trim().min(3).max(200),
  comment: z.string().trim().min(10).max(5000),
  rating: z.number().int().min(1).max(5),
  // Only a photo this page uploaded to our Firebase Storage
  images: z.array(z.string().startsWith("https://firebasestorage.googleapis.com/")).max(1),
});

// Public endpoint: everything except the customer's own words is taken from the order, and reviews always start pending
export const createReview = async (
  id: string,
  input: z.input<typeof reviewInputSchema>
): Promise<{ success: true } | { error: string }> => {
  const parsed = reviewInputSchema.safeParse(input);
  if (!parsed.success) return { error: "Please check your review and try again" };
  const { orderId, ...data } = parsed.data;

  const orderRef = firestore().collection(Collections.orders).doc(orderId);
  const orderSnap = await orderRef.get();
  if (!orderSnap.exists) return { error: "Order not found" };
  const order = orderSnap.data() as Order;
  if (order.reviewId) return { error: "This order has already been reviewed" };

  const review: Omit<Extract<Review, { source: "website" }>, "id"> = {
    ...data,
    status: "pending",
    email: order.email,
    source: "website",
    orderId,
    createdAt: getTimestamp(),
    variantIds: order.variants.map(variant => variant.variantId),
  };

  await Promise.all([
    firestore().collection(Collections.reviews).doc(id).set(review),
    orderRef.update({ reviewId: id }),
  ]);
  await sendDiscordReviewMessage(getDiscordReviewMessage({ ...review, id }));
  return { success: true };
};

// ponytail: fetches every review for client-side paging; switch to cursor paging if reviews reach thousands
export const getReviewsAdmin = async () => {
  await requireAdmin();
  const reviews = await firestore().collection(Collections.reviews).orderBy("createdAt", "desc").get();
  return reviews.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Review[];
};

export const updateReview = async (reviewId: string, review: Partial<Review>) => {
  await requireAdmin();
  await firestore().collection(Collections.reviews).doc(reviewId).update(review);
  revalidateReviews();
};
