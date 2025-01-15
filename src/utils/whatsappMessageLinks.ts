import { designsObject } from "@/data/designs";
import { Order } from "@/types/order";

const whatsappPhoneNumber = "917977884773";

export const whatsappKnowMoreLink = `https://api.whatsapp.com/send?phone=${whatsappPhoneNumber}&text=${encodeURIComponent(
  "Hey, I would like to know more about your products"
)}`;

export const getWhatsappShopNowLink = (design?: string) => {
  let message = "";
  if (design) message = `Hey, I'm interested in ordering the "${design}" bandana. Can you help me place an order?`;
  else message = `Hey, I'm interested in ordering a bandana. Can you help me place an order?`;

  const encodedMessage = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${whatsappPhoneNumber}&text=${encodedMessage}`;
};

export const getWhatsappSharePaymentScreenshotLink = (orderDetails: Order) => {
  let message = `Hey, I've made the payment for my order. \n\n*Order Details* \nID: \`${orderDetails.id}\` \nName: ${orderDetails.name} \nEmail: ${orderDetails.email}`;

  message += `\n\n*Products* \n${orderDetails
    .products!.map(product => `- ${designsObject[product.designId]!.name}: ${product.quantity}`)
    .join("\n")}`;

  message += `\n\nHere is the screenshot of the payment `;
  const encodedMessage = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${whatsappPhoneNumber}&text=${encodedMessage}`;
};

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
