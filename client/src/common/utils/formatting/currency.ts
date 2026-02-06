/**
 * Currency formatting utilities
 */

/**
 * Format currency values in Indian Rupees (INR)
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  // ✅ Safety: Handle undefined, null, or non-numeric values
  const safeAmount = (typeof amount === "number" && !isNaN(amount)) ? amount : 0;
  
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(safeAmount);
};

/**
 * Format currency values in compact form (e.g., ₹1.2L, ₹1.5Cr)
 * @param amount - The amount to format
 * @returns Formatted compact currency string
 */
export const formatCompactCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
};

