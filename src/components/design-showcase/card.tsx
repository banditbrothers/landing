import Image from "next/image";
import { Design } from "@/data/designs";
import { FavoriteButton } from "../favoriteButton";
import { PatternBadge } from "../product/badges";
import { ArrowRightCircleIcon } from "../misc/icons";
import { useFavorites } from "@/contexts/FavoritesContext";

interface DesignCardProps {
  design: Design;
  onClick: () => void;
  selected: boolean;
  showRingAroundSelectedCard?: boolean;
  showFavoriteButton?: boolean;
  children: React.ReactNode;
}

export const DesignCard = ({
  design,
  onClick,
  selected,
  children,
  showRingAroundSelectedCard = false,
  showFavoriteButton = true,
}: DesignCardProps) => {
  const { isFavorite, toggleFav } = useFavorites();

  return (
    <div className="w-full h-full">
      <div
        className={`p-4 bg-card rounded-xl relative ${
          showRingAroundSelectedCard && selected ? "ring-2 ring-primary" : ""
        }`}>
        {showFavoriteButton && (
          <div className="absolute top-5 right-5 z-10">
            <FavoriteButton selected={isFavorite(design.id)} toggle={() => toggleFav(design.id)} />
          </div>
        )}
        <button onClick={onClick} className="w-full h-full">
          <div>
            <div className="flex flex-col items-center">
              <div className="relative w-full aspect-square">
                <Image fill src={design.image} alt={design.name} className="object-cover rounded-xl" />
              </div>
              {children}
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};

export const DesignNameAndPriceBanner = ({ design }: { design: Design }) => {
  return (
    <div className="flex flex-row w-full mt-4 px-1 justify-between items-start gap-6">
      <div className="flex flex-col justify-start items-start">
        <h3 className="text-xl font-semibold">{design.name}</h3>
        <span className="flex flex-row gap-2 items-center mt-2">
          <PatternBadge pattern={design.pattern} />
        </span>
      </div>
      <p className="text-sm text-muted-foreground">₹{design.price}</p>
    </div>
  );
};

export const DesignNameAndArrowBanner = ({ design }: { design: Design }) => {
  return (
    <div className="flex flex-row w-full mt-4 px-1 justify-between">
      <h3 className="text-xl font-semibold self-center">{design.name}</h3>
      <ArrowRightCircleIcon className="w-8 h-8 text-bandit-orange" />
    </div>
  );
};
