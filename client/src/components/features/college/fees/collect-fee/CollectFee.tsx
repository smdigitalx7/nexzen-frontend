import { useState } from "react";
import { motion } from "framer-motion";
import { CollectFeeSearch } from "./CollectFeeSearch";
import { CollectFeeForm } from "./CollectFeeForm";
import { CollegeMultiplePaymentForm } from "../multiple-payment/CollegeMultiplePaymentForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Layers } from "lucide-react";
import type { StudentInfo, FeeBalance, MultiplePaymentData } from "@/components/shared/payment/types/PaymentTypes";
import { handlePayByAdmissionWithIncomeId } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface StudentFeeDetails {
  student: any;
  tuitionBalance: any;
  transportBalance?: any; // Make optional since college might not have transport
}

export const CollectFee = () => {
  const { toast } = useToast();
  const [selectedStudent, setSelectedStudent] = useState<StudentFeeDetails | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'single' | 'multiple'>('single');

  const handleStartPayment = (studentDetails: StudentFeeDetails) => {
    setSelectedStudent(studentDetails);
    setIsFormOpen(true);
    // If user clicks "Collect Fee" button, automatically switch to multiple payment mode
    // to show the new multiple payment form workflow
    setPaymentMode('multiple');
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
      const result = await handlePayByAdmissionWithIncomeId(paymentData.admissionNo, apiPayload, 'college');
      
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
      <motion.div
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
      </motion.div>

      {/* Payment Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Payment Mode
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button
              variant={paymentMode === 'single' ? 'default' : 'outline'}
              onClick={() => setPaymentMode('single')}
              className="flex items-center gap-2"
            >
              <CreditCard className="h-4 w-4" />
              Single Payment
            </Button>
            <Button
              variant={paymentMode === 'multiple' ? 'default' : 'outline'}
              onClick={() => setPaymentMode('multiple')}
              className="flex items-center gap-2"
            >
              <Layers className="h-4 w-4" />
              Multiple Payment
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            {paymentMode === 'single' 
              ? 'Collect individual fee payments one at a time'
              : 'Collect multiple fee payments in a single transaction'
            }
          </p>
        </CardContent>
      </Card>

      <CollectFeeSearch 
        onStudentSelected={() => {}} 
        paymentMode={paymentMode}
        onStartPayment={handleStartPayment}
      />

      {/* Single Payment Form */}
      {paymentMode === 'single' && (
        <CollectFeeForm
          isOpen={isFormOpen}
          onClose={handleFormClose}
          selectedStudent={selectedStudent}
          onPaymentComplete={handlePaymentComplete}
        />
      )}

      {/* Multiple Payment Form */}
      {paymentMode === 'multiple' && selectedStudent && isFormOpen && (
        <CollegeMultiplePaymentForm
          {...transformStudentData(selectedStudent)}
          onPaymentComplete={handleMultiplePaymentComplete}
          onCancel={handleFormClose}
        />
      )}
    </div>
  );
};
