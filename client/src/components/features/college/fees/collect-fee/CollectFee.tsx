import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation, useSearch } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CollectFeeSearch } from "./CollectFeeSearch";
import { MultiplePaymentForm } from "@/components/shared/payment/multiple-payment/MultiplePaymentForm";
import { collegePaymentConfig } from "@/components/shared/payment/config/PaymentConfig";
import type {
  StudentInfo,
  FeeBalance,
  MultiplePaymentData,
} from "@/components/shared/payment/types/PaymentTypes";
import { handleCollegePayByAdmissionWithIncomeId } from "@/lib/api-college";
import { useToast } from "@/hooks/use-toast";
import { invalidateAndRefetch } from "@/lib/hooks/common/useGlobalRefetch";
import { collegeKeys } from "@/lib/hooks/college/query-keys";
import { CacheUtils } from "@/lib/api";
import type { CollegeTuitionFeeBalanceRead } from "@/lib/types/college/tuition-fee-balances";
import { CollegeTransportBalancesService } from "@/lib/services/college/transport-fee-balances.service";
import {
  CollegeEnrollmentsService,
  CollegeTuitionBalancesService,
} from "@/lib/services/college";
import type {
  CollegeEnrollmentWithStudentDetails,
  CollegeStudentTransportPaymentSummary,
} from "@/lib/types/college";
import type { ExpectedTransportPaymentsResponse } from "@/lib/types/college/transport-fee-balances";

