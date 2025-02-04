import { Order } from "@/types/order";
import { getAddressString } from "./address";
import { formatCurrency } from "./price";

const whatsappPhoneNumber = "917977884773";

export const whatsappKnowMoreLink = `https://wa.me/${whatsappPhoneNumber}?text=${encodeURIComponent(
  "Hey, I would like to know more about your products"
)}`;

export const getWhatsappNeedHelpWithOrderLink = (orderDetails: Partial<Order>) => {
  let message = `Hey, I need help with my order ${orderDetails.id ? `\n\`ID: ${orderDetails.id}\`` : ""}`;

  if (orderDetails.products) {
    message += `\n\n*Products* \n${orderDetails
      .products!.map(product => `- ${product.name}: ${product.quantity}`)
      .join("\n")}`;
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${whatsappPhoneNumber}?text=${encodedMessage}`;
};

export const getWhatsappOrderConfirmationLink = (order: Order) => {
  const paymentMethod = order.paymentMode === "rzp" ? order.rzp.paymentMethod?.toUpperCase() : "Cash";

  const message = [
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
    `https://www.banditbrothers.in/order/${order.id}`,
    "",
    "Please read through the wash and care instructions here:",
    "https://www.banditbrothers.in/#product-specs",
    "",
    "You should receive your order in 7-10 days.",
    "",
    "May the Bandits be with you!",
  ].join("\n");
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/91${order.phone}?text=${encodedMessage}`;
};

export const getWhatsappOrderReviewLink = (order: Order) => {
  const message = [
    "Hello Fellow Bandit!",
    "We hope you're enjoying your Bandit Brothers bandana!",
    "",
    "We'd love to hear about your experience with our products.",
    `Click here to share your feedback: https://www.banditbrothers.in/order/${order.id}/review`,
  ].join("\n");
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/91${order.phone}?text=${encodedMessage}`;
};

export const getWhatsappNeedHelpLink = (orderId: string) => {
  return `https://wa.me/${whatsappPhoneNumber}?text=${encodeURIComponent(`Hey, I need help with order ${orderId}`)}`;
};

export const getWhatsappUpdateReviewLink = (reviewId: string, orderId: string) => {
  return `https://wa.me/${whatsappPhoneNumber}?text=${encodeURIComponent(
    `Hey, I want to update my review for order ${orderId} with id ${reviewId}`
  )}`;
};

export const getWhatsappHelpWithCreateReviewLink = (orderId: string) => {
  return `https://wa.me/${whatsappPhoneNumber}?text=${encodeURIComponent(
    `Hey, I need help with creating a review for order ${orderId}`
  )}`;
};
