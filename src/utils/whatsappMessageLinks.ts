import { designsObject } from "@/data/products";
import { Order } from "@/types/order";

export const whatsappKnowMoreLink = `https://api.whatsapp.com/send?phone=917977884773&text=${encodeURIComponent(
  "Hey, I would like to know more about your products"
)}`;

export const getWhatsappShopNowLink = (name?: string) => {
  let message = "";
  if (name) message = `Hey, I'm interested in ordering the "${name}" bandana. Can you help me place an order?`;
  else message = `Hey, I'm interested in ordering a bandana. Can you help me place an order?`;

  const encodedMessage = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=917977884773&text=${encodedMessage}`;
};

export const getWhatsappSharePaymentScreenshotLink = (orderDetails: Order) => {
  let message = `Hey, I've made the payment for my order. \n\n*Order Details* \nID: \`${orderDetails.id}\` \nName: ${orderDetails.name} \nEmail: ${orderDetails.email}`;

  message += `\n\n*Products* \n${orderDetails
    .products!.map(product => `- ${designsObject[product.designId]!.name}: ${product.quantity}`)
    .join("\n")}`;

  message += `\n\nHere is the screenshot of the payment `;
  const encodedMessage = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=917977884773&text=${encodedMessage}`;
};
