/**
 * Multiple Payment Hook
 * Custom hook for managing multiple payment form state and logic
 */

import { useState, useEffect, useCallback } from 'react';
import { PaymentValidator } from '../validation/PaymentValidation';
import type { 
  UseMultiplePaymentReturn, 
  PaymentItem, 
  MultiplePaymentData,
  PaymentError,
  ValidationRules 
} from '../types/PaymentTypes';

export const useMultiplePayment = (validationRules: ValidationRules): UseMultiplePaymentReturn => {
  const [paymentItems, setPaymentItems] = useState<PaymentItem[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<PaymentError[]>([]);

  // Calculate total amount whenever payment items change
  useEffect(() => {
    const total = paymentItems.reduce((sum, item) => sum + item.amount, 0);
    setTotalAmount(total);
  }, [paymentItems]);

  // Validate form whenever payment items change
  useEffect(() => {
    if (paymentItems.length > 0) {
      const validation = PaymentValidator.validateForm(
        {
          studentId: '',
          admissionNo: '',
          details: paymentItems,
          remarks: '',
          totalAmount
        },
        validationRules
      );
      
      const paymentErrors: PaymentError[] = validation.errors.map(error => ({
        type: 'validation',
        message: error,
        suggestion: 'Please check your input and try again'
      }));
      
      setErrors(paymentErrors);
    } else {
      setErrors([]);
    }
  }, [paymentItems, totalAmount, validationRules]);

  const addPaymentItem = useCallback((item: PaymentItem) => {
    setPaymentItems(prev => [...prev, item]);
  }, []);

  const updatePaymentItem = useCallback((updatedItem: PaymentItem) => {
    setPaymentItems(prev => 
      prev.map(item => 
        item.id === updatedItem.id ? updatedItem : item
      )
    );
  }, []);

  const removePaymentItem = useCallback((itemId: string) => {
    setPaymentItems(prev => prev.filter(item => item.id !== itemId));
  }, []);

  const submitPayment = useCallback(async (data: MultiplePaymentData) => {
    setIsSubmitting(true);
    
    try {
      // Final validation
      const validation = PaymentValidator.validateForm(data, validationRules);
      if (!validation.isValid) {
        const paymentErrors: PaymentError[] = validation.errors.map(error => ({
          type: 'validation',
          message: error,
          suggestion: 'Please check your input and try again'
        }));
        setErrors(paymentErrors);
        throw new Error('Validation failed');
      }

      // Here you would typically make the API call
      // For now, we'll just simulate success
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Clear form on success
      setPaymentItems([]);
      setErrors([]);
      
    } catch (error) {
      const paymentError: PaymentError = {
        type: 'system_error',
        message: error instanceof Error ? error.message : 'Payment submission failed',
        suggestion: 'Please try again later or contact support'
      };
      setErrors([paymentError]);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [validationRules]);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  return {
    paymentItems,
    totalAmount,
    isSubmitting,
    errors,
    addPaymentItem,
    updatePaymentItem,
    removePaymentItem,
    submitPayment,
    clearErrors
  };
};

/**
 * Payment Validation Hook
 * Custom hook for payment validation logic
 */

import type { UsePaymentValidationReturn } from '../types/PaymentTypes';

export const usePaymentValidation = (validationRules: ValidationRules): UsePaymentValidationReturn => {
  const validateAmount = useCallback((amount: number) => {
    return PaymentValidator.validateAmount(amount, validationRules);
  }, [validationRules]);

  const validateTermSequence = useCallback((items: PaymentItem[]) => {
    return PaymentValidator.validateTermSequence(items, validationRules);
  }, [validationRules]);

  const validateDuplicates = useCallback((items: PaymentItem[]) => {
    return PaymentValidator.validateDuplicates(items, validationRules);
  }, [validationRules]);

  const validateForm = useCallback((data: MultiplePaymentData) => {
    return PaymentValidator.validateForm(data, validationRules);
  }, [validationRules]);

  return {
    validateAmount,
    validateTermSequence,
    validateDuplicates,
    validateForm
  };
};

/**
 * Fee Balances Hook
 * Custom hook for managing fee balance data
 */

export interface FeeBalanceData {
  bookFee: {
    total: number;
    paid: number;
    outstanding: number;
  };
  tuitionFee: {
    total: number;
    term1: { paid: number; outstanding: number };
    term2: { paid: number; outstanding: number };
    term3?: { paid: number; outstanding: number };
  };
  transportFee: {
    total: number;
    term1: { paid: number; outstanding: number };
    term2: { paid: number; outstanding: number };
    term3?: { paid: number; outstanding: number };
  };
}

export const useFeeBalances = (admissionNo: string, institutionType: 'school' | 'college') => {
  const [feeBalances, setFeeBalances] = useState<FeeBalanceData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!admissionNo) return;

    const fetchFeeBalances = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Here you would typically make an API call to fetch fee balances
        // For now, we'll simulate the data
        const mockData: FeeBalanceData = {
          bookFee: {
            total: 1500,
            paid: 0,
            outstanding: 1500
          },
          tuitionFee: {
            total: institutionType === 'college' ? 45000 : 30000,
            term1: { paid: 0, outstanding: institutionType === 'college' ? 15000 : 10000 },
            term2: { paid: 0, outstanding: institutionType === 'college' ? 15000 : 10000 },
            term3: { paid: 0, outstanding: institutionType === 'college' ? 15000 : 10000 }
          },
          transportFee: {
            total: institutionType === 'college' ? 6000 : 4000,
            term1: { paid: 0, outstanding: institutionType === 'college' ? 2000 : 2000 },
            term2: { paid: 0, outstanding: institutionType === 'college' ? 2000 : 2000 },
            ...(institutionType === 'college' && {
              term3: { paid: 0, outstanding: 2000 }
            })
          }
        };
        
        setFeeBalances(mockData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch fee balances');
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeeBalances();
  }, [admissionNo, institutionType]);

  return {
    feeBalances,
    isLoading,
    error
  };
};
