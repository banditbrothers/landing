"use server";

import { Collections } from "@/constants/collections";
import { firestore } from "@/lib/firebase-admin";
import { Review } from "@/types/review";

export const createReview = async (id: string, review: Omit<Review, "id">) => {
  const reviewRef = firestore().collection(Collections.reviews).doc(id);

  const reviewPromise = reviewRef.set(review);
  const orderPromise = firestore().collection(Collections.orders).doc(review.orderId).update({ reviewId: id });
  await Promise.all([reviewPromise, orderPromise]);

  const newReview = { ...review, id };
  return newReview;
};

export const getReviewsAdmin = async (limit = 10) => {
  const reviews = await firestore().collection(Collections.reviews).orderBy("createdAt", "desc").limit(limit).get();
  return reviews.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Review[];
};

export const getReviews = async (limit = 10) => {
  const reviews = await firestore()
    .collection(Collections.reviews)
    .where("status", "==", "approved")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  return reviews.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Review[];
};

export const updateReview = async (reviewId: string, review: Partial<Review>) => {
  await firestore().collection(Collections.reviews).doc(reviewId).update(review);
};
