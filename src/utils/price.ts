export const CURRENCY = "INR";

/** "₹1,234" for whole rupees, "₹1,234.50" otherwise (or force decimals with decimalPlaces) */
export function formatCurrency(amount: number, decimalPlaces = Number.isInteger(amount) ? 0 : 2): string {
  if (amount === null) return "₹0";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: CURRENCY,
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(amount);
}

/** Razorpay takes paise; app code uses rupees. Convert only at that boundary. */
export const toPaise = (rupees: number) => Math.round(rupees * 100);
