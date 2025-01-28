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

export const trackDesignView = (designId: string) => {
  console.debug("posthog design_viewed", { design_id: designId });
  posthog.capture("design_viewed", { design_id: designId });
};

export const trackDesignAddToCart = (designId: string) => {
  console.debug("posthog design_add_to_cart", { design_id: designId });
  posthog.capture("design_add_to_cart", { design_id: designId });
};

export const trackDesignShare = (designId: string) => {
  console.debug("posthog design_share", { design_id: designId });
  posthog.capture("design_share", { design_id: designId });
};
