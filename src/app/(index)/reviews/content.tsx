"use client";

import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { ReviewCard, shortName } from "@/components/cards/ReviewCard";
import { StarRating } from "@/components/misc/StarRating";
import { LoadMoreTrigger } from "@/components/misc/LoadMoreTrigger";
import { Reveal, SectionHead } from "@/components/misc/Reveal";
import { ReviewWithoutEmail as Review } from "@/types/review";
import type { RatingSummary } from "@/lib/reviews";
import { Scorecard } from "@/components/misc/Scorecard";
import { Kicker } from "@/components/typography/Kicker";

const LIMIT = 12;

// Short, photo-less reviews become orange pull quotes; every third one stays plain so they don't clump
const isLoud = (review: Review, i: number) => !review.images.length && review.title.trim().length <= 22 && i % 3 !== 0;

// Wall columns at Tailwind's md / lg breakpoints; 1 on the server (it can't know the width)
const MD = "(min-width: 768px)";
const LG = "(min-width: 1024px)";
const useColumnCount = () =>
  useSyncExternalStore(
    onChange => {
      const queries = [MD, LG].map(q => window.matchMedia(q));
      queries.forEach(q => q.addEventListener("change", onChange));
      return () => queries.forEach(q => q.removeEventListener("change", onChange));
    },
    () => (window.matchMedia(LG).matches ? 3 : window.matchMedia(MD).matches ? 2 : 1),
    () => 1
  );

// All approved reviews come from the server (one cached read); the wall just reveals them LIMIT at a time
export default function ReviewsContent({ rating, reviews }: { rating: RatingSummary | null; reviews: Review[] }) {
  const [shown, setShown] = useState(LIMIT);
  const cols = useColumnCount();
  // Photo strip + CTA use the first page only, so loading more doesn't reshuffle them
  const photos = reviews.slice(0, LIMIT).filter(r => r.images.length > 0);

  return (
    <div className="max-w-screen-2xl mx-auto px-4 md:px-8 pt-20 md:pt-24 min-h-screen">
      <nav className="text-[13px] text-muted-foreground flex gap-2 pt-4 relative z-10" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">
          Home
        </Link>
        <span className="opacity-50">/</span>
        <span className="text-foreground">Reviews</span>
      </nav>

      <header className="grid lg:grid-cols-[1.35fr_1fr] gap-8 lg:gap-12 items-end pt-8 md:pt-12 pb-12 md:pb-14">
        <div>
          <Kicker>Word on the street</Kicker>
          <h1 className="font-calera uppercase leading-[0.9] text-[17vw] md:text-[clamp(4.5rem,10.5vw,10rem)]">
            Fellow bandits
            <br />
            say it <span className="text-bandit-orange">best</span>.
          </h1>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-md mt-6">
            Real reviews from real riders, gym rats and backpackers. Every one is from a verified order. No paid hype.
          </p>
        </div>
        {rating && rating.count > 0 && <Scorecard rating={rating} />}
      </header>

      {photos.length > 0 && <PhotoStrip photos={photos} />}

      <section className="border-t border-border pt-12 md:pt-14">
        <SectionHead
          kicker="Straight from the gang"
          title={
            <>
              The whole <span className="text-bandit-orange">wall</span>
            </>
          }
        />

        {reviews.length === 0 ? (
          <h3 className="text-2xl font-semibold tracking-tight text-center my-32">No Reviews Yet</h3>
        ) : (
          // Review i always sits in column i % cols, so revealing more only appends to the bottoms
          // (CSS `columns` rebalanced every card on each reveal)
          <div className="flex gap-5 items-start">
            {Array.from({ length: cols }, (_, c) => (
              <div key={c} className="flex-1 min-w-0 flex flex-col gap-5">
                {reviews
                  .slice(0, shown)
                  .map(
                    (review, i) =>
                      i % cols === c && (
                        <ReviewCard key={review.id} review={review} loud={isLoud(review, i)} priority={i < 3} />
                      )
                  )}
              </div>
            ))}
          </div>
        )}

        {/* Keyed so it remounts after each reveal and fires again if the reader is still at the bottom */}
        {shown < reviews.length && <LoadMoreTrigger key={shown} onReach={() => setShown(n => n + LIMIT)} />}
      </section>

      <Reveal className="mt-20 grid md:grid-cols-[1.3fr_1fr] gap-8 items-center rounded-[26px] border border-border bg-card p-7 md:p-12 overflow-hidden">
        <div>
          <Kicker className="mb-0">Your turn</Kicker>
          <h2 className="font-calera uppercase leading-[0.9] text-[clamp(2.75rem,6vw,5.5rem)] mt-2.5">
            Wear your <span className="text-bandit-orange">mischief</span>.
          </h2>
          <p className="text-muted-foreground leading-relaxed max-w-md mt-3.5 mb-6">
            Join the gang. Already got your gear? Your review link comes with your order on WhatsApp, and we read every
            one.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <Link
              href="/shop"
              className="inline-flex items-center h-[54px] px-6 rounded-xl bg-bandit-orange text-black font-semibold transition hover:brightness-110 hover:-translate-y-px">
              Shop the loot →
            </Link>
            <Link
              href="/#how-to-wear"
              className="inline-flex items-center h-[54px] px-6 rounded-xl border border-border font-semibold transition-colors hover:border-foreground">
              How to wear
            </Link>
          </div>
        </div>
        {photos.length > 0 && (
          <div className="relative h-56 md:h-72">
            {photos.slice(0, 3).map((r, i) => (
              <div
                key={r.id}
                className={`absolute w-[150px] md:w-[200px] aspect-square rounded-2xl overflow-hidden border-[3px] border-background shadow-[0_16px_40px_rgba(0,0,0,.5)] ${
                  [
                    "left-0 top-12 -rotate-[8deg]",
                    "left-[30%] top-0 rotate-[4deg] z-[1]",
                    "right-0 top-16 rotate-[10deg]",
                  ][i]
                }`}>
                <Skeleton className="absolute inset-0 rounded-none" />
                <Image fill src={r.images[0]} alt="" sizes="200px" className="object-cover" />
              </div>
            ))}
          </div>
        )}
      </Reveal>
    </div>
  );
}

