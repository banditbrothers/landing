import Image from "next/image";
import { Review } from "@/types/review";
import { ProductBadge } from "@/app/order/page";
import { DESIGNS_OBJ } from "@/data/designs";
import { StarRating } from "../misc/StarRating";

export const ReviewCard = ({ review }: { review: Review }) => {
  return (
    <div className="relative p-6 rounded-lg bg-card shadow hover:shadow-lg transition-shadow duration-200">
      <div className="flex flex-col  gap-6">
        <div className="flex-1">
          <div className="flex flex-col gap-3">
            <h3 className="text-xl font-semibold text-card-foreground">{review.title}</h3>
            <div className="flex flex-col items-start gap-3 mb-1">
              <div className="flex flex-row gap-2 items-center">
                <ProductBadge>{DESIGNS_OBJ[review.productIds[0]].name}</ProductBadge>
                {review.productIds[1] && <ProductBadge>{DESIGNS_OBJ[review.productIds[1]].name}</ProductBadge>}
                {review.productIds.length > 2 && (
                  <span className="text-xs text-muted-foreground">+{review.productIds.length - 2}</span>
                )}
              </div>
              <StarRating value={review.rating} />
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{review.comment}</p>
          </div>
        </div>

        <div className="relative w-full  aspect-[4/3] rounded-lg overflow-hidden">
          <Image fill src={review.images[0]} alt="Review Image" className="object-cover" />
        </div>
      </div>
    </div>
  );
};
