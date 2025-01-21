import { Order } from "@/types/order";
import { MessageCreateOptions } from "discord.js";
import { getAddressString } from "./address";
import { getDate } from "./misc";

export const getDiscordOrderMessage = (order: Order) => {
  return {
    content: "",
    embeds: [
      {
        title: "🎉 We have a new order!",
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
