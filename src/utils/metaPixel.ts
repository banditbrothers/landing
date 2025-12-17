"use client";

import ReactPixel from "react-facebook-pixel";

// Track product view
export const trackMetaViewContent = (params: {
  contentId: string;
  productId: string;
  designId: string;
  contentName: string;
  contentType: string;
  value: number;
  currency?: string;
}) => {
  ReactPixel.track("ViewContent", {
    content_ids: [params.contentId],
    content_name: params.contentName,
    product_id: params.productId,
    design_id: params.designId,
    content_type: params.contentType,
    value: params.value,
    currency: params.currency || "INR",
  });
};

// Track add to cart
export const trackMetaAddToCart = (params: {
  contentId: string;
  productId: string;
  designId: string;
  contentName: string;
  value: number;
  quantity: number;
  currency?: string;
}) => {
  ReactPixel.track("AddToCart", {
    content_ids: [params.contentId],
    product_id: params.productId,
    design_id: params.designId,
    content_name: params.contentName,
    content_type: "product",
    value: params.value,
    currency: params.currency || "INR",
    num_items: params.quantity,
  });
};

// Track checkout initiation
export const trackMetaInitiateCheckout = (params: {
  contentIds: string[];
  value: number;
  numItems: number;
  currency?: string;
}) => {
  ReactPixel.track("InitiateCheckout", {
    content_ids: params.contentIds,
    value: params.value,
    currency: params.currency || "INR",
    num_items: params.numItems,
  });
};

// Track payment info added (when payment is initiated)
export const trackMetaAddPaymentInfo = (params: {
  contentIds: string[];
  value: number;
  currency?: string;
}) => {
  ReactPixel.track("AddPaymentInfo", {
    content_ids: params.contentIds,
    content_type: "product",
    value: params.value,
    currency: params.currency || "INR",
  });
};

// Track purchase completion
export const trackMetaPurchase = (params: {
  contentIds: string[];
  value: number;
  currency?: string;
  numItems: number;
  orderId?: string;
}) => {
  ReactPixel.track("Purchase", {
    content_ids: params.contentIds,
    content_type: "product",
    value: params.value,
    currency: params.currency || "INR",
    num_items: params.numItems,
    ...(params.orderId && { order_id: params.orderId }),
  });
};

// Track search
export const trackMetaSearch = (searchQuery: string) => {
  ReactPixel.track("Search", {
    search_string: searchQuery,
  });
};

// Track custom events (optional)
export const trackMetaCustomEvent = (eventName: string, params?: Record<string, any>) => {
  ReactPixel.trackCustom(eventName, params);
};

