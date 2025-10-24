/**
 * Payment Items List Component
 * Manages the list of payment items in the multiple payment form
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, AlertCircle, CreditCard, FileText, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PaymentItemCard } from './PaymentItemCard';
import type { PaymentItem, PaymentPurpose, PaymentMethod } from '../types/PaymentTypes';

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

interface PaymentItemsListProps {
  items: PaymentItem[];
  onAdd: () => void;
  onRemove: (itemId: string) => void;
  institutionType: 'school' | 'college';
  errors?: string[];
  warnings?: string[];
  // Payment Summary Props
  paymentMethod: PaymentMethod;
  remarks: string;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onRemarksChange: (remarks: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  disabled?: boolean;
}

export const PaymentItemsList: React.FC<PaymentItemsListProps> = ({
  items,
  onAdd,
  onRemove,
  institutionType,
  errors = [],
  warnings = [],
  // Payment Summary Props
  paymentMethod,
  remarks,
  onPaymentMethodChange,
  onRemarksChange,
  onSubmit,
  onCancel,
  isSubmitting = false,
  disabled = false
}) => {
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const getAddedPurposes = (): PaymentPurpose[] => {
    return items.map(item => item.purpose);
  };

  const getAvailablePurposes = (): PaymentPurpose[] => {
    const allPurposes: PaymentPurpose[] = ['BOOK_FEE', 'TUITION_FEE', 'TRANSPORT_FEE', 'OTHER'];
    const addedPurposes = getAddedPurposes();
    
    // Filter out duplicates based on business rules
    return allPurposes.filter(purpose => {
      if (purpose === 'BOOK_FEE') {
        return !addedPurposes.includes('BOOK_FEE');
      }
      return true; // Allow multiple tuition, transport, and other payments
    });
  };

  const formatTotalAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  const handleSubmitClick = () => {
    setShowConfirmationDialog(true);
  };

  const handleConfirmPayment = () => {
    setShowConfirmationDialog(false);
    onSubmit();
  };

  const handleCancelConfirmation = () => {
    setShowConfirmationDialog(false);
  };

  return (
    <div className={`grid gap-4 ${items.length > 0 ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
      {/* Payment Items Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Payment Items
            </CardTitle>
            <Button
              onClick={onAdd}
              size="sm"
              className="gap-2"
              disabled={getAvailablePurposes().length === 0}
            >
              <Plus className="h-4 w-4" />
              Add Payment
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
        {/* Error Messages */}
        <AnimatePresence>
          {errors.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
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
            </motion.div>
          )}
        </AnimatePresence>

        {/* Warning Messages */}
        <AnimatePresence>
          {warnings.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-1">
                    {warnings.map((warning, index) => (
                      <div key={index} className="text-sm">
                        {warning}
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Payment Items */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-6 text-gray-500"
              >
                <div className="space-y-1">
                  <div className="text-3xl">💳</div>
                  <p className="text-sm">No payment items added yet</p>
                  <p className="text-xs text-gray-400">
                    Click "Add Payment" to start adding payment items
                  </p>
                </div>
              </motion.div>
            ) : (
              items.map((item, index) => (
                <PaymentItemCard
                  key={item.id}
                  item={item}
                  onRemove={onRemove}
                  institutionType={institutionType}
                  orderNumber={index + 1}
                  allItems={items}
                />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Add Payment Button (when no items) */}
        {items.length === 0 && (
          <div className="text-center py-4">
            <Button
              onClick={onAdd}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Your First Payment
            </Button>
          </div>
        )}
        </CardContent>
      </Card>

      {/* Payment Summary Section - Only show when items exist */}
      {items.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CreditCard className="h-4 w-4 text-gray-600" />
              Payment Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
          {/* Total Amount Display */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <span className="text-base font-medium text-gray-700">
                Total Amount ({items.length} item{items.length !== 1 ? 's' : ''})
              </span>
              <span className="text-xl font-bold text-gray-900">
                {formatTotalAmount(totalAmount)}
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
          {paymentMethodOptions.find(option => option.value === paymentMethod) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-2"
            >
              <div className="flex items-start gap-2">
                <CreditCard className="h-3 w-3 text-blue-600 mt-0.5" />
                <div className="text-xs">
                  <p className="font-medium text-blue-800">
                    Selected: {paymentMethodOptions.find(option => option.value === paymentMethod)?.label}
                  </p>
                  <p className="text-blue-600">
                    {paymentMethodOptions.find(option => option.value === paymentMethod)?.description}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
              className="w-full"
            >
              Cancel
            </Button>
            
            <Button
              onClick={handleSubmitClick}
              disabled={disabled || isSubmitting || totalAmount <= 0}
              className="w-full gap-2"
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
              className="bg-blue-50 border border-blue-200 rounded-lg p-2"
            >
              <div className="flex items-center gap-2 text-xs text-blue-800">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Processing your payment. Please wait...</span>
              </div>
            </motion.div>
          )}

          {/* Validation Info */}
          {disabled && totalAmount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-50 border border-yellow-200 rounded-lg p-2"
            >
              <div className="text-xs text-yellow-800">
                Please resolve validation errors before submitting the payment.
              </div>
            </motion.div>
          )}
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmationDialog} onOpenChange={setShowConfirmationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Confirm Payment
            </DialogTitle>
            <DialogDescription>
              Please review your payment details before proceeding.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Payment Summary */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Total Amount:</span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatTotalAmount(totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Payment Method:</span>
                  <span className="text-sm text-gray-900">
                    {paymentMethodOptions.find(option => option.value === paymentMethod)?.label}
                  </span>
                </div>
                {remarks && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-gray-600">Remarks:</span>
                    <span className="text-sm text-gray-900">{remarks}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Items:</span>
                  <span className="text-sm text-gray-900">{items.length} payment{items.length !== 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            {/* Warning Message */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium">Please confirm:</p>
                  <p>This action will process the payment and cannot be undone.</p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleCancelConfirmation}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPayment}
              disabled={isSubmitting}
              className="bg-green-600 hover:bg-green-700 gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentItemsList;
