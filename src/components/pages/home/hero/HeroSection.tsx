"use client";

import Link from "next/link";
import { m } from "motion/react";
import { ArrowDown, ArrowRight } from "lucide-react";
import { scrollTo } from "@/utils/misc";
import { MIN_ORDER_AMOUNT_FOR_FREE_SHIPPING } from "@/constants/shipping";
import { formatCurrency } from "@/utils/price";

const LINES = ["Wear", "Your", "Mischief."];
const ease = [0.2, 0.7, 0.2, 1] as const;

export const HeroSection = () => {
  return (
    <section id="hero" className="relative h-[100svh] min-h-[600px] overflow-hidden">
      <m.video
        autoPlay
        muted
        loop
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
        initial={{ scale: 1.15 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.4, ease }}>
        <source src="/hero-bg.mp4" type="video/mp4" />
      </m.video>
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent" />

      <div className="relative z-10 h-full max-w-screen-2xl mx-auto px-4 md:px-8 flex flex-col justify-end pb-24 md:pb-20">
        <m.p
          className="text-xs md:text-sm tracking-[0.25em] uppercase text-white/80 mb-4 flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease }}>
          <span className="h-px w-10 bg-bandit-orange" />
          <span>
            Bandanas · Balaclavas · <span className="whitespace-nowrap">Made in India</span>
          </span>
        </m.p>

        <h1 className="font-calera uppercase text-white leading-[0.85] text-[clamp(4.5rem,17vw,13rem)]">
          {LINES.map((line, i) => (
            <span key={line} className="block overflow-hidden pb-[0.04em]">
              <m.span
                className={`block ${i === 2 ? "text-bandit-orange" : ""}`}
                initial={{ y: "105%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.9, delay: 0.4 + i * 0.12, ease }}>
                {line}
              </m.span>
            </span>
          ))}
        </h1>

        <m.div
          className="mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.95, ease }}>
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
              className="inline-flex items-center h-12 md:h-14 px-6 md:px-7 rounded-full border border-white/30 text-white backdrop-blur-sm transition hover:border-white hover:bg-white/10">
              Best sellers
            </button>
          </div>
        </m.div>
      </div>

      <m.div
        className="absolute bottom-0 inset-x-0 z-10 border-t border-white/10 bg-black/30 backdrop-blur-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1.3 }}>
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
      </m.div>
    </section>
  );
};
