"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
}

export function StarRatingInput({ value, onChange }: StarRatingProps) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <Star
          key={star}
          className={cn(
            "w-6 h-6 cursor-pointer transition-colors",
            star <= value ? "fill-bandit-orange text-bandit-orange" : "text-gray-300"
          )}
          onClick={() => onChange(star)}
        />
      ))}
    </div>
  );
}

export function StarRating({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: value }).map((_, i) => (
        <Star key={i} className="w-3 h-3 fill-bandit-orange text-bandit-orange" />
      ))}
      {Array.from({ length: 5 - value }).map((_, i) => (
        <Star key={i} className="w-3 h-3 stroke-muted-foreground" />
      ))}
    </div>
  );
}
