/**
 * Other Component
 * Handles custom purpose payment input for multiple payment form
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, AlertCircle, CheckCircle } from 'lucide-react';
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

export const OtherComponent: React.FC<PurposeSpecificComponentProps> = ({
  student,
  feeBalances,
  config,
  onAdd,
  onCancel
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

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const isFormValid = customPurposeName.trim() && amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && errors.length === 0;

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
            <Plus className="h-5 w-5 text-purple-600" />
            Custom Payment
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
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
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
                  <div className="w-3 h-3 border-2 border-gray-300 border-t-purple-600 rounded-full animate-spin"></div>
                  Validating...
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
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default OtherComponent;
