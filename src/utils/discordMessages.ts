import { Order } from "@/types/order";
import { MessageCreateOptions } from "discord.js";
import { getAddressString } from "./address";
import { getDate } from "./timestamp";
import { getWhatsappOrderConfirmationLink } from "./whatsappMessageLinks";
import { Review } from "@/types/review";
import { getReferralSourceLabel } from "@/constants/order";

export const getDiscordPaymentLinkPaidMessage = (order: Order) => {
  return {
    content: `🎉 ${order.name}'s international payment link paid!`,
    embeds: [
      {
        title: "Payment Link Paid",
        color: 0x00ff00,
        fields: [
          { name: "ID", value: order.id },
          { name: "Name", value: order.name },
          { name: "Referral Source", value: getReferralSourceLabel(order.referralSource) },
          { name: "Address", value: getAddressString(order.address) },
          { name: "Products", value: order.variants.map(variant => `${variant.quantity}x ${variant.variantId} - (${variant.size})`).join("\n") },
          { name: "Total", value: `₹${order.total}` },
          { name: "View Order", value: `[View Order](https://www.banditbrothers.in/order/${order.id})` },
        ],
        timestamp: new Date(getDate(order.createdAt)).toISOString(),
      },
    ],
  } as MessageCreateOptions;
}

export const getDiscordOrderMessage = (order: Order) => {
  let paymentMethod = order.paymentMode === "rzp" ? order.rzp.paymentMethod?.toUpperCase() : "Cash";
  if (order.paymentMode === "manual") paymentMethod = "Manual";
  

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
          { name: "Phone", value: order.phone },
          { name: "Referral Source", value: getReferralSourceLabel(order.referralSource) },
          { name: "Shipping Region", value: order.isInternational ? "🌍 International" : "🇮🇳 Domestic" },
          {
            name: "Payment Details",
            value: `${paymentMethod} / ₹${order.total} ${order.couponCode ? `(${order.couponCode})` : ""}`,
          },
          { name: "Address", value: getAddressString(order.address) },
          {
            name: "Products",
            value: order.variants.map(variant => `${variant.quantity}x ${variant.variantId} - (${variant.size})`).join("\n"),
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
