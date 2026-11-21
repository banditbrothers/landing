// Zod schemas shared by the browser forms and the server actions, so validation rules can't drift apart.
// Messages are for the forms; the server only checks success.
import { z } from "zod";

export const PHONE_REGEX = /^[+]?[\d\s\-()]{7,20}$/;

export const addressSchema = z.object({
  line1: z.string().trim().min(2, "Enter valid address").max(300),
  line2: z.string().max(300).optional(),
  country: z.string().min(2, "Please select a country").max(3),
  state: z.string().min(1, "Please select a state/province").max(100),
  city: z.string().trim().min(2, "Enter valid city").max(100),
  zip: z.string().trim().min(3, "Enter valid postal code").max(10, "Enter valid postal code"),
});

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Enter valid name").max(100),
  email: z.string().trim().email("Please enter a valid email address").max(200),
  phone: z.string().regex(PHONE_REGEX, "Enter a valid phone number"),
  referralSource: z.string().max(100),
  address: addressSchema,
});

export const orderInputSchema = customerSchema.extend({
  couponCode: z.string().max(50).nullable(),
  variants: z
    .array(
      z.object({ variantId: z.string().min(1), size: z.string().min(1), quantity: z.number().int().min(1).max(50) })
    )
    .min(1)
    .max(50),
});
export type OrderInput = z.input<typeof orderInputSchema>;

export const reviewFieldsSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  title: z.string().trim().min(3, "Title must be at least 3 characters").max(200),
  comment: z.string().trim().min(10, "Comment must be at least 10 characters").max(5000),
  rating: z.number().int().min(1, "Oops! You forgot to rate us 5 stars!").max(5),
});
