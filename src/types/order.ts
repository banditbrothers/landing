export type OrderStatus = "initiated" | "approval-pending" | "paid" | "cancelled" | "admin-cancelled";

export type Order = {
  id: string;
  createdAt: number;
  name: string;
  email: string;
  phone: string;
  amount: number;
  couponCode: string | null;
  address: {
    line1: string;
    line2: string;
    country: string;
    state: string;
    city: string;
    zip: string;
  };
  products: {
    designId: string;
    quantity: number;
  }[];
  payment: {
    status: OrderStatus;
    updatedAt: number;
  };
};

export type Coupon = {
  id: string;
  code: string;
  name: string;
  description: string;
  discountType: "fixed" | "percentage";
  minOrderAmount: number;
  discount: number;
  createdAt: number;
  expiresAt: number;
  isActive: boolean;
};

export type SelectedDesignsType = {
  designId: string;
  quantity: number;
};
