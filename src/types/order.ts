import { OrderedVariant } from "./product";

export type OrderStatus = "initiated" | "paid" | "cancelled" | "admin-cancelled" | "payment-failed";

export type PaymentMethod = "card" | "netbanking" | "wallet" | "emi" | "upi" | null;

export type Address = {
  line1: string;
  line2?: string;
  country: string;
  state: string;
  city: string;
  zip: string;
};

export type OversoldLine = { variantId: string; size: string; short: number };

export type Order = {
  id: string;
  reviewId?: string;
  createdAt: number;
  name: string;
  email: string;
  phone: string;
  referralSource: string;
  total: number;
  subtotal: number;
  discount: number;
  shipping: number;
  couponCode: string | null;
  address: Address;
  isInternational: boolean;
  variants: OrderedVariant[];
  status: OrderStatus;
  stockDeducted?: boolean;
  // Lines that were paid for after stock hit 0 (set by deductStockForOrder)
  oversold?: OversoldLine[];
  reviewRequestSentAt?: number;
  // International orders: the latest Razorpay payment link sent by admin (older ones are cancelled)
  paymentLink?: { id: string; url: string };
} & (
  | {
      paymentMode: "rzp";
      rzp: {
        orderId: string;
        amount: number;
        currency: string;
        paymentId: string | null;
        paymentStatus: string | null;
        isInternational: boolean;
        paymentMethod: PaymentMethod;
      };
    }
  | {
      paymentMode: "cash";
      cash: {
        amount: number;
        paymentStatus: "paid" | "cancelled";
      };
    }
  | {
      paymentMode: "manual";
    }
);

export type CartItem = {
  variantId: string;
  size: string;
  quantity: number;
};
