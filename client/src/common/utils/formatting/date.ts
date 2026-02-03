/**
 * Date formatting utilities
 */

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
  
  // Handle different date formats and validate the date
  if (!dateString || dateString === null || dateString === undefined) {
    return '-';
  }
  
  // Handle empty string or whitespace
  if (typeof dateString === 'string' && dateString.trim() === '') {
    return '-';
  }
  
  // Try to parse the date string
  const date = new Date(dateString);
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    console.warn(`Invalid date string: ${dateString}`);
    return '-';
  }
  
  // Check if the date is too far in the past or future (likely invalid)
  const now = new Date();
  const yearDiff = Math.abs(date.getFullYear() - now.getFullYear());
  if (yearDiff > 100) {
    console.warn(`Date seems invalid (${yearDiff} years difference): ${dateString}`);
    return '-';
  }
  
  return date.toLocaleDateString("en-IN", { ...defaultOptions, ...options });
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

