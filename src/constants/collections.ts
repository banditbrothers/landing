import { isProduction } from "@/utils/misc";

export const Collections = {
  orders: isProduction ? "orders" : "orders-dev",
};
