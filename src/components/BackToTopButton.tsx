"use client";

import { ArrowUp } from "lucide-react";

export default function BackToTopButton() {
  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="relative z-10 grid place-items-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-black border-2 border-bandit-orange text-bandit-orange transition shadow-[0_0_0_4px_hsl(var(--background))] hover:scale-110 hover:border-white hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-bandit-orange focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none">
      <ArrowUp className="w-5 h-5 md:w-6 md:h-6" strokeWidth={2.4} />
    </button>
  );
}
