/**
 * Payment Items List Component
 * Manages the list of payment items in the multiple payment form
 */

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  AlertCircle,
  CreditCard,
  FileText,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PaymentItemCard } from "./PaymentItemCard";
import type {
  PaymentItem,
  PaymentPurpose,
  PaymentMethod,
} from "../types/PaymentTypes";

const paymentMethodOptions: Array<{
  value: PaymentMethod;
  label: string;
  description: string;
}> = [
  {
    value: "CASH",
    label: "Cash",
    description: "Cash payment",
  },
  {
    value: "ONLINE",
    label: "Online",
    description: "Online payment (UPI, Card, Net Banking)",
  },
];

interface PaymentItemsListProps {
  items: PaymentItem[];
  onAdd: () => void;
  onRemove: (itemId: string) => void;
  institutionType: "school" | "college";
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
  disabled = false,
}) => {
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false);
  const [isAcknowledged, setIsAcknowledged] = useState(false);

  const getAddedPurposes = (): PaymentPurpose[] => {
    return items.map((item) => item.purpose);
  };

  const getAvailablePurposes = (): PaymentPurpose[] => {
    const allPurposes: PaymentPurpose[] = [
      "BOOK_FEE",
      "TUITION_FEE",
      "TRANSPORT_FEE",
      "OTHER",
    ];
    const addedPurposes = getAddedPurposes();

    // Filter out duplicates based on business rules
    return allPurposes.filter((purpose) => {
      if (purpose === "BOOK_FEE") {
        return !addedPurposes.includes("BOOK_FEE");
      }
      return true; // Allow multiple tuition, transport, and other payments
    });
  };

  const formatTotalAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

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
    <div className="space-y-6">
      {/* Payment Items Section - Redesigned */}
      <Card className="border border-gray-200 shadow-sm">
        <CardHeader className="border-b border-gray-200 pb-4 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-gray-900">
              Payment Items
            </CardTitle>
            <Button
              onClick={onAdd}
              size="sm"
              className="gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
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
          <div className="space-y-3 mt-4">
            <AnimatePresence mode="popLayout">
              {items.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center py-16 border-2 border-dashed border-blue-200 rounded-lg bg-blue-50/30 cursor-pointer hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
                  onClick={onAdd}
                >
                  <div className="space-y-3">
                    <div className="text-blue-500">
                      <Plus className="h-10 w-10 mx-auto" />
                    </div>
                    <p className="text-sm font-medium text-gray-700">
                      No payment items added
                    </p>
                    <p className="text-xs text-gray-500">
                      Click here or &quot;Add Payment&quot; button to start
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

          {/* Payment Summary Section - Redesigned */}
          {items.length > 0 && (
            <Card className="border border-gray-200 shadow-sm mt-6">
              <CardHeader className="border-b border-gray-200 pb-4 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  Payment Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-5 pt-6">
                {/* Total Amount Display - Green */}
                <div className="border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Total Amount ({items.length} item
                        {items.length !== 1 ? "s" : ""})
                      </p>
                      <p className="text-xs text-gray-500">
                        All payment items combined
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-3xl font-bold text-green-600">
                        {formatTotalAmount(totalAmount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Payment Method Selection - Radio Buttons */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium text-gray-700">
                    Payment Method <span className="text-red-500">*</span>
                  </Label>
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={(value) =>
                      onPaymentMethodChange(value as PaymentMethod)
                    }
                    disabled={isSubmitting}
                    className="grid grid-cols-2 gap-3"
                  >
                    {paymentMethodOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          paymentMethod === option.value
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30"
                        } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <RadioGroupItem
                          value={option.value}
                          id={option.value}
                          className="text-blue-600"
                          disabled={isSubmitting}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">
                            {option.label}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {option.description}
                          </div>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                {/* Remarks - Enhanced */}
                <div className="space-y-2">
                  <Label
                    htmlFor="remarks"
                    className="text-sm font-medium text-gray-700"
                  >
                    Remarks{" "}
                    <span className="text-gray-400 font-normal">
                      (Optional)
                    </span>
                  </Label>
                  <Textarea
                    id="remarks"
                    placeholder="Add any additional notes or remarks..."
                    value={remarks}
                    onChange={(e) => onRemarksChange(e.target.value)}
                    disabled={isSubmitting}
                    rows={3}
                    className="resize-none border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400"
                  />
                </div>

                {/* Action Buttons - Enhanced */}
                <div className="flex flex-col gap-3 pt-4 border-t border-gray-200">
                  <Button
                    onClick={handleSubmitClick}
                    disabled={disabled || isSubmitting || totalAmount <= 0}
                    className="w-full gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all"
                    size="lg"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <FileText className="h-5 w-5" />
                        Submit Payment
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    onClick={onCancel}
                    disabled={isSubmitting}
                    className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                  >
                    Cancel
                  </Button>
                </div>

                {/* Submission Info - Simplified */}
                {isSubmitting && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-300 bg-gray-50 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Processing your payment. Please wait...</span>
                    </div>
                  </motion.div>
                )}

                {/* Validation Info - Simplified */}
                {disabled && totalAmount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="border border-gray-300 bg-gray-50 rounded-lg p-3"
                  >
                    <div className="text-sm text-gray-700">
                      Please resolve validation errors before submitting the
                      payment.
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog - Simplified to 1 step */}
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
          <DialogHeader className="pb-4 border-b border-gray-200">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Confirm Payment
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-600 mt-2">
              Review and confirm payment details
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-4">
            {/* Payment Summary - Enhanced */}
            <div className="border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-5">
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-4 border-b border-green-200">
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">
                      Total Amount
                    </span>
                    <span className="text-xs text-gray-500">
                      {items.length} item{items.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">
                    {formatTotalAmount(totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm py-2">
                  <span className="text-gray-600 font-medium">
                    Payment Method
                  </span>
                  <span className="font-semibold text-gray-900">
                    {
                      paymentMethodOptions.find(
                        (option) => option.value === paymentMethod
                      )?.label
                    }
                  </span>
                </div>
                {remarks && (
                  <div className="flex justify-between items-start gap-2 pt-2 border-t border-blue-200 text-sm">
                    <span className="text-gray-600 font-medium">Remarks</span>
                    <span className="text-gray-900 text-right max-w-[60%] text-sm">
                      {remarks}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Acknowledgment Checkbox - Simplified */}
            <div className="flex items-start gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
              <Checkbox
                id="acknowledge"
                checked={isAcknowledged}
                onCheckedChange={(checked) =>
                  setIsAcknowledged(checked === true)
                }
                disabled={isSubmitting}
                className="mt-0.5 shrink-0"
              />
              <Label
                htmlFor="acknowledge"
                className="text-xs text-gray-700 leading-relaxed cursor-pointer"
              >
                I confirm that the payment details are correct and understand
                this action cannot be undone.
              </Label>
            </div>
          </div>

          <DialogFooter className="gap-3 pt-4 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={handleCancelConfirmation}
              disabled={isSubmitting}
              className="border-gray-300"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmPayment}
              disabled={!isAcknowledged || isSubmitting}
              className="bg-gray-900 hover:bg-gray-800 text-white gap-2 min-w-[140px]"
            >
              <CheckCircle className="h-4 w-4" />
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentItemsList;
