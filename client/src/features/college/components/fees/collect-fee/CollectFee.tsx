import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";
import { CollectFeeSearch } from "./CollectFeeSearch";
import { CollectFeePaymentView } from "./CollectFeePaymentView";
import type { MultiplePaymentData } from "@/common/components/shared/payment/types/PaymentTypes";
import { mapPaymentMethodForAPI } from "@/common/components/shared/payment/utils/paymentUtils";
import { handleCollegePayByEnrollment } from "@/core/api/api-college";
import { useToast } from "@/common/hooks/use-toast";
import { collegeKeys } from "@/features/college/hooks/query-keys";
import { batchInvalidateQueries } from "@/common/hooks/useGlobalRefetch";
import { getReceiptNoFromResponse } from "@/core/api/payment-types";
import { useStudentFeeDetails } from "@/features/college/hooks/useStudentFeeDetails";
import type { CollegeTuitionFeeBalanceRead } from "@/features/college/types/tuition-fee-balances";
import { CollegeTransportBalancesService } from "@/features/college/services/transport-fee-balances.service";
import {
  CollegeEnrollmentsService,
  CollegeTuitionBalancesService,
} from "@/features/college/services";
import type {
  CollegeEnrollmentWithStudentDetails,
  CollegeStudentTransportPaymentSummary,
} from "@/features/college/types";
import type { ExpectedTransportPaymentsResponse } from "@/features/college/types/transport-fee-balances";

export interface StudentFeeDetails {
  enrollment: CollegeEnrollmentWithStudentDetails;
  tuitionBalance: CollegeTuitionFeeBalanceRead | null;
  /**
   * Legacy/compat: populated by `CollectFeeSearch` for UI breakdown.
   * Prefer `transportExpectedPayments` / `transportSummary` when available.
   */
  transportBalance?: CollegeStudentTransportPaymentSummary | null;
  transportExpectedPayments?: ExpectedTransportPaymentsResponse;
  transportSummary?: CollegeStudentTransportPaymentSummary | null;
}

