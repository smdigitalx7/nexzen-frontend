/**
 * Transport Fee Component
 * Handles transport fee payment input for multiple payment form
 */

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Truck, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { PaymentValidator, getAvailableTerms } from '../../validation/PaymentValidation';
import type { PurposeSpecificComponentProps, PaymentItem, PaymentMethod } from '../../types/PaymentTypes';
import { useCollegeExpectedTransportPaymentsByEnrollmentId } from '@/lib/hooks/college/use-college-transport-balances';

const paymentMethodOptions: Array<{ value: PaymentMethod; label: string }> = [
  { value: "CASH", label: "Cash" },
  { value: "ONLINE", label: "Online" },
];

interface TransportFeeComponentProps extends PurposeSpecificComponentProps {
  isOpen: boolean;
}

export const TransportFeeComponent: React.FC<TransportFeeComponentProps> = ({
  student,
  feeBalances,
  config,
  onAdd,
  onCancel,
  isOpen,
}) => {
  const [selectedTerms, setSelectedTerms] = useState<number[]>([]);
  const [termAmounts, setTermAmounts] = useState<Record<number, string>>({});
  const [lockedTerms, setLockedTerms] = useState<number[]>([]);
  // For colleges: monthly payment data
  const [paymentMonth, setPaymentMonth] = useState<string>(''); // Single month input for colleges (YYYY-MM-01 format) - fallback
  const [selectedExpectedMonths, setSelectedExpectedMonths] = useState<string[]>([]); // Selected expected payment months
  const [expectedMonthAmounts, setExpectedMonthAmounts] = useState<Record<string, string>>({}); // Amounts for each expected month
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termErrors, setTermErrors] = useState<Record<number, boolean>>({});
  const [expectedMonthErrors, setExpectedMonthErrors] = useState<Record<string, string>>({}); // Error messages per month
  const initializedRef = useRef(false);

  // Fetch expected payments for colleges when enrollment_id is available
  const isCollege = config.institutionType === 'college';
  const { data: expectedPaymentsData, isLoading: isLoadingExpectedPayments } = useCollegeExpectedTransportPaymentsByEnrollmentId(
    isCollege && student.enrollmentId ? student.enrollmentId : null
  );

  // Get available terms for transport fee
  const availableTerms = getAvailableTerms('TRANSPORT_FEE', feeBalances, config.institutionType);
  
  // For colleges, check if there are outstanding payments using the total amount
  const collegeOutstanding = isCollege ? feeBalances.transportFee.total : 0;
  
  // Get expected payments for colleges (memoized to prevent dependency issues)
  const expectedPayments = useMemo(() => {
    return expectedPaymentsData?.expected_payments || [];
  }, [expectedPaymentsData?.expected_payments]);
  
  // Calculate monthly amount (assume equal distribution if multiple months expected)
  // If total is 0 but there are expected payments, set a default amount (user can change it)
  const monthlyAmount = useMemo(() => {
    if (expectedPayments.length > 0) {
      const total = feeBalances.transportFee.total;
      // If total is 0, use a placeholder amount (user will need to enter actual amount)
      return total > 0 ? total / expectedPayments.length : 0;
    }
    return feeBalances.transportFee.total;
  }, [expectedPayments.length, feeBalances.transportFee.total]);
  
  // Check if there are any outstanding payments
  // For colleges, check if there are expected payments OR outstanding amount; for schools, use term-based outstanding
  const hasOutstandingPayments = isCollege 
    ? (collegeOutstanding > 0 || expectedPayments.length > 0)
    : availableTerms.some(term => term.outstanding > 0);
  const allTermsPaid = availableTerms.length > 0 && availableTerms.every(term => term.paid);

  useEffect(() => {
    // Only initialize term amounts if we haven't initialized yet
    if (!initializedRef.current) {
      const initialAmounts: Record<number, string> = {};
      const initialExpectedAmounts: Record<string, string> = {};
      
      if (isCollege) {
        // For colleges with expected payments, initialize amounts for each expected month
        if (expectedPayments.length > 0) {
          expectedPayments.forEach((payment) => {
            // Initialize with payment_amount from expected payment if available, otherwise leave empty
            // Handle both string and number types for payment_amount
            const paymentAmount = typeof payment.payment_amount === 'string' 
              ? parseFloat(payment.payment_amount) 
              : (payment.payment_amount || 0);
            
            if (paymentAmount > 0 && !isNaN(paymentAmount)) {
              initialExpectedAmounts[payment.expected_payment_month] = paymentAmount.toFixed(2);
            } else {
              initialExpectedAmounts[payment.expected_payment_month] = '';
            }
          });
          setExpectedMonthAmounts(initialExpectedAmounts);
        } else {
          // Fallback: initialize with the total transport fee amount for manual input
          if (collegeOutstanding > 0) {
            initialAmounts[1] = collegeOutstanding.toString();
          }
        }
      } else {
        // For schools, use term-based amounts
        availableTerms.forEach(term => {
          if (term.available && term.outstanding > 0) {
            initialAmounts[term.term] = term.outstanding.toString();
          }
        });
      }
      
      setTermAmounts(initialAmounts);
      initializedRef.current = true;
    }
  }, [availableTerms, isCollege, collegeOutstanding, expectedPayments, monthlyAmount]);

  // Helper function to get sequence number (from property or array index)
  const getSequenceNumber = (payment: typeof expectedPayments[0], index: number): number => {
    return payment.payment_sequence_number ?? (index + 1);
  };

  // Handle expected payment month selection (in sequence order)
  const handleExpectedMonthSelection = (month: string, checked: boolean) => {
    if (checked) {
      const paymentIndex = expectedPayments.findIndex(p => p.expected_payment_month === month);
      const payment = expectedPayments[paymentIndex];
      if (!payment || paymentIndex === -1) return;
      
      const currentSequence = getSequenceNumber(payment, paymentIndex);
      
      // Check if previous months in sequence are selected
      const previousMonths = expectedPayments
        .filter((p, idx) => getSequenceNumber(p, idx) < currentSequence)
        .map(p => p.expected_payment_month);
      
      const allPreviousSelected = previousMonths.every(m => selectedExpectedMonths.includes(m));
      
      if (!allPreviousSelected && previousMonths.length > 0) {
        const firstSequence = expectedPayments.length > 0 
          ? getSequenceNumber(expectedPayments[0], 0)
          : 1;
        setErrors([`Please select previous months in sequence first (starting from sequence #${firstSequence})`]);
        return;
      }
      
      setSelectedExpectedMonths(prev => [...prev, month]);
      
      // Initialize amount if not already set - use payment_amount from expected payment
      if (!expectedMonthAmounts[month]) {
        const payment = expectedPayments.find(p => p.expected_payment_month === month);
        if (payment && payment.payment_amount !== undefined && payment.payment_amount !== null) {
          // Handle both string and number types for payment_amount
          const paymentAmount = typeof payment.payment_amount === 'string' 
            ? parseFloat(payment.payment_amount) 
            : (payment.payment_amount || 0);
          
          if (paymentAmount > 0 && !isNaN(paymentAmount)) {
            setExpectedMonthAmounts(prev => ({
              ...prev,
              [month]: paymentAmount.toFixed(2)
            }));
          }
        }
      }
    } else {
      // Remove month and any months after it in sequence
      const paymentIndex = expectedPayments.findIndex(p => p.expected_payment_month === month);
      const payment = expectedPayments[paymentIndex];
      if (!payment || paymentIndex === -1) return;
      
      const currentSequence = getSequenceNumber(payment, paymentIndex);
      
      const monthsToRemove = expectedPayments
        .filter((p, idx) => getSequenceNumber(p, idx) >= currentSequence)
        .map(p => p.expected_payment_month);
      
      setSelectedExpectedMonths(prev => prev.filter(m => !monthsToRemove.includes(m)));
      
      // Clear amounts for removed months
      setExpectedMonthAmounts(prev => {
        const newAmounts = { ...prev };
        monthsToRemove.forEach(m => delete newAmounts[m]);
        return newAmounts;
      });
      
      // Clear errors for removed months
      setExpectedMonthErrors(prev => {
        const newErrors = { ...prev };
        monthsToRemove.forEach(m => delete newErrors[m]);
        return newErrors;
      });
    }
    
    // Clear errors
    setErrors([]);
  };

  // Handle expected month amount change
  const handleExpectedMonthAmountChange = (month: string, value: string) => {
    setExpectedMonthAmounts(prev => ({
      ...prev,
      [month]: value
    }));
    
    // Clear error for this month when user starts typing
    setExpectedMonthErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[month];
      return newErrors;
    });
    
    // Validate amount
    const numAmount = parseFloat(value);
    if (!isNaN(numAmount) && numAmount > 0) {
      const validation = PaymentValidator.validateAmount(numAmount, config.validationRules);
      if (!validation.isValid) {
        // Set error for this specific month
        setExpectedMonthErrors(prev => ({
          ...prev,
          [month]: validation.errors[0] || 'Invalid amount'
        }));
      } else {
        // Check if amount exceeds the payment_amount for this specific month
        const payment = expectedPayments.find(p => p.expected_payment_month === month);
        if (payment && payment.payment_amount !== undefined && payment.payment_amount !== null) {
          // Handle both string and number types for payment_amount
          const paymentAmount = typeof payment.payment_amount === 'string' 
            ? parseFloat(payment.payment_amount) 
            : (payment.payment_amount || 0);
          
          if (!isNaN(paymentAmount) && numAmount > paymentAmount) {
            // Set error for this specific month
            setExpectedMonthErrors(prev => ({
              ...prev,
              [month]: `Amount cannot exceed ${formatAmount(paymentAmount)}`
            }));
          } else {
            // Clear error for this month
            setExpectedMonthErrors(prev => {
              const newErrors = { ...prev };
              delete newErrors[month];
              return newErrors;
            });
          }
        }
      }
    } else if (value.trim() === '') {
      // Clear error if field is empty
      setExpectedMonthErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[month];
        return newErrors;
      });
    }
  };

  // Format month for display
  const formatPaymentMonth = (monthString: string): string => {
    try {
      const date = new Date(monthString);
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    } catch {
      return monthString;
    }
  };

  const handleTermSelection = (termNumber: number, checked: boolean) => {
    if (checked) {
      // Prevent duplicate term selection
      if (selectedTerms.includes(termNumber)) {
        return;
      }

      // Add term to selection
      const newSelectedTerms = [...selectedTerms, termNumber];
      setSelectedTerms(newSelectedTerms);

      // Lock all previous terms except the last one
      const termsToLock = newSelectedTerms.slice(0, -1);
      setLockedTerms(termsToLock);

      // Set amounts for locked terms to full outstanding amount
      const newAmounts = { ...termAmounts };
      termsToLock.forEach((term) => {
        const termData = availableTerms.find((t) => t.term === term);
        if (termData && termData.outstanding > 0) {
          newAmounts[term] = termData.outstanding.toString();
        }
      });

      // Set amount for the last selected term (can be custom)
      const lastTerm = newSelectedTerms[newSelectedTerms.length - 1];
      const lastTermData = availableTerms.find((t) => t.term === lastTerm);
      if (lastTermData && lastTermData.outstanding > 0) {
        newAmounts[lastTerm] = lastTermData.outstanding.toString();
      }

      setTermAmounts(newAmounts);
    } else {
      // Remove term from selection
      const newSelectedTerms = selectedTerms.filter(
        (term) => term !== termNumber
      );
      setSelectedTerms(newSelectedTerms);

      // Update locked terms
      const newLockedTerms = newSelectedTerms.slice(0, -1);
      setLockedTerms(newLockedTerms);

      // Clear amount for removed term
      setTermAmounts((prev) => {
        const newAmounts = { ...prev };
        delete newAmounts[termNumber];
        return newAmounts;
      });
    }
  };

  const handleTermAmountChange = (termNumber: number, value: string) => {
    // Directly update the term amount - no selection check needed since input is only shown for selected terms
    setTermAmounts((prev) => {
      const newAmounts = { ...prev };
      newAmounts[termNumber] = value;
      return newAmounts;
    });

    // Validate after a short delay to ensure state is updated
    setTimeout(() => {
      validateTermAmount(termNumber, value);
    }, 0);
  };

  const validateTermAmount = (termNumber: number, value: string) => {
    const numAmount = parseFloat(value);
    const validation = PaymentValidator.validateAmount(
      numAmount,
      config.validationRules
    );

    let hasExceededAmount = false;

    // Check if amount exceeds outstanding balance for this term
    if (isCollege) {
      // For colleges, check against total transport fee
      if (numAmount > feeBalances.transportFee.total) {
        validation.errors.push(
          `Amount cannot exceed total transport fee of ${formatAmount(feeBalances.transportFee.total)}`
        );
        hasExceededAmount = true;
      }
    } else {
      // For schools, check against term-specific outstanding balance
      const termData = availableTerms.find((t) => t.term === termNumber);
      if (termData && numAmount > termData.outstanding) {
        validation.errors.push(
          `Amount cannot exceed outstanding balance of ${formatAmount(termData.outstanding)}`
        );
        hasExceededAmount = true;
      }
    }

    // Clear error if amount is valid
    if (!hasExceededAmount && validation.errors.length === 0) {
      hasExceededAmount = false;
    }

    // Update term error state
    setTermErrors((prev) => ({
      ...prev,
      [termNumber]: hasExceededAmount,
    }));

    setErrors(validation.errors);
  };

  const handleSubmit = () => {
    // Prevent duplicate submission
    if (isSubmitting) {
      return;
    }

    if (!isCollege && selectedTerms.length === 0) {
      setErrors(["Please select at least one term"]);
      return;
    }
    
    // Create payment items
    setIsSubmitting(true);
    
    // Validation will happen in specific branches below
    
    if (isCollege) {
      // For colleges: use expected payments if available, otherwise fallback to manual input
      if (expectedPayments.length > 0) {
        // Check if any months are selected
        if (selectedExpectedMonths.length === 0) {
          setErrors(['Please select at least one expected payment month']);
          setIsSubmitting(false);
          return;
        }
        
        // Validate all selected expected months
        const validationErrors: string[] = [];
        selectedExpectedMonths.forEach(month => {
          const amount = expectedMonthAmounts[month];
          if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
            validationErrors.push(`Please enter a valid amount for ${formatPaymentMonth(month)}`);
            return;
          }
          
          const numAmount = parseFloat(amount);
          const validation = PaymentValidator.validateAmount(numAmount, config.validationRules);
          if (!validation.isValid) {
            validationErrors.push(...validation.errors.map(err => `${formatPaymentMonth(month)}: ${err}`));
          }
          
          // Check if amount exceeds the payment_amount for this specific month
          const payment = expectedPayments.find(p => p.expected_payment_month === month);
          if (payment && payment.payment_amount !== undefined && payment.payment_amount !== null) {
            // Handle both string and number types for payment_amount
            const paymentAmount = typeof payment.payment_amount === 'string' 
              ? parseFloat(payment.payment_amount) 
              : (payment.payment_amount || 0);
            
            if (!isNaN(paymentAmount) && numAmount > paymentAmount) {
              validationErrors.push(`${formatPaymentMonth(month)}: Amount cannot exceed ${formatAmount(paymentAmount)}`);
            }
          }
        });
        
        if (validationErrors.length > 0) {
          setErrors(validationErrors);
          setIsSubmitting(false);
          return;
        }
        
        // Create payment items for each selected expected month (in sequence order)
        const sortedSelectedMonths = selectedExpectedMonths.sort((a, b) => {
          const indexA = expectedPayments.findIndex(p => p.expected_payment_month === a);
          const indexB = expectedPayments.findIndex(p => p.expected_payment_month === b);
          const paymentA = indexA !== -1 ? expectedPayments[indexA] : null;
          const paymentB = indexB !== -1 ? expectedPayments[indexB] : null;
          const seqA = paymentA ? getSequenceNumber(paymentA, indexA) : 0;
          const seqB = paymentB ? getSequenceNumber(paymentB, indexB) : 0;
          return seqA - seqB;
        });
        
        // Add all payment items first
        const paymentItemsToAdd: PaymentItem[] = sortedSelectedMonths.map(month => {
          const amount = parseFloat(expectedMonthAmounts[month]);
          // Convert month to YYYY-MM-01 format
          const paymentMonth = month.startsWith('20') ? month.substring(0, 7) + '-01' : month;
          
          return {
            id: `transport-fee-month-${month}-${Date.now()}-${Math.random()}`,
            purpose: 'TRANSPORT_FEE',
            paymentMonth: paymentMonth, // YYYY-MM-01 format
            amount: amount,
            paymentMethod: paymentMethod
          };
        });
        
        // Add all items
        paymentItemsToAdd.forEach(item => {
          onAdd(item);
        });
        
        // Close dialog after successfully adding items (use setTimeout to ensure state updates)
        setIsSubmitting(false);
        setTimeout(() => {
          onCancel();
        }, 100);
      } else if (paymentMonth && termAmounts[1]) {
        // Fallback: manual month input
        const amount = parseFloat(termAmounts[1] || '0');
        
        // Validate payment_month format (YYYY-MM-01)
        const monthRegex = /^\d{4}-\d{2}-01$/;
        if (!monthRegex.test(paymentMonth)) {
          setErrors(['Payment month must be in YYYY-MM-01 format (e.g., 2024-01-01)']);
          setIsSubmitting(false);
          return;
        }
        
        // Validate amount
        if (!amount || isNaN(amount) || amount <= 0) {
          setErrors(['Please enter a valid amount']);
          setIsSubmitting(false);
          return;
        }
        
        const validation = PaymentValidator.validateAmount(amount, config.validationRules);
        if (!validation.isValid) {
          setErrors(validation.errors);
          setIsSubmitting(false);
          return;
        }
        
        const paymentItem: PaymentItem = {
          id: `transport-fee-month-${paymentMonth}-${Date.now()}-${Math.random()}`,
          purpose: 'TRANSPORT_FEE',
          paymentMonth: paymentMonth, // YYYY-MM-01 format
          amount: amount,
          paymentMethod: paymentMethod
        };
        onAdd(paymentItem);
        
        // Close dialog after successfully adding item (use setTimeout to ensure state updates)
        setIsSubmitting(false);
        setTimeout(() => {
          onCancel();
        }, 100);
      } else {
        setErrors(['Please select expected payment months or enter a payment month and amount']);
        setIsSubmitting(false);
      }
    } else {
      // For schools: validate term-based payments first
      const validationErrors: string[] = [];
      selectedTerms.forEach(termNumber => {
        const amount = termAmounts[termNumber];
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
          validationErrors.push(
            `Please enter a valid amount for Term ${termNumber}`
          );
          return;
        }

        const numAmount = parseFloat(amount);
        const validation = PaymentValidator.validateAmount(
          numAmount,
          config.validationRules
        );
        if (!validation.isValid) {
          validationErrors.push(
            ...validation.errors.map((error) => `Term ${termNumber}: ${error}`)
          );
        }

        // Check if amount exceeds outstanding balance for this term
        const termData = availableTerms.find((t) => t.term === termNumber);
        if (termData && numAmount > termData.outstanding) {
          validationErrors.push(
            `Term ${termNumber}: Amount cannot exceed outstanding balance of ${formatAmount(termData.outstanding)}`
          );
        }
      });

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setIsSubmitting(false);
        return;
      }

      // For schools: create payment items for each selected term
      const uniqueSelectedTerms = Array.from(new Set(selectedTerms)); // Remove duplicates
      const paymentItemsToAdd: PaymentItem[] = uniqueSelectedTerms.map(termNumber => {
        const amount = parseFloat(termAmounts[termNumber]);
        return {
          id: `transport-fee-term-${termNumber}-${Date.now()}-${Math.random()}`,
          purpose: 'TRANSPORT_FEE',
          termNumber: termNumber,
          amount: amount,
          paymentMethod: paymentMethod
        };
      });
      
      // Add all items
      paymentItemsToAdd.forEach(item => {
        onAdd(item);
      });
      
      // Close dialog after successfully adding items (use setTimeout to ensure state updates)
      setIsSubmitting(false);
      setTimeout(() => {
        onCancel();
      }, 100);
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const isFormValid = isCollege 
    ? (
        // If expected payments available, require at least one selected with valid amounts
        (expectedPayments.length > 0 && selectedExpectedMonths.length > 0 && selectedExpectedMonths.every(month => {
          const amount = expectedMonthAmounts[month];
          return amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;
        })) ||
        // Fallback: manual month input
        (paymentMonth && /^\d{4}-\d{2}-01$/.test(paymentMonth) && termAmounts[1] && !isNaN(parseFloat(termAmounts[1])) && parseFloat(termAmounts[1]) > 0)
      ) && errors.length === 0 && Object.keys(expectedMonthErrors).length === 0
    : (selectedTerms.length > 0 && selectedTerms.every(term => {
        const amount = termAmounts[term];
        return amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;
      })) && errors.length === 0 && Object.keys(termErrors).filter(key => termErrors[Number(key)]).length === 0;

  // Helper function to determine if a term can be selected
  const canSelectTerm = (termNumber: number): boolean => {
    const term = availableTerms.find((t) => t.term === termNumber);
    if (!term) return false;

    // Can't select if fully paid (no outstanding amount)
    // Allow selection if there's any outstanding balance, even if partially paid
    if (term.outstanding <= 0) return false;

    // For sequential selection:
    // - Previous terms with outstanding balance must be fully paid OR selected in current session
    // - Exception: If current term is partially paid, allow continuing that partial payment
    if (termNumber > 1) {
      const isCurrentTermPartiallyPaid = term.paid && term.outstanding > 0;

      for (let prevTermNum = 1; prevTermNum < termNumber; prevTermNum++) {
        const prevTerm = availableTerms.find((t) => t.term === prevTermNum);
        if (prevTerm) {
          // Skip if previous term is fully paid (no outstanding)
          if (prevTerm.outstanding <= 0) {
            continue;
          }

          // If previous term has outstanding balance:
          // - Must be selected in current session, OR
          // - Current term is partially paid (allow continuing partial payments)
          if (
            prevTerm.outstanding > 0 &&
            !selectedTerms.includes(prevTermNum) &&
            !isCurrentTermPartiallyPaid
          ) {
            return false;
          }
        }
      }
    }

    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-orange-200 bg-gradient-to-r from-orange-50/50 to-red-50/50">
          <DialogTitle className="flex items-center gap-2 text-lg text-gray-900">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Truck className="h-5 w-5 text-orange-600" />
            </div>
            Transport Fee Payment
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-2">
            Add transport fee payment for{" "}
            <span className="font-medium text-gray-900">{student.name}</span> (
            {student.admissionNo})
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
          <div className="space-y-6">

          {/* College Monthly Payment */}
          {isCollege ? (
            <div className="space-y-4">
              {/* Expected Payments Section */}
              {isLoadingExpectedPayments ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-orange-600" />
                  <span className="ml-2 text-sm text-gray-600">Loading expected payments...</span>
                </div>
              ) : expectedPayments.length > 0 ? (
                <>
                  {/* Month Selection */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">
                      Select Payment Months <span className="text-red-500">*</span>
                    </Label>
                    
                    {!hasOutstandingPayments ? (
                      <div className="text-center py-8">
                        <div className="flex flex-col items-center space-y-4">
                          <div className="p-4 bg-green-100 rounded-full">
                            <CheckCircle2 className="h-8 w-8 text-green-600" />
                          </div>
                          <div className="text-center">
                            <h3 className="text-lg font-semibold text-green-800 mb-2">
                              All Transport Fees Paid!
                            </h3>
                            <p className="text-sm text-gray-600">
                              All transport fee payments have been paid in full.
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {expectedPayments.map((payment, paymentIdx) => {
                          const isSelected = selectedExpectedMonths.includes(payment.expected_payment_month);
                          const currentSequence = getSequenceNumber(payment, paymentIdx);
                          const previousPayments = expectedPayments
                            .filter((p, idx) => getSequenceNumber(p, idx) < currentSequence)
                            .map(p => p.expected_payment_month);
                          const canSelect = previousPayments.length === 0 || 
                            previousPayments.every(m => selectedExpectedMonths.includes(m));
                          
                          // Get payment amount for this month - handle both string and number types
                          const paymentAmount = typeof payment.payment_amount === 'string' 
                            ? parseFloat(payment.payment_amount) || 0
                            : (payment.payment_amount || 0);
                          
                          return (
                            <div
                              key={payment.expected_payment_month}
                              className="border border-gray-200 rounded-lg p-4 bg-white hover:border-orange-300 transition-colors"
                            >
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center space-x-3">
                                  <Checkbox
                                    id={`expected-month-${payment.expected_payment_month}`}
                                    checked={isSelected}
                                    onCheckedChange={(checked) => handleExpectedMonthSelection(payment.expected_payment_month, checked as boolean)}
                                    disabled={!canSelect}
                                  />
                                  <Label htmlFor={`expected-month-${payment.expected_payment_month}`} className="flex items-center gap-2">
                                    <Badge variant="outline" className="text-xs font-mono">
                                      #{getSequenceNumber(payment, paymentIdx)}
                                    </Badge>
                                    <span className="font-medium">{formatPaymentMonth(payment.expected_payment_month)}</span>
                                    {isSelected && (
                                      <Badge variant="default" className="text-xs bg-green-100 text-green-700">
                                        Selected
                                      </Badge>
                                    )}
                                    {!canSelect && !isSelected && (
                                      <Badge variant="outline" className="text-xs text-orange-500">
                                        Select Previous First
                                      </Badge>
                                    )}
                                  </Label>
                                </div>
                                <div className="text-sm text-gray-600">
                                  Amount: {formatAmount(paymentAmount)}
                                </div>
                              </div>
                              
                              {isSelected && (
                                <div className="space-y-2">
                                  <Label htmlFor={`amount-${payment.expected_payment_month}`} className="text-sm font-medium">
                                    Payment Amount for {formatPaymentMonth(payment.expected_payment_month)} *
                                  </Label>
                                  <div className="relative">
                                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium">
                                      ₹
                                    </span>
                                    <Input
                                      id={`amount-${payment.expected_payment_month}`}
                                      type="text"
                                      placeholder="Enter amount"
                                      value={expectedMonthAmounts[payment.expected_payment_month] || ''}
                                      onChange={(e) => handleExpectedMonthAmountChange(payment.expected_payment_month, e.target.value)}
                                      className={`pl-8 bg-blue-50/50 border-blue-300 ${expectedMonthErrors[payment.expected_payment_month] ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                                    />
                                  </div>
                                  {paymentAmount > 0 && (
                                    <p className="text-xs text-gray-500">
                                      Maximum amount: {formatAmount(paymentAmount)}
                                    </p>
                                  )}
                                  {paymentAmount === 0 && (
                                    <p className="text-xs text-gray-500">
                                      Enter the payment amount for this month
                                    </p>
                                  )}
                                  {expectedMonthErrors[payment.expected_payment_month] && (
                                    <p className="text-xs text-red-500 mt-1">
                                      {expectedMonthErrors[payment.expected_payment_month]}
                                    </p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    {selectedExpectedMonths.length > 0 && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                          <strong>Selected:</strong> {selectedExpectedMonths.length} month{selectedExpectedMonths.length !== 1 ? 's' : ''} • 
                          Total Amount: <strong>{formatAmount(selectedExpectedMonths.reduce((sum, month) => {
                            const amount = parseFloat(expectedMonthAmounts[month] || '0');
                            return sum + (isNaN(amount) ? 0 : amount);
                          }, 0))}</strong>
                        </p>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Fallback: Manual month input when no expected payments */
                <div className="space-y-4">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-yellow-800">
                      <AlertCircle className="h-4 w-4 inline mr-1" />
                      No expected payments found. Please enter payment month manually.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="payment-month" className="text-sm font-medium">
                      Payment Month * (YYYY-MM-01 format)
                    </Label>
                    <Input
                      id="payment-month"
                      type="text"
                      placeholder="e.g., 2024-01-01"
                      value={paymentMonth}
                      onChange={(e) => {
                        const value = e.target.value;
                        setPaymentMonth(value);
                        // Clear error when user types
                        if (errors.some(err => err.includes('payment month'))) {
                          setErrors(errors.filter(err => !err.includes('payment month')));
                        }
                      }}
                      className={errors.some(err => err.includes('payment month')) ? 'border-red-500 focus-visible:ring-red-500' : ''}
                    />
                    <p className="text-xs text-gray-500">
                      Format: YYYY-MM-01 (first day of the month, e.g., 2024-01-01 for January 2024)
                    </p>
                    {errors.some(err => err.includes('payment month')) && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.find(err => err.includes('payment month'))}
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="transport-amount" className="text-sm font-medium">
                      Payment Amount *
                    </Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium">
                        ₹
                      </span>
                      <Input
                        id="transport-amount"
                        type="text"
                        placeholder="Enter amount"
                        value={termAmounts[1] || ''}
                        onChange={(e) => handleTermAmountChange(1, e.target.value)}
                        className={`pl-8 bg-blue-50/50 border-blue-300 ${termErrors[1] ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                      />
                    </div>
                    <p className="text-xs text-gray-500">
                      Maximum amount: {formatAmount(feeBalances.transportFee.total)}
                    </p>
                    {termErrors[1] && (
                      <p className="text-xs text-red-500 mt-1">
                        Amount cannot exceed total transport fee of {formatAmount(feeBalances.transportFee.total)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Fee Information - Enhanced */}
              {/* <div className="border border-blue-200 rounded-lg p-5 bg-gradient-to-br from-blue-50 to-indigo-50"> */}
              {/* <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Truck className="h-4 w-4 text-blue-600" />
                  Transport Fee Information
                </h3> */}
              <div className="grid grid-cols-2 gap-4">
                {availableTerms.map((term) => (
                  <div
                    key={term.term}
                    className={`text-center p-3 rounded-lg border ${
                      term.outstanding > 0
                        ? "bg-white border-red-200 bg-red-50/30"
                        : "bg-white border-blue-100"
                    }`}
                  >
                    <p className="text-xs text-gray-500 mb-1.5">
                      Term {term.term}
                    </p>
                    <p
                      className={`font-semibold text-sm ${
                        term.outstanding > 0 ? "text-red-600" : "text-blue-600"
                      }`}
                    >
                      {formatAmount(term.outstanding)}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">Outstanding</p>
                  </div>
                ))}
              </div>
              {/* </div> */}

              {/* Term Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700">
                  Select Terms <span className="text-red-500">*</span>
                </Label>

                {!hasOutstandingPayments ? (
                  <div className="text-center py-8">
                    <div className="flex flex-col items-center space-y-4">
                      <div className="p-4 bg-green-100 rounded-full">
                        <CheckCircle2 className="h-8 w-8 text-green-600" />
                      </div>
                      <div className="text-center">
                        <h3 className="text-lg font-semibold text-green-800 mb-2">
                          {allTermsPaid
                            ? "All Transport Fees Paid!"
                            : "No Outstanding Transport Fees"}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {allTermsPaid
                            ? "All transport fee terms have been paid in full."
                            : "There are no outstanding transport fee payments for this student."}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {availableTerms.map((term) => (
                      <div
                        key={term.term}
                        className="border border-gray-200 rounded-lg p-4 bg-white hover:border-blue-300 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id={`term-${term.term}`}
                              checked={selectedTerms.includes(term.term)}
                              onCheckedChange={(checked) =>
                                handleTermSelection(
                                  term.term,
                                  checked as boolean
                                )
                              }
                              disabled={!canSelectTerm(term.term)}
                            />
                            <Label
                              htmlFor={`term-${term.term}`}
                              className="flex items-center gap-2"
                            >
                              <span className="font-medium">
                                Term {term.term}
                              </span>
                              {selectedTerms.includes(term.term) && (
                                <Badge
                                  variant={
                                    lockedTerms.includes(term.term)
                                      ? "secondary"
                                      : "default"
                                  }
                                  className={`text-xs ${
                                    lockedTerms.includes(term.term)
                                      ? "bg-gray-200 text-gray-600"
                                      : "bg-green-100 text-green-700"
                                  }`}
                                >
                                  {lockedTerms.includes(term.term)
                                    ? "Locked"
                                    : "Editable"}
                                </Badge>
                              )}
                              {/* Only show "Paid" badge if term is fully paid (no outstanding balance) */}
                              {term.outstanding <= 0 && term.paid && (
                                <Badge variant="secondary" className="text-xs">
                                  Paid
                                </Badge>
                              )}
                              {/* Show "Partially Paid" if there's payment but still outstanding */}
                              {term.paid && term.outstanding > 0 && (
                                <Badge
                                  variant="outline"
                                  className="text-xs text-orange-600 border-orange-300 bg-orange-50"
                                >
                                  Partially Paid
                                </Badge>
                              )}
                              {term.outstanding <= 0 && !term.paid && (
                                <Badge
                                  variant="outline"
                                  className="text-xs text-gray-500"
                                >
                                  No Outstanding
                                </Badge>
                              )}
                              {term.term > 1 &&
                                !canSelectTerm(term.term) &&
                                term.outstanding > 0 && (
                                  <Badge
                                    variant="outline"
                                    className="text-xs text-orange-500"
                                  >
                                    Complete Previous Terms First
                                  </Badge>
                                )}
                            </Label>
                          </div>
                          <div className="text-sm text-gray-600">
                            Outstanding: {formatAmount(term.outstanding)}
                          </div>
                        </div>

                        {selectedTerms.includes(term.term) && (
                          <div className="space-y-2">
                            <Label
                              htmlFor={`amount-term-${term.term}`}
                              className="text-sm font-medium"
                            >
                              Payment Amount for Term {term.term} *
                            </Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium">
                                ₹
                              </span>
                              <Input
                                id={`amount-term-${term.term}`}
                                type="text"
                                placeholder="Enter amount"
                                value={termAmounts[term.term] || ""}
                                onChange={(e) => {
                                  handleTermAmountChange(
                                    term.term,
                                    e.target.value
                                  );
                                }}
                                disabled={lockedTerms.includes(term.term)}
                                className={`pl-8 ${lockedTerms.includes(term.term) ? "bg-blue-50/50 border-blue-300 cursor-not-allowed" : "bg-blue-50/50 border-blue-300"} ${termErrors[term.term] ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                              />
                            </div>
                            {lockedTerms.includes(term.term) && (
                              <p className="text-xs text-gray-500">
                                This term is locked with the full outstanding
                                amount
                              </p>
                            )}
                            {!lockedTerms.includes(term.term) && (
                              <p className="text-xs text-gray-500">
                                Maximum amount: {formatAmount(term.outstanding)}
                              </p>
                            )}
                            {termErrors[term.term] && (
                              <p className="text-xs text-red-500 mt-1">
                                Amount cannot exceed outstanding balance of{" "}
                                {formatAmount(term.outstanding)}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Payment Method - Radio Buttons */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-gray-700">
              Payment Method <span className="text-red-500">*</span>
            </Label>
            <div className="grid grid-cols-2 gap-3">
              {paymentMethodOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    paymentMethod === option.value
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment-method"
                    value={option.value}
                    checked={paymentMethod === option.value}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value as PaymentMethod)
                    }
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span
                    className={`font-medium ${paymentMethod === option.value ? "text-blue-700" : "text-gray-700"}`}
                  >
                    {option.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Warning Message */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {isCollege && expectedPayments.length > 0 ? (
                <>
                  <strong>Important:</strong> Payment months must be selected in sequence order (starting from #{getSequenceNumber(expectedPayments[0], 0)}). 
                  Previous months in the sequence must be selected before selecting later months.
                  {selectedExpectedMonths.length > 0 && (
                    <span className="block mt-1">
                      Selected Months: {selectedExpectedMonths.map(month => formatPaymentMonth(month)).join(', ')} - 
                      Total Amount: <strong>{formatAmount(selectedExpectedMonths.reduce((sum, month) => {
                        const amount = parseFloat(expectedMonthAmounts[month] || '0');
                        return sum + (isNaN(amount) ? 0 : amount);
                      }, 0))}</strong>
                    </span>
                  )}
                </>
              ) : (
                <>
                  <strong>Important:</strong> Terms must be paid sequentially ({config.institutionType === 'college' ? '1 → 2 → 3' : '1 → 2'}). Previous terms that are already paid or have no outstanding balance can be skipped.
                  {selectedTerms.length > 0 && (
                    <span className="block mt-1">
                      Selected Terms: {selectedTerms.map(term => `Term ${term}`).join(', ')} - Total Outstanding: <strong>{formatAmount(selectedTerms.reduce((sum, term) => sum + (availableTerms.find(t => t.term === term)?.outstanding || 0), 0))}</strong>
                    </span>
                  )}
                </>
              )}
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            
            {hasOutstandingPayments ? (
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className="flex-1 gap-2"
            >
              <Truck className="h-4 w-4" />
              {isCollege 
                ? (expectedPayments.length > 0 
                    ? `Add ${selectedExpectedMonths.length} Payment${selectedExpectedMonths.length > 1 ? 's' : ''}`
                    : 'Add Payment')
                : `Add ${selectedTerms.length} Term Payment${selectedTerms.length > 1 ? 's' : ''}`}
            </Button>
            ) : (
              <Button
                onClick={onCancel}
                className="w-full gap-2 bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle2 className="h-4 w-4" />
                Close
              </Button>
            )}
          </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TransportFeeComponent;
