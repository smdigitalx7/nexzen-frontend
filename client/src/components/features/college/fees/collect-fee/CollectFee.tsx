import { useState } from "react";
import { motion } from "framer-motion";
import { CollectFeeSearch } from "./CollectFeeSearch";
import { CollegeMultiplePaymentForm } from "../multiple-payment/CollegeMultiplePaymentForm";
import type { StudentInfo, FeeBalance, MultiplePaymentData } from "@/components/shared/payment/types/PaymentTypes";
import { handleCollegePayByAdmissionWithIncomeId } from "@/lib/api-college";
import { useToast } from "@/hooks/use-toast";

interface StudentFeeDetails {
  student: any;
  tuitionBalance: any;
  transportBalance?: any;
}

interface CollectFeeProps {
  searchResults: StudentFeeDetails[];
  setSearchResults: React.Dispatch<React.SetStateAction<StudentFeeDetails[]>>;
  searchQuery: string;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
}

export const CollectFee = ({ searchResults, setSearchResults, searchQuery, setSearchQuery }: CollectFeeProps) => {
  const { toast } = useToast();
  const [selectedStudent, setSelectedStudent] = useState<StudentFeeDetails | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const handleStartPayment = (studentDetails: StudentFeeDetails) => {
    setSelectedStudent(studentDetails);
    setIsFormOpen(true);
  };

  const handlePaymentComplete = () => {
    setSelectedStudent(null);
    setIsFormOpen(false);
  };

  const handleFormClose = () => {
    setSelectedStudent(null);
    setIsFormOpen(false);
  };

  const handleMultiplePaymentComplete = async (paymentData: MultiplePaymentData) => {
    try {
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

      const result = await handleCollegePayByAdmissionWithIncomeId(paymentData.admissionNo, apiPayload);
      
      console.log('Multiple payment completed successfully:', result);
      
      return result;
    } catch (error) {
      console.error('Multiple payment error:', error);
      
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: "destructive",
      });
      
      throw error;
    }
  };

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
        total: (studentDetails.transportBalance?.term1_amount || 0) + (studentDetails.transportBalance?.term2_amount || 0) + (studentDetails.transportBalance?.term3_amount || 0),
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
      {/* Show search only when form is NOT open */}
      {!isFormOpen && (
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

      {/* Multiple Payment Form - Renders when student is selected */}
      {selectedStudent && isFormOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          <CollegeMultiplePaymentForm
            {...transformStudentData(selectedStudent)}
            onPaymentComplete={handleMultiplePaymentComplete}
            onCancel={handleFormClose}
          />
        </motion.div>
      )}
    </div>
  );
};
