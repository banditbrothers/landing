import Image from "next/image";
import { ReviewWithoutEmail } from "@/types/review";
import { StarRating } from "../misc/StarRating";
import { Skeleton } from "@/components/ui/skeleton";
import { CSSProperties, useState } from "react";
import { ClickableProductBadge } from "../badges/ClickableProductBadges";
import { useVariants } from "@/hooks/useVariants";
import { getProductVariantName } from "@/utils/product";

interface ReviewCardProps {
  review: ReviewWithoutEmail;
  containerStyle?: CSSProperties;
}

export const ReviewCard = ({ review, containerStyle = {} }: ReviewCardProps) => {
  const { data: variants } = useVariants();

  const userName = review.name
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");

  const [isLoading, setIsLoading] = useState(true);

  return (
    <div
      className="relative p-8 rounded-xl bg-card shadow-md hover:shadow-xl transition-all duration-300"
      style={containerStyle}>
      <div className="flex flex-col gap-8">
        <div className="flex-1">
          <div className="flex flex-col gap-4">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <h6 className="text-sm font-medium text-muted-foreground">{userName}</h6>
                <StarRating value={review.rating} />
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-card-foreground">{review.title}</h3>
            </div>
            <div className="flex flex-col items-start gap-4">
              <div className="flex flex-wrap gap-2 items-center">
                {review.source === "website" &&
                  review.variantIds.map(variantId => {
                    const variant = variants.find(v => v.id === variantId)!;
                    const variantName = getProductVariantName(variant, { includeProductName: true });

                    return (
                      <ClickableProductBadge variant={variant} key={variantId}>
                        {variantName}
                      </ClickableProductBadge>
                    );
                  })}
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground/90">{review.comment}</p>
          </div>
        </div>

        {review.images.length > 0 && (
          <div className="relative w-full h-96 rounded-lg overflow-hidden">
            {isLoading && <Skeleton className="absolute inset-0 w-full h-full" aria-hidden="true" />}
            <Image
              fill
              priority
              quality={50}
              src={review.images[0]}
              alt="Review Image"
              className="object-contain"
              onLoad={() => setIsLoading(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
};
