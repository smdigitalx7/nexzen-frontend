/**
 * Number formatting utilities
 */

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

