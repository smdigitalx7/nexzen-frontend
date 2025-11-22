import { useState, useRef, useEffect, useMemo, useCallback, startTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useSearch } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { CollectFeeSearch } from "./CollectFeeSearch";
import { MultiplePaymentForm } from "@/common/components/shared/payment/multiple-payment/MultiplePaymentForm";
import { schoolPaymentConfig } from "@/common/components/shared/payment/config/PaymentConfig";
import type {
  StudentInfo,
  FeeBalance,
  MultiplePaymentData,
} from "@/common/components/shared/payment/types/PaymentTypes";
import { mapPaymentMethodForAPI } from "@/common/components/shared/payment/utils/paymentUtils";
import { handleSchoolPayByAdmissionWithIncomeId as handlePayByAdmissionWithIncomeId } from "@/core/api/api-school";
import { useToast } from "@/common/hooks/use-toast";
import { schoolKeys } from "@/features/school/hooks/query-keys";
import { batchInvalidateAndRefetch } from "@/common/hooks/useGlobalRefetch";
import { EnrollmentsService } from "@/features/school/services/enrollments.service";
import { SchoolTuitionFeeBalancesService } from "@/features/school/services/tuition-fee-balances.service";
import { SchoolTransportFeeBalancesService } from "@/features/school/services/transport-fee-balances.service";
import type { SchoolEnrollmentWithStudentDetails } from "@/features/school/types/enrollments";

interface StudentFeeDetails {
  enrollment: SchoolEnrollmentWithStudentDetails;
  tuitionBalance: any;
  transportBalance: any;
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
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const search = useSearch();
  const [selectedStudent, setSelectedStudent] = useState<StudentFeeDetails | null>(null);
  const paymentSuccessRef = useRef<string | null>(null);
  const hasInitializedRef = useRef(false);

  // Parse URL search parameters
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  const admissionNoFromUrl = searchParams.get("admission_no");

  // Update URL with admission number
  const updateUrlWithAdmission = useCallback((admissionNo: string) => {
    const newSearchParams = new URLSearchParams(search);
    newSearchParams.set("admission_no", admissionNo);
    const newSearch = newSearchParams.toString();
    navigate(`${window.location.pathname}${newSearch ? `?${newSearch}` : ""}`, {
      replace: true,
    });
  }, [search, navigate]);

  // Remove admission number from URL
  const removeAdmissionFromUrl = useCallback(() => {
    const newSearchParams = new URLSearchParams(search);
    newSearchParams.delete("admission_no");
    const newSearch = newSearchParams.toString();
    navigate(`${window.location.pathname}${newSearch ? `?${newSearch}` : ""}`, {
      replace: true,
    });
  }, [search, navigate]);

  const handleStartPayment = useCallback((studentDetails: StudentFeeDetails) => {
    setSelectedStudent(studentDetails);
    paymentSuccessRef.current = null;
    if (studentDetails?.enrollment?.admission_no) {
      updateUrlWithAdmission(studentDetails.enrollment.admission_no);
    }
  }, [updateUrlWithAdmission]);

  const handleBackToSearch = useCallback(() => {
    setSelectedStudent(null);
    removeAdmissionFromUrl();
  }, [removeAdmissionFromUrl]);

  // Search student function
  const searchStudent = useCallback(async (admissionNo: string, showToast = true) => {
    try {
      setSearchQuery(admissionNo);
      updateUrlWithAdmission(admissionNo);

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
          title: "Payment Successful",
          description: "Student fee information has been refreshed.",
          variant: "success",
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      if (showToast) {
        toast({
          title: "Refresh Failed",
          description:
            "Payment was successful but could not refresh student information. Please search again.",
          variant: "default",
        });
      }
    }
  }, [setSearchQuery, updateUrlWithAdmission, setSearchResults, toast]);

  // ✅ FIX: Re-search the student after successful payment with proper delay
  const reSearchStudent = useCallback(async (admissionNo: string) => {
    // Small delay to ensure React Query cache is updated
    await new Promise((resolve) => setTimeout(resolve, 100));
    await searchStudent(admissionNo, true);
  }, [searchStudent]);

  // Auto-search on mount if admission number is in URL
  useEffect(() => {
    if (!hasInitializedRef.current && admissionNoFromUrl && !searchQuery) {
      hasInitializedRef.current = true;
      setSearchQuery(admissionNoFromUrl);
      void searchStudent(admissionNoFromUrl, false);
    }
  }, [admissionNoFromUrl, searchQuery, setSearchQuery, searchStudent]);

  const handleFormClose = useCallback(() => {
    const admissionNoToReSearch = paymentSuccessRef.current;
    setSelectedStudent(null);
    removeAdmissionFromUrl();

    if (admissionNoToReSearch) {
      paymentSuccessRef.current = null;
      void reSearchStudent(admissionNoToReSearch);
    }
  }, [removeAdmissionFromUrl, reSearchStudent]);

