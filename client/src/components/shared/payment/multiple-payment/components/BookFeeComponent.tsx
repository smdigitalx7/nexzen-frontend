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
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-blue-200 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
          <DialogTitle className="flex items-center gap-2 text-lg text-gray-900">
            <div className="p-2 bg-blue-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            Book Fee Payment
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-2">
            Add book fee payment for <span className="font-medium text-gray-900">{student.name}</span> ({student.admissionNo})
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
          <div className="space-y-5">

          {/* Fee Information - Enhanced */}
          <div className="border border-blue-200 rounded-lg p-5 bg-gradient-to-br from-blue-50 to-indigo-50">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-600" />
              Book Fee Information
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
                <p className="text-xs text-gray-500 mb-1.5">Total Fee</p>
                <p className="font-semibold text-gray-900 text-sm">{formatAmount(feeBalances.bookFee.total)}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-blue-100">
                <p className="text-xs text-gray-500 mb-1.5">Paid</p>
                <p className="font-semibold text-blue-600 text-sm">{formatAmount(feeBalances.bookFee.paid)}</p>
              </div>
              <div className="text-center p-3 bg-white rounded-lg border border-red-200 bg-red-50/30">
                <p className="text-xs text-gray-600 mb-1.5 font-medium">Outstanding</p>
                <p className="font-semibold text-red-600 text-sm">{formatAmount(feeBalances.bookFee.outstanding)}</p>
              </div>
            </div>
          </div>

          {outstandingAmount > 0 ? (
            <>
              {/* Amount Input - Enhanced */}
              <div className="space-y-2">
                <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                  Payment Amount <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 font-medium">
                    ₹
                  </span>
                  <Input
                    id="amount"
                    type="text"
                    placeholder="Enter amount"
                    value={amount}
                    disabled={true}
                    className="pl-8 bg-blue-50/50 border-blue-300 text-gray-900 font-semibold cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-green-600 flex items-center gap-1.5 font-medium">
                  <CheckCircle className="h-3.5 w-3.5" />
                  Amount automatically set to full outstanding balance
                </p>
              </div>

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
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment-method"
                        value={option.value}
                        checked={paymentMethod === option.value}
                        onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                        className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className={`font-medium ${paymentMethod === option.value ? 'text-blue-700' : 'text-gray-700'}`}>
                        {option.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
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

          {/* Action Buttons - Enhanced */}
          <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
            {outstandingAmount > 0 ? (
              <>
                <Button
                  onClick={handleSubmit}
                  disabled={!isFormValid}
                  className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md"
                  size="lg"
                >
                  <BookOpen className="h-5 w-5" />
                  Add to Payment
                </Button>
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="w-full border-gray-300 hover:bg-gray-50"
                >
                  Cancel
                </Button>
              </>
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

export default BookFeeComponent;
