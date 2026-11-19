import { SkeletonImage } from "@/components/misc/SkeletonImage";
import Link from "next/link";
import { QuantityStepper } from "../misc/QuantityStepper";
import { closeCartForNavigation } from "../stores/cart";
import { formatCurrency } from "@/utils/price";
import { ProductVariant } from "@/types/product";
import { routes } from "@/utils/routes";
import { getProductVariantName, getProductVariantPrice, getSizeLabel, getSizeStock } from "@/utils/product";
import { PRODUCTS_OBJ } from "@/data/products";

interface CheckoutProductCardProps {
  variant: ProductVariant;
  quantity: number;
  size: string;
  updateCartItemBy: (variantId: string, quantity: number, size?: string) => void;
  removeCartItem: (variantId: string, size?: string) => void;
}

export const CheckoutProductCard = ({
  variant,
  quantity,
  size,
  updateCartItemBy,
  removeCartItem,
}: CheckoutProductCardProps) => {
  const name = getProductVariantName(variant);
  const price = getProductVariantPrice(variant);
  const stock = getSizeStock(variant, size);
  const url = routes.variant(variant);

  return (
    <div className="flex gap-3 py-4 border-b border-border last:border-b-0">
      <Link
        href={url}
        replace
        onClick={closeCartForNavigation}
        className="w-[72px] h-[72px] sm:w-20 sm:h-20 relative shrink-0">
        <SkeletonImage
          skeletonClassName="rounded-lg"
          fill
          sizes="80px"
          src={variant.images.mockup[0]}
          alt={name + " design image"}
          className="object-cover rounded-lg"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between gap-3 text-sm">
          <Link href={url} replace onClick={closeCartForNavigation} className="font-medium hover:underline">
            {name}
          </Link>
          <span className="shrink-0">{formatCurrency(price)}</span>
        </div>
        <p className="text-muted-foreground text-xs mt-0.5">
          {PRODUCTS_OBJ[variant.productId]?.name} · {getSizeLabel(size)}
        </p>
        {stock !== undefined && quantity > stock && (
          <p className="text-destructive text-xs font-medium mt-1">
            {stock === 0 ? "Out of stock, please remove it" : `Only ${stock} left, please reduce the quantity`}
          </p>
        )}
        <div className="flex items-center justify-between mt-2.5">
          <QuantityStepper
            quantity={quantity}
            max={stock}
            increment={() => updateCartItemBy(variant.id, 1, size)}
            decrement={() => updateCartItemBy(variant.id, -1, size)}
          />
          <button
            type="button"
            className="text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
            onClick={() => removeCartItem(variant.id, size)}>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};
