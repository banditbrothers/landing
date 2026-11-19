"use client";

import { SkeletonImage } from "@/components/misc/SkeletonImage";
import Link from "next/link";
import { m } from "motion/react";
import { ArrowRight } from "lucide-react";
import { Reveal, SectionHead } from "@/components/misc/Reveal";

const MUGSHOTS = [1, 2, 3, 4, 5].map(n => `/how-to-wear/mugshot-${n}.webp`);
const TILTS = [-7, 4, -3, 6, -5];

export const WAYS = [
  "Neck gaiter",
  "Face mask",
  "Headband",
  "Helmet liner",
  "Pirate wrap",
  "Hood",
  "Balaclava",
  "Wristband",
  "Ponytail tie",
  "Beanie",
  "Sweatband",
  "Cap liner",
];

export const HowToWearSection = () => {
  return (
    <section id="how-to-wear" className="scroll-mt-20 overflow-hidden">
      <div className="max-w-screen-2xl mx-auto px-4 md:px-8">
        <SectionHead
          kicker="The lineup"
          title={
            <>
              Caught <span className="text-bandit-orange whitespace-nowrap">red-handed</span>
            </>
          }>
          <p className="text-muted-foreground max-w-sm md:text-right">
            Our usual suspects, booked for wearing the same bandana way too many ways.
          </p>
        </SectionHead>
      </div>

      {/* Mugshot wall: fanned + tilted, straighten on hover. Scrolls sideways on mobile. */}
      <div className="flex md:justify-center gap-4 md:gap-0 overflow-x-auto overflow-y-hidden md:overflow-visible snap-x snap-mandatory px-4 md:px-8 py-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {MUGSHOTS.map((src, i) => (
          <m.div
            key={src}
            className="snap-center shrink-0 w-[62vw] sm:w-[40vw] md:w-[22%] md:-mx-3 first:ml-0 relative hover:!z-20"
            style={{ zIndex: i % 2 ? 2 : 1 }}
            initial={{ opacity: 0, y: 60, rotate: 0 }}
            whileInView={{ opacity: 1, y: 0, rotate: TILTS[i] }}
            whileHover={{ rotate: 0, y: -14, scale: 1.04 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ type: "spring", stiffness: 120, damping: 16, delay: i * 0.07 }}>
            <div className="bg-white p-2 pb-8 rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
              <div className="relative aspect-square">
                <SkeletonImage
                  src={src}
                  alt="Bandit Brothers lineup"
                  fill
                  sizes="(min-width: 768px) 22vw, 62vw"
                  className="object-cover"
                />
              </div>
              <p className="font-calera text-black text-lg text-center mt-2 uppercase">
                Suspect #{String(i + 1).padStart(3, "0")}
              </p>
            </div>
          </m.div>
        ))}
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 md:px-8 mt-12 md:mt-16 grid md:grid-cols-[1fr_1.2fr] gap-8 md:gap-14 items-center">
        <Reveal>
          <div className="relative aspect-square rounded-3xl overflow-hidden">
            <SkeletonImage
              src="/how-to-wear.webp"
              alt="How to wear your bandana"
              fill
              sizes="(min-width: 768px) 45vw, 100vw"
              className="object-cover"
            />
          </div>
        </Reveal>
        <div>
          <Reveal>
            <h3 className="font-calera uppercase leading-[0.9] text-[clamp(2.5rem,5vw,4.5rem)]">
              One bandana.
              <br />
              <span className="text-bandit-orange">Endless alibis.</span>
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed mt-5 max-w-lg">
              Stretchy tube, zero seams where it matters. Pull it, twist it, fold it: it&apos;s whatever the day needs.
            </p>
          </Reveal>
          <ol className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-8">
            {WAYS.map((way, i) => (
              <Reveal key={way} delay={i * 0.04} y={14}>
                <li className="group flex items-center gap-3 rounded-xl border border-border px-3 py-3 transition hover:border-bandit-orange hover:bg-bandit-orange/10">
                  <span className="font-calera text-2xl leading-none text-transparent transition group-hover:text-bandit-orange [-webkit-text-stroke:1px_theme(colors.bandit-orange)]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm">{way}</span>
                </li>
              </Reveal>
            ))}
          </ol>
          <Reveal delay={0.2}>
            <Link
              href="/shop/bandana"
              className="group mt-8 inline-flex items-center gap-2 h-12 px-6 rounded-full bg-foreground text-background font-semibold transition hover:bg-bandit-orange hover:text-black">
              Get a bandana
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
};
