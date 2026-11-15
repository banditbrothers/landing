"use client";

import { m } from "motion/react";

// Fades + lifts children in once when they scroll into view
export const Reveal = ({
  children,
  delay = 0,
  y = 28,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) => (
  <m.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.7, delay, ease: [0.2, 0.7, 0.2, 1] }}>
    {children}
  </m.div>
);

// Shared section header: kicker + big Calera title + optional right slot
export const SectionHead = ({
  kicker,
  title,
  children,
}: {
  kicker: string;
  title: React.ReactNode;
  children?: React.ReactNode;
}) => (
  <Reveal className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 md:mb-10">
    <div>
      <p className="text-xs tracking-[0.2em] uppercase text-muted-foreground mb-3">{kicker}</p>
      <h2 className="font-calera uppercase leading-[0.9] text-[clamp(2.75rem,7vw,5.5rem)]">{title}</h2>
    </div>
    {children}
  </Reveal>
);