interface StudentFeeDetails {
  enrollment: CollegeEnrollmentWithStudentDetails;
  tuitionBalance: CollegeTuitionFeeBalanceRead | null;
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
  const [, navigate] = useLocation();
  const search = useSearch();
  const [selectedStudent, setSelectedStudent] =
    useState<StudentFeeDetails | null>(null);
  const paymentSuccessRef = useRef<string | null>(null);
  const hasInitializedRef = useRef(false);

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
        `${window.location.pathname}${newSearch ? `?${newSearch}` : ""}`,
        { replace: true }
      );
    },
    [search, navigate]
  );

  // Remove admission number from URL
  const removeAdmissionFromUrl = useCallback(() => {
    const newSearchParams = new URLSearchParams(search);
    newSearchParams.delete("admission_no");
    const newSearch = newSearchParams.toString();
    navigate(`${window.location.pathname}${newSearch ? `?${newSearch}` : ""}`, {
      replace: true,
    });
  }, [search, navigate]);

  const handleStartPayment = useCallback(
    (studentDetails: StudentFeeDetails) => {
      setSelectedStudent(studentDetails);
      paymentSuccessRef.current = null;
      if (studentDetails?.enrollment?.admission_no) {
        updateUrlWithAdmission(studentDetails.enrollment.admission_no);
      }
    },
    [updateUrlWithAdmission]
  );

  const handleBackToSearch = useCallback(() => {
    setSelectedStudent(null);
    removeAdmissionFromUrl();
  }, [removeAdmissionFromUrl]);

  // Search student function
  const searchStudent = useCallback(
    async (admissionNo: string, showToast = true, forceRefresh = false) => {
      try {
        if (forceRefresh) {
          setSearchResults([]);
          CacheUtils.clearByPattern(
            /^GET:\/college\/student-enrollments\/by-admission\//
          );
          CacheUtils.clearByPattern(/^GET:\/college\/tuition-fee-balances\//);
          CacheUtils.clearByPattern(
            /^GET:\/college\/student-transport-payment\//
          );
        }

        setSearchQuery(admissionNo);
        updateUrlWithAdmission(admissionNo);

        const cacheOptions = forceRefresh ? { cache: false } : undefined;
        const enrollment: CollegeEnrollmentWithStudentDetails =
          await CollegeEnrollmentsService.getByAdmission(
            admissionNo,
            cacheOptions
          );

        const [tuitionBalance, transportSummary, transportExpectedPayments] =
          await Promise.all([
            CollegeTuitionBalancesService.getById(
              enrollment.enrollment_id,
              cacheOptions
            ).catch(() => null),
            CollegeTransportBalancesService.getStudentTransportPaymentSummaryByEnrollmentId(
              enrollment.enrollment_id,
              cacheOptions
            ).catch(() => null),
            CollegeTransportBalancesService.getExpectedTransportPaymentsByEnrollmentId(
              enrollment.enrollment_id,
              cacheOptions
            ).catch(() => undefined),
          ]);

        const studentDetails: StudentFeeDetails = {
          enrollment,
          tuitionBalance,
          transportExpectedPayments,
          transportSummary,
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
            variant: "default",
          });
        }
      }
    },
    [setSearchQuery, updateUrlWithAdmission, setSearchResults, toast]
  );

  // Re-search the student after successful payment
  const reSearchStudent = useCallback(
    async (admissionNo: string) => {
      await searchStudent(admissionNo, true, true);
    },
    [searchStudent]
  );

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

  const handleMultiplePaymentComplete = useCallback(
    async (paymentData: MultiplePaymentData) => {
      try {
        const apiPayload: {
          details: Array<{
            purpose:
              | "BOOK_FEE"
              | "TUITION_FEE"
              | "TRANSPORT_FEE"
              | "OTHER"
              | "ADMISSION_FEE";
            paid_amount: number;
            payment_method: "CASH" | "ONLINE";
            term_number?: number;
            payment_month?: string;
            custom_purpose_name?: string;
          }>;
          remarks?: string;
        } = {
          details: paymentData.details.map((detail) => {
            const baseDetail: {
              purpose:
                | "BOOK_FEE"
                | "TUITION_FEE"
                | "TRANSPORT_FEE"
                | "OTHER"
                | "ADMISSION_FEE";
              paid_amount: number;
              payment_method: "CASH" | "ONLINE";
              term_number?: number;
              payment_month?: string;
              custom_purpose_name?: string;
            } = {
              purpose: detail.purpose as
                | "BOOK_FEE"
                | "TUITION_FEE"
                | "TRANSPORT_FEE"
                | "OTHER"
                | "ADMISSION_FEE",
              paid_amount: detail.amount,
              payment_method:
                detail.paymentMethod === "CHEQUE" ||
                detail.paymentMethod === "DD"
                  ? "CASH"
                  : detail.paymentMethod,
            };

            if (detail.purpose === "TUITION_FEE" && detail.termNumber) {
              baseDetail.term_number = detail.termNumber;
            }

            if (
              detail.purpose === "TRANSPORT_FEE" &&
              "paymentMonth" in detail &&
              detail.paymentMonth
            ) {
              baseDetail.payment_month = detail.paymentMonth;
            }

            if (detail.purpose === "OTHER" && detail.customPurposeName) {
              baseDetail.custom_purpose_name = detail.customPurposeName;
            }

            return baseDetail;
          }),
          remarks: paymentData.remarks || undefined,
        };

        const result = await handleCollegePayByAdmissionWithIncomeId(
          paymentData.admissionNo,
          apiPayload
        );

        paymentSuccessRef.current = paymentData.admissionNo;

        // Invalidate caches
        try {
          CacheUtils.clearByPattern(/GET:.*\/college\/student-enrollments/i);
          CacheUtils.clearByPattern(/GET:.*\/college\/students/i);
          CacheUtils.clearByPattern(/GET:.*\/college\/tuition-fee-balances/i);
          CacheUtils.clearByPattern(
            /GET:.*\/college\/student-transport-payment/i
          );
          CacheUtils.clearByPattern(/GET:.*\/college\/income/i);
        } catch (error) {
          console.warn("Failed to clear API cache:", error);
        }

        // Invalidate React Query cache
        queryClient
          .invalidateQueries({
            queryKey: collegeKeys.students.root(),
            exact: false,
          })
          .catch(console.error);
        queryClient
          .invalidateQueries({
            queryKey: collegeKeys.enrollments.root(),
            exact: false,
          })
          .catch(console.error);
        queryClient
          .invalidateQueries({
            queryKey: collegeKeys.tuition.root(),
            exact: false,
          })
          .catch(console.error);
        queryClient
          .invalidateQueries({
            queryKey: collegeKeys.transport.root(),
            exact: false,
          })
          .catch(console.error);
        queryClient
          .invalidateQueries({
            queryKey: collegeKeys.income.root(),
            exact: false,
          })
          .catch(console.error);

        // Refetch active queries
        queryClient
          .refetchQueries({
            queryKey: collegeKeys.students.root(),
            type: "active",
            exact: false,
          })
          .catch(console.error);
        queryClient
          .refetchQueries({
            queryKey: collegeKeys.enrollments.root(),
            type: "active",
            exact: false,
          })
          .catch(console.error);
        queryClient
          .refetchQueries({
            queryKey: collegeKeys.tuition.root(),
            type: "active",
            exact: false,
          })
          .catch(console.error);
        queryClient
          .refetchQueries({
            queryKey: collegeKeys.transport.root(),
            type: "active",
            exact: false,
          })
          .catch(console.error);
        queryClient
          .refetchQueries({
            queryKey: collegeKeys.income.root(),
            type: "active",
            exact: false,
          })
          .catch(console.error);

        return result;
      } catch (error) {
        paymentSuccessRef.current = null;

        let errorMessage =
          error instanceof Error ? error.message : "An unknown error occurred";
        let errorTitle = "Payment Failed";

        if (errorMessage.includes("Student not found")) {
          errorTitle = "Student Not Found";
          errorMessage =
            "Student not found. Please check the admission number.";
        } else if (errorMessage.includes("Active enrollment not found")) {
          errorTitle = "Enrollment Not Found";
          errorMessage = "Student is not enrolled for this academic year.";
        } else if (errorMessage.includes("Payment sequence violation")) {
          errorTitle = "Payment Sequence Error";
          errorMessage = "Please pay previous terms/months first.";
        } else if (errorMessage.includes("exceeds remaining_balance")) {
          errorTitle = "Amount Exceeds Balance";
          errorMessage = "Payment amount exceeds remaining balance.";
        } else if (errorMessage.includes("must be paid in full")) {
          errorTitle = "Full Payment Required";
          errorMessage =
            "This fee must be paid in full. Partial payments are not allowed.";
        } else if (errorMessage.includes("Book fee prerequisite")) {
          errorTitle = "Book Fee Required";
          errorMessage = "Book fee must be paid before tuition fees.";
        } else if (
          errorMessage.includes("Sequential payment validation failed")
        ) {
          errorTitle = "Sequential Payment Required";
          errorMessage = "Please pay pending months first.";
        } else if (errorMessage.includes("Transport assignment not found")) {
          errorTitle = "Transport Assignment Not Found";
          errorMessage =
            "Student does not have an active transport assignment.";
        } else if (errorMessage.includes("Duplicate payment months")) {
          errorTitle = "Duplicate Payment";
          errorMessage = "Each month can only be paid once per transaction.";
        } else if (errorMessage.includes("Missing required parameter")) {
          errorTitle = "Missing Information";
        }

        toast({
          title: errorTitle,
          description: errorMessage,
          variant: "destructive",
        });

        throw error;
      }
    },
    [toast]
  );

  // Transform student data
  const transformStudentData = useCallback(
    async (
      studentDetails: StudentFeeDetails
    ): Promise<{ student: StudentInfo; feeBalances: FeeBalance }> => {
      const enrollment = studentDetails.enrollment;
      const tuitionData = studentDetails.tuitionBalance;

      const enrollmentId = enrollment.enrollment_id;

      let transportFeeTotal: number | undefined = undefined;
      try {
        const transportSummary =
          await CollegeTransportBalancesService.getStudentTransportPaymentSummary();
        const matchingItem = transportSummary?.items?.find(
          (item) => item.admission_no === enrollment.admission_no
        );
        if (matchingItem) {
          transportFeeTotal =
            typeof matchingItem.total_fee === "string"
              ? parseFloat(matchingItem.total_fee) || 0
              : matchingItem.total_fee || 0;
        }
      } catch (error) {
        // Silently fail
      }

      const student: StudentInfo = {
        studentId: String(enrollment.student_id),
        admissionNo: enrollment.admission_no,
        name: enrollment.student_name,
        className: enrollment.class_name || "N/A",
        academicYear: "2025-2026",
        enrollmentId: enrollmentId,
      };

      const bookFeeTotal = tuitionData?.book_fee ?? 0;
      const bookFeePaid = tuitionData?.book_paid ?? 0;
      const term1Amount = tuitionData?.term1_amount ?? 0;
      const term1Paid = tuitionData?.term1_paid ?? 0;
      const term2Amount = tuitionData?.term2_amount ?? 0;
      const term2Paid = tuitionData?.term2_paid ?? 0;
      const term3Amount = tuitionData?.term3_amount ?? 0;
      const term3Paid = tuitionData?.term3_paid ?? 0;

      const transportTotal = transportFeeTotal ?? 0;

      const feeBalances: FeeBalance = {
        bookFee: {
          total: bookFeeTotal,
          paid: bookFeePaid,
          outstanding: Math.max(0, bookFeeTotal - bookFeePaid),
        },
        tuitionFee: {
          total: term1Amount + term2Amount + term3Amount,
          term1: {
            paid: term1Paid,
            outstanding: Math.max(0, term1Amount - term1Paid),
          },
          term2: {
            paid: term2Paid,
            outstanding: Math.max(0, term2Amount - term2Paid),
          },
          term3: {
            paid: term3Paid,
            outstanding: Math.max(0, term3Amount - term3Paid),
          },
        },
        transportFee: {
          total: transportTotal,
          term1: undefined,
          term2: undefined,
        },
      };

      return { student, feeBalances };
    },
    []
  );

  // Wrapper component to handle async transformStudentData
  // Memoized to prevent unnecessary re-renders
  const TransformStudentDataWrapper = React.memo(({
    studentDetails,
    onPaymentComplete,
    onCancel,
  }: {
    studentDetails: StudentFeeDetails;
    onPaymentComplete: (data: MultiplePaymentData) => Promise<unknown>;
    onCancel: () => void;
  }) => {
    const [transformedData, setTransformedData] = useState<{
      student: StudentInfo;
      feeBalances: FeeBalance;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    // Use ref to track the enrollment ID to prevent unnecessary re-transforms
    // when the studentDetails object reference changes but the data is the same
    const enrollmentIdRef = useRef<number | null>(null);

    useEffect(() => {
      // Only transform if enrollment ID actually changed
      const currentEnrollmentId = studentDetails.enrollment.enrollment_id;
      if (enrollmentIdRef.current === currentEnrollmentId && transformedData) {
        // Already transformed for this enrollment, skip
        return;
      }
      
      enrollmentIdRef.current = currentEnrollmentId;
      setIsLoading(true);
      
      transformStudentData(studentDetails)
        .then((data) => {
          setTransformedData(data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error transforming student data:", error);
          const enrollment = studentDetails.enrollment;
          const tuitionData = studentDetails.tuitionBalance;

          const student: StudentInfo = {
            studentId: String(enrollment.student_id ?? 0),
            admissionNo: enrollment.admission_no,
            name: enrollment.student_name,
            className: enrollment.class_name ?? "N/A",
            academicYear: "2025-2026",
            enrollmentId: enrollment.enrollment_id,
          };

          const bookFeeTotal = tuitionData?.book_fee ?? 0;
          const bookFeePaid = tuitionData?.book_paid ?? 0;
          const term1Amount = tuitionData?.term1_amount ?? 0;
          const term1Paid = tuitionData?.term1_paid ?? 0;
          const term2Amount = tuitionData?.term2_amount ?? 0;
          const term2Paid = tuitionData?.term2_paid ?? 0;
          const term3Amount = tuitionData?.term3_amount ?? 0;
          const term3Paid = tuitionData?.term3_paid ?? 0;

          const transportTotal = 0;

          const feeBalances: FeeBalance = {
            bookFee: {
              total: bookFeeTotal,
              paid: bookFeePaid,
              outstanding: Math.max(0, bookFeeTotal - bookFeePaid),
            },
            tuitionFee: {
              total: term1Amount + term2Amount + term3Amount,
              term1: {
                paid: term1Paid,
                outstanding: Math.max(0, term1Amount - term1Paid),
              },
              term2: {
                paid: term2Paid,
                outstanding: Math.max(0, term2Amount - term2Paid),
              },
              term3: {
                paid: term3Paid,
                outstanding: Math.max(0, term3Amount - term3Paid),
              },
            },
            transportFee: {
              total: transportTotal,
              term1: undefined,
              term2: undefined,
            },
          };

          setTransformedData({ student, feeBalances });
          setIsLoading(false);
        });
    }, [studentDetails.enrollment.enrollment_id]);

    if (isLoading || !transformedData) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">
              Loading student data...
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Back Button & Student Info Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={onCancel}
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
                    {transformedData.student.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Admission: {transformedData.student.admissionNo}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-base font-medium text-gray-900">
                  {transformedData.student.className}
                </p>
                <p className="text-sm text-gray-500">2025-2026</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Form - Inline on page */}
        <MultiplePaymentForm
          {...transformedData}
          config={collegePaymentConfig}
          onPaymentComplete={onPaymentComplete}
          onCancel={onCancel}
        />
      </div>
    );
  });

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
            key={`payment-form-${selectedStudent.enrollment.enrollment_id}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <TransformStudentDataWrapper
              key={`transform-wrapper-${selectedStudent.enrollment.enrollment_id}`}
              studentDetails={selectedStudent}
              onPaymentComplete={handleMultiplePaymentComplete}
              onCancel={handleFormClose}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
