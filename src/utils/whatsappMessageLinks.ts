import { Order } from "@/types/order";
import { getAddressString } from "./address";
import { formatCurrency } from "./price";
import { CONTACT, SITE_URL } from "@/lib/site";
import { getPaymentMethodLabel } from "@/constants/order";
import { routes } from "@/utils/routes";

/** wa.me chat link; `to` is the number with its country code */
export const waLink = (to: string, text: string) => `https://wa.me/${to}?text=${encodeURIComponent(text)}`;

export const getWhatsappNeedHelpWithOrderLink = (orderDetails: Partial<Order>) => {
  let message = `Hey, I need help with my order ${orderDetails.id ? `\n\`ID: ${orderDetails.id}\`` : ""}`;

  if (orderDetails.variants) {
    message += `\n\n*Products* \n${orderDetails
      .variants!.map(variant => `- ${variant.variantId}: ${variant.quantity}`)
      .join("\n")}`;
  }

  return waLink(CONTACT.whatsappNumber, message);
};

export const getWhatsappOrderConfirmationLink = (order: Order) => {
  const paymentMethod = getPaymentMethodLabel(order);

  let message: string[] = [];
  if (order.isInternational) {
    message = [
      "Hey, we have received your order!",
      "",
      `*Order ID:* ${order.id}`,
      "",
      `*Shipping Address:* ${getAddressString(order.address)}`,
      "",
      "Check your order details here:",
      `${SITE_URL}${routes.order(order.id)}`,
      "",
      "A complete breakdown of your order total (including product, and shipping cost) will be shared with you shortly, along with secure payment links and tracking details once everything is ready.",
      "",
      "May the Bandits be with you!",
    ];
  } else {
    message = [
      "Hey, we have received your order!",
      "",
      `*Order ID:* ${order.id}`,
      "",
      `*Order Total:* ${formatCurrency(order.total, 2)}`,
      "",
      `*Shipping Address:* ${getAddressString(order.address)}`,
      "",
      `*Payment Method:* ${paymentMethod}`,
      "",
      "Check your order details here:",
      `${SITE_URL}${routes.order(order.id)}`,
      "",
      "You should receive your order in 7-10 days.",
      "",
      "May the Bandits be with you!",
    ];
  }

  return waLink(order.phone, message.join("\n"));
};

export const getWhatsappOrderReviewLink = (order: Order) => {
  const message = [
    "Hello Fellow Bandit!",
    "We hope you're enjoying your Bandit Brothers bandana!",
    "",
    "We'd love to hear about your experience with our products.",
    `Click here to share your feedback: ${SITE_URL}${routes.orderReview(order.id)}`,
  ].join("\n");
  return waLink(order.phone, message);
};

export const getWhatsappNeedHelpLink = () => {
  return waLink(CONTACT.whatsappNumber, "Hey, I need help with placing an order on Bandit Brothers");
};

export const getWhatsappNeedHelpWithOrderIdLink = (orderId: string) => {
  return waLink(CONTACT.whatsappNumber, `Hey, I need help with order ${orderId}`);
};

export const getWhatsappUpdateReviewLink = (reviewId: string, orderId: string) => {
  return waLink(CONTACT.whatsappNumber, `Hey, I want to update my review for order ${orderId} with id ${reviewId}`);
};

export const getWhatsappHelpWithCreateReviewLink = (orderId: string) => {
  return waLink(CONTACT.whatsappNumber, `Hey, I need help with creating a review for order ${orderId}`);
};
