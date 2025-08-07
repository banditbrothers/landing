import Image from "next/image";
import { FavoriteButton } from "../misc/FavoriteButton";
import { CategoryBadge } from "../badges/DesignBadges";
import { ArrowRightCircleIcon, ShoppingCartIcon } from "../../Icons/icons";
import { useFavorites } from "@/components/stores/favorites";
import useIsMobile from "@/hooks/useIsMobile";
import Link from "next/link";
import { Button } from "../ui/button";
import { useCart } from "../stores/cart";
import { formatCurrency } from "@/utils/price";
import { ProductVariant } from "@/types/product";
import { DESIGNS_OBJ, getColorVariantIds } from "@/data/products";
import { getProductVariantUrl } from "@/utils/share";
import { getProductVariantName, getProductVariantPrice } from "@/utils/product";
import { Badge } from "../ui/badge";

interface ProductVariantCardProps {
  productVariant: ProductVariant;
  openInNewTab?: boolean;
  showFavoriteButton?: boolean;
  children: React.ReactNode;
  optimizeImageQualityOnMobile?: boolean;
  showMoreColorsBadge?: boolean;
}

export const ProductVariantCard = ({
  productVariant,
  children,
  optimizeImageQualityOnMobile = true,
  showMoreColorsBadge = true,
  showFavoriteButton = true,
  openInNewTab = false,
}: ProductVariantCardProps) => {
  const { isFavorite, toggleFav } = useFavorites();
  const isMobile = useIsMobile();

  const name = getProductVariantName(productVariant);

  const hasColorVariants = getColorVariantIds(productVariant.designId).length > 1;

  return (
    <div className="w-full h-full">
      <div className={`p-4 bg-card rounded-xl relative`}>
        {showFavoriteButton && (
          <div className="absolute top-5 right-5 z-10">
            <FavoriteButton selected={isFavorite(productVariant.id)} toggle={() => toggleFav(productVariant.id)} />
          </div>
        )}
        <div className="absolute top-5 left-5 z-10 flex flex-col gap-2">
          {hasColorVariants && showMoreColorsBadge && (
            <Badge variant="default" className="bg-bandit-orange text-white w-fit hover:bg-bandit-orange">
              More Colors Available
            </Badge>
          )}
          {/* {productVariant.isBestSeller && (
            <Badge variant="default" className="bg-bandit-orange text-white w-fit">
              Best Seller
            </Badge>
          )} */}
        </div>
        <Link
          href={getProductVariantUrl(productVariant)}
          target={openInNewTab ? "_blank" : undefined}
          className="w-full h-full">
          <div>
            <div className="flex flex-col items-center">
              <div className="relative w-full aspect-square">
                <Image
                  fill
                  src={productVariant.images.mockup[0]}
                  alt={name + " image"}
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

export const VariantNameAndPriceBanner = ({ productVariant }: { productVariant: ProductVariant }) => {
  const { updateCartItem, cart } = useCart();

  function handleAddToCart(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    updateCartItem(productVariant.id, 1);
  }

  const variantDesign = DESIGNS_OBJ[productVariant.designId];
  const variantPrice = getProductVariantPrice(productVariant);
  const variantName = getProductVariantName(productVariant);

  const cartItem = cart.find(item => item.variantId === productVariant.id);
  return (
    <div className="flex flex-col w-full mt-4 px-1 justify-between items-start gap-6">
      <div className="flex flex-col justify-between items-center w-full">
        <div className="flex flex-row justify-between items-start w-full ">
          <h3 className="text-xl font-semibold">{variantName}</h3>
          <p className="text-sm text-muted-foreground">{formatCurrency(variantPrice)}</p>
        </div>
        <div className="flex flex-row justify-between items-center w-full">
          <span>
            <CategoryBadge category={variantDesign.category} />
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

export const VariantNameAndArrowBanner = ({ productVariant }: { productVariant: ProductVariant }) => {
  return (
    <div className="flex flex-row w-full mt-4 px-1 justify-between">
      <h3 className="text-xl font-semibold self-center">{getProductVariantName(productVariant)}</h3>
      <ArrowRightCircleIcon className="w-8 h-8 text-bandit-orange" />
    </div>
  );
};
