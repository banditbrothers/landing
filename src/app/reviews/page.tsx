"use client";

import { getReviews } from "@/actions/reviews";
import { ReviewCard } from "@/components/cards/ReviewCard";
import { MasonryGridItem, MasonryGridLayout } from "@/components/layouts/MasonryGridLayout";
import { Review } from "@/types/review";
import { useEffect } from "react";
import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { LoaderPinwheel } from "lucide-react";

const LIMIT = 10;

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const fetchReviews = async (lastReview?: Review) => {
    const newReviews = await getReviews(LIMIT, lastReview);
    if (newReviews.length < LIMIT) {
      setHasMore(false);
    }
    return newReviews;
  };

  useEffect(() => {
    const loadInitialReviews = async () => {
      const initialReviews = await fetchReviews();
      setReviews(initialReviews);
      setIsLoading(false);
    };
    loadInitialReviews();
  }, []);

  const handleLoadMore = async () => {
    if (isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);
    const lastReview = reviews[reviews.length - 1];
    const newReviews = await fetchReviews(lastReview);
    setReviews(prev => [...prev, ...newReviews]);
    setIsLoadingMore(false);
  };

  return (
    <div className="max-w-7xl mx-auto mt-32 min-h-screen">
      <div className="px-4">
        <div className="flex flex-row gap-4 items-center justify-center my-16">
          <span className="text-4xl w-fit font-bold text-center">What our Fellow Bandits Say</span>
        </div>
        {isLoading && <LoadingSkeleton />}
        {!isLoading && (
          <>
            <MasonryGridLayout>
              {reviews.map(review => (
                <MasonryGridItem key={review.id}>
                  <ReviewCard review={review} />
                </MasonryGridItem>
              ))}
            </MasonryGridLayout>

            {hasMore && (
              <div className="flex justify-center mt-8 mb-16">
                <Button onClick={handleLoadMore} disabled={isLoadingMore} variant="outline" className="w-fit">
                  Load More
                  {isLoadingMore && <LoaderPinwheel className="ml-2 h-4 w-4 animate-spin" />}
                </Button>
              </div>
            )}
          </>
        )}

        {!isLoading && reviews.length === 0 && (
          <div className="flex flex-col items-center justify-center my-32 px-4">
            <h3 className="mb-2 text-2xl font-semibold tracking-tight">No Reviews Yet</h3>
          </div>
        )}
      </div>
    </div>
  );
}

const LoadingSkeleton = () => (
  <MasonryGridLayout>
    {[...Array(8)].map((_, i) => (
      <MasonryGridItem key={i}>
        <div className="space-y-4 rounded-lg p-6">
          {/* Name and Rating */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-5 w-[120px]" /> {/* Name */}
            <Skeleton className="h-5 w-[120px]" /> {/* Rating stars */}
          </div>

          {/* Title */}
          <Skeleton className="h-8 w-[200px]" />

          {/* Product Tags */}
          <div className="flex flex-wrap gap-2">
            {[...Array(2)].map((_, j) => (
              <Skeleton key={j} className="h-8 w-[140px] rounded-full" />
            ))}
          </div>

          {/* Comment */}
          <Skeleton className="h-4 w-[90%]" />

          {/* Image */}
          <Skeleton className="h-[300px] w-full rounded-md" />
        </div>
      </MasonryGridItem>
    ))}
  </MasonryGridLayout>
);
