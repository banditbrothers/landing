import Image from "next/image";
import Link from "next/link";
import { CategoryBadge } from "../badges/DesignBadges";
import { formatCurrency } from "@/utils/price";
import { ProductVariant } from "@/types/product";
import { getProductVariantUrl } from "@/utils/share";
import { getProductVariantName, getProductVariantPrice } from "@/utils/product";
import { DESIGNS_OBJ } from "@/data/products";

interface SearchProductCardProps {
  variant: ProductVariant;
}

export const SearchProductCard = ({ variant }: SearchProductCardProps) => {
  const variantName = getProductVariantName(variant);
  const variantPrice = getProductVariantPrice(variant);
  const variantDesign = DESIGNS_OBJ[variant.designId];

  return (
    <div key={variant.id} className=" p-4 bg-card rounded-lg relative border border-border">
      <Link href={getProductVariantUrl(variant)}>
        <div className="flex flex-col gap-4">
          <div className="relative w-full aspect-square">
            <Image
              fill
              src={variant.images.mockup[0]}
              alt={variantName + " image"}
              className="object-cover rounded-md w-full h-full"
            />
          </div>
          <div className="flex-1 flex flex-col gap-1">
            <h3 className="font-semibold text-sm sm:text-base pr-3">{variantName}</h3>
            <span className="flex flex-row gap-2 items-center justify-between">
              <CategoryBadge category={variantDesign.category} />
              <p className="text-muted-foreground text-sm">{formatCurrency(variantPrice)}</p>
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};
