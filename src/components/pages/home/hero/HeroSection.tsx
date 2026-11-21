"use client";

import Link from "next/link";
import { ArrowDown, ArrowRight } from "lucide-react";
import { scrollTo } from "@/utils/misc";
import { MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING } from "@/constants/shipping";
import { formatCurrency } from "@/utils/price";

const LINES = ["Wear", "Your", "Mischief."];
// CSS rather than Motion so the sequence starts on first paint, in step with the navbar, instead of after hydration.
// fill-mode-both keeps each piece hidden through its delay.
const ENTER = "animate-in fill-mode-both [animation-timing-function:cubic-bezier(0.2,0.7,0.2,1)] motion-reduce:animate-none";

export const HeroSection = () => {
  return (
    <section id="hero" className="relative h-[100svh] min-h-[600px] overflow-hidden">
      {/* Poster is the video's first frame, so the hero paints before the video decodes. */}
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster="/hero-poster.webp"
        className="absolute inset-0 w-full h-full object-cover">
        <source src="/hero-bg.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

      <div className="relative z-10 h-full max-w-screen-2xl mx-auto px-4 md:px-8 flex flex-col justify-end pb-24 md:pb-20">
        <p
          className={`${ENTER} fade-in slide-in-from-left-5 duration-500 delay-150 text-xs md:text-sm tracking-[0.25em] uppercase text-white/80 mb-4 flex items-center gap-3`}>
          <span className="h-px w-10 bg-bandit-orange" />
          <span>
            Bandanas · Balaclavas · <span className="whitespace-nowrap">Made in India</span>
          </span>
        </p>

        <h1 className="font-calera uppercase text-white leading-[0.85] text-[15vw] sm:text-[clamp(4.5rem,17vw,13rem)]">
          {LINES.map((line, i) => (
            <span key={line} className="block overflow-hidden pb-[0.04em]">
              <span
                className={`${ENTER} slide-in-from-bottom-[105%] duration-700 block ${i === 2 ? "text-bandit-orange" : ""}`}
                style={{ animationDelay: `${200 + i * 80}ms` }}>
                {line}
              </span>
            </span>
          ))}
        </h1>

        <div
          className={`${ENTER} fade-in slide-in-from-bottom-5 duration-500 delay-500 mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6`}>
          <p className="text-base md:text-lg text-white/80 max-w-md leading-relaxed">
            Quick-Dri headwear in loud prints, built for long rides, hot days and bad ideas.
          </p>
          <div className="flex gap-3">
            <Link
              href="/shop"
              className="group inline-flex items-center gap-2 h-12 md:h-14 px-6 md:px-7 rounded-full bg-bandit-orange text-black font-semibold transition hover:brightness-110 hover:-translate-y-0.5">
              Shop now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <button
              onClick={() => scrollTo("library-bestsellers")}
              className="inline-flex items-center h-12 md:h-14 px-6 md:px-7 rounded-full border border-white/30 bg-black/20 text-white transition hover:border-white hover:bg-white/10">
              Best sellers
            </button>
          </div>
        </div>
      </div>

      <div
        className={`${ENTER} fade-in duration-500 delay-500 absolute bottom-0 inset-x-0 z-10 border-t border-white/10 bg-black/60`}>
        <div className="max-w-screen-2xl mx-auto px-4 md:px-8 h-12 flex items-center justify-between text-[11px] md:text-xs tracking-[0.18em] uppercase text-white/70">
          <span>
            {MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING
              ? `Free shipping ${formatCurrency(MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING)}+`
              : "Ships across India"}
          </span>
          <span className="hidden md:inline">4-way Quick-Dri fabric</span>
          <span className="hidden sm:inline">Prints that never fade</span>
          <button
            onClick={() => scrollTo("gear")}
            className="flex items-center gap-2 hover:text-white"
            aria-label="Scroll down">
            Scroll <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
          </button>
        </div>
      </div>
    </section>
  );
};