  const handleMultiplePaymentComplete = useCallback(async (
    paymentData: MultiplePaymentData
  ) => {
    try {
      const apiPayload = {
        details: paymentData.details.map((detail) => ({
          purpose: detail.purpose as
            | "BOOK_FEE"
            | "TUITION_FEE"
            | "TRANSPORT_FEE"
            | "OTHER"
            | "ADMISSION_FEE",
          custom_purpose_name: detail.customPurposeName || undefined,
          term_number: detail.termNumber || undefined,
          paid_amount: detail.amount,
          payment_method: mapPaymentMethodForAPI(detail.paymentMethod),
        })),
        remarks: paymentData.remarks || undefined,
      };

      const result = await handlePayByAdmissionWithIncomeId(
        paymentData.admissionNo,
        apiPayload
      );

      paymentSuccessRef.current = paymentData.admissionNo;

      // ✅ FIX: Use batch invalidation to prevent UI freeze
      batchInvalidateAndRefetch([
        schoolKeys.students.root(),
        schoolKeys.enrollments.root(),
        schoolKeys.tuition.root(),
        schoolKeys.transport.root(),
        schoolKeys.income.root(),
      ]);

      return result;
    } catch (error) {
      console.error("Multiple payment error:", error);
      paymentSuccessRef.current = null;
      toast({
        title: "Payment Failed",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
      throw error;
    }
  }, [toast, queryClient]);

  // Transform existing student data to new format
  const transformStudentData = useCallback((
    studentDetails: StudentFeeDetails
  ): { student: StudentInfo; feeBalances: FeeBalance } => {
    const student: StudentInfo = {
      studentId: String(studentDetails.enrollment.student_id),
      admissionNo: studentDetails.enrollment.admission_no,
      name: studentDetails.enrollment.student_name,
      className: studentDetails.tuitionBalance?.class_name || "N/A",
      academicYear: "2025-2026",
    };

    const feeBalances: FeeBalance = {
      bookFee: {
        total: studentDetails.tuitionBalance?.book_fee || 0,
        paid: studentDetails.tuitionBalance?.book_paid || 0,
        outstanding: Math.max(
          0,
          (studentDetails.tuitionBalance?.book_fee || 0) -
            (studentDetails.tuitionBalance?.book_paid || 0)
        ),
      },
      tuitionFee: {
        total:
          (studentDetails.tuitionBalance?.term1_amount || 0) +
          (studentDetails.tuitionBalance?.term2_amount || 0) +
          (studentDetails.tuitionBalance?.term3_amount || 0),
        term1: {
          paid: studentDetails.tuitionBalance?.term1_paid || 0,
          outstanding: Math.max(
            0,
            (studentDetails.tuitionBalance?.term1_amount || 0) -
              (studentDetails.tuitionBalance?.term1_paid || 0)
          ),
        },
        term2: {
          paid: studentDetails.tuitionBalance?.term2_paid || 0,
          outstanding: Math.max(
            0,
            (studentDetails.tuitionBalance?.term2_amount || 0) -
              (studentDetails.tuitionBalance?.term2_paid || 0)
          ),
        },
        term3: {
          paid: studentDetails.tuitionBalance?.term3_paid || 0,
          outstanding: Math.max(
            0,
            (studentDetails.tuitionBalance?.term3_amount || 0) -
              (studentDetails.tuitionBalance?.term3_paid || 0)
          ),
        },
      },
      transportFee: {
        total:
          (studentDetails.transportBalance?.term1_amount || 0) +
          (studentDetails.transportBalance?.term2_amount || 0),
        term1: {
          paid: studentDetails.transportBalance?.term1_paid || 0,
          outstanding: Math.max(
            0,
            (studentDetails.transportBalance?.term1_amount || 0) -
              (studentDetails.transportBalance?.term1_paid || 0)
          ),
        },
        term2: {
          paid: studentDetails.transportBalance?.term2_paid || 0,
          outstanding: Math.max(
            0,
            (studentDetails.transportBalance?.term2_amount || 0) -
              (studentDetails.transportBalance?.term2_paid || 0)
          ),
        },
      },
    };

    return { student, feeBalances };
  }, []);

  return (
    <div className="space-y-6">
      {/* Search Section - Only show when no student selected */}
      {!selectedStudent && (
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

      {/* Payment Form - Show directly on page when student is selected */}
      <AnimatePresence mode="wait">
        {selectedStudent && (
          <motion.div
            key="payment-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            {/* Back Button & Student Info Header */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handleBackToSearch}
                className="gap-2 text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Search
              </Button>
            </div>

            {/* Student Information Card - Professional */}
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div>
                      <CardTitle className="text-lg font-semibold text-gray-900">
                        {selectedStudent.enrollment.student_name}
                      </CardTitle>
                      <p className="text-sm text-gray-600 mt-0.5">
                        Admission: {selectedStudent.enrollment.admission_no}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-medium text-gray-900">
                      {selectedStudent.tuitionBalance?.class_name || "N/A"}
                    </p>
                    <p className="text-sm text-gray-500">2025-2026</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Form - Inline on page */}
            <MultiplePaymentForm
              {...transformStudentData(selectedStudent)}
              config={schoolPaymentConfig}
              onPaymentComplete={handleMultiplePaymentComplete}
              onCancel={handleFormClose}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CollectFee;
