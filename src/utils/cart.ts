import { CartItem } from "@/types/order";
import { ProductVariant } from "@/types/product";
import { getProductVariantPrice } from "./product";

export const getCartSubtotal = (cart: CartItem[], variants: ProductVariant[]) => {
    if (cart.length === 0) return 0;
  
    return cart.reduce((total, item) => {
      const variant = variants.find(v => v.id === item.variantId)!;
      return total + getProductVariantPrice(variant) * item.quantity;
    }, 0);
  };