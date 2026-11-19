"use client";

import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ShopCard } from "@/components/cards/ShopCard";
import { Sticker } from "@/components/misc/Stickers";
import { familyOf, groupByFamily, isListed } from "@/utils/product";
import { Reveal } from "@/components/misc/Reveal";
import { FitTitle } from "@/components/typography/FitTitle";
import { useVariants } from "@/hooks/useVariants";
import { PRODUCTS, PRODUCTS_OBJ } from "@/data/products";
import { MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING } from "@/constants/shipping";
import { ProductVariant } from "@/types/product";
import { formatCurrency } from "@/utils/price";
import { getProductVariantName, isVariantOutOfStock } from "@/utils/product";
import { routes } from "@/utils/routes";
import { Kicker } from "@/components/typography/Kicker";

const AISLE_SIZE = 7; // + one "see all" tile = two rows of four

const GEAR_LINE: Record<string, string> = {
  bandana: "The OG tube. Twelve-plus ways to wear one piece of fabric.",
  balaclava: "Full-face cover for long rides, dusty roads and cold mornings.",
  "square-bandana": "The classic kerchief. Neck, head, wrist or back pocket.",
  jersey: "Quick-dry jerseys, made to order in monthly batches.",
};

// Best sellers, then newest; in-stock first; one card per colour family
const pickForAisle = (variants: ProductVariant[]) => {
  const ranked = [...variants].sort(
    (a, b) =>
      +isVariantOutOfStock(a) - +isVariantOutOfStock(b) ||
      +!!b.isBestSeller - +!!a.isBestSeller ||
      b.createdAt - a.createdAt
  );
  return ranked.filter((v, i) => ranked.findIndex(x => familyOf(x.designId) === familyOf(v.designId)) === i);
};

