export type StockNotificationStatus = "pending" | "notified";

export type StockNotification = {
  id: string;
  variantId: string;
  size: string;
  email: string | null;
  phone: string | null;
  createdAt: number;
  status: StockNotificationStatus;
};