const PhotoStrip = ({ photos }: { photos: Review[] }) => {
  // Fill at least ~8 tiles, then double it: the marquee animates to -50%, so both halves must match
  const half = Array.from({ length: Math.ceil(8 / photos.length) }, () => photos).flat();
  return (
    <section className="border-t border-border pt-7 pb-14 md:pb-16">
      <SectionHead
        kicker="Spotted"
        title={
          <>
            Bandits in the <span className="text-bandit-orange">wild</span>
          </>
        }
      />
      <div className="-mx-4 md:-mx-8 overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
        <div className="flex gap-5 md:gap-6 w-max py-4 pb-6 animate-marquee [animation-duration:60s] hover:[animation-play-state:paused]">
          {[...half, ...half].map((r, i) => (
            <a
              key={i}
              href={`#r-${r.id}`}
              aria-hidden={i >= half.length}
              tabIndex={i >= half.length ? -1 : undefined}
              className={`w-[180px] md:w-[230px] shrink-0 bg-[#f4f4f2] text-[#111] p-2.5 pb-3.5 rounded-md shadow-[0_14px_30px_rgba(0,0,0,.5)] transition-transform duration-300 hover:rotate-0 hover:scale-[1.04] ${
                i % 2 ? "rotate-2 translate-y-2.5" : "-rotate-[2.5deg]"
              }`}>
              <div className="relative aspect-[4/5] rounded-sm overflow-hidden bg-zinc-300">
                <Skeleton className="absolute inset-0 rounded-none" />
                <Image
                  fill
                  src={r.images[0]}
                  alt={`${shortName(r.name)}'s photo`}
                  sizes="230px"
                  className="object-cover"
                />
              </div>
              <p className="font-bold text-sm leading-tight mt-2.5 line-clamp-2">{r.title.trim()}</p>
              <small className="flex items-center gap-1.5 text-xs text-zinc-600 mt-1">
                {shortName(r.name)} · <StarRating value={r.rating} />
              </small>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
