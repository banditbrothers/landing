/**
 * Formats a number as currency in INR format
 * @param amount - The amount to format
 * @returns Formatted currency string (e.g., "₹1,234.56")
 */
export function formatCurrency(amount: number, decimalPlaces = 0): string {
  if(amount === null) return "₹0";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(amount);
}
