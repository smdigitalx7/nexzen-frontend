/**
 * School Multiple Payment Form Integration
 * School-specific wrapper for the multiple payment form
 */

import React from 'react';
import { MultiplePaymentForm } from '@/components/shared/payment';
import { schoolPaymentConfig } from '@/components/shared/payment/config/PaymentConfig';
import type { StudentInfo, FeeBalance, MultiplePaymentData } from '@/components/shared/payment/types/PaymentTypes';

interface SchoolMultiplePaymentFormProps {
  student: StudentInfo;
  feeBalances: FeeBalance;
  onPaymentComplete: (data: MultiplePaymentData) => void;
  onCancel: () => void;
}

export const SchoolMultiplePaymentForm: React.FC<SchoolMultiplePaymentFormProps> = ({
  student,
  feeBalances,
  onPaymentComplete,
  onCancel
}) => {
  return (
    <MultiplePaymentForm
      student={student}
      feeBalances={feeBalances}
      config={schoolPaymentConfig}
      onPaymentComplete={onPaymentComplete}
      onCancel={onCancel}
    />
  );
};

export default SchoolMultiplePaymentForm;
