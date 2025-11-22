/**
 * Payment Summary Component
 * Displays payment summary and handles form submission
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Loader } from '@/common/components/ui/ProfessionalLoader';
import { Button } from '@/common/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Label } from '@/common/components/ui/label';
import { Textarea } from '@/common/components/ui/textarea';
import { Checkbox } from '@/common/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/common/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/common/components/ui/select';
import type { PaymentSummaryProps, PaymentMethod } from '../types/PaymentTypes';

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
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [isAcknowledged, setIsAcknowledged] = useState(false);
  
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

  const handleSubmitClick = () => {
    setIsAcknowledged(false); // Reset checkbox when opening dialog
    setShowConfirmationDialog(true);
  };

  const handleConfirmPayment = () => {
    if (!isAcknowledged) return; // Don't proceed if not acknowledged
    setShowConfirmationDialog(false);
    setIsAcknowledged(false);
    onSubmit();
  };

  const handleCancelConfirmation = () => {
    setShowConfirmationDialog(false);
    setIsAcknowledged(false);
  };

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
            onClick={handleSubmitClick}
            disabled={disabled || isSubmitting || totalAmount <= 0}
            className="flex-1 gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader.Button size="sm" className="mr-2" />
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
              <Loader.Button size="xs" />
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

      {/* Confirmation Dialog */}
      <Dialog 
        open={showConfirmationDialog} 
        onOpenChange={(open) => {
          if (!isSubmitting) {
            setShowConfirmationDialog(open);
            if (!open) {
              setIsAcknowledged(false);
            }
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader className="pb-4">
            <DialogTitle className="flex items-center gap-2.5 text-xl font-semibold text-gray-900">
              <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
              Confirm Payment
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 mt-1.5">
              Please review your payment details before proceeding.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Payment Summary */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-lg p-5 border border-gray-200/60">
              <div className="space-y-3">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-medium text-gray-700">Total Amount</span>
                  <span className="text-2xl font-bold text-gray-900 tracking-tight">
                    {formatAmount(totalAmount)}
                  </span>
                </div>
                <div className="h-px bg-gray-200"></div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-600">Payment Method</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {selectedPaymentMethod?.label}
                  </span>
                </div>
                {remarks && (
                  <div className="flex justify-between items-start gap-2 pt-1">
                    <span className="text-sm font-medium text-gray-600">Remarks</span>
                    <span className="text-sm text-gray-900 text-right leading-relaxed">{remarks}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-amber-50/80 border border-amber-200/60 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-amber-900">Important Note</p>
                  <p className="text-sm text-amber-800 leading-relaxed">
                    Please verify that the amount being processed ({formatAmount(totalAmount)}) matches the amount collected from the student. This action will process the payment and cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            {/* Acknowledgment Checkbox */}
            <div className="flex items-start gap-3 p-4 bg-gray-50/80 rounded-lg border border-gray-200/60">
              <Checkbox
                id="acknowledge"
                checked={isAcknowledged}
                onCheckedChange={(checked) => setIsAcknowledged(checked === true)}
                disabled={isSubmitting}
                className="mt-0.5 shrink-0"
              />
              <Label
                htmlFor="acknowledge"
                className="text-sm font-normal text-gray-700 leading-relaxed cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-60"
              >
                I acknowledge that I have reviewed the payment details and confirm that all information is correct. I understand that this payment cannot be cancelled once processed.
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-3 pt-2">
            <Button
              variant="outline"
              onClick={handleCancelConfirmation}
              disabled={isSubmitting}
              className="font-medium"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPayment}
              disabled={!isAcknowledged || isSubmitting}
              className="bg-green-600 hover:bg-green-700 text-white font-medium gap-2 min-w-[140px] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle className="h-4 w-4" />
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default PaymentSummary;
