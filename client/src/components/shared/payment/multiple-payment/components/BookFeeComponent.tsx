/**
 * Book Fee Component - Inline Version
 * Handles book fee payment input inline (no modal)
 */

import React, { useState, useEffect } from 'react';
import { BookOpen, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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

  // Get book fee outstanding amount
  const outstandingAmount = feeBalances.bookFee.outstanding;

  useEffect(() => {
    // Always set amount to full outstanding amount - no custom amounts allowed
    if (outstandingAmount > 0) {
      setAmount(outstandingAmount.toString());
    }
  }, [outstandingAmount]);

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
    // Reset form after adding
    setAmount('');
    setPaymentMethod('CASH');
    setErrors([]);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  if (!isOpen || outstandingAmount <= 0) {
    return null;
  }

  const isFormValid = amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && errors.length === 0;

  return (
    <Card className="border border-gray-200 shadow-sm">
      <CardContent className="p-3">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between pb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              <Label className="text-sm font-semibold text-gray-900">Book Fee Payment</Label>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
            >
              ×
            </Button>
          </div>

          {/* Fee Info - Compact */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-gray-50 rounded border border-gray-200">
              <p className="text-gray-500 mb-0.5">Total</p>
              <p className="font-semibold text-gray-900">{formatAmount(feeBalances.bookFee.total)}</p>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded border border-gray-200">
              <p className="text-gray-500 mb-0.5">Paid</p>
              <p className="font-semibold text-blue-600">{formatAmount(feeBalances.bookFee.paid)}</p>
            </div>
            <div className="text-center p-2 bg-red-50 rounded border border-red-200">
              <p className="text-gray-600 mb-0.5 font-medium">Outstanding</p>
              <p className="font-semibold text-red-600">{formatAmount(feeBalances.bookFee.outstanding)}</p>
            </div>
          </div>

          {/* Amount Input - Read-only */}
          <div className="space-y-1.5">
            <Label htmlFor="amount" className="text-xs font-medium text-gray-700">
              Payment Amount <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-600 text-sm">₹</span>
              <Input
                id="amount"
                type="text"
                value={amount}
                disabled={true}
                className="pl-7 pr-2 h-9 bg-gray-50 border-gray-300 text-gray-900 font-medium text-sm"
                readOnly
              />
            </div>
            <p className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Full outstanding balance
            </p>
          </div>

          {/* Payment Method */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-gray-700">
              Payment Method <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
              className="grid grid-cols-2 gap-2"
            >
              {paymentMethodOptions.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-center gap-2 p-2 border rounded cursor-pointer transition-colors text-sm ${
                    paymentMethod === option.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <span className={`font-medium ${paymentMethod === option.value ? 'text-blue-700' : 'text-gray-700'}`}>
                    {option.label}
                  </span>
                </label>
              ))}
            </RadioGroup>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="text-xs text-red-600">
              {errors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}

          {/* Action Button */}
          <Button
            onClick={handleSubmit}
            disabled={!isFormValid}
            className="w-full h-9 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
          >
            <BookOpen className="h-4 w-4 mr-1.5" />
            Add to Payment
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default BookFeeComponent;
