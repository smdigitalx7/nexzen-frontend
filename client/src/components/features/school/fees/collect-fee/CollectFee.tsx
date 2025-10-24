import { useState } from "react";
import { motion } from "framer-motion";
import { CollectFeeSearch } from "./CollectFeeSearch";
import { SchoolMultiplePaymentForm } from "../multiple-payment/SchoolMultiplePaymentForm";
import type { StudentInfo, FeeBalance, MultiplePaymentData } from "@/components/shared/payment/types/PaymentTypes";
import { handlePayByAdmissionWithIncomeId } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface StudentFeeDetails {
  student: any;
  tuitionBalance: any;
  transportBalance: any;
}

export const CollectFee = () => {
  const { toast } = useToast();
  const [selectedStudent, setSelectedStudent] = useState<StudentFeeDetails | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'single' | 'multiple'>('multiple');

  const handleStartPayment = (studentDetails: StudentFeeDetails) => {
    // Ensure we're in multiple payment mode
    setPaymentMode('multiple');
    setSelectedStudent(studentDetails);
    setIsFormOpen(true);
  };

  const handlePaymentComplete = () => {
    // Refresh data or show success message
    setSelectedStudent(null);
    setIsFormOpen(false);
  };

  const handleFormClose = () => {
    setSelectedStudent(null);
    setIsFormOpen(false);
  };

  const handleMultiplePaymentComplete = async (paymentData: MultiplePaymentData) => {
    try {
      // Transform data for the specialized API
      const apiPayload = {
        details: paymentData.details.map(detail => ({
          purpose: detail.purpose as "BOOK_FEE" | "TUITION_FEE" | "TRANSPORT_FEE" | "OTHER" | "ADMISSION_FEE",
          custom_purpose_name: detail.customPurposeName || undefined,
          term_number: detail.termNumber || undefined,
          paid_amount: detail.amount,
          payment_method: detail.paymentMethod === "CHEQUE" ? "CASH" : detail.paymentMethod as "CASH" | "ONLINE",
        })),
        remarks: paymentData.remarks || undefined,
      };

      // Use the specialized API function that handles income_id extraction and receipt generation
      const result = await handlePayByAdmissionWithIncomeId(paymentData.admissionNo, apiPayload, 'school');
      
      // Handle successful payment
      console.log('Multiple payment completed successfully:', result);
      
      // Don't close the form immediately - let MultiplePaymentForm handle it after receipt modal closes
      // setSelectedStudent(null);
      // setIsFormOpen(false);

      // Return the result so MultiplePaymentForm can extract income_id
      return result;
    } catch (error) {
      console.error('Multiple payment error:', error);
      
      // Show error toast
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive",
      });
      
      // Re-throw the error so MultiplePaymentForm can handle it
      throw error;
    }
  };

  // Transform existing student data to new format
  const transformStudentData = (studentDetails: StudentFeeDetails): { student: StudentInfo; feeBalances: FeeBalance } => {
    const student: StudentInfo = {
      studentId: studentDetails.student.student_id || studentDetails.student.id,
      admissionNo: studentDetails.student.admission_no,
      name: studentDetails.student.student_name,
      className: studentDetails.student.section_name || studentDetails.student.class_name || 'N/A',
      academicYear: studentDetails.student.academic_year || '2025-2026'
    };

    const feeBalances: FeeBalance = {
      bookFee: {
        total: studentDetails.tuitionBalance?.book_fee || 0,
        paid: studentDetails.tuitionBalance?.book_paid || 0,
        outstanding: Math.max(0, (studentDetails.tuitionBalance?.book_fee || 0) - (studentDetails.tuitionBalance?.book_paid || 0))
      },
      tuitionFee: {
        total: (studentDetails.tuitionBalance?.term1_amount || 0) + (studentDetails.tuitionBalance?.term2_amount || 0) + (studentDetails.tuitionBalance?.term3_amount || 0),
        term1: {
          paid: studentDetails.tuitionBalance?.term1_paid || 0,
          outstanding: Math.max(0, (studentDetails.tuitionBalance?.term1_amount || 0) - (studentDetails.tuitionBalance?.term1_paid || 0))
        },
        term2: {
          paid: studentDetails.tuitionBalance?.term2_paid || 0,
          outstanding: Math.max(0, (studentDetails.tuitionBalance?.term2_amount || 0) - (studentDetails.tuitionBalance?.term2_paid || 0))
        },
        term3: {
          paid: studentDetails.tuitionBalance?.term3_paid || 0,
          outstanding: Math.max(0, (studentDetails.tuitionBalance?.term3_amount || 0) - (studentDetails.tuitionBalance?.term3_paid || 0))
        }
      },
      transportFee: {
        total: (studentDetails.transportBalance?.term1_amount || 0) + (studentDetails.transportBalance?.term2_amount || 0),
        term1: {
          paid: studentDetails.transportBalance?.term1_paid || 0,
          outstanding: Math.max(0, (studentDetails.transportBalance?.term1_amount || 0) - (studentDetails.transportBalance?.term1_paid || 0))
        },
        term2: {
          paid: studentDetails.transportBalance?.term2_paid || 0,
          outstanding: Math.max(0, (studentDetails.transportBalance?.term2_amount || 0) - (studentDetails.transportBalance?.term2_paid || 0))
        }
      }
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
          onStartPayment={handleStartPayment}
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
