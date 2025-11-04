/**
 * College Multiple Payment Form Integration
 * College-specific wrapper for the multiple payment form
 */

import React from 'react';
import { MultiplePaymentForm } from '@/components/shared/payment/multiple-payment/MultiplePaymentForm';
import { collegePaymentConfig } from '@/components/shared/payment/config/PaymentConfig';
import type { StudentInfo, FeeBalance, MultiplePaymentData } from '@/components/shared/payment/types/PaymentTypes';

interface CollegeMultiplePaymentFormProps {
  student: StudentInfo;
  feeBalances: FeeBalance;
  onPaymentComplete: (data: MultiplePaymentData) => Promise<any>;
  onCancel: () => void;
}

export const CollegeMultiplePaymentForm: React.FC<CollegeMultiplePaymentFormProps> = ({
  student,
  feeBalances,
  onPaymentComplete,
  onCancel
}) => {
  return (
    <MultiplePaymentForm
      student={student}
      feeBalances={feeBalances}
      config={collegePaymentConfig}
      onPaymentComplete={onPaymentComplete}
      onCancel={onCancel}
    />
  );
};

export default CollegeMultiplePaymentForm;
