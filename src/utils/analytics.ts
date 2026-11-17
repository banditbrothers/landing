import posthog from "posthog-js";
import { trackMetaViewContent, trackMetaAddToCart } from "./metaPixel";
import { ProductVariant } from "@/types/product";
import { getProductVariantPrice } from "./product";

/** Generic PostHog event; a no-op outside production (PostHog is only initialised there) */
export const track = (event: string, properties?: Record<string, unknown>) => posthog.capture(event, properties);

/** Line items for checkout/order events */
export const getCartAnalyticsItems = (
  cart: { variantId: string; size: string; quantity: number }[],
  variants: ProductVariant[]
) =>
  cart.map(({ variantId, size, quantity }) => {
    const variant = variants.find(v => v.id === variantId);
    return {
      variant_id: variantId,
      product_id: variant?.productId,
      design_id: variant?.designId,
      size,
      quantity,
      price: variant ? getProductVariantPrice(variant) : undefined,
    };
  });

export const identifyUser = (
  identifier: string,
  user?: { name?: string; phone?: string; email?: string },
  setOnce?: Record<string, string | number>
) => {
  posthog.identify(identifier, {
    name: user?.name,
    phone: user?.phone,
    email: user?.email,
    $set_once: setOnce,
  });
};

export const trackVariantView = ({
  productId,
  designId,
  variantId,
  variantName,
  price,
}: {
  productId: string;
  designId: string;
  variantId: string;
  variantName: string;
  price: number;
}) => {
  // PostHog tracking
  posthog.capture("variant_viewed", { product_id: productId, design_id: designId, variant_id: variantId, variant_name: variantName, price, currency: "INR" });

  // Meta Pixel tracking
  trackMetaViewContent({
    contentId: variantId,
    productId: productId,
    designId: designId,
    contentName: variantName,
    contentType: "product",
    value: price,
  });
};

export const trackVariantAddToCart = ({
  productId,
  designId,
  variantId,
  variantName,
  price,
  quantity,
}: {
  productId: string;
  designId: string;
  variantId: string;
  variantName: string;
  price: number;
  quantity: number;
}) => {
  // PostHog tracking
  posthog.capture("variant_add_to_cart", {
    product_id: productId,
    design_id: designId,
    variant_id: variantId,
    variant_name: variantName,
    price,
    quantity,
    value: price * quantity,
    currency: "INR",
  });

  // Meta Pixel tracking
  trackMetaAddToCart({
    contentId: variantId,
    productId: productId,
    designId: designId,
    contentName: variantName,
    value: price * quantity,
    quantity,
  });
};

export const trackVariantShare = ({ productId, designId }: { productId: string; designId: string }) => {
  posthog.capture("variant_share", { product_id: productId, design_id: designId });
};
