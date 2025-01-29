export type Coupon = {
  id: string;
  code: string;
  name: string;
  description: string;
  discountType: "fixed" | "percentage";
  minOrderAmount: number;
  discount: number;
  createdAt: number;
  expiresAt: number | null;
  isActive: boolean;
};

/**
 * export type DiscountRule = {
  type: "bogo" | "fixed" | "percentage" | "bundle_price";
  // For BOGO
  buyQuantity?: number;      // number of items to buy
  getQuantity?: number;      // number of items given at discount
  // For bundle_price
  itemQuantity?: number;     // e.g., 4 items
  bundlePrice?: number;      // e.g., 1000 (fixed price for the bundle)
  // For fixed/percentage
  discountValue: number;     // percentage or fixed amount of discount
};

export type Coupon = {
  id: string;
  code: string;
  name: string;
  description: string;
  couponType: "bundle" | "regular";
  discountRule: DiscountRule;  // single rule instead of array
  minOrderAmount: number;
  createdAt: number;
  expiresAt: number | null;
  isActive: boolean;
};
 */
