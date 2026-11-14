import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductVariantCard, VariantNameAndPriceBanner } from "@/components/cards/VariantCard";
import { getCatalog } from "@/lib/catalog";
import { sortOutOfStockLast } from "@/utils/product";
import IndexLayout from "./(index)/layout";

export const metadata: Metadata = { title: "Page Not Found" };

// Root not-found renders outside the (index) layout, so wrap it to keep the cart and search working.
export default async function NotFound() {
  const catalog = (await getCatalog()) ?? [];
  const bestSellers = catalog.filter(v => v.isBestSeller && v.isDiscoverable !== false && v.images.mockup.length > 0);
  const suspects = sortOutOfStockLast(bestSellers).slice(0, 4);

  return (
    <IndexLayout>
      <section className="relative overflow-hidden px-4 pt-32 pb-16 md:pt-40">
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-24 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-bandit-orange/15 blur-3xl"
        />

        <div className="relative mx-auto flex max-w-2xl flex-col items-center text-center">
          <p className="font-calera text-[7rem] leading-none text-bandit-orange sm:text-[10rem] md:text-[12rem]">404</p>
          <h1 className="mt-6 text-3xl font-bold text-foreground md:text-4xl">This page pulled a disappearing act</h1>
          <p className="mt-4 text-base text-muted-foreground md:text-lg">
            Whatever was here has slipped away. It may have moved, sold out for good, or never existed. The rest of
            the gang is still around though.
          </p>

          <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
            <Button asChild variant="bandit-hover" size="lg" className="group">
              <Link href="/products">
                Shop all products
                <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">Back to home</Link>
            </Button>
          </div>
        </div>
      </section>

      {suspects.length > 0 && (
        <section className="mx-auto max-w-screen-xl px-4 pb-24">
          <h2 className="mb-6 text-center text-2xl font-bold text-foreground">The usual suspects</h2>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-4">
            {suspects.map(variant => (
              <ProductVariantCard key={variant.id} productVariant={variant} showFavoriteButton={false}>
                <VariantNameAndPriceBanner productVariant={variant} />
              </ProductVariantCard>
            ))}
          </div>
        </section>
      )}
    </IndexLayout>
  );
}
