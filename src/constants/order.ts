import { isProduction } from "@/utils/misc";

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
