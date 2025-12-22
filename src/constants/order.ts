import { isProduction } from "@/utils/misc";

export const REFERRAL_SOURCES = [
  { id: "facebook-instagram-ads", label: "Facebook / Instagram Ads" },
  { id: "instagram-posts-reels", label: "Instagram (Posts / Reel)" },
  { id: "reddit", label: "Reddit" },
  { id: "friends-family", label: "Friends / Family" },
  { id: "google-search", label: "Google Search" },
  { id: "ai-agents", label: "AI Agents (ChatGPT / Gemini)" },
  { id: "others", label: "Others" },
] as const;

export const getReferralSourceLabel = (id: string): string => {
  const source = REFERRAL_SOURCES.find(s => s.id === id);
  return source ? source.label : id;
};

export const DEFAULT_ORDER_VALUES = isProduction
  ? {
      email: "",
      name: "",
      phone: "",
      couponCode: "",
      referralSource: "",
      address: {
        line1: "",
        line2: "",
        country: "IN",
        state: "MH",
        city: "",
        zip: "",
      },
    }
  : {
      email: "test@gmail.com",
      name: "test",
      phone: "9876543210",
      couponCode: "",
      referralSource: "instagram-posts-reels",
      address: {
        line1: "test",
        line2: "",
        country: "IN",
        state: "MH",
        city: "test",
        zip: "400001",
      },
    };
