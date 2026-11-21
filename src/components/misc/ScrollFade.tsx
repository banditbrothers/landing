"use client";

import { useEffect, useRef } from "react";

/** Horizontal scroll row (scrollbar hidden) that fades whichever edge has more content, so it reads as scrollable.
 *  The fade itself is `.scroll-fade` in globals.css; this only flags which edges need it. */
export const ScrollFade = ({ className = "", children }: { className?: string; children: React.ReactNode }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      el.toggleAttribute("data-fade-start", el.scrollLeft > 1);
      el.toggleAttribute("data-fade-end", el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    // Children too: a label change (e.g. "Size: Small, Large") changes the content width, not the row's
    const observer = new ResizeObserver(update);
    observer.observe(el);
    for (const child of el.children) observer.observe(child);
    return () => {
      el.removeEventListener("scroll", update);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      ref={ref}
      className={`scroll-fade overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${className}`}>
      {children}
    </div>
  );
};
