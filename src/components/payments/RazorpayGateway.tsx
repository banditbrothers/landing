"use client";

import { useImperativeHandle } from "react";
import { Order } from "@/types/order";
import Script from "next/script";
import { toast } from "sonner";

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Razorpay: any;
  }
}

type RazorpayPaymentGatewayProps = {
  ref: React.RefObject<RazorpayPaymentGatewayRef | null>;
  onSuccess: (paymentId: string) => void;
  onCancel: (orderId: string) => void;
  onFailed: () => void;
};

type RazorpaySuccessResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export type RazorpayPaymentGatewayRef = {
  handlePayment: (order: Order) => boolean; // false = modal didn't open
};

export const RazorpayPaymentGateway = ({ ref, onSuccess, onCancel, onFailed }: RazorpayPaymentGatewayProps) => {
  const handlePayment = (order: Order) => {
    if (typeof window.Razorpay === "undefined") {
      toast.warning("Payment window didn't load", {
        description: "Refresh the page and try again. Your bag is saved.",
      });
      return false;
    }

    if (order.paymentMode !== "rzp") {
      console.error("Order is not in rzp mode");
      return false;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RZP_KEY_ID!,
      amount: order.rzp.amount, // paise, as created by createRzpOrder
      currency: order.rzp.currency,
      order_id: order.rzp.orderId,
      prefill: { name: order.name, email: order.email, contact: order.phone, method: "upi" },
      config: {
        display: {
          hide: [{ method: "netbanking" }, { method: "paylater" }],
        },
      },
      notes: { dbId: order.id },
      modal: {
        confirm_close: true,
        ondismiss: () => onCancel(order.id),
      },
      handler: (response: RazorpaySuccessResponse) => {
        if (response.razorpay_payment_id) {
          onSuccess(order.id);
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", onFailed);
    rzp.open(options);
    return true;
  };

  useImperativeHandle(ref, () => ({ handlePayment }));

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
    </>
  );
};
