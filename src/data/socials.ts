export const whatsappKnowMoreLink = `https://api.whatsapp.com/send?phone=917977884773&text=${encodeURIComponent(
  "Hey, I would like to know more about your products"
)}`;

export const getWhatsappShopNowLink = (name?: string) => {
  let message = "";
  if (name)
    message = `Hey, I'm interested in ordering the "${name}" bandana. Can you help me place an order?`;
  else
    message = `Hey, I'm interested in ordering a bandana. Can you help me place an order?`;

  const encodedMessage = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=917977884773&text=${encodedMessage}`;
};
