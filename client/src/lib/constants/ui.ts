/**
 * Shared UI constants and configurations
 */

// Common dialog sizes
export const DIALOG_SIZES = {
  SMALL: 'sm:max-w-[400px]',
  MEDIUM: 'sm:max-w-[600px]',
  LARGE: 'sm:max-w-[800px]',
  XLARGE: 'sm:max-w-[1000px]',
  FULL: 'sm:max-w-[95vw]',
} as const;

// Common table configurations
export const TABLE_CONFIG = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const;

// Common form field configurations
export const FORM_CONFIG = {
  DEBOUNCE_DELAY: 300,
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
} as const;

// Common status values
export const STATUS_VALUES = {
  ALL: 'all',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  PAID: 'paid',
  UNPAID: 'unpaid',
  PARTIAL: 'partial',
} as const;

// Common filter options
export const FILTER_OPTIONS = {
  STATUS: [
    { value: STATUS_VALUES.ALL, label: 'All Status' },
    { value: STATUS_VALUES.ACTIVE, label: 'Active' },
    { value: STATUS_VALUES.INACTIVE, label: 'Inactive' },
  ],
  PAYMENT_STATUS: [
    { value: STATUS_VALUES.ALL, label: 'All Status' },
    { value: STATUS_VALUES.PAID, label: 'Paid' },
    { value: STATUS_VALUES.UNPAID, label: 'Unpaid' },
    { value: STATUS_VALUES.PARTIAL, label: 'Partial' },
  ],
} as const;

// Common animation configurations
export const ANIMATION_CONFIG = {
  DURATION: {
    FAST: 0.15,
    NORMAL: 0.3,
    SLOW: 0.5,
  },
  EASING: {
    EASE_IN_OUT: 'ease-in-out',
    EASE_OUT: 'ease-out',
  },
} as const;
