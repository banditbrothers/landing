export type Order = {
  id: string;
  createdAt: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  products: {
    id: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  amount: number;

  paymentId: string;
  paymentStatus: "pending" | "paid" | "failed";
  paymentMethod: "cash" | "card" | "bank_transfer";
};
