import { Order } from "@/types/order";
import { MessageCreateOptions } from "discord.js";
import { getAddressString } from "./address";
import { getDate } from "./timestamp";
import { getWhatsappOrderConfirmationLink } from "./whatsappMessageLinks";
import { Review } from "@/types/review";

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
            value: order.variants.map(variant => `${variant.quantity}x ${variant.variantId}-${variant.size}`).join("\n"),
          },
        ],
        timestamp: new Date(getDate(order.createdAt)).toISOString(),
      },
    ],
  } as MessageCreateOptions;
};

export const getDiscordReviewMessage = (review: Review) => {
  return {
    content: `${review.name} has submitted a review for their order! `,
    embeds: [
      {
        title: "Review Details",
        fields: [
          { name: "ID", value: review.id },
          { name: "Name", value: review.name },
          { name: "Rating", value: review.rating },
          { name: "Title", value: review.title },
          { name: "Comment", value: review.comment },
          { name: "Contains Images", value: review.images.length > 0 ? "Yes" : "No" },
        ],
      },
    ],
  } as MessageCreateOptions;
};
