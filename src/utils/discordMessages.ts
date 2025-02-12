import { Order } from "@/types/order";
import { MessageCreateOptions } from "discord.js";
import { getAddressString } from "./address";
import { getDate } from "./timestamp";
import { getWhatsappOrderConfirmationLink } from "./whatsappMessageLinks";

export const getDiscordOrderMessage = (order: Order) => {
  const paymentMethod = order.paymentMode === "rzp" ? order.rzp.paymentMethod?.toUpperCase() : "Cash";

  return {
    content: `🎉 We have a new order! \nSend ${
      order.name
    } their order info + shipping details by clicking [here](${getWhatsappOrderConfirmationLink(order)})`,
    embeds: [
      {
        title: "Order Details",
        color: 0xfd6e00,
        fields: [
          { name: "ID", value: order.id },
          { name: "Name", value: order.name },
          {
            name: "Payment Details",
            value: `${paymentMethod} / ₹${order.total} ${order.couponCode ? `(${order.couponCode})` : ""}`,
          },
          { name: "Address", value: getAddressString(order.address) },
          {
            name: "Products",
            value: order.products.map(product => `${product.quantity}x ${product.name}`).join("\n"),
          },
        ],
        timestamp: new Date(getDate(order.createdAt)).toISOString(),
      },
    ],
  } as MessageCreateOptions;
};
