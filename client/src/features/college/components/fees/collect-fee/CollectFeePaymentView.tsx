import React, { useMemo } from "react";
import { useAuthStore } from "@/core/auth/authStore";
import {
  CollectFeePaymentView as SharedCollectFeePaymentView,
  type FeeItemShape,
} from "@/common/components/shared/payment/CollectFeePaymentView";
import type { StudentFeeDetails } from "./CollectFee";
import { useUpdateCollegeTuitionBalance } from "@/features/college/hooks/use-college-tuition-balances";

function getItemId(type: string, id: string | number) {
  return `${type}_${id}`;
}

interface CollectFeePaymentViewProps {
  studentDetails: StudentFeeDetails;
  onPaymentComplete: (data: import("@/common/components/shared/payment/types/PaymentTypes").MultiplePaymentData) => Promise<any>;
  onCancel: () => void;
}

export const CollectFeePaymentView = ({
  studentDetails,
  onPaymentComplete,
  onCancel,
}: CollectFeePaymentViewProps) => {
  const branchName = useAuthStore((s) => s.currentBranch?.branch_name ?? "Branch");
  const { enrollment, tuitionBalance, transportExpectedPayments, transportBalance } =
    studentDetails;

  const updateTuitionBalance = useUpdateCollegeTuitionBalance(enrollment.enrollment_id);

  const handleUpdateBookFee = async (amount: number) => {
    await updateTuitionBalance.mutateAsync({ book_fee: amount });
  };

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

    // College transport fee: monthly payments (expected_payment_month); API expects payment_month (YYYY-MM-01) per detail
    const transportItems: FeeItemShape[] = [];
    if (
      transportExpectedPayments?.expected_payments &&
      transportExpectedPayments.expected_payments.length > 0
    ) {
      transportExpectedPayments.expected_payments.forEach((payment, idx) => {
        const amount =
          typeof payment.payment_amount === "string"
            ? parseFloat(payment.payment_amount)
            : payment.payment_amount || 0;
        if (amount > 0 && payment.payment_status !== "PAID") {
          transportItems.push({
            id: getItemId("transport", payment.expected_payment_month),
            type: "TRANSPORT_FEE",
            label: new Date(payment.expected_payment_month).toLocaleString(
              "default",
              { month: "long", year: "numeric" }
            ),
            originalAmount: amount,
            paymentMonth: payment.expected_payment_month,
          });
        }
      });
    }
    if (
      transportItems.length === 0 &&
      transportBalance &&
      Number(transportBalance.total_amount_pending) > 0
    ) {
      transportItems.push({
        id: getItemId("transport", "balance"),
        type: "TRANSPORT_FEE",
        label: "Transport Fee Balance",
        originalAmount: Number(transportBalance.total_amount_pending),
      });
    }
    categories.TRANSPORT_FEE = transportItems;

    return categories;
  }, [tuitionBalance, transportExpectedPayments, transportBalance]);

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
      onUpdateBookFee={handleUpdateBookFee}
      onCancel={onCancel}
    />
  );
};
