"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SkeletonImage } from "@/components/misc/SkeletonImage";
import { cn } from "@/lib/utils";

/** Image link tile with a title over a dark fade (home page "Shop by gear" and final CTA) */
export const GearTile = ({
  href,
  image,
  title,
  titleClassName,
  sizes,
  kicker,
  children,
}: {
  href: string;
  image?: string;
  title: string;
  titleClassName: string;
  /** next/image `sizes` */
  sizes: string;
  kicker?: string;
  /** Line under the title */
  children?: React.ReactNode;
}) => (
  <Link href={href} className="group relative isolate block h-full rounded-2xl overflow-hidden bg-card">
    <SkeletonImage
      skeletonClassName="-z-10"
      fill
      src={image}
      alt={title}
      sizes={sizes}
      className="object-cover -z-10 transition-transform duration-700 ease-out group-hover:scale-105"
    />
    <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent from-30% to-black/85" />
    {kicker && <span className="absolute top-4 left-5 text-xs tracking-[0.18em] text-white/80">{kicker}</span>}
    <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-3">
      <div>
        <h3 className={cn("font-calera uppercase leading-[0.9] text-white", titleClassName)}>{title}</h3>
        {children && <p className="text-sm text-white/80 mt-2">{children}</p>}
      </div>
      <span className="hidden md:grid shrink-0 place-items-center w-12 h-12 rounded-full bg-white text-black transition duration-300 group-hover:bg-bandit-orange group-hover:-rotate-45">
        <ArrowRight className="w-5 h-5" />
      </span>
    </div>
  </Link>
);
