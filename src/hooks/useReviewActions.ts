import { Review } from "@/types/review";
import { createReview as createReviewAction, updateReview as updateReviewAction } from "@/actions/reviews";
import { useState } from "react";

export const useReviewActions = () => {
  const [creatingReview, setCreatingReview] = useState(false);
  const [updatingReview, setUpdatingReview] = useState(false);

  const createReview = async (review: Omit<Review, "id">) => {
    setCreatingReview(true);
    try {
      return await createReviewAction(review);
    } catch (error) {
      throw error;
    } finally {
      setCreatingReview(false);
    }
  };

  const updateReview = async (reviewId: string, review: Partial<Review>) => {
    setUpdatingReview(true);
    try {
      return await updateReviewAction(reviewId, review);
    } catch (error) {
      throw error;
    } finally {
      setUpdatingReview(false);
    }
  };

  return {
    loading: { creatingReview, updatingReview },
    createReview,
    updateReview,
  };
};
