"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

export function StarRatingInput({ value, onChange, className }: StarRatingProps) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={star === value}
          aria-label={`${star} star${star > 1 ? "s" : ""}`}
          onClick={() => onChange(star)}
          className="transition-transform hover:scale-110">
          <Star
            strokeWidth={1.6}
            className={cn(
              "w-6 h-6 transition-colors",
              star <= value ? "fill-bandit-orange text-bandit-orange" : "text-zinc-600",
              className
            )}
          />
        </button>
      ))}
    </div>
  );
}

export function StarRating({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn("flex gap-0.5", className)}>
      {Array.from({ length: value }).map((_, i) => (
        <Star key={i} className="w-3 h-3 fill-bandit-orange text-bandit-orange" />
      ))}
      {Array.from({ length: 5 - value }).map((_, i) => (
        <Star key={i} className="w-3 h-3 stroke-muted-foreground" />
      ))}
    </div>
  );
}
