"use client";

import { shuffleArray } from "@/utils/misc";
import { useState, useEffect } from "react";
import { ProductVariantCard, VariantNameAndPriceBanner } from "../../cards/VariantCard";
import { ProductVariant } from "@/types/product";
import { useVariants } from "@/hooks/useVariants";

export const RecommendedProducts = ({ currentVariantId, count = 4 }: { currentVariantId: string; count?: number }) => {
  const { data: variants } = useVariants();

  const [recommendedVariants, setRecommendedVariants] = useState<ProductVariant[]>([]);

  useEffect(() => {
    setRecommendedVariants(shuffleArray(variants.filter(v => v.id !== currentVariantId)));
  }, [currentVariantId, variants]);

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-foreground mb-8">You Might Also Like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {recommendedVariants.slice(0, count).map(relatedVariant => (
          <ProductVariantCard key={relatedVariant.id} openInNewTab productVariant={relatedVariant}>
            <VariantNameAndPriceBanner productVariant={relatedVariant} />
          </ProductVariantCard>
        ))}
      </div>
    </div>
  );
};
