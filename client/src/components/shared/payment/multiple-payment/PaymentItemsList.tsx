/**
 * Payment Items List Component - Modern Redesign
 * Manages the list of payment items with modern shadcn/21st.dev UI
 */

import React, { useState, useMemo, memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  AlertCircle,
  CreditCard,
  FileText,
  CheckCircle,
  Sparkles,
  X,
  Loader2,
} from "lucide-react";
import { Loader } from "@/components/ui/ProfessionalLoader";
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
import { Separator } from "@/components/ui/separator";
import { PaymentItemCard } from "./PaymentItemCard";
import {
  PAYMENT_METHOD_OPTIONS,
  calculateCardCharges,
  calculateTotalWithCardCharges,
  formatAmount,
} from "../utils/paymentUtils";
import type {
  PaymentItem,
  PaymentPurpose,
  PaymentMethod,
} from "../types/PaymentTypes";

interface PaymentItemsListProps {
  items: PaymentItem[];
  onAdd: () => void;
  onRemove: (itemId: string) => void;
  institutionType: "school" | "college";
  errors?: string[];
  warnings?: string[];
  paymentMethod: PaymentMethod;
  remarks: string;
  onPaymentMethodChange: (method: PaymentMethod) => void;
  onRemarksChange: (remarks: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting?: boolean;
  disabled?: boolean;
}

export const PaymentItemsList = memo<PaymentItemsListProps>(
  ({
    items,
    onAdd,
    onRemove,
    institutionType,
    errors = [],
    warnings = [],
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

    const getAvailablePurposes = useMemo((): PaymentPurpose[] => {
      const allPurposes: PaymentPurpose[] = [
        "BOOK_FEE",
        "TUITION_FEE",
        "TRANSPORT_FEE",
        "OTHER",
      ];
      const addedPurposes = items.map((item) => item.purpose);

      return allPurposes.filter((purpose) => {
        if (purpose === "BOOK_FEE") {
          return !addedPurposes.includes("BOOK_FEE");
        }
        return true;
      });
    }, [items]);

    const formatTotalAmount = useMemo(
      () => formatAmount,
      []
    );

    const totalAmount = useMemo(
      () => items.reduce((sum, item) => sum + item.amount, 0),
      [items]
    );

    const handleSubmitClick = () => {
      setIsAcknowledged(false);
      setShowConfirmationDialog(true);
    };

    const handleConfirmPayment = () => {
      if (!isAcknowledged) return;
      setShowConfirmationDialog(false);
      setIsAcknowledged(false);
      onSubmit();
    };

    const handleCancelConfirmation = () => {
      setShowConfirmationDialog(false);
      setIsAcknowledged(false);
    };

    return (
      <div className="space-y-5">
        {/* Grid Layout: Payment Items (Left) and Payment Summary (Right) */}
        <div className="grid grid-cols-2 gap-5">
          {/* Payment Items Section - Left Column */}
          <Card className="border border-gray-200 shadow-sm">
            <CardHeader className="border-b border-gray-200 pb-4 px-5 pt-5">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold text-gray-900">
                    Payment Items
                  </CardTitle>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {items.length} item{items.length !== 1 ? "s" : ""} added
                  </p>
                </div>
                <Button
                  onClick={onAdd}
                  size="sm"
                  className="gap-2 h-9 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                  disabled={getAvailablePurposes.length === 0}
                >
                  <Plus className="h-4 w-4" />
                  Add Payment
                </Button>
              </div>
            </CardHeader>

            <CardContent className="space-y-4 p-5">
              {/* Error Messages */}
              <AnimatePresence>
                {errors.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <Alert
                      variant="destructive"
                      className="border-red-200 bg-red-50/50"
                    >
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="space-y-1">
                          {errors.map((error, index) => (
                            <div key={index} className="text-sm font-medium">
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
                    <Alert className="border-amber-200 bg-amber-50/50">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertDescription>
                        <div className="space-y-1">
                          {warnings.map((warning, index) => (
                            <div key={index} className="text-sm text-amber-800">
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
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="text-center py-12 border border-dashed border-gray-300 rounded-lg bg-gray-50 cursor-pointer hover:border-blue-400 hover:bg-blue-50/50 transition-colors"
                      onClick={onAdd}
                    >
                      <div className="space-y-3">
                        <div className="text-gray-400">
                          <Plus className="h-10 w-10 mx-auto" />
                        </div>
                        <p className="text-sm font-medium text-gray-600">
                          No payment items added
                        </p>
                        <p className="text-xs text-gray-500">
                          Click to add payment
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
            </CardContent>
          </Card>

          {/* Payment Summary Section - Right Column */}
          {items.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="h-fit"
            >
              <Card className="border border-gray-200 shadow-sm">
                <CardHeader className="border-b border-gray-200 pb-4 px-5 pt-5">
                  <CardTitle className="text-base font-semibold text-gray-900">
                    Payment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 p-5">
                  {/* Total Amount Display */}
                  <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">
                          Total Amount
                        </p>
                        <p className="text-xs text-gray-500">
                          {items.length} item{items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-green-700">
                          {formatTotalAmount(totalAmount)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator className="bg-gray-200" />

                  {/* Payment Method Selection */}
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
                      className="grid grid-cols-3 gap-3"
                    >
                      {PAYMENT_METHOD_OPTIONS.map((option) => {
                        const isSelected = paymentMethod === option.value;
                        const colorClasses = {
                          green: isSelected
                            ? "border-green-500 bg-green-50"
                            : "border-gray-200 hover:border-green-300 hover:bg-green-50/30",
                          blue: isSelected
                            ? "border-blue-500 bg-blue-50"
                            : "border-gray-200 hover:border-blue-300 hover:bg-blue-50/30",
                          purple: isSelected
                            ? "border-purple-500 bg-purple-50"
                            : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/30",
                        };
                        return (
                          <label
                            key={option.value}
                            className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all text-sm ${
                              colorClasses[option.color as keyof typeof colorClasses]
                            } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <RadioGroupItem
                                value={option.value}
                                id={option.value}
                                className="text-blue-600"
                                disabled={isSubmitting}
                              />
                              <span className="text-2xl">{option.icon}</span>
                              <span
                                className={`font-semibold flex-1 ${
                                  isSelected
                                    ? option.color === "green"
                                      ? "text-green-700"
                                      : option.color === "blue"
                                        ? "text-blue-700"
                                        : "text-purple-700"
                                    : "text-gray-700"
                                }`}
                              >
                                {option.label}
                              </span>
                            </div>
                            <span
                              className={`text-xs ${
                                isSelected
                                  ? option.color === "green"
                                    ? "text-green-600"
                                    : option.color === "blue"
                                      ? "text-blue-600"
                                      : "text-purple-600"
                                  : "text-gray-500"
                              }`}
                            >
                              {option.description}
                            </span>
                          </label>
                        );
                      })}
                    </RadioGroup>
                    
                    {/* Card Charges Display */}
                    {paymentMethod === "CARD" && totalAmount > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-purple-200 bg-purple-50/50 rounded-lg p-4 space-y-2"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <CreditCard className="h-4 w-4 text-purple-600" />
                          <span className="text-sm font-semibold text-purple-800">
                            Card Processing Charges
                          </span>
                        </div>
                        <div className="space-y-1.5 text-sm">
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">Base Amount:</span>
                            <span className="font-medium text-gray-900">
                              {formatAmount(totalAmount)}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600">
                              Processing Charges (1.2%):
                            </span>
                            <span className="font-medium text-purple-700">
                              +{formatAmount(calculateCardCharges(totalAmount))}
                            </span>
                          </div>
                          <Separator className="bg-purple-200" />
                          <div className="flex justify-between items-center pt-1">
                            <span className="font-semibold text-purple-900">
                              Total Amount:
                            </span>
                            <span className="text-lg font-bold text-purple-900">
                              {formatAmount(
                                calculateTotalWithCardCharges(totalAmount)
                              )}
                            </span>
                          </div>
                          <p className="text-xs text-purple-600 mt-2 italic">
                            Note: Charges are for display only. Actual payment amount remains{" "}
                            {formatAmount(totalAmount)}.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <Separator className="bg-gray-200" />

                  {/* Remarks */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="remarks"
                      className="text-sm font-medium text-gray-700"
                    >
                      Remarks{" "}
                      <span className="text-gray-400 font-normal text-xs">
                        (Optional)
                      </span>
                    </Label>
                    <Textarea
                      id="remarks"
                      placeholder="Add any additional notes..."
                      value={remarks}
                      onChange={(e) => onRemarksChange(e.target.value)}
                      disabled={isSubmitting}
                      rows={3}
                      className="resize-none border-gray-300 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 text-sm"
                    />
                  </div>

                  {/* Action Buttons - Side by Side */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={handleSubmitClick}
                      disabled={disabled || isSubmitting || totalAmount <= 0}
                      className="flex-[3] gap-2 bg-blue-600 hover:bg-blue-700 text-white h-10 text-sm font-medium"
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

                    <Button
                      variant="outline"
                      onClick={onCancel}
                      disabled={isSubmitting}
                      className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50 h-10 text-sm"
                    >
                      Cancel
                    </Button>
                  </div>

                  {/* Submission Info */}
                  {isSubmitting && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-blue-200 bg-blue-50/50 rounded-lg p-3.5"
                    >
                      <div className="flex items-center gap-2.5 text-sm text-blue-800">
                        <Loader.Button size="xs" />
                        <span className="font-medium">
                          Processing your payment. Please wait...
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {/* Validation Info */}
                  {disabled && totalAmount > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-amber-200 bg-amber-50/50 rounded-lg p-3.5"
                    >
                      <div className="text-sm text-amber-800 font-medium">
                        Please resolve validation errors before submitting the
                        payment.
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Confirmation Dialog - Modern Design */}
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
          <DialogContent className="max-w-md sm:rounded-2xl">
            <DialogHeader className="pb-4 border-b border-gray-100">
              <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                  <CheckCircle className="h-5 w-5 text-white" />
                </div>
                Confirm Payment
              </DialogTitle>
              <DialogDescription className="text-sm text-gray-600 mt-2">
                Review and confirm payment details before proceeding
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 pt-4">
              {/* Payment Summary - Enhanced */}
              <div className="relative overflow-hidden border border-emerald-200/60 bg-gradient-to-br from-emerald-50/80 to-green-50/60 rounded-xl p-5 shadow-sm">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
                <div className="relative space-y-4">
                  <div className="flex justify-between items-center pb-4 border-b border-emerald-200/60">
                    <div>
                      <span className="text-sm font-medium text-gray-600 block mb-1">
                        Total Amount
                      </span>
                      <span className="text-xs text-gray-500">
                        {items.length} item{items.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                      {formatTotalAmount(totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm py-2">
                    <span className="text-gray-600 font-medium">
                      Payment Method
                    </span>
                    <span className="font-semibold text-gray-900">
                      {
                        PAYMENT_METHOD_OPTIONS.find(
                          (option) => option.value === paymentMethod
                        )?.label
                      }
                    </span>
                  </div>
                  {remarks && (
                    <div className="flex justify-between items-start gap-2 pt-2 border-t border-emerald-200/60 text-sm">
                      <span className="text-gray-600 font-medium">Remarks</span>
                      <span className="text-gray-900 text-right max-w-[60%] text-sm leading-relaxed">
                        {remarks}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Acknowledgment Checkbox - Enhanced */}
              <div className="flex items-start gap-3 p-4 border border-gray-200 rounded-xl bg-gray-50/50">
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

            <DialogFooter className="gap-3 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                onClick={handleCancelConfirmation}
                disabled={isSubmitting}
                className="border-gray-300"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleConfirmPayment}
                disabled={!isAcknowledged || isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white gap-2 min-w-[140px] shadow-sm"
              >
                <CheckCircle className="h-4 w-4" />
                Confirm
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
);

PaymentItemsList.displayName = "PaymentItemsList";

export default PaymentItemsList;
