export interface Review {
  id: string;
  orderId: string;
  name: string;
  email: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  createdAt: number;
  status: ReviewStatus;
  productIds: string[];
}

export type ReviewStatus = "pending" | "approved" | "rejected";
