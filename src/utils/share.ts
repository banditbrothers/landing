import { routes } from "./routes";
import { ProductVariant } from "@/types/product";
import { trackVariantShare } from "./analytics";
import { getProductVariantName } from "./product";

const shareMessage = (productVariant: ProductVariant) => {
  return `Hey! Check out this ${getProductVariantName(productVariant, { includeProductName: true })} by Bandit Brothers\n${window.location.origin}${routes.variant(productVariant)}`;
};

export const shareVariant = async (productVariant: ProductVariant) => {
  if (!productVariant) throw new Error("Product variant is required to share");

  try {
    trackVariantShare({ productId: productVariant.productId, designId: productVariant.designId });
    await navigator.share({
      title: `Share ${getProductVariantName(productVariant, { includeProductName: true })}`,
      text: shareMessage(productVariant),
    });
  } catch (e) {
    console.error(e);
  }
};
