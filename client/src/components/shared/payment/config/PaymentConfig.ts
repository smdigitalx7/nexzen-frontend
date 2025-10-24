/**
 * Payment Form Configuration
 * Configuration for school and college payment forms
 */

import type { PaymentFormConfig, ValidationRules } from '../types/PaymentTypes';

export const schoolPaymentConfig: PaymentFormConfig = {
  institutionType: 'school',
  maxTerms: 2,
  supportedPurposes: ['BOOK_FEE', 'TUITION_FEE', 'TRANSPORT_FEE', 'OTHER'],
  validationRules: {
    amountRange: {
      min: 1,
      max: 1000000,
      decimals: 2
    },
    termSequence: true,
    duplicatePrevention: true,
    bookFeeFirst: true
  }
};

export const collegePaymentConfig: PaymentFormConfig = {
  institutionType: 'college',
  maxTerms: 3,
  supportedPurposes: ['BOOK_FEE', 'TUITION_FEE', 'TRANSPORT_FEE', 'OTHER'],
  validationRules: {
    amountRange: {
      min: 1,
      max: 1000000,
      decimals: 2
    },
    termSequence: true,
    duplicatePrevention: true,
    bookFeeFirst: true
  }
};

export const getPaymentConfig = (institutionType: 'school' | 'college'): PaymentFormConfig => {
  return institutionType === 'school' ? schoolPaymentConfig : collegePaymentConfig;
};
