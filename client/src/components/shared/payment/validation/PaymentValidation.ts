/**
 * Payment Validation System
 * Handles validation logic for multiple payment forms
 */

import type { 
  PaymentItem, 
  PaymentValidationResult, 
  MultiplePaymentData,
  ValidationRules,
  PaymentPurpose,
  FeeBalance
} from '../types/PaymentTypes';

export class PaymentValidator {
  /**
   * Validates payment amount
   */
  static validateAmount(amount: number, rules: ValidationRules): PaymentValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (amount <= 0) {
      errors.push('Payment amount must be greater than 0');
    }

    if (amount < rules.amountRange.min) {
      errors.push(`Payment amount must be at least ₹${rules.amountRange.min}`);
    }

    if (amount > rules.amountRange.max) {
      errors.push(`Payment amount cannot exceed ₹${rules.amountRange.max.toLocaleString()}`);
    }

    // Check decimal places
    const decimalPlaces = (amount.toString().split('.')[1] || '').length;
    if (decimalPlaces > rules.amountRange.decimals) {
      errors.push(`Payment amount can have maximum ${rules.amountRange.decimals} decimal places`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates term sequence for tuition and transport fees
   */
  static validateTermSequence(items: PaymentItem[], rules: ValidationRules): PaymentValidationResult {
    if (!rules.termSequence) {
      return { isValid: true, errors: [], warnings: [] };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Group items by purpose
    const tuitionItems = items.filter(item => item.purpose === 'TUITION_FEE');
    const transportItems = items.filter(item => item.purpose === 'TRANSPORT_FEE');

    // Validate tuition fee sequence
    if (tuitionItems.length > 0) {
      const termNumbers = tuitionItems.map(item => item.termNumber!).sort();
      for (let i = 0; i < termNumbers.length - 1; i++) {
        if (termNumbers[i + 1] - termNumbers[i] !== 1) {
          errors.push('Tuition fee terms must be paid sequentially (1 → 2 → 3)');
          break;
        }
      }
    }

    // Validate transport fee sequence
    if (transportItems.length > 0) {
      const termNumbers = transportItems.map(item => item.termNumber!).sort();
      for (let i = 0; i < termNumbers.length - 1; i++) {
        if (termNumbers[i + 1] - termNumbers[i] !== 1) {
          errors.push('Transport fee terms must be paid sequentially (1 → 2)');
          break;
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates for duplicate payment purposes
   */
  static validateDuplicates(items: PaymentItem[], rules: ValidationRules): PaymentValidationResult {
    if (!rules.duplicatePrevention) {
      return { isValid: true, errors: [], warnings: [] };
    }

    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for duplicate BOOK_FEE
    const bookFees = items.filter(item => item.purpose === 'BOOK_FEE');
    if (bookFees.length > 1) {
      errors.push('Book fee can only be paid once per transaction');
    }

    // Check for duplicate OTHER payments with same custom purpose
    const otherPayments = items.filter(item => item.purpose === 'OTHER');
    const customPurposes = otherPayments.map(item => item.customPurposeName);
    const duplicateCustomPurposes = customPurposes.filter((purpose, index) => 
      customPurposes.indexOf(purpose) !== index
    );
    
    if (duplicateCustomPurposes.length > 0) {
      errors.push('Duplicate custom purpose payments are not allowed');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates business rules (e.g., book fee must be paid first)
   */
  static validateBusinessRules(items: PaymentItem[], rules: ValidationRules, feeBalances?: FeeBalance): PaymentValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!rules.bookFeeFirst) {
      return { isValid: true, errors: [], warnings: [] };
    }

    const hasBookFee = items.some(item => item.purpose === 'BOOK_FEE');
    const hasTuitionFee = items.some(item => item.purpose === 'TUITION_FEE');
    const hasTransportFee = items.some(item => item.purpose === 'TRANSPORT_FEE');

    // Check if book fee is already paid (if feeBalances is provided)
    if (feeBalances) {
      const bookOutstanding = feeBalances.bookFee.outstanding;
      const bookFeePaid = bookOutstanding <= 0;
      
      // If book fee is outstanding, it must be included in the payment
      if (!bookFeePaid && !hasBookFee) {
        errors.push('Book fee must be paid before processing any other payments');
      }
    } else {
      // Fallback to old logic if feeBalances is not provided
      if ((hasTuitionFee || hasTransportFee) && !hasBookFee) {
        errors.push('Book fee must be paid before tuition or transport fee payments');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates custom purpose name for OTHER payments
   */
  static validateCustomPurposeName(purpose: PaymentPurpose, customName?: string): PaymentValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (purpose === 'OTHER') {
      if (!customName || customName.trim().length === 0) {
        errors.push('Custom purpose name is required for OTHER payments');
      } else if (customName.trim().length < 3) {
        errors.push('Custom purpose name must be at least 3 characters long');
      } else if (customName.trim().length > 100) {
        errors.push('Custom purpose name cannot exceed 100 characters');
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validates term number for tuition and transport fees
   */
  static validateTermNumber(purpose: PaymentPurpose, termNumber?: number, maxTerms: number = 3): PaymentValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (purpose === 'TUITION_FEE' || purpose === 'TRANSPORT_FEE') {
      if (!termNumber) {
        errors.push('Term number is required for tuition and transport fees');
      } else if (termNumber < 1 || termNumber > maxTerms) {
        errors.push(`Term number must be between 1 and ${maxTerms}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Comprehensive form validation
   */
  static validateForm(data: MultiplePaymentData, rules: ValidationRules, feeBalances?: FeeBalance): PaymentValidationResult {
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    // Validate each payment item
    data.details.forEach((item, index) => {
      const amountValidation = this.validateAmount(item.amount, rules);
      const customPurposeValidation = this.validateCustomPurposeName(item.purpose, item.customPurposeName);
      const termValidation = this.validateTermNumber(item.purpose, item.termNumber, rules.amountRange.max === 1000000 ? 3 : 2);

      allErrors.push(...amountValidation.errors.map(error => `Payment ${index + 1}: ${error}`));
      allErrors.push(...customPurposeValidation.errors.map(error => `Payment ${index + 1}: ${error}`));
      allErrors.push(...termValidation.errors.map(error => `Payment ${index + 1}: ${error}`));

      allWarnings.push(...amountValidation.warnings.map(warning => `Payment ${index + 1}: ${warning}`));
      allWarnings.push(...customPurposeValidation.warnings.map(warning => `Payment ${index + 1}: ${warning}`));
      allWarnings.push(...termValidation.warnings.map(warning => `Payment ${index + 1}: ${warning}`));
    });

    // Validate form-level rules
    const duplicateValidation = this.validateDuplicates(data.details, rules);
    const sequenceValidation = this.validateTermSequence(data.details, rules);
    const businessRulesValidation = this.validateBusinessRules(data.details, rules, feeBalances);

    allErrors.push(...duplicateValidation.errors);
    allErrors.push(...sequenceValidation.errors);
    allErrors.push(...businessRulesValidation.errors);

    allWarnings.push(...duplicateValidation.warnings);
    allWarnings.push(...sequenceValidation.warnings);
    allWarnings.push(...businessRulesValidation.warnings);

    // Validate total amount
    if (data.totalAmount <= 0) {
      allErrors.push('Total amount must be greater than 0');
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings
    };
  }
}

/**
 * Validation message templates
 */
export const ValidationMessages = {
  AMOUNT_REQUIRED: 'Payment amount is required',
  AMOUNT_MIN: (min: number) => `Payment amount must be at least ₹${min}`,
  AMOUNT_MAX: (max: number) => `Payment amount cannot exceed ₹${max.toLocaleString()}`,
  AMOUNT_DECIMALS: (decimals: number) => `Payment amount can have maximum ${decimals} decimal places`,
  
  TERM_REQUIRED: 'Term number is required for tuition and transport fees',
  TERM_RANGE: (max: number) => `Term number must be between 1 and ${max}`,
  TERM_SEQUENCE: 'Terms must be paid sequentially',
  
  CUSTOM_PURPOSE_REQUIRED: 'Custom purpose name is required for OTHER payments',
  CUSTOM_PURPOSE_MIN: 'Custom purpose name must be at least 3 characters long',
  CUSTOM_PURPOSE_MAX: 'Custom purpose name cannot exceed 100 characters',
  
  DUPLICATE_BOOK_FEE: 'Book fee can only be paid once per transaction',
  DUPLICATE_CUSTOM_PURPOSE: 'Duplicate custom purpose payments are not allowed',
  
  BOOK_FEE_FIRST: 'Book fee must be paid before tuition or transport fee payments',
  
  FORM_TOTAL_REQUIRED: 'Total amount must be greater than 0',
  FORM_EMPTY: 'At least one payment item is required'
};

/**
 * Helper function to get available terms for a student
 */
export function getAvailableTerms(
  purpose: PaymentPurpose, 
  feeBalances: FeeBalance, 
  institutionType: 'school' | 'college'
): Array<{ term: number; available: boolean; paid: boolean; outstanding: number }> {
  // Different term counts based on purpose and institution type
  // Schools: 3 terms for tuition, 2 terms for transport
  // Colleges: No terms (single payment)
  const maxTerms = institutionType === 'college' ? 0 : (purpose === 'TRANSPORT_FEE' ? 2 : 3);
  const terms: Array<{ term: number; available: boolean; paid: boolean; outstanding: number }> = [];


  for (let i = 1; i <= maxTerms; i++) {
    let paid = false;
    let outstanding = 0;

    if (purpose === 'TUITION_FEE') {
      const termKey = `term${i}` as 'term1' | 'term2' | 'term3';
      const termData = feeBalances.tuitionFee[termKey as keyof typeof feeBalances.tuitionFee];
      if (termData && typeof termData === 'object' && 'paid' in termData && 'outstanding' in termData) {
        paid = termData.paid > 0;
        outstanding = termData.outstanding || 0;
      }
    } else if (purpose === 'TRANSPORT_FEE') {
      const termKey = `term${i}` as 'term1' | 'term2';
      const termData = feeBalances.transportFee[termKey as keyof typeof feeBalances.transportFee];
      if (termData && typeof termData === 'object' && 'paid' in termData && 'outstanding' in termData) {
        paid = termData.paid > 0;
        outstanding = termData.outstanding || 0;
      }
    }

    // Term is available if it has outstanding balance
    // A term should be available if there's any outstanding amount, regardless of whether it's partially paid
    // This allows continuing to pay partially paid terms that still have outstanding balance
    // For sequential validation: term 1 is always available if outstanding > 0
    // For subsequent terms: available if outstanding > 0 AND (previous term is fully paid OR current term is partially paid)
    const previousTermFullyPaid = i === 1 ? true : (terms[i - 2]?.outstanding === 0);
    const isPartiallyPaid = paid && outstanding > 0;
    // Allow term if it has outstanding balance AND either:
    // - It's term 1 (always allowed if outstanding > 0)
    // - Previous term is fully paid (sequential validation)
    // - Current term is partially paid (allow continuing partial payments)
    const available = outstanding > 0 && (i === 1 || previousTermFullyPaid || isPartiallyPaid);

    terms.push({
      term: i,
      available,
      paid,
      outstanding
    });
  }

  return terms;
}

/**
 * Helper function to check if a fee purpose is available for payment
 */
export function isFeePurposeAvailable(
  purpose: PaymentPurpose,
  feeBalances: FeeBalance,
  institutionType: 'school' | 'college',
  addedPurposes: PaymentPurpose[] = []
): { available: boolean; reason?: string; outstandingAmount?: number } {
  // Check if book fee is pending and must be selected first
  const bookOutstanding = feeBalances.bookFee.outstanding;
  const bookFeePending = bookOutstanding > 0;
  const bookFeeAdded = addedPurposes.includes('BOOK_FEE');

  switch (purpose) {
    case 'BOOK_FEE':
      return {
        available: bookOutstanding > 0,
        reason: bookOutstanding <= 0 ? 'Book fee is already paid in full' : undefined,
        outstandingAmount: bookOutstanding
      };

    case 'TUITION_FEE':
      const tuitionTerms = getAvailableTerms('TUITION_FEE', feeBalances, institutionType);
      const hasAvailableTuitionTerm = tuitionTerms.some(term => term.available);
      const totalTuitionOutstanding = tuitionTerms.reduce((sum, term) => sum + term.outstanding, 0);
      
      // If book fee is pending and not added, tuition fee is not available
      if (bookFeePending && !bookFeeAdded) {
        return {
          available: false,
          reason: 'Book fee must be selected first before tuition fee',
          outstandingAmount: totalTuitionOutstanding
        };
      }
      
      return {
        available: hasAvailableTuitionTerm,
        reason: !hasAvailableTuitionTerm ? 'No tuition fee terms available for payment' : undefined,
        outstandingAmount: totalTuitionOutstanding
      };

    case 'TRANSPORT_FEE':
      const transportTerms = getAvailableTerms('TRANSPORT_FEE', feeBalances, institutionType);
      const hasAvailableTransportTerm = transportTerms.some(term => term.available);
      const totalTransportOutstanding = transportTerms.reduce((sum, term) => sum + term.outstanding, 0);
      
      // If book fee is pending and not added, transport fee is not available
      if (bookFeePending && !bookFeeAdded) {
        return {
          available: false,
          reason: 'Book fee must be selected first before transport fee',
          outstandingAmount: totalTransportOutstanding
        };
      }
      
      return {
        available: hasAvailableTransportTerm,
        reason: !hasAvailableTransportTerm ? 'No transport fee terms available for payment' : undefined,
        outstandingAmount: totalTransportOutstanding
      };

    case 'OTHER':
      // If book fee is pending and not added, other payments are not available
      if (bookFeePending && !bookFeeAdded) {
        return {
          available: false,
          reason: 'Book fee must be selected first before other payments',
          outstandingAmount: 0
        };
      }
      
      // Other payments are available if book fee is not pending or already added
      return {
        available: true,
        outstandingAmount: 0
      };

    default:
      return {
        available: false,
        reason: 'Unknown payment purpose',
        outstandingAmount: 0
      };
  }
}

/**
 * Helper function to get fee purpose availability status for all purposes
 */
export function getAllFeePurposeAvailability(
  feeBalances: FeeBalance,
  institutionType: 'school' | 'college',
  addedPurposes: PaymentPurpose[] = []
): Record<PaymentPurpose, { available: boolean; reason?: string; outstandingAmount?: number }> {
  const purposes: PaymentPurpose[] = ['BOOK_FEE', 'TUITION_FEE', 'TRANSPORT_FEE', 'OTHER'];
  
  return purposes.reduce((acc, purpose) => {
    acc[purpose] = isFeePurposeAvailable(purpose, feeBalances, institutionType, addedPurposes);
    return acc;
  }, {} as Record<PaymentPurpose, { available: boolean; reason?: string; outstandingAmount?: number }>);
}
