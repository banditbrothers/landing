import posthog from "posthog-js";

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

export const trackVariantView = ({ productId, designId }: { productId: string; designId: string }) => {
  console.debug("posthog variant_viewed", { product_id: productId, design_id: designId });
  posthog.capture("variant_viewed", { product_id: productId, design_id: designId });
};

export const trackVariantAddToCart = ({ productId, designId }: { productId: string; designId: string }) => {
  console.debug("posthog variant_add_to_cart", { product_id: productId, design_id: designId });
  posthog.capture("variant_add_to_cart", { product_id: productId, design_id: designId });
};

export const trackVariantShare = ({ productId, designId }: { productId: string; designId: string }) => {
  console.debug("posthog variant_share", { product_id: productId, design_id: designId });
  posthog.capture("variant_share", { product_id: productId, design_id: designId });
};
