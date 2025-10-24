/**
 * Payment Summary Component
 * Displays payment summary and handles form submission
 */

import React from 'react';
import { motion } from 'framer-motion';
import { CreditCard, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { PaymentSummaryProps, PaymentMethod } from '../../types/PaymentTypes';

const paymentMethodOptions: Array<{ value: PaymentMethod; label: string; description: string }> = [
  {
    value: 'CASH',
    label: 'Cash',
    description: 'Cash payment'
  },
  {
    value: 'ONLINE',
    label: 'Online',
    description: 'Online payment (UPI, Card, Net Banking)'
  },
  {
    value: 'CHEQUE',
    label: 'Cheque',
    description: 'Cheque payment'
  },
  {
    value: 'DD',
    label: 'Demand Draft',
    description: 'Demand Draft payment'
  }
];

export const PaymentSummary: React.FC<PaymentSummaryProps> = ({
  totalAmount,
  paymentMethod,
  remarks,
  onPaymentMethodChange,
  onRemarksChange,
  onSubmit,
  onCancel,
  isSubmitting,
  disabled
}) => {
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const selectedPaymentMethod = paymentMethodOptions.find(
    option => option.value === paymentMethod
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Payment Summary
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Total Amount Display */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-medium text-gray-700">
              Total Amount
            </span>
            <span className="text-2xl font-bold text-gray-900">
              {formatAmount(totalAmount)}
            </span>
          </div>
        </div>

        {/* Payment Method Selection */}
        <div className="space-y-2">
          <Label htmlFor="payment-method" className="text-sm font-medium">
            Payment Method
          </Label>
          <Select
            value={paymentMethod}
            onValueChange={(value: PaymentMethod) => onPaymentMethodChange(value)}
            disabled={isSubmitting}
          >
            <SelectTrigger id="payment-method">
              <SelectValue placeholder="Select payment method" />
            </SelectTrigger>
            <SelectContent>
              {paymentMethodOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex flex-col">
                    <span className="font-medium">{option.label}</span>
                    <span className="text-xs text-gray-500">
                      {option.description}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Remarks */}
        <div className="space-y-2">
          <Label htmlFor="remarks" className="text-sm font-medium">
            Remarks (Optional)
          </Label>
          <Textarea
            id="remarks"
            placeholder="Add any additional notes or remarks..."
            value={remarks}
            onChange={(e) => onRemarksChange(e.target.value)}
            disabled={isSubmitting}
            rows={3}
            className="resize-none"
          />
        </div>

        {/* Payment Method Info */}
        {selectedPaymentMethod && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-3"
          >
            <div className="flex items-start gap-2">
              <CreditCard className="h-4 w-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-800">
                  Selected: {selectedPaymentMethod.label}
                </p>
                <p className="text-blue-600">
                  {selectedPaymentMethod.description}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          
          <Button
            onClick={onSubmit}
            disabled={disabled || isSubmitting || totalAmount <= 0}
            className="flex-1 gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Submit Payment
              </>
            )}
          </Button>
        </div>

        {/* Submission Info */}
        {isSubmitting && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-3"
          >
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Processing your payment. Please wait...</span>
            </div>
          </motion.div>
        )}

        {/* Validation Info */}
        {disabled && totalAmount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-50 border border-yellow-200 rounded-lg p-3"
          >
            <div className="text-sm text-yellow-800">
              Please resolve validation errors before submitting the payment.
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentSummary;
