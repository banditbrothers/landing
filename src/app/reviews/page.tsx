"use client";

import { ReviewCard } from "@/components/cards/ReviewCard";
import { MasonryGridItem, MasonryGridLayout } from "@/components/layouts/MasonryGridLayout";
import { Review } from "@/types/review";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { LoaderPinwheel } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";

const LIMIT = 10;

const fetchReviewsApi = async (limit: number, lastReviewCreatedAt?: number) => {
  const url = new URL("/api/reviews", window.location.origin);

  url.searchParams.set("limit", limit.toString());
  if (lastReviewCreatedAt) url.searchParams.set("lastReviewCreatedAt", lastReviewCreatedAt.toString());

  const response = await fetch(url.toString());
  return response.json() as Promise<Review[]>;
};

export default function ReviewsPage() {
  const {
    data: pageWiseReviews,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["reviews"],
    queryFn: ({ pageParam }) => fetchReviewsApi(LIMIT, pageParam.lastReviewCreatedAt),
    getNextPageParam: lastPage => {
      if (lastPage.length < LIMIT) return undefined;

      const lastReview = lastPage[lastPage.length - 1];
      return { lastReviewCreatedAt: lastReview.createdAt };
    },
    initialPageParam: { lastReviewCreatedAt: 0 },
  });

  const reviews = pageWiseReviews ? pageWiseReviews?.pages.flat() : [];

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

            {hasNextPage && (
              <div className="flex justify-center mt-8 mb-16">
                <Button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  variant="outline"
                  className="w-fit">
                  Load More
                  {isFetchingNextPage && <LoaderPinwheel className="ml-2 h-4 w-4 animate-spin" />}
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
