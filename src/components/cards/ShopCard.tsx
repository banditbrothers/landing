"use client";

import { FavoriteButton } from "@/components/misc/FavoriteButton";
import { useState } from "react";
import { SkeletonImage } from "@/components/misc/SkeletonImage";
import Link from "next/link";
import { toast } from "sonner";
import { useCart } from "@/components/stores/cart";
import { ProductVariant } from "@/types/product";
import { PRODUCTS_OBJ } from "@/data/products";
import { formatCurrency } from "@/utils/price";
import { routes } from "@/utils/routes";
import {
  exceedsStock,
  getFamilyName,
  getProductVariantName,
  getProductVariantPrice,
  getUnitsLeft,
  isNewDrop,
  isSizeInStock,
  isVariantOutOfStock,
  LOW_STOCK_THRESHOLD,
} from "@/utils/product";
import { useAddToCart } from "@/hooks/useAddToCart";
import { SOLD_OUT_IMAGE, SoldOutStamp, Sticker } from "@/components/misc/Stickers";
import { FamilySwatches } from "@/components/misc/FamilySwatches";

type ShopCardProps = {
  variant: ProductVariant;
  /** Every colour variant folded into this card (includes `variant`); their swatches switch the card's variant */
  family?: ProductVariant[];
  /** Title with the gear name instead of the design (used in "complete the kit") */
  showGearName?: boolean;
  priority?: boolean;
};

export const ShopCard = ({
  variant: initial,
  family = [initial],
  showGearName = false,
  priority = false,
}: ShopCardProps) => {
  const [activeId, setActiveId] = useState(initial.id);
  const variant = family.find(v => v.id === activeId) ?? initial;
  const { cart } = useCart();
  const addToCart = useAddToCart();

  const product = PRODUCTS_OBJ[variant.productId];
  const soldOut = isVariantOutOfStock(variant);
  const unitsLeft = getUnitsLeft(variant);
  const price = getProductVariantPrice(variant);
  const name = getProductVariantName(variant);
  const title = showGearName ? product.name : family.length > 1 ? getFamilyName(variant) : name;
  const href = routes.variant(variant);

  const inCart = (size: string) => cart.find(i => i.variantId === variant.id && i.size === size)?.quantity ?? 0;
  const quickSizes = product.sizes.length <= 2 ? product.sizes.filter(s => isSizeInStock(variant, s)) : [];

  const quickAdd = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    if (exceedsStock(variant, size, inCart(size) + 1)) return toast.error("That's all we have in stock");
    addToCart(variant, size);
  };

  return (
    <Link href={href} className="group block">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-card">
        <SkeletonImage
          fill
          src={variant.images.mockup[0]}
          alt={getProductVariantName(variant, { includeProductName: true })}
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
          priority={priority}
          className={`object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06] ${
            soldOut ? SOLD_OUT_IMAGE : ""
          }`}
        />

        <div className="absolute top-3 left-3 z-[2] flex flex-col items-start gap-1.5">
          {variant.isBestSeller && <Sticker>Most wanted</Sticker>}
          {isNewDrop(variant) && <Sticker tone="light">New drop</Sticker>}
          {!soldOut && unitsLeft !== undefined && unitsLeft <= LOW_STOCK_THRESHOLD && (
            <Sticker tone="ghost">Only {unitsLeft} left</Sticker>
          )}
        </div>

        {soldOut && <SoldOutStamp />}

        <FavoriteButton
          variantId={variant.id}
          className="absolute top-1.5 right-1.5 z-[2] grid place-items-center w-9 h-9 rounded-full bg-black/55 backdrop-blur text-white"
          iconClassName="w-[18px] h-[18px]"
        />

        {/* Quick add slides up on hover (desktop only) */}
        {!soldOut && (
          <div className="hidden md:flex absolute inset-x-2.5 bottom-2.5 z-[2] gap-1.5 translate-y-[calc(100%+14px)] group-hover:translate-y-0 group-focus-within:translate-y-0 transition-transform duration-300 ease-out">
            {quickSizes.length > 0 ? (
              quickSizes.map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={e => quickAdd(e, size)}
                  className="flex-1 h-11 rounded-xl bg-white/95 text-black text-sm font-semibold transition-colors hover:bg-bandit-orange">
                  +{" "}
                  {product.sizes.length > 1
                    ? (product.sizeLabels?.[size]?.split(" - ")[0] ?? size)
                    : `Add · ${formatCurrency(price)}`}
                </button>
              ))
            ) : (
              <span className="flex-1 h-11 rounded-xl bg-white/95 text-black text-sm font-semibold grid place-items-center">
                Choose size →
              </span>
            )}
          </div>
        )}
      </div>

      <div className="pt-3 px-0.5 grid grid-cols-1 md:grid-cols-[1fr_auto] gap-x-3 gap-y-1">
        <h3 className="text-sm md:text-[17px] font-semibold leading-tight line-clamp-2">{title}</h3>
        <span className="text-sm md:text-base font-semibold">{formatCurrency(price)}</span>
        <div className="md:col-span-2 flex items-center gap-2 text-xs md:text-[13px] text-muted-foreground">
          {showGearName ? (
            <span className="truncate">{name}</span>
          ) : (
            <FamilySwatches family={family} activeId={variant.id} onPick={setActiveId} />
          )}
        </div>
      </div>
    </Link>
  );
};
