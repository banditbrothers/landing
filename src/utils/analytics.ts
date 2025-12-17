import posthog from "posthog-js";
import { trackMetaViewContent, trackMetaAddToCart } from "./metaPixel";

export const identifyUser = (
  identifier?: string,
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
  posthog.capture("variant_viewed", { product_id: productId, design_id: designId });

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
  posthog.capture("variant_add_to_cart", { product_id: productId, design_id: designId });

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
  // console.debug("posthog variant_share", { product_id: productId, design_id: designId });
  posthog.capture("variant_share", { product_id: productId, design_id: designId });
};
