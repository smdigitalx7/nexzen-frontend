/**
 * Multiple Payment Form Component
 * Main orchestrator for multiple payment functionality
 */

import React, { useState, useEffect, useRef, useMemo, memo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PurposeSelectionModal } from "./PurposeSelectionModal";
import { PaymentItemsList } from "./PaymentItemsList";
import { BookFeeComponent } from "./components/BookFeeComponent";
import { TuitionFeeComponent } from "./components/TuitionFeeComponent";
import { TransportFeeComponent } from "./components/TransportFeeComponent";
import { OtherComponent } from "./components/OtherComponent";
import { PaymentValidator } from "../validation/PaymentValidation";
import { ReceiptPreviewModal } from "@/components/shared";
import { handleRegenerateReceipt } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";

import type {
  MultiplePaymentFormProps,
  PaymentItem,
  PaymentPurpose,
  PaymentMethod,
  MultiplePaymentData,
  PaymentError,
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

  // Receipt blob states - using separate state variables like reservations
  const [showReceiptModal, setShowReceiptModal] = useState<boolean>(false);
  const [receiptBlobUrl, setReceiptBlobUrl] = useState<string | null>(null);
  const [lastPaymentIncomeId, setLastPaymentIncomeId] = useState<number | null>(
    null
  );
  const [modalRenderKey, setModalRenderKey] = useState<number>(0);
  const modalStateRef = useRef<{
    showReceiptModal: boolean;
    receiptBlobUrl: string | null;
  }>({ showReceiptModal: false, receiptBlobUrl: null });
  const isMountedRef = useRef(true);

  // Debug logging for modal state changes (only in development)
  // Only log when state actually changes to avoid excessive logging
  const prevModalState = useRef({ showReceiptModal: false, receiptBlobUrl: null as string | null });
  useEffect(() => {
    if (import.meta.env.DEV) {
      const stateChanged = 
        prevModalState.current.showReceiptModal !== showReceiptModal ||
        prevModalState.current.receiptBlobUrl !== receiptBlobUrl;

      if (stateChanged) {
        console.log("🔍 MultiplePaymentForm modal state changed:", {
          showReceiptModal,
          receiptBlobUrl: !!receiptBlobUrl,
          timestamp: new Date().toISOString(),
        });

        // Track when modal state changes to false
        if (!showReceiptModal && receiptBlobUrl) {
          console.log("⚠️ MODAL STATE LOST! Blob URL exists but modal is false");
        }

        // Log when both conditions are met
        if (showReceiptModal && receiptBlobUrl) {
          console.log("🎯 Both conditions met - modal should render!");
        }

        prevModalState.current = { showReceiptModal, receiptBlobUrl };
      }
    }
  }, [showReceiptModal, receiptBlobUrl]);

  // Track component mounting/unmounting
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      console.log("🔍 MultiplePaymentForm unmounting");
    };
  }, []);

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

  // Cleanup blob URL on component unmount
  useEffect(() => {
    return () => {
      if (receiptBlobUrl) {
        URL.revokeObjectURL(receiptBlobUrl);
      }
    };
  }, [receiptBlobUrl]);

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
        paymentMethod: 'CASH' // Default to CASH
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

  const generateReceiptBlob = async (incomeId: number): Promise<void> => {
    try {
      // Check authentication token
      const { token } = useAuthStore.getState();
      if (!token) {
        throw new Error("No authentication token available");
      }

      // Validate income ID
      if (!incomeId || typeof incomeId !== "number" || incomeId <= 0) {
        throw new Error(`Invalid income ID: ${incomeId}`);
      }

      // Generate receipt blob URL
      const blobUrl = await handleRegenerateReceipt(
        incomeId,
        config.institutionType
      );

      // Validate blob URL
      if (!blobUrl || typeof blobUrl !== "string") {
        throw new Error("Invalid blob URL received from API");
      }

      // CRITICAL: Set receipt modal states FIRST before other updates
      setReceiptBlobUrl(blobUrl);
      setLastPaymentIncomeId(incomeId);
      setShowReceiptModal(true);
      setModalRenderKey((prev) => prev + 1);

      // Update ref to persist state
      modalStateRef.current = {
        showReceiptModal: true,
        receiptBlobUrl: blobUrl,
      };

      // Don't show success toast or set paymentCompleted here
      // These will be shown/set only after the receipt modal is closed
    } catch (error) {
      console.error("❌ Failed to generate receipt blob:", error);

      // Show error toast
      toast({
        title: "Receipt Generation Failed",
        description:
          error instanceof Error
            ? error.message
            : "Could not generate receipt. Please try again.",
        variant: "destructive",
      });

      // Still show payment success even if receipt generation fails
      toast({
        title: "Payment Successful",
        description: `Payment completed successfully.`,
        variant: "success",
      });
      setPaymentCompleted(true);
    }
  };

  const handleCloseReceiptModal = () => {
    console.log("📄 Closing receipt modal");
    setShowReceiptModal(false);

    // Show success toast and set payment completed ONLY after receipt modal is closed
    toast({
      title: "Payment Successful",
      description: `Payment of ${formatTotalAmount(totalAmount)} completed successfully.`,
      variant: "success",
    });

    setPaymentCompleted(true);

    // Redirect to receipt after modal closes
    if (receiptBlobUrl) {
      console.log("📄 Redirecting to receipt:", receiptBlobUrl);
      // Open receipt in new tab
      window.open(receiptBlobUrl, "_blank");
    }

    if (receiptBlobUrl) {
      URL.revokeObjectURL(receiptBlobUrl);
      setReceiptBlobUrl(null);
    }

    // Close the parent form after receipt modal is closed
    console.log("📄 Closing parent form after receipt modal closed");
    onCancel();
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      const paymentData: MultiplePaymentData = {
        studentId: student.studentId,
        admissionNo: student.admissionNo,
        details: paymentItems,
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

      // Check if payment was successful and we have an income ID
      // PRIORITY: Set receipt modal states FIRST before other state updates
      if (paymentResult !== undefined && paymentResult !== null) {
        // Handle the API response structure from handlePayByAdmissionWithIncomeId
        // Type guard for payment result with income_id and blobUrl
        if (
          typeof paymentResult === "object" &&
          "income_id" in paymentResult &&
          typeof (paymentResult as { income_id: number }).income_id === "number"
        ) {
          const typedResult = paymentResult as { income_id: number; blobUrl?: string; paymentData?: any };
          const incomeId = typedResult.income_id;

          // The blobUrl is already generated by handlePayByAdmissionWithIncomeId
          if (typedResult.blobUrl) {
            // CRITICAL: Set receipt modal states FIRST in a single batch
            // Use React's automatic batching by grouping all state updates together
            setReceiptBlobUrl(typedResult.blobUrl);
            setLastPaymentIncomeId(incomeId);
            setShowReceiptModal(true);
            setModalRenderKey((prev) => prev + 1);

            // Update ref to persist state
            modalStateRef.current = {
              showReceiptModal: true,
              receiptBlobUrl: typedResult.blobUrl,
            };

            // Don't show success toast or set paymentCompleted here
            // These will be shown/set only after the receipt modal is closed
          } else {
            // Fallback: generate receipt blob
            await generateReceiptBlob(incomeId);
          }
        } else if (typeof paymentResult === "object") {
          // Handle legacy API response structure: { success: true, data: { context: { income_id: 249 } } }
          let incomeId: number | null = null;

          // Type assertion to handle the response object
          const result = paymentResult as Record<string, any>;

          // Check for income_id in different possible locations
          if (result.data && typeof result.data === "object") {
            const data = result.data as Record<string, any>;
            if (data.context && typeof data.context === "object") {
              incomeId = (data.context as { income_id?: number }).income_id ?? null;
            } else if (data.income_id) {
              incomeId = typeof data.income_id === "number" ? data.income_id : null;
            }
          } else if (result.income_id) {
            incomeId = typeof result.income_id === "number" ? result.income_id : null;
          }

          if (incomeId && typeof incomeId === "number") {
            // Generate receipt blob after successful payment
            // The generateReceiptBlob function will handle opening the modal after dialog closes
            await generateReceiptBlob(incomeId);
          } else {
            // Fallback: try to generate receipt with last known income ID
            if (lastPaymentIncomeId) {
              await generateReceiptBlob(lastPaymentIncomeId);
            }
          }
        } else if (typeof paymentResult === "number") {
          // If paymentResult is directly the income ID
          setLastPaymentIncomeId(paymentResult);
          await generateReceiptBlob(paymentResult);
        } else {
          // Fallback: try to generate receipt with last known income ID
          if (lastPaymentIncomeId) {
            await generateReceiptBlob(lastPaymentIncomeId);
          }
        }
      } else {
        // Payment completed but no result returned - try with last known income ID
        if (lastPaymentIncomeId) {
          await generateReceiptBlob(lastPaymentIncomeId);
        }
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

  // Removed excessive render logging - only log when modal state actually changes
  // The modal state change logging is handled in the useEffect above with proper dependencies

  // Force modal to show if both conditions are met
  // Only update if state is actually out of sync to prevent render loops
  useEffect(() => {
    if (receiptBlobUrl && !showReceiptModal && isMountedRef.current) {
      if (import.meta.env.DEV) {
        console.log(
          "🔧 Force showing modal - blob URL exists but modal not showing"
        );
      }

      setShowReceiptModal(true);
      setModalRenderKey((prev) => prev + 1);

      // Update ref
      modalStateRef.current = {
        showReceiptModal: true,
        receiptBlobUrl,
      };
    }
  }, [receiptBlobUrl, showReceiptModal]);

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
                Your payment has been processed successfully. Receipt will be
                displayed shortly.
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

      {/* Receipt Preview Modal - Always render but control visibility */}
      {receiptBlobUrl && (
        <ReceiptPreviewModal
          key={`receipt-modal-${receiptBlobUrl}-${modalRenderKey}`}
          isOpen={showReceiptModal}
          onClose={handleCloseReceiptModal}
          blobUrl={receiptBlobUrl}
        />
      )}
    </div>
  );
});

MultiplePaymentForm.displayName = "MultiplePaymentForm";

export default MultiplePaymentForm;
