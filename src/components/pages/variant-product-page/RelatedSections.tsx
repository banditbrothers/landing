"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SkeletonImage } from "@/components/misc/SkeletonImage";
import { ShopCard } from "@/components/cards/ShopCard";
import { ReviewCard } from "@/components/cards/ReviewCard";
import { Scorecard } from "@/components/misc/Scorecard";
import { Rail } from "@/components/pages/home/product-library/ProductLibrarySection";
import { WAYS } from "@/components/pages/home/how-to-wear/HowToWearSection";
import { useVariants } from "@/hooks/useVariants";
import { PRODUCTS } from "@/data/products";
import type { RatingSummary } from "@/lib/reviews";
import { Product, ProductVariant } from "@/types/product";
import { ReviewWithoutEmail } from "@/types/review";
import { shuffleArray } from "@/utils/misc";
import { familyOf, sortOutOfStockLast } from "@/utils/product";
import { routes } from "@/utils/routes";

const isVariant = (v: ProductVariant | undefined): v is ProductVariant => !!v;

const SectionHead = ({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: React.ReactNode;
  children?: React.ReactNode;
}) => (
  <div className="mb-6">
    <p className="text-xs tracking-[0.18em] uppercase text-muted-foreground mb-2">{kicker}</p>
    {/* kicker sits outside the row so the action centers on the title alone */}
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
      <h2 className="font-calera uppercase leading-[0.9] text-[clamp(2.5rem,5vw,4rem)]">{title}</h2>
      {children}
    </div>
  </div>
);

/** Everything below the fold: how to wear, the rest of the kit, also bought, reviews, more like this */
export const RelatedSections = ({
  variant,
  product,
  rating,
  reviewCount,
  reviews,
  boughtWith,
}: {
  variant: ProductVariant;
  product: Omit<Product, "id">;
  rating: RatingSummary | null;
  reviewCount: number;
  reviews: ReviewWithoutEmail[];
  boughtWith: string[];
}) => {
  const { data: variants } = useVariants();
  const [moreLikeThis, setMoreLikeThis] = useState<ProductVariant[]>([]);

  // Shuffled after mount so server and client render the same markup
  useEffect(() => {
    setMoreLikeThis(
      sortOutOfStockLast(
        shuffleArray(variants.filter(v => v.id !== variant.id && v.productId === variant.productId && v.isAvailable))
      ).slice(0, 10)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant.id, variants]);

  // Same design (or same colour family) in the other gear types
  const kit = PRODUCTS.filter(p => p.id !== variant.productId)
    .map(
      p =>
        variants.find(v => v.productId === p.id && v.designId === variant.designId) ??
        variants.find(v => v.productId === p.id && familyOf(v.designId) === familyOf(variant.designId))
    )
    .filter(isVariant)
    .filter(v => v.images.mockup.length > 0);

  const kitIds = new Set(kit.map(v => v.id));
  const alsoBought = sortOutOfStockLast(
    boughtWith
      .map(id => variants.find(v => v.id === id))
      .filter(isVariant)
      .filter(v => !kitIds.has(v.id))
  ).slice(0, 10);

  const productName = product.name.toLowerCase();

  return (
    <>
      {variant.productId === "bandana" && <WearItYourWay />}

      {kit.length > 0 && (
        <section className="py-12 md:py-16">
          <SectionHead kicker="Same print, other gear" title="Complete the kit" />
          <div className="grid grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-7 md:gap-5">
            {kit.map(v => (
              <ShopCard key={v.id} variant={v} showGearName />
            ))}
          </div>
        </section>
      )}

      {alsoBought.length > 0 && (
        <section className="py-12 md:py-16 -mx-4 md:-mx-8">
          <div className="px-4 md:px-8">
            <SectionHead kicker="Bought with this design" title="Bandits also grabbed" />
          </div>
          <Rail variants={alsoBought} />
        </section>
      )}

      {reviews.length > 0 && (
        <section id="reviews" className="py-12 md:py-16 scroll-mt-20">
          <SectionHead
            kicker={
              reviewCount >= reviews.length
                ? "From orders with this design"
                : reviewCount
                  ? "This design first, then the whole crew"
                  : "From the whole crew"
            }
            title="Bandits say">
            <Link
              href="/reviews"
              className="text-sm text-muted-foreground border-b border-border pb-0.5 hover:text-foreground hover:border-bandit-orange w-fit">
              All reviews →
            </Link>
          </SectionHead>
          <div className="grid lg:grid-cols-[340px_1fr] gap-6 lg:gap-10 items-start">
            {rating && rating.count > 0 && <Scorecard rating={rating} />}
            {/* Masonry like /reviews: cards differ a lot in height (photo vs none) */}
            <div className="columns-1 sm:columns-2 xl:columns-3 gap-5">
              {reviews.map(r => (
                <div key={r.id} className="break-inside-avoid mb-5">
                  <ReviewCard review={r} currentVariantId={variant.id} />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {moreLikeThis.length > 0 && (
        <section className="py-12 md:py-16 -mx-4 md:-mx-8">
          <div className="px-4 md:px-8">
            <SectionHead kicker={`More ${productName}s`} title="More mischief">
              <Link
                href={routes.product(variant.productId)}
                className="text-sm text-muted-foreground border-b border-border pb-0.5 hover:text-foreground hover:border-bandit-orange w-fit md:mr-28">
                Shop all {productName}s →
              </Link>
            </SectionHead>
          </div>
          <Rail variants={moreLikeThis} />
        </section>
      )}
    </>
  );
};

const WearItYourWay = () => {
  return (
    <section className="py-12 md:py-16">
      <SectionHead kicker="One tube, many looks" title="Wear it your way" />
      <div className="grid md:grid-cols-[1fr_2.4fr] gap-3.5">
        <div className="relative aspect-square md:aspect-auto rounded-2xl overflow-hidden bg-black">
          <SkeletonImage
            fill
            src="/how-to-wear.webp"
            alt="How to wear your bandana"
            sizes="(min-width: 768px) 30vw, 100vw"
            className="object-contain"
          />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {WAYS.slice(0, 6).map((way, i) => (
            <div
              key={way}
              className="min-h-[120px] md:min-h-[150px] p-4 md:p-5 rounded-2xl bg-card border border-border flex flex-col justify-between transition hover:border-bandit-orange hover:-translate-y-0.5">
              <span className="font-calera text-5xl leading-none text-transparent [-webkit-text-stroke:1px_theme(colors.bandit-orange)]">
                {String(i + 1).padStart(2, "0")}
              </span>
              <b>{way}</b>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
