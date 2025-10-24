/**
 * Shared Payment Components Index
 * Exports all shared payment components and utilities
 */

// Main Components
export { MultiplePaymentForm } from './multiple-payment/MultiplePaymentForm';
export { PurposeSelectionModal } from './multiple-payment/PurposeSelectionModal';
export { PaymentItemsList } from './multiple-payment/PaymentItemsList';
export { PaymentItemCard } from './multiple-payment/PaymentItemCard';
export { PaymentSummary } from './multiple-payment/PaymentSummary';

// Purpose-Specific Components
export { BookFeeComponent } from './multiple-payment/components/BookFeeComponent';
export { TuitionFeeComponent } from './multiple-payment/components/TuitionFeeComponent';
export { TransportFeeComponent } from './multiple-payment/components/TransportFeeComponent';
export { OtherComponent } from './multiple-payment/components/OtherComponent';

// Validation
export { PaymentValidator } from './validation/PaymentValidation';

// Hooks
export { useMultiplePayment, usePaymentValidation, useFeeBalances } from './hooks/useMultiplePayment';

// Configuration
export { schoolPaymentConfig, collegePaymentConfig, getPaymentConfig } from './config/PaymentConfig';

// Types
export type * from './types/PaymentTypes';