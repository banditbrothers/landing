import { Order } from "@/types/order";
import { getAddressString } from "./address";

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
  const message = [
    "Hey, we have received your order!",
    "",
    `*Order ID:* ${order.id}`,
    "",
    `*Order Total:* ₹${order.total}`,
    "",
    `*Shipping Address:* ${getAddressString(order.address)}`,
    "",
    `*Payment Method:* ${order.paymentMode === "rzp" ? "Razorpay" : "Cash"}`,
    "",
    "Please read through the wash and care instructions here:",
    "https://www.banditbrothers.in/#product-specs",
    "",
    "You should receive your order in 7-10 days.",
    "",
    "May the Bandits be with you!",
  ].join("\n");
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${order.phone}?text=${encodedMessage}`;
};

export const getWhatsappNeedHelpLink = (orderId: string) => {
  return `https://wa.me/${whatsappPhoneNumber}?text=${encodeURIComponent(`Hey, I need help with order ${orderId}`)}`;
};
