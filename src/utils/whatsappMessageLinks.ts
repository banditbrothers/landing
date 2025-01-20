import { designsObject } from "@/data/designs";
import { Order } from "@/types/order";

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
