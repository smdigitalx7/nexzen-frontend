import { useState, useRef, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useLocation, useSearch } from "wouter";
import { CollectFeeSearch } from "./CollectFeeSearch";
import { SchoolMultiplePaymentForm } from "../multiple-payment/SchoolMultiplePaymentForm";
import type {
  StudentInfo,
  FeeBalance,
  MultiplePaymentData,
} from "@/components/shared/payment/types/PaymentTypes";
import { handleSchoolPayByAdmissionWithIncomeId as handlePayByAdmissionWithIncomeId } from "@/lib/api-school";
import { useToast } from "@/hooks/use-toast";
import { EnrollmentsService } from "@/lib/services/school/enrollments.service";
import { SchoolTuitionFeeBalancesService } from "@/lib/services/school/tuition-fee-balances.service";
import { SchoolTransportFeeBalancesService } from "@/lib/services/school/transport-fee-balances.service";
import type { SchoolEnrollmentWithStudentDetails } from "@/lib/types/school/enrollments";

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
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const search = useSearch();
  const [selectedStudent, setSelectedStudent] =
    useState<StudentFeeDetails | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<"single" | "multiple">(
    "multiple"
  );
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
    navigate(`${window.location.pathname}${newSearch ? `?${newSearch}` : ""}`, {
      replace: true,
    });
  };

  // Remove admission number from URL
  const removeAdmissionFromUrl = () => {
    const newSearchParams = new URLSearchParams(search);
    newSearchParams.delete("admission_no");
    const newSearch = newSearchParams.toString();
    navigate(`${window.location.pathname}${newSearch ? `?${newSearch}` : ""}`, {
      replace: true,
    });
  };

  const handleStartPayment = (studentDetails: StudentFeeDetails) => {
    // Ensure we're in multiple payment mode
    setPaymentMode("multiple");
    setSelectedStudent(studentDetails);
    setIsFormOpen(true);
    paymentSuccessRef.current = null; // Reset payment success flag
  };

  const handlePaymentComplete = () => {
    // Refresh data or show success message
    setSelectedStudent(null);
    setIsFormOpen(false);
  };

  // Search student function (reusable for both initial search and re-search)
  const searchStudent = async (admissionNo: string, showToast = true) => {
    try {
      // Update search query and URL
      setSearchQuery(admissionNo);
      // Update URL separately to avoid dependency issues
      setTimeout(() => updateUrlWithAdmission(admissionNo), 0);

      // Use enrollment endpoint to get enrollment data
      const enrollment = await EnrollmentsService.getByAdmission(admissionNo);
      
      // Fetch tuition and transport balances using enrollment_id
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
  };

  // Re-search the student after successful payment
  const reSearchStudent = async (admissionNo: string) => {
    await searchStudent(admissionNo, true);
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

  const handleMultiplePaymentComplete = async (
    paymentData: MultiplePaymentData
  ) => {
    try {
      // Transform data for the specialized API
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
          payment_method:
            detail.paymentMethod === "CHEQUE"
              ? "CASH"
              : (detail.paymentMethod as "CASH" | "ONLINE"),
        })),
        remarks: paymentData.remarks || undefined,
      };

      // Use the specialized API function that handles income_id extraction and receipt generation
      const result = await handlePayByAdmissionWithIncomeId(
        paymentData.admissionNo,
        apiPayload
      );

      // Handle successful payment

      // Store admission number for re-search after form closes
      paymentSuccessRef.current = paymentData.admissionNo;

      // Don't close the form immediately - let MultiplePaymentForm handle it after receipt modal closes
      // setSelectedStudent(null);
      // setIsFormOpen(false);

      // Return the result so MultiplePaymentForm can extract income_id
      return result;
    } catch (error) {
      console.error("Multiple payment error:", error);

      // Reset payment success flag on error
      paymentSuccessRef.current = null;

      // Show error toast
      toast({
        title: "Payment Failed",
        description:
          error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });

      // Re-throw the error so MultiplePaymentForm can handle it
      throw error;
    }
  };

  // Transform existing student data to new format
  const transformStudentData = (
    studentDetails: StudentFeeDetails
  ): { student: StudentInfo; feeBalances: FeeBalance } => {
    const student: StudentInfo = {
      studentId: String(studentDetails.enrollment.student_id),
      admissionNo: studentDetails.enrollment.admission_no,
      name: studentDetails.enrollment.student_name,
      className: studentDetails.tuitionBalance?.class_name || "N/A",
      academicYear: "2025-2026", // Enrollment doesn't have academic year, use default
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
  };

  return (
    <div className="space-y-6">
      {/* <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Collect Fee</h1>
          <p className="text-muted-foreground">
            Search for students and collect fee payments with receipt generation
          </p>
        </div>
      </motion.div> */}

      {/* Show search only when form is NOT open */}
      {!isFormOpen && (
        <CollectFeeSearch
          onStudentSelected={() => {}}
          paymentMode={paymentMode}
          onStartPayment={(studentDetails) => {
            handleStartPayment(studentDetails);
            // Update URL when starting payment
            if (studentDetails?.enrollment?.admission_no) {
              setTimeout(
                () =>
                  updateUrlWithAdmission(studentDetails.enrollment.admission_no),
                0
              );
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <SchoolMultiplePaymentForm
            {...transformStudentData(selectedStudent)}
            onPaymentComplete={handleMultiplePaymentComplete}
            onCancel={handleFormClose}
          />
        </motion.div>
      )}
    </div>
  );
};

export default CollectFee;
