"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
}

export function StarRating({ value, onChange }: StarRatingProps) {
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
