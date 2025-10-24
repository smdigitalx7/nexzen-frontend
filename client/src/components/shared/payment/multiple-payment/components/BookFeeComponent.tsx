/**
 * Book Fee Component
 * Handles book fee payment input for multiple payment form
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, AlertCircle, CheckCircle } from 'lucide-react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PaymentValidator } from '../../validation/PaymentValidation';
import type { PurposeSpecificComponentProps, PaymentItem, PaymentMethod } from '../../types/PaymentTypes';

const paymentMethodOptions: Array<{ value: PaymentMethod; label: string }> = [
  { value: 'CASH', label: 'Cash' },
  { value: 'ONLINE', label: 'Online' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'DD', label: 'Demand Draft' }
];

export const BookFeeComponent: React.FC<PurposeSpecificComponentProps> = ({
  student,
  feeBalances,
  config,
  onAdd,
  onCancel
}) => {
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [errors, setErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  // Get book fee outstanding amount
  const outstandingAmount = feeBalances.bookFee.outstanding;

  useEffect(() => {
    // Pre-fill with outstanding amount if available
    if (outstandingAmount > 0) {
      setAmount(outstandingAmount.toString());
    }
  }, [outstandingAmount]);

  const handleAmountChange = (value: string) => {
    setAmount(value);
    validateAmount(value);
  };

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            Book Fee Payment
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Student Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Student:</span>
                <span className="ml-2 font-medium">{student.name}</span>
              </div>
              <div>
                <span className="text-gray-600">Admission No:</span>
                <span className="ml-2 font-medium">{student.admissionNo}</span>
              </div>
              <div>
                <span className="text-gray-600">Class:</span>
                <span className="ml-2 font-medium">{student.className}</span>
              </div>
              <div>
                <span className="text-gray-600">Academic Year:</span>
                <span className="ml-2 font-medium">{student.academicYear}</span>
              </div>
            </div>
          </div>

          {/* Fee Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">Book Fee Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
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

          {/* Amount Input */}
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm font-medium">
              Payment Amount *
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                ₹
              </span>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="pl-8"
                min="1"
                max={config.validationRules.amountRange.max}
                step="0.01"
              />
            </div>
            
            {/* Amount validation feedback */}
            <div className="flex items-center gap-2 text-xs">
              {isValidating ? (
                <div className="flex items-center gap-1 text-gray-500">
                  <div className="w-3 h-3 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                  Validating...
                </div>
              ) : errors.length > 0 ? (
                <div className="flex items-center gap-1 text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {errors[0]}
                </div>
              ) : amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 ? (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  Amount is valid
                </div>
              ) : null}
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
              <strong>Important:</strong> Book fee must be paid in full in a single transaction.
              {outstandingAmount > 0 && (
                <span className="block mt-1">
                  Outstanding amount: <strong>{formatAmount(outstandingAmount)}</strong>
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
            
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid}
              className="flex-1 gap-2"
            >
              <BookOpen className="h-4 w-4" />
              Add to Payment
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default BookFeeComponent;
