import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useNavigate } from "react-router-dom";

import { useQueryClient } from "@tanstack/react-query";
import { CollectFeeSearch } from "./CollectFeeSearch";
import { SchoolCollectFeePaymentView } from "./CollectFeePaymentView";
import { mapPaymentMethodForAPI } from "@/common/components/shared/payment/utils/paymentUtils";
import { handleSchoolPayByEnrollment } from "@/core/api/api-school";
import { useToast } from "@/common/hooks/use-toast";
import { schoolKeys } from "@/features/school/hooks/query-keys";
import { batchInvalidateQueries } from "@/common/hooks/useGlobalRefetch";
import { getReceiptNoFromResponse } from "@/core/api/payment-types";
import { EnrollmentsService } from "@/features/school/services/enrollments.service";
import { SchoolTuitionFeeBalancesService } from "@/features/school/services/tuition-fee-balances.service";
import { SchoolTransportFeeBalancesService } from "@/features/school/services/transport-fee-balances.service";
import { useStudentFeeDetails, StudentFeeDetails } from "@/features/school/hooks/useStudentFeeDetails";
import type { MultiplePaymentData } from "@/common/components/shared/payment/types/PaymentTypes";

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
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const search = location.search;
  const [selectedAdmissionNo, setSelectedAdmissionNo] = useState<string | null>(null);
  const paymentSuccessRef = useRef<string | null>(null);
  const hasInitializedRef = useRef(false);

  // Parse URL search parameters
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  const admissionNoFromUrl = searchParams.get("admission_no");

  // Use the custom hook to fetch student fee details
  const { data: selectedStudent, refetch: refetchFeeDetails, dataUpdatedAt } = useStudentFeeDetails(selectedAdmissionNo);

  // Update URL with admission number
  const updateUrlWithAdmission = useCallback((admissionNo: string) => {
    const newSearchParams = new URLSearchParams(search);
    newSearchParams.set("admission_no", admissionNo);
    const newSearch = newSearchParams.toString();
    navigate(`${location.pathname}${newSearch ? `?${newSearch}` : ""}`, {
      replace: true,
    });
    setSelectedAdmissionNo(admissionNo);
  }, [search, navigate, location.pathname]);

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

  const handleStartPayment = useCallback((studentDetails: StudentFeeDetails) => {
    if (studentDetails?.enrollment?.admission_no) {
      updateUrlWithAdmission(studentDetails.enrollment.admission_no);
    }
  }, [updateUrlWithAdmission]);

  const handleBackToSearch = useCallback(() => {
    removeAdmissionFromUrl();
  }, [removeAdmissionFromUrl]);

  // Search student function (Only used for initial search list, not for payment view data)
  const searchStudent = useCallback(async (admissionNo: string, showToast = true) => {
    try {
      setSearchQuery(admissionNo);
      
      const enrollment = await EnrollmentsService.getByAdmission(admissionNo);
      
      const [tuitionBalance, transportBalance] = await Promise.all([
        SchoolTuitionFeeBalancesService.getById(enrollment.enrollment_id).catch(() => null),
        SchoolTransportFeeBalancesService.getById(enrollment.enrollment_id).catch(() => null)
      ]);

      const studentDetails: StudentFeeDetails = {
        enrollment,
        tuitionBalance,
        transportBalance,
      };

      setSearchResults([studentDetails]);

      if (showToast) {
        toast({
          title: "Student Found",
          description: "Student details retrieved successfully.",
          variant: "success",
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      if (showToast) {
        toast({
          title: "Search Failed",
          description: "Could not find student details.",
          variant: "destructive",
        });
      }
    }
  }, [setSearchQuery, setSearchResults, toast]);

  // Auto-search on mount if admission number is in URL
  useEffect(() => {
    if (!hasInitializedRef.current && admissionNoFromUrl) {
      hasInitializedRef.current = true;
      setSearchQuery(admissionNoFromUrl);
      setSelectedAdmissionNo(admissionNoFromUrl);
      void searchStudent(admissionNoFromUrl, false);
    }
  }, [admissionNoFromUrl, searchQuery, setSearchQuery, searchStudent]);

  const handleFormClose = useCallback(async () => {
    paymentSuccessRef.current = null;
    removeAdmissionFromUrl();
  }, [removeAdmissionFromUrl]);

  const handleMultiplePaymentComplete = useCallback(async (
    paymentData: MultiplePaymentData
  ) => {
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
        details: paymentData.details.map((detail) => ({
          purpose: detail.purpose as "BOOK_FEE" | "TUITION_FEE" | "TRANSPORT_FEE" | "OTHER",
          custom_purpose_name: detail.customPurposeName || undefined,
          term_number: detail.termNumber ?? undefined,
          paid_amount: detail.amount,
          payment_method: mapPaymentMethodForAPI(detail.paymentMethod),
        })),
        remarks: paymentData.remarks || undefined,
      };

      const result = await handleSchoolPayByEnrollment(enrollmentId, apiPayload);

      paymentSuccessRef.current = paymentData.admissionNo;

      // ✅ FIX: Invalidate queries first, then refetch to ensure UI updates
      // Do this even if receipt generation failed (payment succeeded)
      await batchInvalidateQueries([
        schoolKeys.students.root(),
        schoolKeys.enrollments.root(),
        schoolKeys.tuition.root(),
        schoolKeys.transport.root(),
        schoolKeys.income.root(),
      ]);
      
      // Wait for refetch to complete to ensure UI updates with fresh data
      await refetchFeeDetails();

      const receiptNo = getReceiptNoFromResponse(result.paymentData);
      return { blobUrl: result.blobUrl, receiptNo: receiptNo ?? undefined };
    } catch (error) {
      console.error("Multiple payment error:", error);
      
      // ✅ FIX: Even if payment fails, try to refetch fee details in case partial update occurred
      try {
        await refetchFeeDetails();
      } catch (refetchError) {
        console.error("Failed to refetch fee details after payment error:", refetchError);
      }
      
      toast({
        title: "Payment Failed",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast, selectedStudent?.enrollment.enrollment_id, refetchFeeDetails]);

  return (
    <div className="space-y-6">
      {/* Search Section - Only show when no student selected */}
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

      {/* Payment Form - single Back + branch name in shared CollectFeePaymentView */}
      <AnimatePresence mode="wait">
        {selectedAdmissionNo && (
          <motion.div
            key="payment-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {selectedStudent ? (
              <SchoolCollectFeePaymentView
                key={`payment-${selectedAdmissionNo}-${dataUpdatedAt ?? Date.now()}`}
                studentDetails={selectedStudent}
                onPaymentComplete={handleMultiplePaymentComplete}
                onCancel={handleFormClose}
              />
            ) : (
              <div className="flex items-center justify-center p-12">
                <span className="loading loading-spinner loading-lg text-primary"></span>
                <span className="ml-3 text-lg font-medium text-muted-foreground">Loading fee details...</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollectFee;
