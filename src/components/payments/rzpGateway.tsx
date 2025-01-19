"use client";

import { useImperativeHandle } from "react";
import { Order } from "@/types/order";
import Script from "next/script";
import { useState } from "react";
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
  handlePayment: (order: Order) => void;
};

export const RazorpayPaymentGateway = ({ ref, onSuccess, onCancel, onFailed }: RazorpayPaymentGatewayProps) => {
  const [loaded, setLoaded] = useState(false);

  useImperativeHandle(ref, () => ({ handlePayment }));

  const handlePayment = (order: Order) => {
    if (!loaded) {
      toast.warning("Payment gateway is loading, Please try in a moment");
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RZP_KEY_ID!,
      amount: order.amount * 100,
      currency: order.rzp.currency,
      name: "Bandit Brothers",
      order_id: order.rzp.orderId,
      prefill: {
        name: order.name,
        email: order.email,
        contact: order.phone,
        method: "upi",
      },
      config: {
        display: {
          blocks: { banks: { name: "Pay via UPI", instruments: [{ method: "upi" }] } },
          preferences: { show_default_blocks: false },
          sequence: ["block.banks"],
        },
      },
      theme: {
        color: "#fd6e00",
      },
      notes: { dbId: order.id },
      modal: {
        confirm_close: true,
        ondismiss: () => onCancel(order.id),
      },
      handler: (response: RazorpaySuccessResponse) => {
        if (response.razorpay_payment_id) {
          onSuccess(response.razorpay_payment_id);
        }
      },
    };

    const rzp = new window.Razorpay(options);
    rzp.on("payment.failed", onFailed);
    rzp.open(options);
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" onLoad={() => setLoaded(true)} />
    </>
  );
};
