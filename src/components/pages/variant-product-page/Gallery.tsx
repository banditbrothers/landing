"use client";

import { useEffect, useRef, useState } from "react";
import { ShareIcon } from "lucide-react";
import { SkeletonImage } from "@/components/misc/SkeletonImage";
import { Sticker } from "@/components/misc/Stickers";
import { ProductVariant } from "@/types/product";
import { getProductVariantName, isNewDrop } from "@/utils/product";
import { shareVariant } from "@/utils/share";

/** Swipeable on touch, thumbnails beside it on desktop. */
export const Gallery = ({ variant, soldOut }: { variant: ProductVariant; soldOut: boolean }) => {
  const images = variant.images.mockup;
  const [imageIndex, setImageIndex] = useState(0);
  const slider = useRef<HTMLDivElement>(null);

  // Switching colourway starts back at image 1; onScroll then resets imageIndex
  useEffect(() => {
    slider.current?.scrollTo({ left: 0 });
  }, [variant.id]);

  const goToImage = (i: number) => {
    const el = slider.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

  return (
    <div className="grid md:grid-cols-[84px_1fr] gap-3.5 lg:sticky lg:top-[calc(var(--nav-h)+2rem)] lg:transition-[top] lg:duration-300 min-w-0">
      <div className="hidden md:flex flex-col gap-2.5 order-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            aria-label={`Show image ${i + 1}`}
            onClick={() => goToImage(i)}
            className={`relative shrink-0 w-16 md:w-full aspect-square rounded-lg overflow-hidden border-2 transition ${
              i === imageIndex ? "border-bandit-orange opacity-100" : "border-transparent opacity-60 hover:opacity-100"
            }`}>
            <SkeletonImage fill src={src} alt="" sizes="84px" className="object-cover" />
          </button>
        ))}
      </div>

      <div className="relative aspect-square rounded-3xl overflow-hidden bg-card order-1 md:order-2">
        <div
          ref={slider}
          onScroll={e => setImageIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          className="flex h-full overflow-x-auto overflow-y-hidden snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((src, i) => (
            <div key={src} className="relative w-full h-full shrink-0 snap-center">
              <SkeletonImage
                fill
                src={src}
                alt={i === 0 ? getProductVariantName(variant, { includeProductName: true }) : ""}
                priority={i === 0}
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
        {soldOut && <CrimeTape />}
        {/* Mobile: no room for share in the buy row, so it sits on the image */}
        <button
          type="button"
          aria-label="Share"
          onClick={() => shareVariant(variant)}
          className="sm:hidden absolute bottom-2 right-2 grid place-items-center w-10 h-10 rounded-full bg-black/60 backdrop-blur text-white">
          <ShareIcon className="w-[18px] h-[18px]" />
        </button>
        <div className="absolute top-4 left-4 flex gap-2 pointer-events-none">
          {variant.isBestSeller && <Sticker>Most wanted</Sticker>}
          {isNewDrop(variant) && <Sticker tone="light">New drop</Sticker>}
        </div>
        {images.length > 1 && (
          <div className="md:hidden absolute bottom-4 inset-x-0 flex justify-center gap-2">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Show image ${i + 1}`}
                onClick={() => goToImage(i)}
                className={`h-2 rounded-full transition-all duration-500 ${i === imageIndex ? "bg-bandit-orange w-5" : "bg-white/60 w-2"}`}
              />
            ))}
          </div>
        )}
        {images.length > 1 && (
          <span className="hidden md:inline absolute bottom-4 right-4 text-xs px-2.5 py-1.5 rounded-full bg-black/60 backdrop-blur text-white">
            {imageIndex + 1} / {images.length}
          </span>
        )}
      </div>
    </div>
  );
};

// Crime-scene tape slanted across the top of the image, scrolling "OUT OF STOCK"
const CrimeTape = () => (
  <div
    aria-label="Out of stock"
    role="img"
    className="absolute -inset-x-16 top-[9%] z-[1] -rotate-[7deg] pointer-events-none bg-bandit-red text-white border-y-[3px] border-black shadow-[0_8px_24px_rgba(0,0,0,.45)] overflow-hidden whitespace-nowrap">
    <div className="inline-flex animate-[marquee_18s_linear_infinite] motion-reduce:animate-none" aria-hidden>
      {[0, 1].map(k => (
        <span key={k} className="flex">
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} className="font-calera text-xl md:text-2xl pt-1.5 pb-0.5 px-4 flex items-center gap-4">
              OUT OF STOCK <span className="text-base">✕</span>
            </span>
          ))}
        </span>
      ))}
    </div>
  </div>
);
