"use client";

import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { FavoriteButton } from "../misc/FavoriteButton";
import { CategoryBadge } from "../badges/DesignBadges";
import { ShoppingCartIcon } from "../../Icons/icons";
import { useFavorites } from "@/components/stores/favorites";
import useIsMobile from "@/hooks/useIsMobile";
import Link from "next/link";
import { Button } from "../ui/button";
import { useCart } from "../stores/cart";
import { formatCurrency } from "@/utils/price";
import { ProductVariant } from "@/types/product";
import { DESIGNS_OBJ, getColorVariantIds } from "@/data/products";
import { getProductVariantUrl } from "@/utils/share";
import {
  exceedsStock,
  getFirstInStockSize,
  getProductVariantName,
  getProductVariantPrice,
  isVariantOutOfStock,
} from "@/utils/product";
import { Badge } from "../ui/badge";
import { useRouter } from "next/navigation";

interface ProductVariantCardProps {
  productVariant: ProductVariant;
  openInNewTab?: boolean;
  showFavoriteButton?: boolean;
  showMoreColorsBadge?: boolean;
  children: React.ReactNode;
  optimizeImageQualityOnMobile?: boolean;
}

export const ProductVariantCard = ({
  productVariant,
  children,
  optimizeImageQualityOnMobile = true,
  showFavoriteButton = true,
  showMoreColorsBadge = false,
  openInNewTab = false,
}: ProductVariantCardProps) => {
  const { isFavorite, toggleFav } = useFavorites();
  const isMobile = useIsMobile();
  const router = useRouter();

  const name = getProductVariantName(productVariant);

  const productLink = getProductVariantUrl(productVariant);

  const isOutOfStock = isVariantOutOfStock(productVariant);
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
          {showMoreColorsBadge && hasColorVariants && (
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
          href={productLink}
          target={openInNewTab ? "_blank" : undefined}
          onMouseEnter={() => router.prefetch(productLink)}
          className="w-full h-full">
          <div>
            <div className="flex flex-col items-center">
              <div className="relative w-full aspect-square">
                <Skeleton className="absolute inset-0 rounded-xl" />
                <Image
                  fill
                  src={productVariant.images.mockup[0]}
                  alt={name + " image"}
                  className={`object-cover rounded-xl ${isOutOfStock ? "grayscale-[.6] brightness-75" : ""}`}
                  quality={optimizeImageQualityOnMobile && isMobile ? 40 : 75}
                />
                {isOutOfStock && <SoldOutStamp />}
              </div>
              {children}
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
};

// Grainy noise mask so the stamp looks inked rather than printed
const STAMP_MASK = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='80'><filter id='n'><feTurbulence baseFrequency='.8' numOctaves='2'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 -2.4 1.7'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>")`;

const SoldOutStamp = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    <span
      className="-rotate-[14deg] border-4 border-double border-red-600 text-red-600 bg-black/55 rounded-md px-4 py-1.5 text-2xl md:text-3xl font-bold uppercase tracking-[.18em]"
      style={{ WebkitMaskImage: STAMP_MASK, maskImage: STAMP_MASK }}>
      Sold Out
    </span>
  </div>
);

export const VariantNameAndPriceBanner = ({ productVariant }: { productVariant: ProductVariant }) => {
  const { updateCartItem, cart } = useCart();

  // Quick-add uses the first in-stock size; undefined when every size is sold out
  const defaultSize = getFirstInStockSize(productVariant);

  function handleAddToCart(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (!defaultSize) return;
    updateCartItem(productVariant.id, 1, defaultSize);
  }

  const variantDesign = DESIGNS_OBJ[productVariant.designId];
  const variantPrice = getProductVariantPrice(productVariant);
  const variantName = getProductVariantName(productVariant);

  const cartItem = cart.find(item => item.variantId === productVariant.id && item.size === defaultSize);
  return (
    <div className="flex flex-col w-full mt-4 px-1 justify-between items-start gap-6">
      <div className="flex flex-col justify-between items-center w-full">
        <div className="flex flex-row justify-between items-center gap-2 w-full">
          <h3 className="text-xl font-semibold">{variantName}</h3>
          <p className="text-sm text-muted-foreground shrink-0">{formatCurrency(variantPrice)}</p>
        </div>
        <div className="flex flex-row justify-between items-center w-full">
          <span>
            <CategoryBadge category={variantDesign.category} />
          </span>
          {defaultSize && (
            <Button
              type="button"
              variant="outline"
              className="w-fit"
              disabled={exceedsStock(productVariant, defaultSize, (cartItem?.quantity ?? 0) + 1)}
              onClick={handleAddToCart}>
              <ShoppingCartIcon className="w-4 h-4" />
              {cartItem && cartItem.quantity}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
