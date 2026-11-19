/** Paths for pages that take ids. Relative, so links render the same on server and browser; prefix SITE_URL for messages */
export const routes = {
  product: (productId: string) => `/shop/${productId}`,
  variant: ({ productId, designId }: { productId: string; designId: string }) => `/shop/${productId}/${designId}`,
  order: (orderId: string) => `/order/${orderId}`,
  orderReview: (orderId: string) => `/order/${orderId}/review`,
};
