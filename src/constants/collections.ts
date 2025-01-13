import { isProduction } from "@/utils/misc";

export const Collections = {
  orders: isProduction ? "orders" : "orders-dev",
  coupons: isProduction ? "coupons" : "coupons-dev",
};
