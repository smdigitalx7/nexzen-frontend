/**
 * Tuition Fee Component
 * Handles tuition fee payment input for multiple payment form
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, AlertCircle, CheckCircle, Lock, CheckCircle2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

const paymentMethodOptions: Array<{ value: PaymentMethod; label: string }> = [
  { value: 'CASH', label: 'Cash' },
  { value: 'ONLINE', label: 'Online' }
];

interface TuitionFeeComponentProps extends PurposeSpecificComponentProps {
  isOpen: boolean;
}

export const TuitionFeeComponent: React.FC<TuitionFeeComponentProps> = ({
  student,
  feeBalances,
  config,
  onAdd,
  onCancel,
  isOpen
}) => {
  const [selectedTerms, setSelectedTerms] = useState<number[]>([]);
  const [termAmounts, setTermAmounts] = useState<Record<number, string>>({});
  const [lockedTerms, setLockedTerms] = useState<number[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [errors, setErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termErrors, setTermErrors] = useState<Record<number, boolean>>({});
  const initializedRef = useRef(false);

  // Get available terms for tuition fee
  const availableTerms = getAvailableTerms('TUITION_FEE', feeBalances, config.institutionType);
  
  // Check if there are any outstanding payments
  const hasOutstandingPayments = availableTerms.some(term => term.outstanding > 0);
  const allTermsPaid = availableTerms.length > 0 && availableTerms.every(term => term.paid);
  
  // For colleges, check if there are outstanding payments using the total amount
  const isCollege = config.institutionType === 'college';
  const collegeOutstanding = isCollege ? feeBalances.tuitionFee.total : 0;

  useEffect(() => {
    // Only initialize term amounts if we haven't initialized yet
    if (!initializedRef.current) {
      const initialAmounts: Record<number, string> = {};
      availableTerms.forEach(term => {
        if (term.available && term.outstanding > 0) {
          initialAmounts[term.term] = term.outstanding.toString();
        }
      });
      setTermAmounts(initialAmounts);
      initializedRef.current = true;
    }
  }, [availableTerms]);

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
      
      // Set amounts for locked terms to full outstanding amount (non-editable)
      const newAmounts = { ...termAmounts };
      termsToLock.forEach(term => {
        const termData = availableTerms.find(t => t.term === term);
        if (termData && termData.outstanding > 0) {
          newAmounts[term] = termData.outstanding.toString();
        }
      });
      
      // Set amount for the last selected term (can be custom)
      const lastTerm = newSelectedTerms[newSelectedTerms.length - 1];
      const lastTermData = availableTerms.find(t => t.term === lastTerm);
      if (lastTermData && lastTermData.outstanding > 0) {
        newAmounts[lastTerm] = lastTermData.outstanding.toString();
      }
      
      setTermAmounts(newAmounts);
    } else {
      // Remove term from selection
      const newSelectedTerms = selectedTerms.filter(term => term !== termNumber);
      setSelectedTerms(newSelectedTerms);
      
      // Update locked terms
      const newLockedTerms = newSelectedTerms.slice(0, -1);
      setLockedTerms(newLockedTerms);
      
      // Clear amount for removed term
      setTermAmounts(prev => {
        const newAmounts = { ...prev };
        delete newAmounts[termNumber];
        return newAmounts;
      });
    }
  };

  const handleTermAmountChange = (termNumber: number, value: string) => {
    // Only allow changes for the last selected term (not locked terms)
    const lastSelectedTerm = selectedTerms[selectedTerms.length - 1];
    if (termNumber !== lastSelectedTerm) {
      return; // Don't allow changes to locked terms
    }
    
    setTermAmounts(prev => {
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
    setIsValidating(true);
    
    const numAmount = parseFloat(value);
    const validation = PaymentValidator.validateAmount(numAmount, config.validationRules);
    
    let hasExceededAmount = false;
    
    // Check if amount exceeds outstanding balance for this term
    if (isCollege) {
      // For colleges, check against total tuition fee
      if (numAmount > feeBalances.tuitionFee.total) {
        validation.errors.push(`Amount cannot exceed total tuition fee of ${formatAmount(feeBalances.tuitionFee.total)}`);
        hasExceededAmount = true;
      }
    } else {
      // For schools, check against term-specific outstanding balance
      const termData = availableTerms.find(t => t.term === termNumber);
      if (termData && numAmount > termData.outstanding) {
        validation.errors.push(`Amount cannot exceed outstanding balance of ${formatAmount(termData.outstanding)}`);
        hasExceededAmount = true;
      }
    }
    
    // Clear error if amount is valid
    if (!hasExceededAmount && validation.errors.length === 0) {
      hasExceededAmount = false;
    }
    
    // Update term error state
    setTermErrors(prev => ({
      ...prev,
      [termNumber]: hasExceededAmount
    }));
    
    setErrors(validation.errors);
    setIsValidating(false);
  };

  const handleSubmit = () => {
    // Prevent duplicate submission
    if (isSubmitting) {
      return;
    }
    
    if (!isCollege && selectedTerms.length === 0) {
      setErrors(['Please select at least one term']);
      return;
    }
    
    if (isCollege && (!termAmounts[1] || isNaN(parseFloat(termAmounts[1])) || parseFloat(termAmounts[1]) <= 0)) {
      setErrors(['Please enter a valid amount']);
      return;
    }

    // Validate all selected terms
    const validationErrors: string[] = [];
    
    if (isCollege) {
      // For colleges, validate single payment
      const amount = termAmounts[1];
      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        validationErrors.push('Please enter a valid amount');
        return;
      }

      const numAmount = parseFloat(amount);
      const validation = PaymentValidator.validateAmount(numAmount, config.validationRules);
      if (!validation.isValid) {
        validationErrors.push(...validation.errors);
      }

      // Check if amount exceeds total tuition fee
      if (numAmount > feeBalances.tuitionFee.total) {
        validationErrors.push(`Amount cannot exceed total tuition fee of ${formatAmount(feeBalances.tuitionFee.total)}`);
      }
    } else {
      // For schools, validate term-based payments
      selectedTerms.forEach(termNumber => {
        const amount = termAmounts[termNumber];
        if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
          validationErrors.push(`Please enter a valid amount for Term ${termNumber}`);
          return;
        }

        const numAmount = parseFloat(amount);
        const validation = PaymentValidator.validateAmount(numAmount, config.validationRules);
        if (!validation.isValid) {
          validationErrors.push(...validation.errors.map(error => `Term ${termNumber}: ${error}`));
        }

        // Check if amount exceeds outstanding balance for this term
        const termData = availableTerms.find(t => t.term === termNumber);
        if (termData && numAmount > termData.outstanding) {
          validationErrors.push(`Term ${termNumber}: Amount cannot exceed outstanding balance of ${formatAmount(termData.outstanding)}`);
        }
      });
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Create payment items for each selected term
    const uniqueSelectedTerms = Array.from(new Set(selectedTerms)); // Remove duplicates
    setIsSubmitting(true);
    
    uniqueSelectedTerms.forEach(termNumber => {
      const amount = parseFloat(termAmounts[termNumber]);
      const paymentItem: PaymentItem = {
        id: `tuition-fee-term-${termNumber}-${Date.now()}-${Math.random()}`,
        purpose: 'TUITION_FEE',
        termNumber: termNumber,
        amount: amount,
        paymentMethod: paymentMethod
      };
      onAdd(paymentItem);
    });
    
    setIsSubmitting(false);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const isFormValid = (isCollege ? (termAmounts[1] && !isNaN(parseFloat(termAmounts[1])) && parseFloat(termAmounts[1]) > 0) : (selectedTerms.length > 0 && selectedTerms.every(term => {
    const amount = termAmounts[term];
    return amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;
  }))) && errors.length === 0;

  // Helper function to determine if a term can be selected
  const canSelectTerm = (termNumber: number): boolean => {
    const term = availableTerms.find(t => t.term === termNumber);
    if (!term) return false;
    
    // Can't select if already paid or no outstanding amount
    if (term.paid || term.outstanding <= 0) return false;
    
    // For sequential selection, check if previous terms are either:
    // 1. Already paid (no outstanding balance), OR
    // 2. Selected in current session
    if (termNumber > 1) {
      for (let prevTermNum = 1; prevTermNum < termNumber; prevTermNum++) {
        const prevTerm = availableTerms.find(t => t.term === prevTermNum);
        if (prevTerm) {
          // If previous term has outstanding balance and is not selected, can't select current term
          if (prevTerm.outstanding > 0 && !prevTerm.paid && !selectedTerms.includes(prevTermNum)) {
            return false;
          }
        }
      }
    }
    
    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-green-600" />
            Tuition Fee Payment
          </DialogTitle>
          <DialogDescription className="font-semibold">
            Add tuition fee payment for {student.name} ({student.admissionNo})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">

          {/* College Single Payment */}
          {isCollege ? (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-800 mb-2">Tuition Fee Information</h3>
                <div className="text-sm text-blue-700">
                  <p>Total Tuition Fee: <strong>{formatAmount(feeBalances.tuitionFee.total)}</strong></p>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tuition-amount" className="text-sm font-medium">
                  Payment Amount *
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ₹
                  </span>
                  <Input
                    id="tuition-amount"
                    type="text"
                    placeholder="Enter amount"
                    value={termAmounts[1] || ''}
                    onChange={(e) => handleTermAmountChange(1, e.target.value)}
                    className={`pl-8 ${termErrors[1] ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                  />
                </div>
                <p className="text-xs text-gray-500">
                  Maximum amount: {formatAmount(feeBalances.tuitionFee.total)}
                </p>
                {termErrors[1] && (
                  <p className="text-xs text-red-500 mt-1">
                    Amount cannot exceed total tuition fee of {formatAmount(feeBalances.tuitionFee.total)}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <>
              {/* Term Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Select Terms *</Label>
                
                {!hasOutstandingPayments ? (
              <div className="text-center py-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-green-100 rounded-full">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="text-center">
                    <h3 className="text-lg font-semibold text-green-800 mb-2">
                      {allTermsPaid ? 'All Tuition Fees Paid!' : 'No Outstanding Tuition Fees'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {allTermsPaid 
                        ? 'All tuition fee terms have been paid in full.'
                        : 'There are no outstanding tuition fee payments for this student.'
                      }
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {availableTerms.map((term) => (
                  <div key={term.term} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Checkbox
                          id={`term-${term.term}`}
                          checked={selectedTerms.includes(term.term)}
                          onCheckedChange={(checked) => handleTermSelection(term.term, checked as boolean)}
                          disabled={!canSelectTerm(term.term)}
                        />
                      <Label htmlFor={`term-${term.term}`} className="flex items-center gap-2">
                        <span className="font-medium">Term {term.term}</span>
                        {selectedTerms.includes(term.term) && (
                          <Badge 
                            variant={lockedTerms.includes(term.term) ? "secondary" : "default"}
                            className={`text-xs ${
                              lockedTerms.includes(term.term) 
                                ? 'bg-gray-200 text-gray-600' 
                                : 'bg-green-100 text-green-700'
                            }`}
                          >
                            {lockedTerms.includes(term.term) ? 'Locked' : 'Editable'}
                          </Badge>
                        )}
                        {term.paid && (
                          <Badge variant="secondary" className="text-xs">
                            Paid
                          </Badge>
                        )}
                        {term.outstanding <= 0 && !term.paid && (
                          <Badge variant="outline" className="text-xs text-gray-500">
                            No Outstanding
                          </Badge>
                        )}
                        {term.term > 1 && !canSelectTerm(term.term) && term.outstanding > 0 && !term.paid && (
                          <Badge variant="outline" className="text-xs text-orange-500">
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
                      <Label htmlFor={`amount-term-${term.term}`} className="text-sm font-medium">
                        Payment Amount for Term {term.term} *
                        {lockedTerms.includes(term.term) && (
                          <span className="text-xs text-gray-500 ml-2">(Locked - Full Amount)</span>
                        )}
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                          ₹
                        </span>
                        <Input
                          id={`amount-term-${term.term}`}
                          type="text"
                          placeholder="Enter amount"
                          value={termAmounts[term.term] || ''}
                          onChange={(e) => {
                            handleTermAmountChange(term.term, e.target.value);
                          }}
                          disabled={lockedTerms.includes(term.term)}
                          className={`pl-8 ${lockedTerms.includes(term.term) ? 'bg-gray-100 cursor-not-allowed' : ''} ${termErrors[term.term] ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
                        />
                      </div>
                      {lockedTerms.includes(term.term) && (
                        <p className="text-xs text-gray-500">
                          This term is locked with the full outstanding amount
                        </p>
                      )}
                      {!lockedTerms.includes(term.term) && (
                        <p className="text-xs text-gray-500">
                          Maximum amount: {formatAmount(term.outstanding)}
                        </p>
                      )}
                      {termErrors[term.term] && (
                        <p className="text-xs text-red-500 mt-1">
                          Amount cannot exceed outstanding balance of {formatAmount(term.outstanding)}
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

          {/* Payment Method */}
          <div className="space-y-2">
            <Label htmlFor="payment-method" className="text-sm font-medium">
              Payment Method *
            </Label>
            <Select value={paymentMethod} onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}>
              <SelectTrigger id="payment-method">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Warning Message */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Important:</strong> Terms must be paid sequentially (1 → 2 → 3). Previous terms that are already paid or have no outstanding balance can be skipped.
              {selectedTerms.length > 0 && (
                <span className="block mt-1">
                  Selected Terms: {selectedTerms.map(term => `Term ${term}`).join(', ')} - Total Outstanding: <strong>{formatAmount(selectedTerms.reduce((sum, term) => sum + (availableTerms.find(t => t.term === term)?.outstanding || 0), 0))}</strong>
                </span>
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
              disabled={!isFormValid}
              className="flex-1 gap-2"
            >
              <GraduationCap className="h-4 w-4" />
              Add {selectedTerms.length} Term Payment{selectedTerms.length > 1 ? 's' : ''}
            </Button>
            ) : (
              <Button
                onClick={onCancel}
                className="flex-1 gap-2"
              >
                <CheckCircle2 className="h-4 w-4" />
                Close
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TuitionFeeComponent;