interface CollectFeeProps {
  searchResults: StudentFeeDetails[];
  setSearchResults: React.Dispatch<React.SetStateAction<StudentFeeDetails[]>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

export const CollectFee = ({
  searchResults,
  setSearchResults,
  searchQuery,
  setSearchQuery,
}: CollectFeeProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const search = location.search;
  const [selectedAdmissionNo, setSelectedAdmissionNo] = useState<string | null>(null);
  const paymentSuccessRef = useRef<string | null>(null);
  const hasInitializedRef = useRef(false);

  const { data: selectedStudent, refetch: refetchFeeDetails } =
    useStudentFeeDetails(selectedAdmissionNo);

  // Parse URL search parameters
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  const admissionNoFromUrl = searchParams.get("admission_no");

  // Update URL with admission number
  const updateUrlWithAdmission = useCallback(
    (admissionNo: string) => {
      const newSearchParams = new URLSearchParams(search);
      newSearchParams.set("admission_no", admissionNo);
      const newSearch = newSearchParams.toString();
      navigate(
        `${location.pathname}${newSearch ? `?${newSearch}` : ""}`,
        { replace: true }
      );
      setSelectedAdmissionNo(admissionNo);
    },
    [search, navigate, location.pathname]
  );

  // Remove admission number from URL
  const removeAdmissionFromUrl = useCallback(() => {
    const newSearchParams = new URLSearchParams(search);
    newSearchParams.delete("admission_no");
    const newSearch = newSearchParams.toString();
    navigate(`${location.pathname}${newSearch ? `?${newSearch}` : ""}`, {
      replace: true,
    });
    setSelectedAdmissionNo(null);
  }, [search, navigate, location.pathname]);

  const handleStartPayment = useCallback(
    (studentDetails: StudentFeeDetails) => {
      paymentSuccessRef.current = null;
      if (studentDetails?.enrollment?.admission_no) {
        updateUrlWithAdmission(studentDetails.enrollment.admission_no);
      }
    },
    [updateUrlWithAdmission]
  );

  const handleBackToSearch = useCallback(() => {
    removeAdmissionFromUrl();
  }, [removeAdmissionFromUrl]);

  // ✅ FIX: Search student function - removed CacheUtils, using React Query cache
  const searchStudent = useCallback(
    async (admissionNo: string, showToast = true, forceRefresh = false) => {
      try {
        if (forceRefresh) {
          setSearchResults([]);
          // React Query will handle cache invalidation automatically
        }

        setSearchQuery(admissionNo);
        updateUrlWithAdmission(admissionNo);

        // ✅ FIX: Removed cacheOptions - React Query handles caching
        const enrollment: CollegeEnrollmentWithStudentDetails =
          await CollegeEnrollmentsService.getByAdmission(admissionNo);

        const [tuitionBalance, transportSummary, transportExpectedPayments] =
          await Promise.all([
            CollegeTuitionBalancesService.getById(
              enrollment.enrollment_id
            ).catch(() => null),
            CollegeTransportBalancesService.getStudentTransportPaymentSummaryByEnrollmentId(
              enrollment.enrollment_id
            ).catch(() => null),
            CollegeTransportBalancesService.getExpectedTransportPaymentsByEnrollmentId(
              enrollment.enrollment_id
            ).catch(() => undefined),
          ]);

        const studentDetails: StudentFeeDetails = {
          enrollment,
          tuitionBalance,
          transportExpectedPayments,
          transportSummary,
          // Keep legacy alias populated for `CollectFeeSearch` compatibility.
          transportBalance: transportSummary ?? null,
        };

        setSearchResults([studentDetails]);

        if (showToast) {
          toast({
            title: "Payment Successful",
            description:
              "Student fee information has been refreshed with updated balances.",
            variant: "success",
          });
        }
      } catch (error) {
        if (showToast) {
          toast({
            title: "Refresh Failed",
            description:
              "Payment was successful but could not refresh student information. Please search again.",
             variant: "default", // Changed from destructive to default as it's not critical if payment succeeded
          });
        }
      }
    },
    [setSearchQuery, updateUrlWithAdmission, setSearchResults, toast]
  );

  // Auto-search on mount if admission number is in URL
  useEffect(() => {
    if (!hasInitializedRef.current && admissionNoFromUrl && !searchQuery) {
      hasInitializedRef.current = true;
      setSearchQuery(admissionNoFromUrl);
      setSelectedAdmissionNo(admissionNoFromUrl);
      void searchStudent(admissionNoFromUrl, false);
    }
  }, [admissionNoFromUrl, searchQuery, setSearchQuery, searchStudent]);

  const handleFormClose = useCallback(() => {
    paymentSuccessRef.current = null;
    removeAdmissionFromUrl();
  }, [removeAdmissionFromUrl]);


  const handleMultiplePaymentComplete = useCallback(
    async (paymentData: MultiplePaymentData) => {
      const enrollmentId = paymentData.enrollmentId ?? selectedStudent?.enrollment.enrollment_id;
      if (!enrollmentId) {
        toast({
          title: "Payment Failed",
          description: "Enrollment not found. Please search for the student again.",
          variant: "destructive",
        });
        throw new Error("Enrollment ID required for fee collection");
      }

      try {
        const apiPayload = {
          details: paymentData.details.map((detail) => {
            const base: {
              purpose: "BOOK_FEE" | "TUITION_FEE" | "TRANSPORT_FEE" | "OTHER";
              paid_amount: number;
              payment_method: "CASH" | "UPI" | "CARD";
              term_number?: number;
              payment_month?: string;
              custom_purpose_name?: string;
            } = {
              purpose: detail.purpose as "BOOK_FEE" | "TUITION_FEE" | "TRANSPORT_FEE" | "OTHER",
              paid_amount: detail.amount,
              payment_method: mapPaymentMethodForAPI(detail.paymentMethod),
            };
            if (detail.purpose === "TUITION_FEE" && detail.termNumber) base.term_number = detail.termNumber;
            if (detail.purpose === "TRANSPORT_FEE" && "paymentMonth" in detail && detail.paymentMonth) base.payment_month = detail.paymentMonth;
            if (detail.purpose === "OTHER" && detail.customPurposeName) base.custom_purpose_name = detail.customPurposeName;
            return base;
          }),
          remarks: paymentData.remarks || undefined,
        };

        const result = await handleCollegePayByEnrollment(enrollmentId, apiPayload);

        paymentSuccessRef.current = paymentData.admissionNo;

        // Invalidate queries so lists and other views refresh (same as School)
        await batchInvalidateQueries([
          collegeKeys.students.root(),
          collegeKeys.enrollments.root(),
          collegeKeys.tuition.root(),
          collegeKeys.transport.root(),
          collegeKeys.income.root(),
        ]);

        await refetchFeeDetails();

        const receiptNo = getReceiptNoFromResponse(result.paymentData);
        return { blobUrl: result.blobUrl, receiptNo: receiptNo ?? undefined };
      } catch (error) {
        paymentSuccessRef.current = null;
        console.error("Payment error:", error);

        let errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        let errorTitle = "Payment Failed";

        if (errorMessage.includes("Student not found")) {
          errorTitle = "Student Not Found";
          errorMessage = "Student not found. Please check the admission number.";
        } else if (errorMessage.includes("Active enrollment not found") || errorMessage.includes("Enrollment not found")) {
          errorTitle = "Enrollment Not Found";
          errorMessage = "Student is not enrolled for this academic year.";
        } else if (errorMessage.includes("Payment sequence violation") || errorMessage.includes("Sequential payment")) {
          errorTitle = "Payment Sequence Error";
          errorMessage = "Please pay previous terms/months first.";
        } else if (errorMessage.includes("exceeds remaining_balance")) {
          errorTitle = "Amount Exceeds Balance";
          errorMessage = "Payment amount exceeds remaining balance.";
        } else if (errorMessage.includes("must be paid in full")) {
          errorTitle = "Full Payment Required";
          errorMessage = "This fee must be paid in full. Partial payments are not allowed.";
        } else if (errorMessage.includes("Book fee prerequisite") || errorMessage.includes("Book fee must be paid")) {
          errorTitle = "Book Fee Required";
          errorMessage = "Book fee must be paid before tuition fees.";
        } else if (errorMessage.includes("Transport assignment not found")) {
          errorTitle = "Transport Assignment Not Found";
          errorMessage = "Student does not have an active transport assignment.";
        } else if (errorMessage.includes("Duplicate payment months")) {
          errorTitle = "Duplicate Payment";
          errorMessage = "Each month can only be paid once per transaction.";
        }

        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
        });

        throw error;
      }
    },
    [toast, selectedStudent?.enrollment?.enrollment_id, refetchFeeDetails]
  );

  return (
    <div className="space-y-6 h-full min-h-[500px]">
      {/* Search Section - Only show when no admission selected */}
      {!selectedAdmissionNo && (
        <CollectFeeSearch
          onStudentSelected={() => {}}
          paymentMode="multiple"
          onStartPayment={handleStartPayment}
          searchResults={searchResults}
          setSearchResults={setSearchResults}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}

      {/* Payment Form - data from react-query; refetches after successful payment */}
      <AnimatePresence mode="wait">
        {selectedAdmissionNo && (
          <motion.div
            key={`payment-view-${selectedAdmissionNo}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            {selectedStudent ? (
              <CollectFeePaymentView
                studentDetails={selectedStudent}
                onPaymentComplete={handleMultiplePaymentComplete}
                onCancel={handleFormClose}
              />
            ) : (
              <div className="flex items-center justify-center p-12">
                <span className="loading loading-spinner loading-lg text-primary" />
                <span className="ml-3 text-lg font-medium text-muted-foreground">
                  Loading fee details...
                </span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
