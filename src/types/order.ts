export type OrderStatus = "initiated" | "paid" | "cancelled" | "admin-cancelled" | "payment-failed";

export type Address = {
  line1: string;
  line2?: string;
  country: string;
  state: string;
  city: string;
  zip: string;
};

export type Order = {
  id: string;
  createdAt: number;
  name: string;
  email: string;
  phone: string;
  amount: number;
  couponCode: string | null;
  address: Address;
  products: SelectedDesignsType[];
  status: OrderStatus;
} & (
  | {
      paymentMode: "rzp";
      rzp: {
        orderId: string;
        amount: number;
        currency: string;
        paymentId: string | null;
        paymentStatus: string | null;
      };
    }
  | {
      paymentMode: "cash";
      cash: {
        amount: number;
        paymentStatus: "paid" | "cancelled";
      };
    }
);

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
