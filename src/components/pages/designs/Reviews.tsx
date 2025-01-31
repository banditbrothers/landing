"use client";

import { getReviewsByProductId } from "@/actions/reviews";
import { Card } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { formatDateShort } from "@/utils/timestamp";
import { StarRating } from "@/components/misc/StarRating";

export const Reviews = ({ currentDesignId }: { currentDesignId: string }) => {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ["reviews", currentDesignId],
    queryFn: async () => await getReviewsByProductId(currentDesignId, 5),
  });

  if (isLoading || !reviews) return null;

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-foreground mb-8">Reviews</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {reviews.map(review => (
          <Card key={review.id} className="p-4 flex flex-col gap-2">
            <div className="flex items-end justify-between">
              <div className="flex items-center gap-2">
                <div>
                  <p className="font-medium text-sm">{review.name}</p>
                  <p className="text-xs text-muted-foreground">{formatDateShort(review.createdAt)}</p>
                </div>
              </div>

              <div className="mb-[2px]">
                <StarRating value={review.rating} />
              </div>
            </div>

            {review.images?.[0] && (
              <div className="">
                <AspectRatio ratio={16 / 9}>
                  <Image src={review.images[0]} alt="Review image" fill className="rounded-md object-cover" />
                </AspectRatio>
              </div>
            )}

            <div>
              <h3 className="font-semibold">{review.title}</h3>
              <p className="text-sm text-muted-foreground">{review.comment}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
