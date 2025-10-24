/**
 * Payment Types and Interfaces for Multiple Payment Form
 * Shared between School and College modules
 */

export type PaymentPurpose = 'BOOK_FEE' | 'TUITION_FEE' | 'TRANSPORT_FEE' | 'OTHER';
export type PaymentMethod = 'CASH' | 'ONLINE' | 'CHEQUE' | 'DD';

export interface PaymentItem {
  id: string;
  purpose: PaymentPurpose;
  termNumber?: number;
  amount: number;
  paymentMethod: PaymentMethod;
  customPurposeName?: string;
}

export interface MultiplePaymentData {
  studentId: string;
  admissionNo: string;
  details: PaymentItem[];
  remarks?: string;
  totalAmount: number;
}

export interface PaymentValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface StudentInfo {
  studentId: string;
  admissionNo: string;
  name: string;
  className: string;
  academicYear: string;
}

export interface FeeBalance {
  bookFee: {
    total: number;
    paid: number;
    outstanding: number;
  };
  tuitionFee: {
    total: number;
    term1: { paid: number; outstanding: number }; // Required for schools
    term2: { paid: number; outstanding: number }; // Required for schools
    term3: { paid: number; outstanding: number }; // Required for schools
  };
  transportFee: {
    total: number;
    term1?: { paid: number; outstanding: number }; // Only for schools (colleges have single payment)
    term2?: { paid: number; outstanding: number }; // Only for schools (colleges have single payment)
  };
}

export interface PaymentFormConfig {
  institutionType: 'school' | 'college';
  maxTerms: number;
  supportedPurposes: PaymentPurpose[];
  validationRules: ValidationRules;
}

export interface ValidationRules {
  amountRange: {
    min: number;
    max: number;
    decimals: number;
  };
  termSequence: boolean;
  duplicatePrevention: boolean;
  bookFeeFirst: boolean;
}

export interface PurposeSelectionProps {
  isOpen?: boolean;
  availablePurposes: PaymentPurpose[];
  addedPurposes: PaymentPurpose[];
  paymentItems?: PaymentItem[]; // Add actual payment items for duplicate term checking
  onPurposeSelect: (purpose: PaymentPurpose) => void;
  onClose: () => void;
  feeBalances?: FeeBalance;
  institutionType?: 'school' | 'college';
}

export interface PaymentItemCardProps {
  item: PaymentItem;
  onRemove: (itemId: string) => void;
  institutionType: 'school' | 'college';
  orderNumber?: number;
  allItems?: PaymentItem[]; // Add all items to check deletion order
}

export interface PaymentSummaryProps {
  totalAmount: number;
  paymentMethod: PaymentMethod;
  remarks: string;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onRemarksChange: (remarks: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
  disabled: boolean;
}

export interface MultiplePaymentFormProps {
  student: StudentInfo;
  feeBalances: FeeBalance;
  config: PaymentFormConfig;
  onPaymentComplete: (data: MultiplePaymentData) => Promise<any>;
  onCancel: () => void;
}

export interface PurposeSpecificComponentProps {
  student: StudentInfo;
  feeBalances: FeeBalance;
  config: PaymentFormConfig;
  onAdd: (item: PaymentItem) => void;
  onCancel: () => void;
  isOpen: boolean;
}

// API Integration Types
export interface PaymentApiRequest {
  details: Array<{
    purpose: PaymentPurpose;
    custom_purpose_name?: string;
    term_number?: number;
    paid_amount: number;
    payment_method: PaymentMethod;
  }>;
  remarks?: string;
}

export interface PaymentApiResponse {
  success: boolean;
  message: string;
  data?: any;
}

// Error Types
export interface PaymentError {
  type: 'validation' | 'business_rule' | 'not_found' | 'system_error' | 'generic';
  field?: string;
  message: string;
  suggestion: string;
}

// Hook Types
export interface UseMultiplePaymentReturn {
  paymentItems: PaymentItem[];
  totalAmount: number;
  isSubmitting: boolean;
  errors: PaymentError[];
  addPaymentItem: (item: PaymentItem) => void;
  updatePaymentItem: (item: PaymentItem) => void;
  removePaymentItem: (itemId: string) => void;
  submitPayment: (data: MultiplePaymentData) => Promise<void>;
  clearErrors: () => void;
}

export interface UsePaymentValidationReturn {
  validateAmount: (amount: number) => PaymentValidationResult;
  validateTermSequence: (items: PaymentItem[]) => PaymentValidationResult;
  validateDuplicates: (items: PaymentItem[]) => PaymentValidationResult;
  validateForm: (data: MultiplePaymentData) => PaymentValidationResult;
}
