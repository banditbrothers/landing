import { Review } from "@/types/review";
import { createReview as createReviewAction } from "@/actions/reviews";
import { useState } from "react";

export const useReviewActions = () => {
  const [creatingReview, setCreatingReview] = useState(false);

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

  return {
    loading: { creatingReview },
    createReview,
  };
};
