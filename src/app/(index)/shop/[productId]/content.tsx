"use client";

import { useState } from "react";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useParams } from "next/navigation";
import { familyOf, isListed, ProductGridLayout } from "@/components/layouts/ProductGridLayout";
import { Sticker } from "@/components/cards/ShopCard";
import { FitTitle } from "@/components/typography/FitTitle";
import { HowToWearDialog } from "@/components/dialogs/HowToWearDialog";
import { SizingDialog } from "@/components/dialogs/SizingDialog";
import { useVariants } from "@/hooks/useVariants";
import { PRODUCTS, PRODUCTS_OBJ } from "@/data/products";
import { formatCurrency } from "@/utils/price";

export function ProductPageContent() {
  const { data: variants } = useVariants();
  const { productId } = useParams<{ productId: string }>();
  const [dialog, setDialog] = useState<"how-to" | "sizing" | null>(null);

  const product = PRODUCTS_OBJ[productId];
  const productVariants = variants.filter(v => v.productId === productId && v.isAvailable);
  // Colour shades of one design count once, matching the folded grid
  const countFor = (id: string) =>
    new Set(variants.filter(v => v.productId === id && isListed(v)).map(v => familyOf(v.designId))).size;
  // Only gear that actually has something on the shelf gets a tab
  const tabs = PRODUCTS.filter(p => p.id === productId || countFor(p.id) > 0);

  if (!product) return null;

  const multiSize = product.sizes.length > 1;
  const helper =
    productId === "bandana"
      ? {
          tag: "12+ ways",
          title: "How to wear it",
          text: "Headband, mask, neck gaiter, wristband, helmet liner… see them all.",
          image: "/how-to-wear.webp",
          open: "how-to" as const,
        }
      : productId === "jersey"
        ? {
            tag: "Size guide",
            title: "Find your fit",
            text: "Check the chart before you pick a size. Jerseys ship in monthly batches.",
            image: product.baseImages?.mockup[0],
            open: "sizing" as const,
          }
        : multiSize
          ? {
              tag: "Sizing",
              title: "Find your fit",
              text: `${Object.values(product.sizeLabels ?? {}).join(" · ")} head circumference. Helmet XS–M? Go small.`,
              image: product.baseImages?.mockup[0],
              open: null,
            }
          : {
              tag: "One size",
              title: "Fits most",
              text: `${product.dimensions["one-size"] ?? ""} of 4-way stretch fabric.`,
              image: product.baseImages?.mockup[0],
              open: null,
            };

  const HelperTag = helper.open ? "button" : "div";

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-8 pt-20 md:pt-24 min-h-screen">
      {productId === "bandana" && <HowToWearDialog open={dialog === "how-to"} onClose={() => setDialog(null)} />}
      {productId === "jersey" && <SizingDialog open={dialog === "sizing"} onClose={() => setDialog(null)} />}

      <nav className="text-[13px] text-muted-foreground flex gap-2 pt-4 relative z-10" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="opacity-50">/</span>
        <Link href="/shop" className="hover:text-foreground">
          Shop
        </Link>
        <span className="opacity-50">/</span>
        <span className="text-foreground">{product.name}s</span>
      </nav>

      <header className="grid md:grid-cols-[1.5fr_1fr] gap-6 md:gap-10 items-end pt-6 pb-8 md:pb-9">
        <div className="min-w-0">
          <FitTitle as="h1" text={`${product.name}s`} max="8rem" className="font-calera uppercase leading-[0.9]">
            {product.name}s
          </FitTitle>
          <div className="flex flex-wrap gap-2 mt-5 text-[13px] text-muted-foreground">
            <span className="px-3 py-1.5 rounded-full bg-secondary">
              <b className="text-foreground font-semibold">{formatCurrency(product.basePrice)}</b> each
            </span>
            <span className="px-3 py-1.5 rounded-full bg-secondary">
              {multiSize ? (
                <>
                  <b className="text-foreground font-semibold">{product.sizes.length} sizes</b> to pick from
                </>
              ) : (
                <>
                  <b className="text-foreground font-semibold">One size</b> fits most
                </>
              )}
            </span>
            <span className="px-3 py-1.5 rounded-full bg-secondary">
              <b className="text-foreground font-semibold">4-way</b> Quick-Dri DryFit
            </span>
            <span className="px-3 py-1.5 rounded-full bg-secondary">UV · sweat · dust</span>
          </div>
        </div>

        <HelperTag
          {...(helper.open ? { type: "button" as const, onClick: () => setDialog(helper.open) } : {})}
          className="grid grid-cols-[96px_1fr] md:grid-cols-[120px_1fr] gap-4 items-center p-3.5 rounded-2xl border border-border bg-card text-left transition-colors hover:border-bandit-orange">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-secondary">
            <Skeleton className="absolute inset-0 rounded-none" />
            {helper.image && <Image fill src={helper.image} alt="" sizes="120px" className="object-cover" />}
          </div>
          <div>
            <Sticker>{helper.tag}</Sticker>
            <b className="block text-lg mt-1.5 mb-1">{helper.title}</b>
            <p className="text-[13px] text-muted-foreground leading-relaxed">{helper.text}</p>
          </div>
        </HelperTag>
      </header>

      <div className="flex gap-1.5 border-b border-border overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {tabs.map(p => (
          <Link
            key={p.id}
            href={`/shop/${p.id}`}
            aria-current={p.id === productId ? "page" : undefined}
            className={`px-4 py-3.5 text-[15px] whitespace-nowrap border-b-2 -mb-px transition-colors ${
              p.id === productId
                ? "text-foreground border-bandit-orange font-semibold"
                : "text-muted-foreground border-transparent hover:text-foreground"
            }`}>
            {p.name}s<sup className="text-[11px] text-muted-foreground ml-1">{countFor(p.id)}</sup>
          </Link>
        ))}
      </div>

      <ProductGridLayout productVariants={productVariants} />

      {product.about && (
        <section className="max-w-3xl py-16 md:py-24 space-y-4 text-muted-foreground leading-relaxed">
          <h2 className="font-calera uppercase text-foreground text-4xl md:text-5xl leading-[0.9] mb-6">
            About our {product.name.toLowerCase()}s
          </h2>
          {product.about.map(p => (
            <p key={p}>{p}</p>
          ))}
        </section>
      )}
    </div>
  );
}
