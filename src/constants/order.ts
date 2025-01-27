import { isProduction } from "@/utils/misc";

export const DEFAULT_ORDER_VALUES = isProduction
  ? {
      email: "",
      name: "",
      phone: "",
      couponCode: "",
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
      phone: "+919876543210",
      couponCode: "",
      address: {
        line1: "test",
        line2: "",
        country: "IN",
        state: "MH",
        city: "test",
        zip: "400001",
      },
    };
