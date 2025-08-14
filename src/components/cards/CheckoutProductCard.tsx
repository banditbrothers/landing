import { XMarkIcon } from "../../Icons/icons";
import { Button } from "../ui/button";
import Image from "next/image";
import Link from "next/link";
import { QuantityStepper } from "../misc/QuantityStepper";
import { useCart } from "../stores/cart";
import { formatCurrency } from "@/utils/price";
import { ProductVariant } from "@/types/product";
import { getProductVariantUrl } from "@/utils/share";
import { getProductVariantName, getProductVariantPrice, getSizeLabel } from "@/utils/product";

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
  const closeCart = useCart(s => s.closeCart);

  const name = getProductVariantName(variant);
  const price = getProductVariantPrice(variant);

  return (
    <div key={variant.id} className="flex gap-4 p-4 bg-card rounded-lg relative border border-border">
      <Button
        variant="ghost"
        size="icon"
        type="button"
        className="absolute top-2 right-2 h-6 w-6"
        onClick={() => removeCartItem(variant.id, size)}>
        <XMarkIcon className="w-4 h-4" />
      </Button>
      <div className="w-20 h-20 sm:w-24 sm:h-24 relative">
        <Link href={getProductVariantUrl(variant)} onClick={closeCart}>
          <Image
            fill
            src={variant.images.mockup[0]}
            alt={name + " design image"}
            className="object-cover rounded-md w-full h-full"
          />
        </Link>
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-sm sm:text-base pr-3">{name}</h3>
        <p className="text-muted-foreground text-xs">Size: {getSizeLabel(size)}</p>
        <p className="text-muted-foreground text-sm">{formatCurrency(price)}</p>
        <div className="flex items-center gap-2 mt-2 justify-end">
          <QuantityStepper
            quantity={quantity}
            increment={() => updateCartItemBy(variant.id, 1, size)}
            decrement={() => updateCartItemBy(variant.id, -1, size)}
          />
        </div>
      </div>
    </div>
  );
};
