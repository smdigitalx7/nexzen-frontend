/**
 * Shared formatting utilities for consistent data display across the application
 */

/**
 * Format currency values in Indian Rupees (INR)
 * @param amount - The amount to format
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
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

/**
 * Format date strings to Indian locale
 * @param dateString - The date string to format
 * @param options - Intl.DateTimeFormatOptions for customization
 * @returns Formatted date string
 */
export const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  return new Date(dateString).toLocaleDateString("en-IN", { ...defaultOptions, ...options });
};

/**
 * Format date and time strings to Indian locale
 * @param dateString - The date string to format
 * @returns Formatted date and time string
 */
export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString("en-IN", {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format percentage values
 * @param value - The percentage value (0-100)
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format large numbers with Indian number system (lakhs, crores)
 * @param value - The number to format
 * @returns Formatted number string
 */
export const formatIndianNumber = (value: number): string => {
  if (value >= 10000000) { // 1 crore
    return `${(value / 10000000).toFixed(1)}Cr`;
  } else if (value >= 100000) { // 1 lakh
    return `${(value / 100000).toFixed(1)}L`;
  } else if (value >= 1000) { // 1 thousand
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};
