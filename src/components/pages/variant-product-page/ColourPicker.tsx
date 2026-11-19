"use client";

import Image from "next/image";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useVariants } from "@/hooks/useVariants";
import { DESIGNS_OBJ, getColorVariantIds } from "@/data/designs";
import { ProductVariant } from "@/types/product";
import { getProductVariantName, isVariantOutOfStock } from "@/utils/product";
import { routes } from "@/utils/routes";

/** Other colourways of this design in the same gear; renders nothing when there's only one */
export const ColourPicker = ({ variant, className }: { variant: ProductVariant; className?: string }) => {
  const { data: variants } = useVariants();
  const colourIds = getColorVariantIds(variant.designId);
  const colourways = variants
    .filter(v => v.productId === variant.productId && colourIds.includes(v.designId))
    .sort((a, b) => DESIGNS_OBJ[a.designId].name.localeCompare(DESIGNS_OBJ[b.designId].name));
  if (colourways.length <= 1) return null;

  const name = getProductVariantName(variant);
  const shade = name.includes(" - ") ? name.split(" - ").slice(1).join(" - ") : name;

  return (
    <div className={className}>
      <div className="flex justify-between items-baseline text-sm mb-3">
        <span>
          Colourway: <b className="font-semibold">{shade}</b>
        </span>
        <span className="text-[13px] text-muted-foreground">{colourways.length} options</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {colourways.map(c => (
          <Link
            key={c.id}
            href={routes.variant(c)}
            replace
            scroll={false}
            title={`${getProductVariantName(c)}${isVariantOutOfStock(c) ? " (sold out)" : ""}`}
            aria-current={c.id === variant.id ? "true" : undefined}
            className={`relative w-[62px] aspect-square rounded-lg overflow-hidden border-2 transition hover:-translate-y-0.5 ${
              c.id === variant.id ? "border-bandit-orange" : "border-transparent"
            } ${isVariantOutOfStock(c) ? "opacity-40" : ""}`}>
            <Skeleton className="absolute inset-0 rounded-none" />
            <Image fill src={c.images.mockup[0]} alt={getProductVariantName(c)} sizes="62px" className="object-cover" />
          </Link>
        ))}
      </div>
    </div>
  );
};
