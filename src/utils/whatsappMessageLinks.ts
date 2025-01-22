import { designsObject } from "@/data/designs";
import { Order } from "@/types/order";
import { getAddressString } from "./address";

const whatsappPhoneNumber = "917977884773";

export const whatsappKnowMoreLink = `https://api.whatsapp.com/send?phone=${whatsappPhoneNumber}&text=${encodeURIComponent(
  "Hey, I would like to know more about your products"
)}`;

export const getWhatsappNeedHelpLink = (orderDetails: Partial<Order>) => {
  let message = `Hey, I need help with my order ${orderDetails.id ? `\n\`ID: ${orderDetails.id}\`` : ""}`;

  if (orderDetails.products) {
    message += `\n\n*Products* \n${orderDetails
      .products!.map(product => `- ${designsObject[product.designId]!.name}: ${product.quantity}`)
      .join("\n")}`;
  }

  const encodedMessage = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${whatsappPhoneNumber}&text=${encodedMessage}`;
};

export const getWhatsappOrderConfirmationLink = (order: Order) => {
  const message = [
    "Hey, we have received your order!",
    "",
    `*Order ID:* ${order.id}`,
    "",
    `*Order Total:* ₹${order.amount}`,
    "",
    `*Shipping Address:* ${getAddressString(order.address)}`,
    "",
    `*Payment Method:* ${order.paymentMode === "rzp" ? "Razorpay" : "Cash"}`,
    "",
    "You should receive your order in 7-10 days.",
    "May the Bandits be with you!",
  ].join("\n");
  const encodedMessage = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${order.phone}&text=${encodedMessage}`;
};
