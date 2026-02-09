import React, { useMemo } from "react";
import { useAuthStore } from "@/core/auth/authStore";
import {
  CollectFeePaymentView as SharedCollectFeePaymentView,
  type FeeItemShape,
} from "@/common/components/shared/payment/CollectFeePaymentView";
import type { StudentFeeDetails } from "@/features/school/hooks/useStudentFeeDetails";

function getItemId(type: string, id: string | number) {
  return `${type}_${id}`;
}

interface CollectFeePaymentViewProps {
  studentDetails: StudentFeeDetails;
  onPaymentComplete: (data: import("@/common/components/shared/payment/types/PaymentTypes").MultiplePaymentData) => Promise<any>;
  onCancel: () => void;
}

export const SchoolCollectFeePaymentView = ({
  studentDetails,
  onPaymentComplete,
  onCancel,
}: CollectFeePaymentViewProps) => {
  const branchName = useAuthStore((s) => s.currentBranch?.branch_name ?? "Branch");
  const { enrollment, tuitionBalance, transportBalance } = studentDetails;

  const feeCategories = useMemo(() => {
    const categories: {
      BOOK_FEE: FeeItemShape[];
      TUITION_FEE: FeeItemShape[];
      TRANSPORT_FEE: FeeItemShape[];
    } = {
      BOOK_FEE: [],
      TUITION_FEE: [],
      TRANSPORT_FEE: [],
    };

    if (tuitionBalance) {
      const bookOutstanding = Math.max(
        0,
        (tuitionBalance.book_fee || 0) - (tuitionBalance.book_paid || 0)
      );
      if (bookOutstanding > 0) {
        categories.BOOK_FEE.push({
          id: getItemId("book", "fee"),
          type: "BOOK_FEE",
          label: "Book & Kit Fee",
          originalAmount: bookOutstanding,
        });
      }

      [
        { term: 1, amount: tuitionBalance.term1_amount, paid: tuitionBalance.term1_paid },
        { term: 2, amount: tuitionBalance.term2_amount, paid: tuitionBalance.term2_paid },
        { term: 3, amount: tuitionBalance.term3_amount, paid: tuitionBalance.term3_paid },
      ].forEach((t) => {
        const outstanding = Math.max(0, (t.amount || 0) - (t.paid || 0));
        if (outstanding > 0) {
          categories.TUITION_FEE.push({
            id: getItemId("tuition", t.term),
            type: "TUITION_FEE",
            label: `Term ${t.term} Tuition`,
            originalAmount: outstanding,
            termNumber: t.term,
          });
        }
      });
    }

    if (transportBalance) {
      [
        { term: 1, amount: transportBalance.term1_amount, paid: transportBalance.term1_paid },
        { term: 2, amount: transportBalance.term2_amount, paid: transportBalance.term2_paid },
      ].forEach((t) => {
        const outstanding = Math.max(0, (t.amount || 0) - (t.paid || 0));
        if (outstanding > 0) {
          categories.TRANSPORT_FEE.push({
            id: getItemId("transport", t.term),
            type: "TRANSPORT_FEE",
            label: `Term ${t.term} Transport`,
            originalAmount: outstanding,
            termNumber: t.term,
          });
        }
      });
    }

    return categories;
  }, [tuitionBalance, transportBalance]);

  const isBookFeePending = feeCategories.BOOK_FEE.length > 0;

  return (
    <SharedCollectFeePaymentView
      branchName={branchName}
      studentLabel={enrollment.student_name}
      admissionNo={enrollment.admission_no}
      feeCategories={feeCategories}
      isBookFeePending={isBookFeePending}
      enrollmentId={enrollment.enrollment_id}
      onPaymentComplete={onPaymentComplete}
      onCancel={onCancel}
    />
  );
};
