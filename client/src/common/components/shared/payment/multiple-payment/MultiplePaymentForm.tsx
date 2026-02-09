/**
 * Multiple Payment Form Component
 * Main orchestrator for multiple payment functionality
 */

import React, { useState, useEffect, useRef, useMemo, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { PurposeSelectionModal } from "./PurposeSelectionModal";
import { PaymentItemsList } from "./PaymentItemsList";
import { BookFeeComponent } from "./components/BookFeeComponent";
import { TuitionFeeComponent } from "./components/TuitionFeeComponent";
import { TransportFeeComponent } from "./components/TransportFeeComponent";
import { OtherComponent } from "./components/OtherComponent";
import { PaymentValidator } from "../validation/PaymentValidation";
import { handleRegenerateReceipt } from "@/core/api";
import { toast } from "@/common/hooks/use-toast";
import { openReceiptInNewTab } from "@/common/utils/payment";
import { useAuthStore } from "@/core/auth/authStore";

import type {
  MultiplePaymentFormProps,
  PaymentItem,
  PaymentPurpose,
  PaymentMethod,
  MultiplePaymentData,
} from "../types/PaymentTypes";

export const MultiplePaymentForm: React.FC<MultiplePaymentFormProps> = memo(({
  student,
  feeBalances,
  config,
  onPaymentComplete,
  onCancel,
}) => {
  const [paymentItems, setPaymentItems] = useState<PaymentItem[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [remarks, setRemarks] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [paymentCompleted, setPaymentCompleted] = useState<boolean>(false);

  const formatTotalAmount = useMemo(
    () => (amount: number) => {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    },
    []
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  // Modal states
  const [showPurposeModal, setShowPurposeModal] = useState<boolean>(false);
  const [showPurposeComponent, setShowPurposeComponent] =
    useState<boolean>(false);
  const [selectedPurpose, setSelectedPurpose] = useState<PaymentPurpose | null>(
    null
  );

  const receiptBlobRef = useRef<string | null>(null);
  const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Order payment items: Book Fee first, then Tuition terms (1,2,3), then Transport terms (1,2)
  const getOrderedPaymentItems = useCallback((items: PaymentItem[]): PaymentItem[] => {
    return [...items].sort((a, b) => {
      // Define priority order
      const getPriority = (item: PaymentItem): number => {
        switch (item.purpose) {
          case "BOOK_FEE":
            return 1;
          case "TUITION_FEE":
            return 2 + (item.termNumber || 0); // Term 1 = 3, Term 2 = 4, Term 3 = 5
          case "TRANSPORT_FEE":
            return 10 + (item.termNumber || 0); // Term 1 = 11, Term 2 = 12
          case "OTHER":
            return 20; // Other payments come last
          default:
            return 99;
        }
      };

      return getPriority(a) - getPriority(b);
    });
  }, []);

  // Calculate total amount whenever payment items change
  useEffect(() => {
    const total = paymentItems.reduce((sum, item) => sum + item.amount, 0);
    setTotalAmount(total);
  }, [paymentItems]);

  // Validate form whenever payment items change
  useEffect(() => {
    if (paymentItems.length > 0) {
      const validation = PaymentValidator.validateForm(
        {
          studentId: student.studentId,
          admissionNo: student.admissionNo,
          details: paymentItems,
          remarks,
          totalAmount,
        },
        config.validationRules,
        feeBalances
      );

      setErrors(validation.errors);
      setWarnings(validation.warnings);
    } else {
      setErrors([]);
      setWarnings([]);
    }
  }, [paymentItems, remarks, totalAmount, student, config.validationRules]);

  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      if (receiptBlobRef.current) {
        try {
          URL.revokeObjectURL(receiptBlobRef.current);
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const handleAddPayment = () => {
    setShowPurposeModal(true);
  };

  const handlePurposeSelect = (purpose: PaymentPurpose) => {
    // For BOOK_FEE, add directly without showing component
    if (purpose === 'BOOK_FEE' && feeBalances.bookFee.outstanding > 0) {
      const bookFeeItem: PaymentItem = {
        id: `book-fee-${Date.now()}`,
        purpose: 'BOOK_FEE',
        amount: feeBalances.bookFee.outstanding,
        paymentMethod: paymentMethod // Use the selected payment method from the form
      };
      setPaymentItems((prev) => [...prev, bookFeeItem]);
      setShowPurposeModal(false);
      return;
    }
    
    // For other purposes, show the component
    setSelectedPurpose(purpose);
    setShowPurposeModal(false);
    setShowPurposeComponent(true);
  };

  const handlePurposeComponentCancel = () => {
    setShowPurposeComponent(false);
    setSelectedPurpose(null);
  };

  const handlePaymentItemAdd = (item: PaymentItem) => {
    setPaymentItems((prev) => [...prev, item]);
    setShowPurposeComponent(false);
    setSelectedPurpose(null);
  };

  const handlePaymentItemEdit = (item: PaymentItem) => {
    // Remove the item and open the appropriate component for editing
    setPaymentItems((prev) => prev.filter((i) => i.id !== item.id));
    setSelectedPurpose(item.purpose);
    setShowPurposeComponent(true);
  };

  const handlePaymentItemRemove = (itemId: string) => {
    setPaymentItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const openReceiptAndClose = useCallback(
    (blobUrl: string | null) => {
      if (blobUrl) {
        try {
          openReceiptInNewTab(blobUrl);
        } catch {
          // Popup may be blocked
        }
        receiptBlobRef.current = blobUrl;
      }
      toast({
        title: "Payment Successful",
        description: blobUrl
          ? `Receipt opened in a new tab. Amount: ${formatTotalAmount(totalAmount)}`
          : `Payment of ${formatTotalAmount(totalAmount)} completed.`,
        variant: "success",
      });
      setPaymentCompleted(true);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = setTimeout(() => {
        closeTimeoutRef.current = null;
        if (receiptBlobRef.current) {
          try {
            URL.revokeObjectURL(receiptBlobRef.current);
          } catch {
            // ignore
          }
          receiptBlobRef.current = null;
        }
        onCancel();
      }, 1400);
    },
    [totalAmount, formatTotalAmount, onCancel]
  );

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Apply the selected payment method to all payment items
      const updatedPaymentItems = paymentItems.map((item) => ({
        ...item,
        paymentMethod: paymentMethod, // Use the selected payment method from the form
      }));

      const paymentData: MultiplePaymentData = {
        studentId: student.studentId,
        admissionNo: student.admissionNo,
        enrollmentId: student.enrollmentId,
        details: updatedPaymentItems,
        remarks: remarks.trim() || undefined,
        totalAmount,
      };

      // Final validation
      const validation = PaymentValidator.validateForm(
        paymentData,
        config.validationRules,
        feeBalances
      );
      if (!validation.isValid) {
        setErrors(validation.errors);
        setIsSubmitting(false);
        return;
      }

      // Process payment and get income ID
      const paymentResult = await onPaymentComplete(paymentData);

      if (paymentResult !== undefined && paymentResult !== null) {
        let blobUrl: string | null = null;
        let incomeId: number | null = null;

        if (
          typeof paymentResult === "object" &&
          "income_id" in paymentResult &&
          typeof (paymentResult as { income_id: number }).income_id === "number"
        ) {
          const typed = paymentResult as { income_id: number; blobUrl?: string };
          incomeId = typed.income_id;
          blobUrl = typed.blobUrl ?? null;
        } else if (typeof paymentResult === "object") {
          const r = paymentResult as Record<string, unknown>;
          if (r.data && typeof r.data === "object") {
            const d = r.data as Record<string, unknown>;
            incomeId =
              (d.context as { income_id?: number })?.income_id ??
              (typeof d.income_id === "number" ? d.income_id : null) ??
              null;
          } else if (typeof (r as { income_id?: number }).income_id === "number") {
            incomeId = (r as { income_id: number }).income_id;
          }
        } else if (typeof paymentResult === "number") {
          incomeId = paymentResult;
        }

        if (!blobUrl && incomeId && useAuthStore.getState().token) {
          try {
            blobUrl = await handleRegenerateReceipt(incomeId, config.institutionType) ?? null;
          } catch {
            // receipt optional; payment still succeeded
          }
        }

        openReceiptAndClose(blobUrl);
      } else {
        openReceiptAndClose(null);
      }
    } catch (error) {
      console.error("Payment submission error:", error);
      setErrors(["Payment submission failed. Please try again."]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvailablePurposes = (): PaymentPurpose[] => {
    const allPurposes: PaymentPurpose[] = [
      "BOOK_FEE",
      "TUITION_FEE",
      "TRANSPORT_FEE",
      "OTHER",
    ];

    // Filter out duplicates based on business rules
    const availablePurposes = allPurposes.filter((purpose) => {
      if (purpose === "BOOK_FEE") {
        return !paymentItems.some((item) => item.purpose === "BOOK_FEE");
      }

      // For tuition and transport fees, check if all terms are already added
      if (purpose === "TUITION_FEE" || purpose === "TRANSPORT_FEE") {
        // For colleges, don't filter based on terms - availability is determined by outstanding amounts
        // and expected payments (for transport), which are checked in PurposeSelectionModal
        if (config.institutionType === "college") {
          // For colleges, always include if not already added as a purpose
          // The actual availability (outstanding amounts) is checked in PurposeSelectionModal
          return !paymentItems.some((item) => item.purpose === purpose);
        }
        
        // For schools, check if all terms are already added
        const maxTerms = purpose === "TRANSPORT_FEE" ? 2 : 3;
        const addedTerms = paymentItems
          .filter((item) => item.purpose === purpose)
          .map((item) => item.termNumber)
          .filter((termNumber) => termNumber !== undefined);

        // Get unique terms to prevent duplicates
        const uniqueAddedTerms = Array.from(new Set(addedTerms));

        // If all possible terms are added, don't show the purpose
        return uniqueAddedTerms.length < maxTerms;
      }

      return true; // Allow multiple OTHER payments
    });

    return availablePurposes;
  };

  const getAddedPurposes = (): PaymentPurpose[] => {
    return paymentItems.map((item) => item.purpose);
  };

  const renderPurposeComponent = () => {
    if (!selectedPurpose || !showPurposeComponent) return null;

    const commonProps = {
      student,
      feeBalances,
      config,
      onAdd: handlePaymentItemAdd,
      onCancel: handlePurposeComponentCancel,
      isOpen: showPurposeComponent,
    };

    switch (selectedPurpose) {
      case "BOOK_FEE":
        return <BookFeeComponent {...commonProps} />;
      case "TUITION_FEE":
        return <TuitionFeeComponent {...commonProps} />;
      case "TRANSPORT_FEE":
        return <TransportFeeComponent {...commonProps} />;
      case "OTHER":
        return <OtherComponent {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5">
      {/* Payment Completed Message - Enhanced */}
      {paymentCompleted && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="relative overflow-hidden border-2 border-emerald-300/60 bg-gradient-to-r from-emerald-50/80 to-green-50/60 rounded-xl p-5 shadow-lg"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-200/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="relative flex items-center gap-4">
            <div className="p-2.5 bg-emerald-100 rounded-xl shadow-sm">
              <CheckCircle2 className="h-6 w-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-emerald-900 text-lg">
                Payment Completed
              </h3>
              <p className="text-sm text-emerald-700 mt-1 leading-relaxed">
                Your payment has been processed. Receipt opened in a new tab.
              </p>
            </div>
          </div>
        </motion.div>
      )}


      {/* Payment Items List */}
      <PaymentItemsList
        items={getOrderedPaymentItems(paymentItems)}
        onAdd={handleAddPayment}
        onRemove={handlePaymentItemRemove}
        institutionType={config.institutionType}
        errors={errors}
        warnings={warnings}
        // Payment Summary Props
        paymentMethod={paymentMethod}
        remarks={remarks}
        onPaymentMethodChange={setPaymentMethod}
        onRemarksChange={setRemarks}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        isSubmitting={isSubmitting}
        disabled={errors.length > 0}
      />

      {/* Purpose Selection Modal */}
      <PurposeSelectionModal
        isOpen={showPurposeModal}
        availablePurposes={getAvailablePurposes()}
        addedPurposes={getAddedPurposes()}
        paymentItems={paymentItems}
        onPurposeSelect={handlePurposeSelect}
        onClose={() => setShowPurposeModal(false)}
        feeBalances={feeBalances}
        institutionType={config.institutionType}
      />

      {/* Purpose-Specific Component */}
      <AnimatePresence>
        {showPurposeComponent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderPurposeComponent()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success/Error Messages - Enhanced (moved to PaymentItemsList) */}
    </div>
  );
});

MultiplePaymentForm.displayName = "MultiplePaymentForm";

export default MultiplePaymentForm;
