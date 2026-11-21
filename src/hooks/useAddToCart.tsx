"use client";

import Image from "next/image";
import { toast } from "sonner";
import { openCart, useCart } from "@/components/stores/cart";
import { useVariants } from "@/hooks/useVariants";
import { ProductVariant } from "@/types/product";
import { formatCurrency } from "@/utils/price";
import { getFreeShippingProgress } from "@/utils/cart";
import { trackVariantAddToCart } from "@/utils/analytics";
import { getProductVariantName, getProductVariantPrice } from "@/utils/product";

/** Adds to cart and toasts the free-shipping progress; `openCart` opens the bag instead of offering a "View bag" link */
export const useAddToCart = () => {
  const { cart, coupon, updateCartItem } = useCart();
  const { data: variants } = useVariants();

  return (variant: ProductVariant, size: string, quantity = 1, options: { openCart?: boolean } = {}) => {
    const price = getProductVariantPrice(variant);
    const name = getProductVariantName(variant);
    trackVariantAddToCart({
      productId: variant.productId,
      designId: variant.designId,
      variantId: variant.id,
      variantName: name,
      price,
      quantity,
    });
    updateCartItem(variant.id, quantity, size);

    const freeShipping = getFreeShippingProgress(cart, variants, coupon, price * quantity);
    const thumb = variant.images.mockup[0];
    toast.success(`${name} added`, {
      icon: thumb ? <Image src={thumb} alt="" width={30} height={30} className="size-full object-cover" /> : undefined,
      description:
        freeShipping &&
        (freeShipping.unlocked
          ? "Free shipping unlocked"
          : `${formatCurrency(freeShipping.left)} away from free shipping`),
      action: options.openCart ? undefined : { label: "View bag", onClick: openCart },
    });
    if (options.openCart) openCart();
  };
};
