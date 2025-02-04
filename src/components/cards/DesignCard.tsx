import Image from "next/image";
import { Design } from "@/data/designs";
import { FavoriteButton } from "../misc/FavoriteButton";
import { CategoryBadge } from "../badges/DesignBadges";
import { ArrowRightCircleIcon, ShoppingCartIcon } from "../misc/icons";
import { useFavorites } from "@/components/stores/favorites";
import useIsMobile from "@/hooks/useIsMobile";
import Link from "next/link";
import { Button } from "../ui/button";
import { useCart } from "../stores/cart";
import { formatCurrency } from "@/utils/price";

interface DesignCardProps {
  design: Design;
  openInNewTab?: boolean;
  showFavoriteButton?: boolean;
  children: React.ReactNode;
  optimizeImageQualityOnMobile?: boolean;
}

export const DesignCard = ({
  design,
  children,
  optimizeImageQualityOnMobile = true,
  showFavoriteButton = true,
  openInNewTab = false,
}: DesignCardProps) => {
  const { isFavorite, toggleFav } = useFavorites();
  const isMobile = useIsMobile();

  return (
    <div className="w-full h-full">
      <div className={`p-4 bg-card rounded-xl relative`}>
        {showFavoriteButton && (
          <div className="absolute top-5 right-5 z-10">
            <FavoriteButton selected={isFavorite(design.id)} toggle={() => toggleFav(design.id)} />
          </div>
        )}
        <Link href={`/designs/${design.id}`} target={openInNewTab ? "_blank" : undefined} className="w-full h-full">
          <div>
            <div className="flex flex-col items-center">
              <div className="relative w-full aspect-square">
                <Image
                  fill
                  src={design.image}
                  alt={design.name + " design image"}
                  className="object-cover rounded-xl"
                  quality={optimizeImageQualityOnMobile && isMobile ? 40 : 75}
                />
              </div>
              {children}
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

export const DesignNameAndPriceBanner = ({ design }: { design: Design }) => {
  const { updateCartItem, cart } = useCart();

  function handleAddToCart(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    updateCartItem(design.id, 1);
  }

  const cartItem = cart.find(item => item.designId === design.id);
  return (
    <div className="flex flex-col w-full mt-4 px-1 justify-between items-start gap-6">
      <div className="flex flex-col justify-between items-center w-full">
        <div className="flex flex-row justify-between items-start w-full ">
          <h3 className="text-xl font-semibold">{design.name}</h3>
          <p className="text-sm text-muted-foreground">{formatCurrency(design.price)}</p>
        </div>
        <div className="flex flex-row justify-between items-center w-full">
          <span>
            <CategoryBadge category={design.category} />
          </span>
          <Button type="button" variant="outline" className="w-fit" onClick={handleAddToCart}>
            <ShoppingCartIcon className="w-4 h-4" />
            {cartItem && cartItem.quantity}
          </Button>
        </div>
      </div>
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
