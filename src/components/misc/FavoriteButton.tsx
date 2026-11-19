"use client";

import { HeartIcon } from "lucide-react";
import { useFavorites } from "@/components/stores/favorites";
import { cn } from "@/lib/utils";

export const FavoriteButton = ({
  variantId,
  className,
  iconClassName,
}: {
  variantId: string;
  className?: string;
  iconClassName?: string;
}) => {
  const { isFavorite, toggleFav } = useFavorites();
  const on = isFavorite(variantId);
  return (
    <button
      type="button"
      aria-label={on ? "Remove from favourites" : "Add to favourites"}
      onClick={e => {
        e.preventDefault(); // cards wrap this in a Link
        toggleFav(variantId);
      }}
      className={className}>
      <HeartIcon
        suppressHydrationWarning // favourites load from localStorage after hydration
        className={cn(iconClassName, on ? "fill-bandit-orange stroke-bandit-orange" : "fill-none stroke-current")}
      />
    </button>
  );
};
