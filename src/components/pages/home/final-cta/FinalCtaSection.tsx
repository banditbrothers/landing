"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { GearTile } from "@/components/cards/GearTile";
import { Reveal } from "@/components/misc/Reveal";
import { ACTIVE_PRODUCTS } from "@/data/products";
import { MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING } from "@/constants/shipping";
import type { RatingSummary } from "@/lib/reviews";
import { formatCurrency } from "@/utils/price";
import { routes } from "@/utils/routes";
import { getProductPluralName } from "@/utils/product";

const TILE_TITLE = "text-xl sm:text-2xl md:text-3xl";
const TILE_SIZES = "(min-width: 1024px) 30vw, 50vw";
const WIDE_TILE_SIZES = "(min-width: 1024px) 60vw, 100vw";

// Photos from hand-picked reviews (JSLHa02RDDUx2N0ZU9ma, 9x2oLI5R6wJzYATw7pGP, h0m9VV8in6nnmQI5N1yc), left to right
const RATING_AVATARS = [
  "https://firebasestorage.googleapis.com/v0/b/banditbrothers-5253.firebasestorage.app/o/reviews%2FJSLHa02RDDUx2N0ZU9ma%2F0.jpg?alt=media&token=dc3a2ba1-7543-4e54-85f6-259cdcaa8462",
  "https://firebasestorage.googleapis.com/v0/b/banditbrothers-5253.firebasestorage.app/o/reviews%2F9x2oLI5R6wJzYATw7pGP%2F0.webp?alt=media&token=a45cf2be-5f28-4dc2-947c-d4154113f7fb",
  "https://bandit-brothers-s3-storage.s3.ap-south-1.amazonaws.com/reviews/h0m9VV8in6nnmQI5N1yc/image-0.jpeg",
];

export const FinalCtaSection = ({ rating }: { rating: RatingSummary | null }) => {
  // With an odd count the first tile goes full width, so the grid stays even (3 → 1 + 2, 5 → 1 + 2 + 2)
  const wideFirst = ACTIVE_PRODUCTS.length % 2 === 1;

  return (
    <section className="max-w-screen-2xl mx-auto px-4 md:px-8 pb-8">
      <div className="grid lg:grid-cols-[1.3fr_2fr] gap-3 md:gap-4">
        <Reveal>
          <div className="relative overflow-hidden h-full rounded-2xl bg-bandit-orange text-bandit-ink p-7 md:p-10 flex flex-col justify-between gap-10 lg:min-h-[520px]">
            <span
              aria-hidden
              className="absolute -right-8 -bottom-16 font-calera text-[20rem] leading-none opacity-[0.08] pointer-events-none">
              ✦
            </span>
            <div>
              <p className="text-xs font-bold tracking-[0.2em] uppercase">Still scrolling?</p>
              <h2 className="font-calera uppercase leading-[0.82] text-[clamp(3.5rem,6vw,6rem)] mt-3">
                Be a bandit
                <br />
                brother
              </h2>
              <p className="font-medium max-w-sm mt-4">
                {MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING
                  ? `Free shipping across India on orders over ${formatCurrency(MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING)}. `
                  : ""}
                Pick your gear →
              </p>
            </div>

            <div className="relative">
              {rating && rating.count > 0 && (
                <div className="flex items-center gap-2.5 text-sm font-medium mb-6">
                  <span className="flex -space-x-2">
                    {RATING_AVATARS.map(src => (
                      <Image
                        key={src}
                        src={src}
                        alt=""
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-bandit-orange"
                      />
                    ))}
                  </span>
                  <span>
                    Rated <b>{rating.average.toFixed(1)}★</b> from {rating.count} reviews
                  </span>
                </div>
              )}
              <div className="flex flex-wrap gap-2.5">
                <Link
                  href="/shop"
                  className="group inline-flex items-center gap-2 h-14 px-7 rounded-full bg-bandit-ink text-bandit-orange font-semibold transition hover:-translate-y-0.5">
                  Shop everything
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/reviews"
                  className="inline-flex items-center h-14 px-7 rounded-full border-[1.5px] border-bandit-ink font-semibold transition hover:bg-bandit-ink/10">
                  Read reviews
                </Link>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-2 auto-rows-fr gap-3 md:gap-4">
          {ACTIVE_PRODUCTS.map((product, i) => {
            const wide = wideFirst && i === 0;
            return (
              <Reveal
                key={product.id}
                delay={(i + 1) * 0.08}
                className={wide ? "col-span-2 aspect-[2/1] lg:aspect-auto" : "aspect-square lg:aspect-auto"}>
                <GearTile
                  href={routes.product(product.id)}
                  image={product.baseImages?.mockup?.[0]}
                  title={getProductPluralName(product)}
                  titleClassName={TILE_TITLE}
                  sizes={wide ? WIDE_TILE_SIZES : TILE_SIZES}>
                  {product.tagline && <span className="hidden sm:inline">{product.tagline}</span>}
                </GearTile>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
};
