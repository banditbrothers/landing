import { Order } from "@/types/order";
import { MessageCreateOptions } from "discord.js";
import { getAddressString } from "./address";
import { getDate } from "./timestamp";
import { getWhatsappOrderConfirmationLink } from "./whatsappMessageLinks";

export const getDiscordOrderMessage = (order: Order) => {
  return {
    content: `🎉 We have a new order! \nClick [here](${getWhatsappOrderConfirmationLink(
      order
    )}) to send customer order info + shipping details`,
    embeds: [
      {
        title: "Order Details",
        color: 0xfd6e00,
        fields: [
          { name: "ID", value: order.id },
          { name: "Name", value: order.name },
          {
            name: "Payment Details",
            value: `${order.paymentMode} / ₹${order.amount} ${order.couponCode ? `(${order.couponCode})` : ""}`,
          },
          { name: "Address", value: getAddressString(order.address) },
          {
            name: "Products",
            value: order.products.map(product => `${product.quantity}x ${product.designId}`).join("\n"),
          },
        ],
        timestamp: new Date(getDate(order.createdAt)).toISOString(),
      },
    ],
  } as MessageCreateOptions;
};
