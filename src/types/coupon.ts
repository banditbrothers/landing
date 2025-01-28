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
