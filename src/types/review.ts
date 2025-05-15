export type Review = {
  id: string;
  name: string;
  email: string;
  rating: number;
  title: string;
  comment: string;
  images: string[];
  createdAt: number;
  status: ReviewStatus;
} & (
  | {
      source: "google";
      googleReviewUrl: string;
  }
  | {
      source: "website";
      orderId: string;
      variantIds: string[];
    }
);

export type ReviewStatus = "pending" | "approved" | "rejected";
export type ReviewWithoutEmail =
  | Omit<Extract<Review, { source: "website" }>, "email">
  | Omit<Extract<Review, { source: "google" }>, "email">;
