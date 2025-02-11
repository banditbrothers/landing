import Image from "next/image";
import { Review } from "@/types/review";
import { DESIGNS_OBJ } from "@/data/designs";
import { StarRating } from "../misc/StarRating";
import { ProductBadge } from "../badges/ProductBadge";
import Link from "next/link";

export const ReviewCard = ({ review }: { review: Review }) => {
  return (
    <div className="relative p-6 rounded-lg bg-card shadow hover:shadow-lg transition-shadow duration-200">
      <div className="flex flex-col  gap-6">
        <div className="flex-1">
          <div className="flex flex-col gap-3">
            <h3 className="text-xl font-semibold text-card-foreground">{review.title}</h3>
            <div className="flex flex-col items-start gap-3 mb-1">
              <div className="flex flex-wrap gap-2 items-center">
                {review.productIds.map(productId => (
                  <Link href={`/designs/${productId}`} key={productId}>
                    <ProductBadge>{DESIGNS_OBJ[productId].name}</ProductBadge>
                  </Link>
                ))}
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
