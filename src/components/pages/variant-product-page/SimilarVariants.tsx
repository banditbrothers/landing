"use client";

import Image from "next/image";
import Link from "next/link";
import { ProductVariant } from "@/types/product";
import { getProductVariantUrl } from "@/utils/share";
import { getProductVariantName } from "@/utils/product";
import { DESIGNS_OBJ } from "@/data/products";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface ColorVariantsProps {
  colorVariants: ProductVariant[];
  currentVariantId: string;
}

export const ColorVariants = ({ colorVariants, currentVariantId }: ColorVariantsProps) => {
  const filteredVariants = colorVariants.filter(variant => variant.id !== currentVariantId);

  if (filteredVariants.length === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <div className="space-y-4 pt-6 border-t border-muted">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-2">Color Variants</h2>
        </div>

        <div className="flex flex-wrap gap-3">
          {filteredVariants.map(variant => {
            const variantName = getProductVariantName(variant);
            const variantDesign = DESIGNS_OBJ[variant.designId];

            const variantImage = variant.images.mockup[0];

            return (
              <div key={variant.id} className="w-20 flex-shrink-0">
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <Link
                      href={getProductVariantUrl(variant)}
                      className="group block relative overflow-hidden rounded-xl bg-card border border-border/50 hover:border-border transition-all duration-300 hover:shadow-lg">
                      <div className="aspect-square relative overflow-hidden">
                        <Image
                          fill
                          src={variantImage}
                          alt={variantName}
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          sizes="(max-width: 640px) 25vw, (max-width: 768px) 16vw, 12vw"
                          quality={60}
                        />
                      </div>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{variantDesign.name}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
};
