/**
 * Payment Utilities
 * Shared utilities for payment methods and calculations
 */

import type { PaymentMethod } from '../types/PaymentTypes';

/**
 * Payment method options with icons and descriptions
 */
export const PAYMENT_METHOD_OPTIONS: Array<{
  value: PaymentMethod;
  label: string;
  description: string;
  icon: string;
  color: string;
}> = [
  {
    value: 'CASH',
    label: 'Cash',
    description: 'Physical cash payment',
    icon: '💵',
    color: 'green',
  },
  {
    value: 'UPI',
    label: 'UPI',
    description: 'Unified Payments Interface',
    icon: '📱',
    color: 'blue',
  },
  {
    value: 'CARD',
    label: 'Card',
    description: 'Debit/Credit Card (Swiping)',
    icon: '💳',
    color: 'purple',
  },
];

/**
 * Card processing charges percentage (1.2%)
 */
export const CARD_CHARGES_PERCENTAGE = 0.012; // 1.2%

/**
 * Calculate card charges for a given amount
 * @param amount - The base amount
 * @returns The card charges amount (1.2% of the amount)
 */
export function calculateCardCharges(amount: number): number {
  return Math.round(amount * CARD_CHARGES_PERCENTAGE * 100) / 100;
}

/**
 * Calculate total amount with card charges (for display only)
 * @param amount - The base amount
 * @returns The total amount including card charges
 */
export function calculateTotalWithCardCharges(amount: number): number {
  return amount + calculateCardCharges(amount);
}

/**
 * Map frontend payment method to backend API payment method
 * Backend supports: "CASH" | "UPI" | "CARD"
 * @param method - Frontend payment method
 * @returns Backend payment method (same as input)
 */
export function mapPaymentMethodForAPI(method: PaymentMethod): PaymentMethod {
  // Backend now accepts CASH, UPI, and CARD directly
  return method;
}

/**
 * Format amount as Indian Rupees
 */
export function formatAmount(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

