"use client";

import { ArrowUp } from "lucide-react";

export default function BackToTopButton() {
  return (
    <button
      type="button"
      aria-label="Back to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="grid place-items-center w-8 h-8 rounded-full border border-border text-muted-foreground transition hover:border-bandit-orange hover:text-bandit-orange">
      <ArrowUp className="w-4 h-4" />
    </button>
  );
}
