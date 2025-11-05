import { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useLocation, useSearch } from "wouter";
import { CollectFeeSearch } from "./CollectFeeSearch";
import { CollegeMultiplePaymentForm } from "../multiple-payment/CollegeMultiplePaymentForm";
import type { StudentInfo, FeeBalance, MultiplePaymentData } from "@/components/shared/payment/types/PaymentTypes";
import { handleCollegePayByAdmissionWithIncomeId } from "@/lib/api-college";
import { useToast } from "@/hooks/use-toast";
import type { CollegeTuitionFeeBalanceRead, CollegeTuitionFeeBalanceFullRead } from "@/lib/types/college/tuition-fee-balances";
import { CollegeTransportBalancesService } from "@/lib/services/college/transport-fee-balances.service";
import { CollegeEnrollmentsService, CollegeTuitionBalancesService } from "@/lib/services/college";
import type { CollegeEnrollmentWithStudentDetails, CollegeStudentTransportPaymentSummary } from "@/lib/types/college";
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

export const CollectFee = ({ searchResults, setSearchResults, searchQuery, setSearchQuery }: CollectFeeProps) => {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const search = useSearch();
  const [selectedStudent, setSelectedStudent] = useState<StudentFeeDetails | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const paymentSuccessRef = useRef<string | null>(null); // Store admission number for re-search
  const hasInitializedRef = useRef(false);

  // Parse URL search parameters
  const searchParams = useMemo(() => new URLSearchParams(search), [search]);
  const admissionNoFromUrl = searchParams.get("admission_no");

  // Update URL with admission number
  const updateUrlWithAdmission = (admissionNo: string) => {
    const newSearchParams = new URLSearchParams(search);
    newSearchParams.set("admission_no", admissionNo);
    const newSearch = newSearchParams.toString();
    navigate(`${window.location.pathname}${newSearch ? `?${newSearch}` : ""}`, { replace: true });
  };

  const handleStartPayment = (studentDetails: StudentFeeDetails) => {
    setSelectedStudent(studentDetails);
    setIsFormOpen(true);
    paymentSuccessRef.current = null; // Reset payment success flag
  };

  // Search student function (reusable for both initial search and re-search)
  const searchStudent = async (admissionNo: string, showToast = true, forceRefresh = false) => {
    try {
      // If forceRefresh is true, invalidate cache and clear search results first
      if (forceRefresh) {
        // Clear search results immediately to show loading state
        setSearchResults([]);
        
        // Import CacheUtils to invalidate cache
        const { CacheUtils } = await import("@/lib/api");
        
        // Invalidate all college-related cache entries for this admission number
        // This ensures we get fresh data after payment
        CacheUtils.clearByPattern(/^GET:\/college\/student-enrollments\/by-admission\//);
        CacheUtils.clearByPattern(/^GET:\/college\/tuition-fee-balances\//);
        CacheUtils.clearByPattern(/^GET:\/college\/student-transport-payment\//);
      }
      
      // Update search query and URL
      setSearchQuery(admissionNo);
      // Update URL separately to avoid dependency issues
      setTimeout(() => updateUrlWithAdmission(admissionNo), 0);
      
      // Import Api to bypass cache when forceRefresh is true
      const { Api } = await import("@/lib/api");
      
      // Use enrollment endpoint to get enrollment data
      // When forceRefresh is true, bypass cache by using cache: false option
      const enrollment: CollegeEnrollmentWithStudentDetails = forceRefresh
        ? await Api.get<CollegeEnrollmentWithStudentDetails>(`/college/student-enrollments/by-admission/${admissionNo}`, undefined, undefined, { cache: false })
        : await CollegeEnrollmentsService.getByAdmission(admissionNo);
      
      // Fetch tuition balance, transport summary, and expected transport payments using enrollment_id
      // When forceRefresh is true, bypass cache
      const [tuitionBalance, transportSummary, transportExpectedPayments] = await Promise.all([
        forceRefresh
          ? await Api.get<CollegeTuitionFeeBalanceFullRead>(`/college/tuition-fee-balances/${enrollment.enrollment_id}`, undefined, undefined, { cache: false }).catch(() => null)
          : CollegeTuitionBalancesService.getById(enrollment.enrollment_id).catch(() => null),
        forceRefresh
          ? await Api.get<CollegeStudentTransportPaymentSummary>(`/college/student-transport-payment/by-enrollment/${enrollment.enrollment_id}`, undefined, undefined, { cache: false }).catch(() => null)
          : CollegeTransportBalancesService.getStudentTransportPaymentSummaryByEnrollmentId(enrollment.enrollment_id).catch(() => null),
        forceRefresh
          ? await Api.get<ExpectedTransportPaymentsResponse>(`/college/student-transport-payment/expected-payments/${enrollment.enrollment_id}`, undefined, undefined, { cache: false }).catch(() => undefined)
          : CollegeTransportBalancesService.getExpectedTransportPaymentsByEnrollmentId(enrollment.enrollment_id).catch(() => undefined)
      ]);

      const studentDetails: StudentFeeDetails = {
        enrollment,
        tuitionBalance,
        transportExpectedPayments,
        transportSummary // Add transport summary for outstanding calculation
      };

      setSearchResults([studentDetails]);
      
      if (showToast) {
        toast({
          title: "Payment Successful",
          description: "Student fee information has been refreshed with updated balances.",
          variant: "success",
        });
      }
    } catch (error) {
      if (showToast) {
        toast({
          title: "Refresh Failed",
          description: "Payment was successful but could not refresh student information. Please search again.",
          variant: "default",
        });
      }
    }
  };

  // Re-search the student after successful payment with force refresh to bypass cache
  const reSearchStudent = async (admissionNo: string) => {
    await searchStudent(admissionNo, true, true); // forceRefresh = true to bypass cache
  };

  // Auto-search on mount if admission number is in URL
  useEffect(() => {
    if (!hasInitializedRef.current && admissionNoFromUrl && !searchQuery) {
      hasInitializedRef.current = true;
      setSearchQuery(admissionNoFromUrl);
      void searchStudent(admissionNoFromUrl, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admissionNoFromUrl]);

  const handleFormClose = () => {
    const admissionNoToReSearch = paymentSuccessRef.current;
    setSelectedStudent(null);
    setIsFormOpen(false);
    
    // If payment was successful, re-search the same admission number
    if (admissionNoToReSearch) {
      paymentSuccessRef.current = null; // Reset flag
      void reSearchStudent(admissionNoToReSearch);
    }
  };

  const handleMultiplePaymentComplete = async (paymentData: MultiplePaymentData) => {
    try {
      const apiPayload: {
        details: Array<{
          purpose: "BOOK_FEE" | "TUITION_FEE" | "TRANSPORT_FEE" | "OTHER" | "ADMISSION_FEE";
          paid_amount: number;
          payment_method: "CASH" | "ONLINE";
          term_number?: number;
          payment_month?: string;
          custom_purpose_name?: string;
        }>;
        remarks?: string;
      } = {
        details: paymentData.details.map(detail => {
          const baseDetail: {
            purpose: "BOOK_FEE" | "TUITION_FEE" | "TRANSPORT_FEE" | "OTHER" | "ADMISSION_FEE";
            paid_amount: number;
            payment_method: "CASH" | "ONLINE";
            term_number?: number;
            payment_month?: string;
            custom_purpose_name?: string;
          } = {
            purpose: detail.purpose as "BOOK_FEE" | "TUITION_FEE" | "TRANSPORT_FEE" | "OTHER" | "ADMISSION_FEE",
            paid_amount: detail.amount,
            payment_method: (detail.paymentMethod === "CHEQUE" || detail.paymentMethod === "DD" ? "CASH" : detail.paymentMethod),
          };

          // Add term_number for TUITION_FEE
          if (detail.purpose === "TUITION_FEE" && detail.termNumber) {
            baseDetail.term_number = detail.termNumber;
          }

          // Add payment_month for TRANSPORT_FEE (college uses monthly payments, not terms)
          if (detail.purpose === "TRANSPORT_FEE" && 'paymentMonth' in detail && detail.paymentMonth) {
            baseDetail.payment_month = detail.paymentMonth; // Should be in YYYY-MM-01 format
          }

          // Add custom_purpose_name for OTHER
          if (detail.purpose === "OTHER" && detail.customPurposeName) {
            baseDetail.custom_purpose_name = detail.customPurposeName;
          }

          return baseDetail;
        }),
        remarks: paymentData.remarks || undefined,
      };

      // Use the specialized API function that handles income_id extraction and receipt generation
      const result = await handleCollegePayByAdmissionWithIncomeId(paymentData.admissionNo, apiPayload);

      // Handle successful payment

      // Store admission number for re-search after form closes
      paymentSuccessRef.current = paymentData.admissionNo;

      // Don't close the form immediately - let MultiplePaymentForm handle it after receipt modal closes
      // setSelectedStudent(null);
      // setIsFormOpen(false);

      // Return the result so MultiplePaymentForm can extract income_id and blobUrl
      return result;
    } catch (error) {
      // Reset payment success flag on error
      paymentSuccessRef.current = null;
      
      // Parse error message and provide user-friendly feedback based on markdown guide
      let errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      let errorTitle = "Payment Failed";
      
      // Handle specific error types from the markdown guide
      if (errorMessage.includes("Student not found")) {
        errorTitle = "Student Not Found";
        errorMessage = "Student not found. Please check the admission number.";
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
        errorMessage = "This fee must be paid in full. Partial payments are not allowed.";
      } else if (errorMessage.includes("Book fee prerequisite")) {
        errorTitle = "Book Fee Required";
        errorMessage = "Book fee must be paid before tuition fees.";
      } else if (errorMessage.includes("Sequential payment validation failed")) {
        errorTitle = "Sequential Payment Required";
        errorMessage = "Please pay pending months first.";
      } else if (errorMessage.includes("Transport assignment not found")) {
        errorTitle = "Transport Assignment Not Found";
        errorMessage = "Student does not have an active transport assignment.";
      } else if (errorMessage.includes("Duplicate payment months")) {
        errorTitle = "Duplicate Payment";
        errorMessage = "Each month can only be paid once per transaction.";
      } else if (errorMessage.includes("Missing required parameter")) {
        errorTitle = "Missing Information";
        // Keep original message as it's specific
      }
      
      toast({
        title: errorTitle,
        description: errorMessage,
        variant: "destructive",
      });
      
      throw error;
    }
  };

  const transformStudentData = async (studentDetails: StudentFeeDetails): Promise<{ student: StudentInfo; feeBalances: FeeBalance }> => {
    const enrollment = studentDetails.enrollment;
    const tuitionData = studentDetails.tuitionBalance;

    // Get enrollment_id directly from enrollment
    const enrollmentId = enrollment.enrollment_id;

    // Try to get transport fee total from transport payment summary
    // For colleges, transport fees are monthly-based only (not term-based)
    let transportFeeTotal: number | undefined = undefined;
    try {
      const transportSummary = await CollegeTransportBalancesService.getStudentTransportPaymentSummary();
      const matchingItem = transportSummary?.items?.find(
        (item) => item.admission_no === enrollment.admission_no
      );
      if (matchingItem) {
        // Get total_fee from summary (monthly-based for colleges)
        transportFeeTotal = typeof matchingItem.total_fee === 'string' 
          ? parseFloat(matchingItem.total_fee) || 0 
          : (matchingItem.total_fee || 0);
      }
    } catch (error) {
      // Silently fail - transportFeeTotal is optional
      // Will use fallback values if fetch fails
    }

    const student: StudentInfo = {
      studentId: String(enrollment.student_id),
      admissionNo: enrollment.admission_no,
      name: enrollment.student_name,
      className: enrollment.class_name || 'N/A',
      academicYear: '2025-2026', // Default academic year
      enrollmentId: enrollmentId
    };

    const bookFeeTotal = tuitionData?.book_fee ?? 0;
    const bookFeePaid = tuitionData?.book_paid ?? 0;
    const term1Amount = tuitionData?.term1_amount ?? 0;
    const term1Paid = tuitionData?.term1_paid ?? 0;
    const term2Amount = tuitionData?.term2_amount ?? 0;
    const term2Paid = tuitionData?.term2_paid ?? 0;
    const term3Amount = tuitionData?.term3_amount ?? 0;
    const term3Paid = tuitionData?.term3_paid ?? 0;

    // For colleges, transport fees are monthly-based only (NOT term-based)
    // Use total_fee from transport payment summary if available
    // DO NOT sum term amounts - colleges don't use terms for transport fees
    // If transportFeeTotal is not available from summary, set to 0 (component will handle expected payments)
    const transportTotal = transportFeeTotal ?? 0;

    const feeBalances: FeeBalance = {
      bookFee: {
        total: bookFeeTotal,
        paid: bookFeePaid,
        outstanding: Math.max(0, bookFeeTotal - bookFeePaid)
      },
      tuitionFee: {
        total: term1Amount + term2Amount + term3Amount,
        term1: {
          paid: term1Paid,
          outstanding: Math.max(0, term1Amount - term1Paid)
        },
        term2: {
          paid: term2Paid,
          outstanding: Math.max(0, term2Amount - term2Paid)
        },
        term3: {
          paid: term3Paid,
          outstanding: Math.max(0, term3Amount - term3Paid)
        }
      },
      transportFee: {
        // For colleges: monthly-based only - use total directly, no term structure
        total: transportTotal,
        // term1 and term2 should be undefined for colleges (only used by schools)
        term1: undefined,
        term2: undefined
      }
    };

    return { student, feeBalances };
  };

  // Wrapper component to handle async transformStudentData
  const TransformStudentDataWrapper = ({ 
    studentDetails, 
    onPaymentComplete, 
    onCancel 
  }: { 
    studentDetails: StudentFeeDetails; 
    onPaymentComplete: (data: MultiplePaymentData) => Promise<unknown>; 
    onCancel: () => void;
  }) => {
    const [transformedData, setTransformedData] = useState<{ student: StudentInfo; feeBalances: FeeBalance } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      transformStudentData(studentDetails)
        .then((data) => {
          setTransformedData(data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Error transforming student data:", error);
          // Fallback to synchronous transform using enrollment data
          const enrollment = studentDetails.enrollment;
          const tuitionData = studentDetails.tuitionBalance;

          const student: StudentInfo = {
            studentId: String(enrollment.student_id ?? 0),
            admissionNo: enrollment.admission_no,
            name: enrollment.student_name,
            className: enrollment.class_name ?? 'N/A',
            academicYear: '2025-2026',
            enrollmentId: enrollment.enrollment_id
          };

          const bookFeeTotal = tuitionData?.book_fee ?? 0;
          const bookFeePaid = tuitionData?.book_paid ?? 0;
          const term1Amount = tuitionData?.term1_amount ?? 0;
          const term1Paid = tuitionData?.term1_paid ?? 0;
          const term2Amount = tuitionData?.term2_amount ?? 0;
          const term2Paid = tuitionData?.term2_paid ?? 0;
          const term3Amount = tuitionData?.term3_amount ?? 0;
          const term3Paid = tuitionData?.term3_paid ?? 0;

          // For colleges, transport fees are monthly-based only (NOT term-based)
          // We can't reliably get total from term-based data - set to 0
          // Component will handle expected payments via enrollment_id (which we don't have in fallback)
          // DO NOT sum term amounts - colleges don't use terms for transport fees
          const transportTotal = 0;

          const feeBalances: FeeBalance = {
            bookFee: {
              total: bookFeeTotal,
              paid: bookFeePaid,
              outstanding: Math.max(0, bookFeeTotal - bookFeePaid)
            },
            tuitionFee: {
              total: term1Amount + term2Amount + term3Amount,
              term1: {
                paid: term1Paid,
                outstanding: Math.max(0, term1Amount - term1Paid)
              },
              term2: {
                paid: term2Paid,
                outstanding: Math.max(0, term2Amount - term2Paid)
              },
              term3: {
                paid: term3Paid,
                outstanding: Math.max(0, term3Amount - term3Paid)
              }
            },
            transportFee: {
              // For colleges: monthly-based only - use total directly, no term structure
              total: transportTotal,
              // term1 and term2 should be undefined for colleges (only used by schools)
              term1: undefined,
              term2: undefined
            }
          };

          setTransformedData({ student, feeBalances });
          setIsLoading(false);
        });
    }, [studentDetails]);

    if (isLoading || !transformedData) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <p className="text-sm text-muted-foreground">Loading student data...</p>
          </div>
        </div>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-6"
      >
        <CollegeMultiplePaymentForm
          {...transformedData}
          onPaymentComplete={onPaymentComplete}
          onCancel={onCancel}
        />
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Show search only when form is NOT open */}
      {!isFormOpen && (
        <CollectFeeSearch 
          onStudentSelected={() => {}} 
          paymentMode="multiple"
          onStartPayment={(studentDetails: StudentFeeDetails) => {
            handleStartPayment(studentDetails);
            // Update URL when starting payment
            const admissionNo = studentDetails?.enrollment?.admission_no;
            if (admissionNo) {
              setTimeout(() => updateUrlWithAdmission(admissionNo), 0);
            }
          }}
          searchResults={searchResults}
          setSearchResults={setSearchResults}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />
      )}

      {/* Multiple Payment Form - Renders when student is selected */}
      {selectedStudent && isFormOpen && (
        <TransformStudentDataWrapper
          studentDetails={selectedStudent}
          onPaymentComplete={handleMultiplePaymentComplete}
          onCancel={handleFormClose}
        />
      )}
    </div>
  );
};
