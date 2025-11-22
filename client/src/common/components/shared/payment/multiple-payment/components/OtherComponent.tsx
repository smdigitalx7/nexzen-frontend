/**
 * Other Component
 * Handles custom purpose payment input for multiple payment form
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/common/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Label } from '@/common/components/ui/label';
import { Input } from '@/common/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/common/components/ui/dialog';
import { Alert, AlertDescription } from '@/common/components/ui/alert';
import { Loader } from '@/common/components/ui/ProfessionalLoader';
import { RadioGroup, RadioGroupItem } from '@/common/components/ui/radio-group';
import { PaymentValidator } from '../../validation/PaymentValidation';
import {
  PAYMENT_METHOD_OPTIONS,
  calculateCardCharges,
  calculateTotalWithCardCharges,
  formatAmount,
} from '../../utils/paymentUtils';
import type { PurposeSpecificComponentProps, PaymentItem, PaymentMethod } from '../../types/PaymentTypes';

const commonPurposes = [
  'Library Fine',
  'Sports Equipment Fee',
  'Laboratory Fee',
  'Computer Fee',
  'Development Fee',
  'Maintenance Fee',
  'Examination Fee',
  'Late Fee',
  'Miscellaneous Fee',
  'Other'
];

interface OtherComponentProps extends PurposeSpecificComponentProps {
  isOpen: boolean;
}

export const OtherComponent: React.FC<OtherComponentProps> = ({
  student,
  feeBalances,
  config,
  onAdd,
  onCancel,
  isOpen
}) => {
  const [customPurposeName, setCustomPurposeName] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [errors, setErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const handleAmountChange = (value: string) => {
    setAmount(value);
    validateAmount(value);
  };

  const handleCustomPurposeChange = (value: string) => {
    setCustomPurposeName(value);
    validateCustomPurpose(value);
  };

  const validateAmount = (value: string) => {
    setIsValidating(true);
    
    const numAmount = parseFloat(value);
    const validation = PaymentValidator.validateAmount(numAmount, config.validationRules);
    
    setErrors(prev => prev.filter(error => !error.includes('amount')).concat(validation.errors));
    setIsValidating(false);
  };

  const validateCustomPurpose = (value: string) => {
    const validation = PaymentValidator.validateCustomPurposeName('OTHER', value);
    setErrors(prev => prev.filter(error => !error.includes('purpose')).concat(validation.errors));
  };

  const handleSubmit = () => {
    const numAmount = parseFloat(amount);
    
    if (!customPurposeName.trim()) {
      setErrors(['Custom purpose name is required']);
      return;
    }

    if (isNaN(numAmount) || numAmount <= 0) {
      setErrors(['Please enter a valid amount']);
      return;
    }

    const amountValidation = PaymentValidator.validateAmount(numAmount, config.validationRules);
    const purposeValidation = PaymentValidator.validateCustomPurposeName('OTHER', customPurposeName);
    
    const allErrors = [...amountValidation.errors, ...purposeValidation.errors];
    
    if (allErrors.length > 0) {
      setErrors(allErrors);
      return;
    }

    const paymentItem: PaymentItem = {
      id: `other-${Date.now()}`,
      purpose: 'OTHER',
      customPurposeName: customPurposeName.trim(),
      amount: numAmount,
      paymentMethod: paymentMethod
    };

    onAdd(paymentItem);
  };


  const isFormValid = customPurposeName.trim() && amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && errors.length === 0;

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-gray-200">
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-purple-600" />
            Custom Payment
          </DialogTitle>
          <DialogDescription className="font-semibold">
            Add custom purpose payment for {student.name} ({student.admissionNo})
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
          <div className="space-y-6">

          {/* Custom Purpose Name */}
          <div className="space-y-2">
            <Label htmlFor="custom-purpose" className="text-sm font-medium">
              Custom Purpose Name *
            </Label>
            <Input
              id="custom-purpose"
              placeholder="Enter custom purpose (e.g., Library Fine, Sports Equipment Fee)"
              value={customPurposeName}
              onChange={(e) => handleCustomPurposeChange(e.target.value)}
              maxLength={100}
            />
            
            {/* Purpose validation feedback */}
            <div className="flex items-center gap-2 text-xs">
              {customPurposeName && customPurposeName.trim().length >= 3 ? (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-3 w-3" />
                  Purpose name is valid
                </div>
              ) : customPurposeName && customPurposeName.trim().length < 3 ? (
                <div className="flex items-center gap-1 text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  Purpose name must be at least 3 characters
                </div>
              ) : null}
            </div>
          </div>

          {/* Common Purposes Suggestions */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Common Purposes</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {commonPurposes.map((purpose) => (
                <Button
                  key={purpose}
                  variant="outline"
                  size="sm"
                  onClick={() => setCustomPurposeName(purpose)}
                  className="text-xs h-8"
                >
                  {purpose}
                </Button>
              ))}
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
                    type="text"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => handleAmountChange(e.target.value)}
                    className="pl-8"
                  />
            </div>
            
            {/* Amount validation feedback */}
            <div className="flex items-center gap-2 text-xs">
              {isValidating ? (
                <div className="flex items-center gap-1 text-gray-500">
                  <Loader.Button size="xs" />
                  <span>Validating...</span>
                </div>
              ) : errors.some(error => error.includes('amount')) ? (
                <div className="flex items-center gap-1 text-red-600">
                  <AlertCircle className="h-3 w-3" />
                  {errors.find(error => error.includes('amount'))}
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
            <Label className="text-sm font-medium">
              Payment Method <span className="text-red-500">*</span>
            </Label>
            <RadioGroup
              value={paymentMethod}
              onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}
              className="grid grid-cols-3 gap-3"
            >
              {PAYMENT_METHOD_OPTIONS.map((option) => {
                const isSelected = paymentMethod === option.value;
                const colorClasses = {
                  green: isSelected
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 hover:border-green-300 hover:bg-green-50/30',
                  blue: isSelected
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/30',
                  purple: isSelected
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50/30',
                };
                return (
                  <label
                    key={option.value}
                    className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      colorClasses[option.color as keyof typeof colorClasses]
                    }`}
                  >
                    <div className="flex items-center gap-2.5 w-full">
                      <RadioGroupItem value={option.value} id={option.value} />
                      <span className="text-2xl">{option.icon}</span>
                      <span
                        className={`font-semibold flex-1 ${
                          isSelected
                            ? option.color === 'green'
                              ? 'text-green-700'
                              : option.color === 'blue'
                                ? 'text-blue-700'
                                : 'text-purple-700'
                            : 'text-gray-700'
                        }`}
                      >
                        {option.label}
                      </span>
                    </div>
                    <span
                      className={`text-xs ${
                        isSelected
                          ? option.color === 'green'
                            ? 'text-green-600'
                            : option.color === 'blue'
                              ? 'text-blue-600'
                              : 'text-purple-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {option.description}
                    </span>
                  </label>
                );
              })}
            </RadioGroup>
            
            {/* Card Charges Display */}
            {paymentMethod === 'CARD' && parseFloat(amount) > 0 && (
              <div className="border border-purple-200 bg-purple-50/50 rounded-lg p-4 space-y-2 mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-semibold text-purple-800">Card Processing Charges</span>
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Base Amount:</span>
                    <span className="font-medium text-gray-900">{formatAmount(parseFloat(amount))}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Processing Charges (1.2%):</span>
                    <span className="font-medium text-purple-700">
                      +{formatAmount(calculateCardCharges(parseFloat(amount)))}
                    </span>
                  </div>
                  <div className="h-px bg-purple-200"></div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="font-semibold text-purple-900">Total Amount:</span>
                    <span className="text-lg font-bold text-purple-900">
                      {formatAmount(calculateTotalWithCardCharges(parseFloat(amount)))}
                    </span>
                  </div>
                  <p className="text-xs text-purple-600 mt-2 italic">
                    Note: Charges shown for display only. Payment amount: {formatAmount(parseFloat(amount))}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Error Messages */}
          {errors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {errors.map((error, index) => (
                    <div key={index} className="text-sm">
                      {error}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Info Message */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Note:</strong> This is a custom payment for purposes not covered by standard fees.
              Make sure to enter a clear and descriptive purpose name.
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
              <Plus className="h-4 w-4" />
              Add to Payment
            </Button>
          </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OtherComponent;
