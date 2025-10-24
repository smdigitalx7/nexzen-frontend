/**
 * Book Fee Component
 * Handles book fee payment input for multiple payment form
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, AlertCircle, CheckCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
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
import { PaymentValidator } from '../../validation/PaymentValidation';
import type { PurposeSpecificComponentProps, PaymentItem, PaymentMethod } from '../../types/PaymentTypes';

const paymentMethodOptions: Array<{ value: PaymentMethod; label: string }> = [
  { value: 'CASH', label: 'Cash' },
  { value: 'ONLINE', label: 'Online' }
];

interface BookFeeComponentProps extends PurposeSpecificComponentProps {
  isOpen: boolean;
}

export const BookFeeComponent: React.FC<BookFeeComponentProps> = ({
  student,
  feeBalances,
  config,
  onAdd,
  onCancel,
  isOpen
}) => {
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [errors, setErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  // Get book fee outstanding amount
  const outstandingAmount = feeBalances.bookFee.outstanding;

  useEffect(() => {
    // Always set amount to full outstanding amount - no custom amounts allowed
    if (outstandingAmount > 0) {
      setAmount(outstandingAmount.toString());
    }
  }, [outstandingAmount]);

  // Remove custom amount change handlers - book fee must be paid in full

  const validateAmount = (value: string) => {
    setIsValidating(true);
    
    const numAmount = parseFloat(value);
    const validation = PaymentValidator.validateAmount(numAmount, config.validationRules);
    
    setErrors(validation.errors);
    setIsValidating(false);
  };

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrors(['Please enter a valid amount']);
      return;
    }

    const validation = PaymentValidator.validateAmount(numAmount, config.validationRules);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    const paymentItem: PaymentItem = {
      id: `book-fee-${Date.now()}`,
      purpose: 'BOOK_FEE',
      amount: numAmount,
      paymentMethod: paymentMethod
    };

    onAdd(paymentItem);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const isFormValid = amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && errors.length === 0;

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Book Fee Payment
          </DialogTitle>
          <DialogDescription className="font-semibold">
            Add book fee payment for {student.name} ({student.admissionNo})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">

          {/* Fee Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">Book Fee Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-blue-600">Total Fee:</span>
                <span className="ml-2 font-medium">{formatAmount(feeBalances.bookFee.total)}</span>
              </div>
              <div>
                <span className="text-blue-600">Paid:</span>
                <span className="ml-2 font-medium">{formatAmount(feeBalances.bookFee.paid)}</span>
              </div>
              <div>
                <span className="text-blue-600">Outstanding:</span>
                <span className="ml-2 font-medium text-red-600">{formatAmount(feeBalances.bookFee.outstanding)}</span>
              </div>
            </div>
          </div>

          {outstandingAmount > 0 ? (
            <>
              {/* Amount Input */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium">
                  Payment Amount * <span className="text-xs text-gray-500">(Fixed - Full Outstanding Amount)</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    ₹
                  </span>
                  <Input
                    id="amount"
                    type="text"
                    placeholder="Enter amount"
                    value={amount}
                    disabled={true}
                    className="pl-8 bg-gray-100 cursor-not-allowed"
                  />
                </div>
                
                {/* Amount validation feedback */}
                <div className="flex items-center gap-2 text-xs">
                  <div className="flex items-center gap-1 text-blue-600">
                    <CheckCircle className="h-3 w-3" />
                    Amount automatically set to full outstanding balance
                  </div>
                </div>
              </div>

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
                  <strong>Important:</strong> Book fee must be paid in full in a single transaction. Custom amounts are not allowed.
                  {outstandingAmount > 0 && (
                    <span className="block mt-1">
                      Payment amount is automatically set to: <strong>{formatAmount(outstandingAmount)}</strong>
                    </span>
                  )}
                </AlertDescription>
              </Alert>
            </>
          ) : (
            <div className="text-center py-8">
              <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-green-100 rounded-full">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-green-800 mb-2">
                    Book Fee Already Paid!
                  </h3>
                  <p className="text-sm text-gray-600">
                    The book fee has been paid in full for this student.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancel
            </Button>
            
            {outstandingAmount > 0 ? (
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid}
                className="flex-1 gap-2"
              >
                <BookOpen className="h-4 w-4" />
                Add to Payment
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

export default BookFeeComponent;