export function CollectionContent() {
  const { data: variants } = useVariants();
  const shelf = variants.filter(isListed);

  const aisles = PRODUCTS.map(p => {
    const pv = shelf.filter(v => v.productId === p.id);
    return { product: p, variants: pv, designs: new Set(pv.map(v => familyOf(v.designId))).size };
  }).filter(a => a.variants.length > 0);
  const designCount = new Set(shelf.map(v => familyOf(v.designId))).size;
  const minPrice = Math.min(...aisles.map(a => a.product.basePrice));

  // Kit band: the in-stock design that comes in the most gear types (best sellers win ties)
  const byDesign = new Map<string, ProductVariant[]>();
  shelf
    .filter(v => !isVariantOutOfStock(v))
    .forEach(v => byDesign.set(v.designId, [...(byDesign.get(v.designId) ?? []), v]));
  const kit = [...byDesign.values()].sort(
    (a, b) => b.length - a.length || +b.some(v => v.isBestSeller) - +a.some(v => v.isBestSeller)
  )[0];

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-8 pt-20 md:pt-24 min-h-screen">
      <nav className="text-[13px] text-muted-foreground flex gap-2 pt-4 relative z-10" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="opacity-50">/</span>
        <span className="text-foreground">Shop</span>
      </nav>

      <header className="grid md:grid-cols-[1.4fr_1fr] gap-6 md:gap-10 items-end pt-8 md:pt-12 pb-8">
        <div>
          <Kicker>The whole loot</Kicker>
          <h1 className="font-calera uppercase leading-[0.9] text-[17vw] md:text-[clamp(4.5rem,10vw,10rem)]">
            Every piece <br className="hidden md:block" />
            of <span className="text-bandit-orange">gear</span>.
          </h1>
        </div>
        <div>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-md">
            Bold prints on 4-way stretch, quick-dry fabric. Pick a gear type, then pick your mischief.
          </p>
          <div className="flex gap-8 mt-6">
            {[
              [`${designCount}+`, "Designs"],
              [aisles.length, "Gear types"],
              [formatCurrency(minPrice), "Starting at"],
            ].map(([n, label]) => (
              <div key={label}>
                <b className="block font-calera font-normal text-4xl">{n}</b>
                <small className="text-xs tracking-[0.12em] uppercase text-muted-foreground">{label}</small>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Jump bar: one chip per gear type, scales with PRODUCTS */}
      <div className="sticky top-[var(--nav-h)] transition-[top] duration-300 z-30 -mx-4 md:-mx-8 px-4 md:px-8 py-3 bg-background/90 backdrop-blur-md border-y border-border">
        <div className="flex gap-2 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {aisles.map(({ product, designs }, i) => (
            <a
              key={product.id}
              href={`#${product.id}`}
              className="shrink-0 inline-flex items-center gap-2 h-10 pl-1.5 pr-4 rounded-full border border-border text-sm transition-colors hover:border-bandit-orange">
              <span className="grid place-items-center w-7 h-7 rounded-full bg-secondary text-[11px] tracking-wider text-muted-foreground">
                {String(i + 1).padStart(2, "0")}
              </span>
              {product.name}s<span className="text-muted-foreground">{designs}</span>
            </a>
          ))}
        </div>
      </div>

      {aisles.map(({ product, variants, designs }, i) => {
        const picks = pickForAisle(variants);
        const families = groupByFamily(variants);
        const rest = picks.length - AISLE_SIZE;
        return (
          <section
            key={product.id}
            id={product.id}
            className="scroll-mt-[calc(var(--nav-h)+5rem)] grid lg:grid-cols-[minmax(260px,320px)_1fr] gap-6 lg:gap-10 py-12 md:py-16 border-b border-border last:border-0">
            <Reveal className="lg:sticky lg:top-[calc(var(--nav-h)+6rem)] self-start">
              <span className="text-xs tracking-[0.16em] text-muted-foreground">
                {String(i + 1).padStart(2, "0")} / {String(aisles.length).padStart(2, "0")}
              </span>
              <div className="mt-2">
                <FitTitle text={`${product.name}s`} max="4.5rem" className="font-calera uppercase leading-[0.9]" />
              </div>
              <p className="text-muted-foreground mt-3 leading-relaxed max-w-sm">
                {GEAR_LINE[product.id] ?? product.description[0]}
              </p>
              <div className="flex flex-wrap gap-2 mt-4 text-[13px] text-muted-foreground">
                <span className="px-3 py-1.5 rounded-full bg-secondary">
                  <b className="text-foreground">{formatCurrency(product.basePrice)}</b> each
                </span>
                <span className="px-3 py-1.5 rounded-full bg-secondary">
                  {product.sizes.length > 1 ? `${product.sizes.length} sizes` : "One size"}
                </span>
                <span className="px-3 py-1.5 rounded-full bg-secondary">{designs} designs</span>
              </div>
              <Link
                href={routes.product(product.id)}
                className="mt-6 inline-flex items-center gap-2.5 h-12 px-6 rounded-xl bg-bandit-orange text-black font-semibold transition hover:brightness-110 hover:-translate-y-px">
                Shop all {product.name.toLowerCase()}s <ArrowRight className="w-4 h-4" />
              </Link>
            </Reveal>

            {/* Swipe rail on mobile, 4-up grid from md */}
            <div className="flex md:grid md:grid-cols-4 gap-3 md:gap-5 overflow-x-auto overflow-y-hidden md:overflow-visible snap-x snap-mandatory scroll-px-4 md:scroll-px-0 -mx-4 px-4 md:mx-0 md:px-0 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {picks.slice(0, AISLE_SIZE).map(v => (
                <div key={v.id} className="w-[46%] sm:w-[31%] md:w-auto shrink-0 snap-start">
                  <ShopCard variant={v} family={families.get(familyOf(v.designId))} />
                </div>
              ))}
              <Link
                href={routes.product(product.id)}
                className="w-[46%] sm:w-[31%] md:w-auto shrink-0 snap-start aspect-square rounded-2xl border border-dashed border-border grid place-items-center text-center p-4 transition-colors hover:border-bandit-orange hover:bg-bandit-orange/5 group">
                <span>
                  <span className="block font-calera text-5xl md:text-6xl text-bandit-orange">
                    {rest > 0 ? `+${rest}` : "All"}
                  </span>
                  <span className="text-sm text-muted-foreground group-hover:text-foreground">
                    {rest > 0 ? "more designs" : `${product.name.toLowerCase()}s`} →
                  </span>
                </span>
              </Link>
            </div>
          </section>
        );
      })}

      {kit && kit.length > 1 && (
        <Reveal className="my-12 md:my-16">
          <div className="grid lg:grid-cols-[1fr_1.3fr] gap-8 lg:gap-10 items-center p-6 md:p-10 rounded-3xl border border-border bg-card bg-[radial-gradient(120%_140%_at_0%_0%,rgba(253,110,0,.14),transparent_55%)]">
            <div>
              <Kicker className="text-bandit-orange">Same design, full kit</Kicker>
              <h2 className="font-calera uppercase leading-[0.9] text-[clamp(2.75rem,5vw,4.5rem)]">
                Match the whole gang
              </h2>
              <p className="text-muted-foreground mt-4 mb-6 leading-relaxed max-w-md">
                Pick a print once, wear it everywhere.{" "}
                {MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING !== null &&
                  `The full set usually clears ${formatCurrency(MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING)}, so shipping's on us.`}
              </p>
              <Link
                href={routes.variant(kit[0])}
                className="inline-flex items-center gap-2.5 h-12 px-6 rounded-xl bg-bandit-orange text-black font-semibold transition hover:brightness-110">
                Shop {getProductVariantName(kit[0])} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className={`grid gap-3 ${kit.length > 2 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"}`}>
              {kit.slice(0, 3).map(v => (
                <Link
                  key={v.id}
                  href={routes.variant(v)}
                  className="relative aspect-square rounded-2xl overflow-hidden group">
                  <Skeleton className="absolute inset-0 rounded-none" />
                  <Image
                    fill
                    src={v.images.mockup[0]}
                    alt={getProductVariantName(v, { includeProductName: true })}
                    sizes="(min-width: 1024px) 18vw, 45vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute bottom-2.5 left-2.5">
                    <Sticker tone="ghost">{PRODUCTS_OBJ[v.productId].name}</Sticker>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      )}
    </div>
  );
}
