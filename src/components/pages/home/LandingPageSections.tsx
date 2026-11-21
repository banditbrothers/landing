"use client";

import { Droplets, Palette, Truck, Wind } from "lucide-react";

import { ProductLibrary, ShopByGear } from "@/components/pages/home/product-library/ProductLibrarySection";
// import { KnowYourProductSection } from "@/components/pages/home/know-your-product/KnowYourProductSection";
import { TestimonialsSection } from "@/components/pages/home/testimonials/TestimonialsSection";
import { InstagramFeedSection } from "@/components/pages/home/instagram/InstagramFeedSection";
import { HowToWearSection } from "@/components/pages/home/how-to-wear/HowToWearSection";
import { FinalCtaSection } from "@/components/pages/home/final-cta/FinalCtaSection";
import { Reveal } from "@/components/misc/Reveal";
import { MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING } from "@/constants/shipping";
import { formatCurrency } from "@/utils/price";
import type { RatingSummary } from "@/lib/reviews";

const TICKER = [
  "Wear your mischief",
  "Quick-Dri DryFit",
  "Made in India",
  "Ride loud",
  "Prints that never fade",
  "Be a bandit brother",
];

// Two crossed, tilted strips scrolling in opposite directions
const Ticker = () => (
  <div className="relative h-32 md:h-40 -my-6 overflow-hidden" aria-hidden>
    {[
      { cls: "bg-card text-muted-foreground -rotate-2", dir: "reverse" },
      { cls: "bg-bandit-orange text-black rotate-2", dir: "normal" },
    ].map(({ cls, dir }) => (
      <div
        key={dir}
        className={`absolute top-1/2 -translate-y-1/2 -inset-x-8 py-3 overflow-hidden whitespace-nowrap ${cls}`}>
        <div className="inline-flex animate-marquee motion-reduce:animate-none" style={{ animationDirection: dir }}>
          {[0, 1].map(k => (
            <span key={k} className="flex">
              {TICKER.map(t => (
                <span key={t} className="font-calera uppercase text-2xl md:text-3xl px-6 flex items-center gap-6">
                  {t} <span className="text-lg">✦</span>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const CODE = [
  { icon: Wind, title: "Breathes", text: "4-way stretch Quick-Dri fabric that dries in minutes." },
  { icon: Palette, title: "Stays loud", text: "Sublimated prints that won't crack, peel or fade." },
  { icon: Droplets, title: "Stays fresh", text: "Wicks sweat and keeps the funk away on long rides." },
  {
    icon: Truck,
    title: "Ships free",
    text: MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING
      ? `Free shipping across India on orders over ${formatCurrency(MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING)}.`
      : "Shipped across India.",
  },
];

const BanditCode = () => (
  <section className="max-w-screen-2xl mx-auto px-4 md:px-8">
    <div className="grid grid-cols-2 lg:grid-cols-4 border border-border rounded-3xl overflow-hidden">
      {CODE.map(({ icon: Icon, title, text }, i) => (
        <Reveal
          key={title}
          delay={i * 0.08}
          className={`group p-5 md:p-8 border-border transition-colors hover:bg-bandit-orange/5 ${i % 2 === 0 ? "border-r" : ""} ${
            i < 2 ? "border-b lg:border-b-0" : ""
          } ${i === 1 ? "lg:border-r" : ""}`}>
          <Icon className="w-6 h-6 text-bandit-orange mb-4 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
          <h3 className="font-calera uppercase text-2xl md:text-3xl">{title}</h3>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{text}</p>
        </Reveal>
      ))}
    </div>
  </section>
);

export function LandingPageSections({ rating }: { rating: RatingSummary | null }) {
  return (
    <div className="space-y-24 md:space-y-32 pb-12">
      <Ticker />
      <ShopByGear />
      <ProductLibrary />
      <BanditCode />
      <HowToWearSection />
      <TestimonialsSection />
      {/* Hidden until the new explainer illustrations are signed off */}
      {/* <KnowYourProductSection /> */}
      <InstagramFeedSection />
      <FinalCtaSection rating={rating} />
    </div>
  );
}
