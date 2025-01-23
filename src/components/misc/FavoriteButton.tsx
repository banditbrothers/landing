import { HeartIconOutline } from "./Icons";

import { HeartIconSolid } from "./Icons";

export const FavoriteButton = ({ selected, toggle }: { selected: boolean; toggle: () => void }) => {
  return (
    <button className="z-10 p-2 bg-background/80 rounded-full" onClick={toggle}>
      {selected ? (
        <HeartIconSolid className="w-5 h-5 text-bandit-orange hover:text-bandit-orange/80 transition-colors" />
      ) : (
        <HeartIconOutline className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
      )}
    </button>
  );
};
