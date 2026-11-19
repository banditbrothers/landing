"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight } from "lucide-react";

import { useVariants } from "@/hooks/useVariants";
import { ACTIVE_PRODUCTS, PRODUCTS_OBJ } from "@/data/products";
import { ProductVariant } from "@/types/product";
import { formatCurrency } from "@/utils/price";
import { routes } from "@/utils/routes";
import {
  familyOf,
  getFamilyName,
  getProductVariantName,
  getProductVariantPrice,
  isVariantOutOfStock,
  sortOutOfStockLast,
} from "@/utils/product";
import { Reveal, SectionHead } from "@/components/misc/Reveal";
import { SOLD_OUT_IMAGE, SoldOutStamp } from "@/components/misc/Stickers";
import { FamilySwatches } from "@/components/misc/FamilySwatches";

const GEAR_COPY: Record<string, string> = {
  bandana: "The OG. 12+ ways to wear it.",
  balaclava: "Full cover for full send.",
  "square-bandana": "Kerchief-style, pocket-ready.",
};

// Bento of product types
export const ShopByGear = () => {
  const gear = ACTIVE_PRODUCTS;

  return (
    <section id="gear" className="scroll-mt-20 max-w-screen-2xl mx-auto px-4 md:px-8">
      <SectionHead
        kicker="Shop by gear"
        title={
          <>
            Pick your <span className="text-bandit-orange">poison</span>
          </>
        }>
        <Link
          href="/shop"
          className="text-sm text-muted-foreground border-b border-border pb-0.5 hover:text-foreground hover:border-bandit-orange w-fit">
          View everything →
        </Link>
      </SectionHead>

      <div className="grid grid-cols-2 md:grid-cols-4 md:grid-rows-2 gap-3 md:gap-4 md:h-[620px]">
        {gear.map((product, i) => (
          <Reveal
            key={product.id}
            delay={i * 0.08}
            className={
              i === 0
                ? "col-span-2 md:row-span-2 h-[380px] md:h-auto"
                : i === 1
                  ? "col-span-2 h-[240px] md:h-auto"
                  : "col-span-1 md:col-span-2 h-[220px] md:h-auto"
            }>
            <Link
              href={routes.product(product.id)}
              className="group relative isolate block h-full rounded-2xl overflow-hidden bg-card">
              <Skeleton className="absolute inset-0 -z-10 rounded-none" />
              {product.baseImages?.mockup?.[0] && (
                <Image
                  fill
                  src={product.baseImages.mockup[0]}
                  alt={product.name}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="object-cover -z-10 transition-transform duration-700 ease-out group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent from-30% to-black/85" />
              <span className="absolute top-4 left-5 text-xs tracking-[0.18em] text-white/80">0{i + 1}</span>
              <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3">
                <div>
                  <h3
                    className={`font-calera uppercase leading-[0.9] text-white ${
                      i === 0 ? "text-[clamp(3rem,7vw,6.5rem)]" : "text-[clamp(1.75rem,3.5vw,3.5rem)]"
                    }`}>
                    {product.name}
                  </h3>
                  <p className="text-sm text-white/80 mt-2">
                    {GEAR_COPY[product.id] && <span className="hidden sm:inline">{GEAR_COPY[product.id]} · </span>}
                    from {formatCurrency(product.basePrice)}
                  </p>
                </div>
                <span className="hidden md:grid shrink-0 place-items-center w-12 h-12 rounded-full bg-white text-black transition duration-300 group-hover:bg-bandit-orange group-hover:-rotate-45">
                  <ArrowRight className="w-5 h-5" />
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
};

const VariantTile = ({
  variant: initial,
  family = [initial],
  rank,
}: {
  variant: ProductVariant;
  /** Colour variants folded into this tile (includes `variant`); their swatches switch the tile */
  family?: ProductVariant[];
  rank?: number;
}) => {
  const [activeId, setActiveId] = useState(initial.id);
  const variant = family.find(v => v.id === activeId) ?? initial;
  const soldOut = isVariantOutOfStock(variant);
  const image = variant.images?.mockup?.[0];

  return (
    <Link href={routes.variant(variant)} className="group block">
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-card">
        <Skeleton className="absolute inset-0 rounded-none" />
        {image && (
          <Image
            fill
            src={image}
            alt={getProductVariantName(variant, { includeProductName: true })}
            sizes="(min-width: 1024px) 25vw, 70vw"
            className={`object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06] ${
              soldOut ? SOLD_OUT_IMAGE : ""
            }`}
          />
        )}
        {soldOut && <SoldOutStamp className="text-2xl md:text-3xl" />}
        <span className="absolute top-3 right-3 grid place-items-center w-9 h-9 rounded-full bg-black/50 backdrop-blur text-white opacity-0 translate-y-1 transition group-hover:opacity-100 group-hover:translate-y-0">
          <ArrowUpRight className="w-4 h-4" />
        </span>
        {rank && (
          <span className="absolute -left-1 -bottom-4 font-calera text-[7rem] leading-none text-transparent pointer-events-none [-webkit-text-stroke:1.5px_theme(colors.bandit-orange)]">
            {rank}
          </span>
        )}
      </div>
      <div className="pt-3 px-0.5 flex justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold truncate">
            {family.length > 1 ? getFamilyName(variant) : getProductVariantName(variant)}
          </h3>
          <p className="text-sm text-muted-foreground">{PRODUCTS_OBJ[variant.productId]?.name}</p>
          <div className="mt-1.5 text-[13px] text-muted-foreground">
            <FamilySwatches family={family} activeId={variant.id} onPick={setActiveId} />
          </div>
        </div>
        <span className="font-semibold">{formatCurrency(getProductVariantPrice(variant))}</span>
      </div>
    </Link>
  );
};

// Native scroll-snap rail; arrow buttons on desktop
export const Rail = ({
  variants,
  families,
  ranked = false,
}: {
  variants: ProductVariant[];
  /** Colour variants per tile, keyed by the tile's variant id */
  families?: Map<string, ProductVariant[]>;
  ranked?: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 1 | -1) =>
    ref.current?.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" });

  return (
    <div className="relative">
      <div
        ref={ref}
        className="grid grid-flow-col auto-cols-[68%] sm:auto-cols-[40%] lg:auto-cols-[calc((100%-3*1.25rem)/4.3)] gap-4 lg:gap-5 overflow-x-auto overflow-y-hidden snap-x snap-mandatory scroll-px-4 md:scroll-px-8 px-4 md:px-8 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {variants.map((v, i) => (
          <Reveal key={v.id} delay={Math.min(i, 5) * 0.06} className="snap-start">
            <VariantTile variant={v} family={families?.get(v.id)} rank={ranked && i < 9 ? i + 1 : undefined} />
          </Reveal>
        ))}
      </div>
      <div className="hidden md:flex absolute -top-[4.5rem] right-8 gap-2">
        {([-1, 1] as const).map(dir => (
          <button
            key={dir}
            onClick={() => scroll(dir)}
            aria-label={dir === 1 ? "Next" : "Previous"}
            className="grid place-items-center w-11 h-11 rounded-full border border-border transition hover:border-bandit-orange hover:text-bandit-orange">
            {dir === 1 ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
          </button>
        ))}
      </div>
    </div>
  );
};

export const ProductLibrary = () => {
  const { data: variants } = useVariants();

  const bestSellers = sortOutOfStockLast(variants.filter(v => v.isBestSeller));
  // Newest in-stock shade of each design per gear type stands for its family; the rest become swatches
  const inStock = variants.filter(v => !isVariantOutOfStock(v)).sort((a, b) => b.createdAt - a.createdAt);
  const familyKey = (v: ProductVariant) => `${v.productId}/${familyOf(v.designId)}`;
  const newArrivals = inStock
    .filter((v, i) => inStock.findIndex(x => familyKey(x) === familyKey(v)) === i)
    .slice(0, 10);
  const newFamilies = new Map(newArrivals.map(v => [v.id, inStock.filter(x => familyKey(x) === familyKey(v))]));

  return (
    <>
      <section id="library-bestsellers" className="scroll-mt-20 max-w-screen-2xl mx-auto">
        <div className="px-4 md:px-8">
          <SectionHead kicker="Most wanted" title="Best sellers" />
        </div>
        <Rail variants={bestSellers} ranked />
      </section>

      {newArrivals.length > 0 && (
        <section id="library-new" className="max-w-screen-2xl mx-auto">
          <div className="px-4 md:px-8">
            <SectionHead
              kicker="Fresh off the press"
              title={
                <>
                  New <span className="text-bandit-orange">drops</span>
                </>
              }
            />
          </div>
          <Rail variants={newArrivals} families={newFamilies} />
        </section>
      )}
    </>
  );
};
