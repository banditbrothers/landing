import "server-only";
// Deliberately NOT "use server" (same as discord.ts): a server action would let anyone message our customers.
import type { Order } from "@/types/order";

// Must match the language picked for the templates in WhatsApp Manager ("English" = en, "English (US)" = en_US)
const TEMPLATE_LANGUAGE = "en";

// "+91 98765-43210" -> "919876543210". Early orders stored bare 10-digit Indian numbers.
export const toWhatsappNumber = (phone: string) => {
  const digits = phone.replace(/\D/g, "").replace(/^0+/, "");
  return digits.length === 10 ? `91${digits}` : digits;
};

const firstName = (name: string) => name.trim().split(/\s+/)[0] || "Bandit";

// Never throws: a failed WhatsApp send must not fail the order or the Razorpay webhook. Returns whether it was sent.
const sendTemplate = async (phone: string, template: string, bodyParams: string[], buttonParam: string) => {
  try {
    const response = await fetch(`https://graph.facebook.com/v23.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: toWhatsappNumber(phone),
        type: "template",
        template: {
          name: template,
          language: { code: TEMPLATE_LANGUAGE },
          components: [
            { type: "body", parameters: bodyParams.map(text => ({ type: "text", text })) },
            { type: "button", sub_type: "url", index: "0", parameters: [{ type: "text", text: buttonParam }] },
          ],
        },
      }),
    });
    if (!response.ok) {
      console.error(`WhatsApp ${template} failed:`, await response.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error(`WhatsApp ${template} error:`, error);
    return false;
  }
};

export const sendWhatsappOrderConfirmation = (order: Order) =>
  sendTemplate(
    order.phone,
    "order_confirmation",
    [firstName(order.name), order.id, order.total.toLocaleString("en-IN")],
    order.id
  );

export const sendWhatsappReviewRequest = (order: Order) =>
  sendTemplate(order.phone, "review_request", [firstName(order.name), order.id], order.id);
