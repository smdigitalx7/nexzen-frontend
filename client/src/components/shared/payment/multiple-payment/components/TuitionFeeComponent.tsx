/**
 * Tuition Fee Component
 * Handles tuition fee payment input for multiple payment form
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, AlertCircle, CheckCircle, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { PaymentValidator, getAvailableTerms } from '../../validation/PaymentValidation';
import type { PurposeSpecificComponentProps, PaymentItem, PaymentMethod } from '../../types/PaymentTypes';

const paymentMethodOptions: Array<{ value: PaymentMethod; label: string }> = [
  { value: 'CASH', label: 'Cash' },
  { value: 'ONLINE', label: 'Online' },
  { value: 'CHEQUE', label: 'Cheque' },
  { value: 'DD', label: 'Demand Draft' }
];

export const TuitionFeeComponent: React.FC<PurposeSpecificComponentProps> = ({
  student,
  feeBalances,
  config,
  onAdd,
  onCancel
}) => {
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [errors, setErrors] = useState<string[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  // Get available terms for tuition fee
  const availableTerms = getAvailableTerms('TUITION_FEE', feeBalances, config.institutionType);

  useEffect(() => {
    // Pre-select first available term
    const firstAvailable = availableTerms.find(term => term.available);
    if (firstAvailable) {
      setSelectedTerm(firstAvailable.term);
      setAmount(firstAvailable.outstanding.toString());
    }
  }, [availableTerms]);

  useEffect(() => {
    // Update amount when term changes
    if (selectedTerm) {
      const termData = availableTerms.find(term => term.term === selectedTerm);
      if (termData && termData.outstanding > 0) {
        setAmount(termData.outstanding.toString());
      }
    }
  }, [selectedTerm, availableTerms]);

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
    if (!selectedTerm) {
      setErrors(['Please select a term']);
      return;
    }

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
      id: `tuition-fee-term-${selectedTerm}-${Date.now()}`,
      purpose: 'TUITION_FEE',
      termNumber: selectedTerm,
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

  const isFormValid = selectedTerm && amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0 && errors.length === 0;

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
            <GraduationCap className="h-5 w-5 text-green-600" />
            Tuition Fee Payment
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

          {/* Term Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Select Term *</Label>
            <RadioGroup
              value={selectedTerm?.toString() || ''}
              onValueChange={(value) => setSelectedTerm(parseInt(value))}
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              {availableTerms.map((term) => (
                <div key={term.term} className="relative">
                  <Label
                    htmlFor={`term-${term.term}`}
                    className={`flex items-center space-x-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                      term.available
                        ? 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                        : 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-60'
                    } ${
                      selectedTerm === term.term
                        ? 'border-green-500 bg-green-50'
                        : ''
                    }`}
                  >
                    <RadioGroupItem
                      value={term.term.toString()}
                      id={`term-${term.term}`}
                      disabled={!term.available}
                      className="sr-only"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Term {term.term}</span>
                        {term.paid && (
                          <Badge variant="secondary" className="text-xs">
                            Paid
                          </Badge>
                        )}
                        {!term.available && !term.paid && (
                          <Lock className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Outstanding: {formatAmount(term.outstanding)}
                      </div>
                    </div>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Term Status */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-800 mb-2">Term Status</h3>
            <div className="space-y-2 text-sm">
              {availableTerms.map((term) => (
                <div key={term.term} className="flex items-center justify-between">
                  <span className="text-blue-600">Term {term.term}:</span>
                  <div className="flex items-center gap-2">
                    {term.paid ? (
                      <Badge variant="secondary" className="text-xs">
                        Paid ({formatAmount(term.outstanding)})
                      </Badge>
                    ) : term.available ? (
                      <Badge variant="outline" className="text-xs text-green-600 border-green-300">
                        Available ({formatAmount(term.outstanding)})
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-xs text-gray-500">
                        Not Available
                      </Badge>
                    )}
                  </div>
                </div>
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
                  <div className="w-3 h-3 border-2 border-gray-300 border-t-green-600 rounded-full animate-spin"></div>
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
              <strong>Important:</strong> Terms must be paid sequentially ({config.institutionType === 'college' ? '1 → 2 → 3' : '1 → 2'}).
              {selectedTerm && (
                <span className="block mt-1">
                  Selected Term {selectedTerm} outstanding: <strong>{formatAmount(availableTerms.find(t => t.term === selectedTerm)?.outstanding || 0)}</strong>
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
              <GraduationCap className="h-4 w-4" />
              Add to Payment
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TuitionFeeComponent;
