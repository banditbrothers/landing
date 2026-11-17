"use client";

import { Sticker } from "@/components/cards/ShopCard";
import { Reveal } from "@/components/misc/Reveal";
import { StarRating } from "@/components/misc/StarRating";
import type { RatingSummary } from "@/lib/reviews";

export const Scorecard = ({ rating }: { rating: RatingSummary }) => (
  <Reveal className="relative rounded-[22px] border border-border bg-card p-6 md:p-7">
    <span className="absolute -top-3 right-6">
      <Sticker>Verified orders</Sticker>
    </span>
    <div className="flex items-center gap-5">
      <b className="font-calera font-normal text-[92px] leading-[0.8]">{rating.average.toFixed(1)}</b>
      <div>
        <StarRating value={Math.round(rating.average)} className="[&_svg]:w-[22px] [&_svg]:h-[22px]" />
        <small className="block text-[13px] text-muted-foreground mt-1.5">
          out of 5 · {rating.count} store-wide {rating.count === 1 ? "review" : "reviews"}
        </small>
      </div>
    </div>
    <div className="grid gap-2 mt-6">
      {rating.breakdown.map((n, i) => (
        <div key={i} className="grid grid-cols-[28px_1fr_34px] gap-2.5 items-center text-[13px] text-muted-foreground">
          <span>{5 - i}★</span>
          <i className="h-2 rounded-full bg-secondary overflow-hidden">
            <i className="block h-full rounded-full bg-bandit-orange" style={{ width: `${(n / rating.count) * 100}%` }} />
          </i>
          <span className="text-right">{n}</span>
        </div>
      ))}
    </div>
  </Reveal>
);
