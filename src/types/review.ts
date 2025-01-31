export interface Review {
  id: string;
  orderId: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  createdAt: number;
  status: ReviewStatus;
  productIds: string[];
}

export enum ReviewStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}
