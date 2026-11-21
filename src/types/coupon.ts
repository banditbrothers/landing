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
  applicableVariants: string[];
  /** Set by getCoupon, never stored: true for the staff cash coupon (cash payment, free shipping) */
  cashAndFreeShipping?: boolean;
};
