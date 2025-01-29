"use client";

import { useEffect } from "react";
import { useState } from "react";
import { HeartIconOutline, HeartIconSolid } from "./icons";

export const FavoriteButton = ({ selected, toggle }: { selected: boolean; toggle: () => void }) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => setIsMounted(true), []);

  const UnselectedIcon = (
    <HeartIconOutline className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
  );

  let Icon = UnselectedIcon;
  if (isMounted && selected)
    Icon = <HeartIconSolid className="w-5 h-5 text-bandit-orange hover:text-bandit-orange/80 transition-colors" />;

  return (
    <button className="z-10 p-2 bg-background/80 rounded-full" onClick={toggle}>
      {Icon}
    </button>
  );
};
