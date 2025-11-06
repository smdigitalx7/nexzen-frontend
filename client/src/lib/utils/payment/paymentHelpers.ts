/**
 * Payment Helper Utilities
 *
 * This file contains utilities and examples for handling payment processing
 * with automatic receipt printing functionality using modal display.
 */

import { handleRegenerateReceipt } from "@/lib/api";
import {
  handlePayAndPrint,
  handlePayByReservation,
  handlePayByAdmission,
} from "@/lib/api-school";
import { SchoolReservationsService } from "@/lib/services/school/reservations.service";
import { DatePicker } from "@/components/ui/date-picker";

/**
 * Example payment data structure
 */
export interface PaymentData {
  amount: number;
  payment_method: "cash" | "card" | "bank_transfer" | "cheque";
  payment_date: string;
  remarks?: string;
  fee_type?: string;
  academic_year?: string;
}

/**
 * Example React component usage for payment processing with modal
 *
 * This shows how to integrate payment functionality with the ReceiptPreviewModal
 */
export const PaymentComponentWithModalExample = `
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { ReceiptPreviewModal } from '@/components/shared';
import { handlePayAndPrint, handleRegenerateReceipt } from '@/lib/api';
import { PaymentData } from '@/lib/utils/payment';

export function PaymentFormWithModal({ admissionNo }: { admissionNo: string }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptBlobUrl, setReceiptBlobUrl] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData>({
    amount: 0,
    payment_method: 'CASH',
    payment_date: new Date().toISOString().split('T')[0],
    remarks: '',
    fee_type: 'TUITION',
    academic_year: '2024-25'
  });

  const handlePayment = async () => {
    if (!paymentData.amount || paymentData.amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid payment amount.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    
    try {
      // Process payment and get blob URL for modal display
      const blobUrl = await handlePayAndPrint(admissionNo, paymentData);
      setReceiptBlobUrl(blobUrl);
      setShowReceiptModal(true);
      
      toast({
        title: "Payment Successful",
        description: "Payment processed successfully. Receipt is ready for viewing.",
        variant: "success",
      });
      
      // Reset form
      setPaymentData({
        amount: 0,
        payment_method: 'cash',
        payment_date: new Date().toISOString().split('T')[0],
        remarks: '',
        fee_type: 'TUITION',
        academic_year: '2024-25'
      });
      
    } catch (error) {
      console.error('Payment processing failed:', error);
      
      toast({
        title: "Payment Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseReceiptModal = () => {
    setShowReceiptModal(false);
    if (receiptBlobUrl) {
      URL.revokeObjectURL(receiptBlobUrl);
      setReceiptBlobUrl(null);
    }
  };

  return (
    <>
      <div className="space-y-4 p-6">
        <h2 className="text-2xl font-bold">Payment Processing</h2>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              value={paymentData.amount}
              onChange={(e) => setPaymentData(prev => ({
                ...prev,
                amount: parseFloat(e.target.value) || 0
              }))}
              placeholder="Enter amount"
            />
          </div>
          
          <div>
            <Label htmlFor="payment_method">Payment Method</Label>
            <Select
              value={paymentData.payment_method}
              onValueChange={(value: PaymentData['payment_method']) => 
                setPaymentData(prev => ({ ...prev, payment_method: value }))
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="ONLINE">Online</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="payment_date">Payment Date</Label>
            <DatePicker
              id="payment_date"
              value={paymentData.payment_date}
              onChange={(value) => setPaymentData(prev => ({
                ...prev,
                payment_date: value
              }))}
              placeholder="Select payment date"
            />
          </div>
          
          <div>
            <Label htmlFor="remarks">Remarks (Optional)</Label>
            <Input
              id="remarks"
              value={paymentData.remarks}
              onChange={(e) => setPaymentData(prev => ({
                ...prev,
                remarks: e.target.value
              }))}
              placeholder="Additional notes"
            />
          </div>
        </div>
        
        <Button 
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full"
        >
          {isProcessing ? 'Processing Payment...' : 'Process Payment & View Receipt'}
        </Button>
      </div>

      {/* Receipt Preview Modal */}
      <ReceiptPreviewModal
        isOpen={showReceiptModal}
        onClose={handleCloseReceiptModal}
        blobUrl={receiptBlobUrl}
      />
    </>
  );
}
`;

/**
 * Direct usage example with modal integration
 */
export const directUsageWithModalExample = `
import { handlePayByReservation, handlePayByAdmission, handleRegenerateReceipt } from '@/lib/api';
import { ReceiptPreviewModal } from '@/components/shared';
import { useState } from 'react';

function PaymentComponent() {
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptBlobUrl, setReceiptBlobUrl] = useState<string | null>(null);

  // Process reservation payment and show receipt in modal
  const handleReservationPayment = async () => {
    try {
      const { blobUrl, income_id, paymentData } = await handlePayByReservation('RS-NZN25260105', {
        details: [{ 
          purpose: 'APPLICATION_FEE', 
          paid_amount: 1000, 
          payment_method: 'CASH' 
        }],
        remarks: 'Payment for application fee'
      });
      console.log('Income ID:', income_id, 'Payment Data:', paymentData);
      setReceiptBlobUrl(blobUrl);
      setShowReceiptModal(true);
    } catch (error) {
      console.error('Reservation payment failed:', error);
    }
  };

  // Process admission payment and show receipt in modal
  const handleAdmissionPayment = async () => {
    try {
      const blobUrl = await handlePayByAdmission('ADM001', {
        details: [{ 
          purpose: 'ADMISSION_FEE', 
          paid_amount: 5000, 
          payment_method: 'CASH' 
        }],
        remarks: 'Payment for admission fee'
      });
      // Note: handlePayByAdmission returns just blobUrl (string)
      // Use handlePayByAdmissionWithIncomeId for income_id and paymentData
      setReceiptBlobUrl(blobUrl);
      setShowReceiptModal(true);
    } catch (error) {
      console.error('Admission payment failed:', error);
    }
  };

  // Regenerate existing receipt
  const handleRegenerate = async () => {
    try {
      const blobUrl = await handleRegenerateReceipt(221);
      setReceiptBlobUrl(blobUrl);
      setShowReceiptModal(true);
    } catch (error) {
      console.error('Receipt regeneration failed:', error);
    }
  };

  const handleCloseModal = () => {
    setShowReceiptModal(false);
    if (receiptBlobUrl) {
      URL.revokeObjectURL(receiptBlobUrl);
      setReceiptBlobUrl(null);
    }
  };

  return (
    <>
      <button onClick={handleReservationPayment}>Process Reservation Payment</button>
      <button onClick={handleAdmissionPayment}>Process Admission Payment</button>
      <button onClick={handleRegenerate}>Regenerate Receipt</button>
      
      <ReceiptPreviewModal
        isOpen={showReceiptModal}
        onClose={handleCloseModal}
        blobUrl={receiptBlobUrl}
      />
    </>
  );
}
`;

/**
 * Error handling examples
 */
export const errorHandlingExamples = `
// Example with comprehensive error handling
const handlePaymentWithErrorHandling = async (admissionNo: string, paymentData: PaymentData) => {
  try {
    const blobUrl = await handlePayAndPrint(admissionNo, paymentData);
    setReceiptBlobUrl(blobUrl);
    setShowReceiptModal(true);
    
    toast({
      title: "Payment Successful",
      description: "Receipt is ready for viewing.",
      variant: "success",
    });
    
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Authentication')) {
        toast({
          title: "Authentication Error",
          description: "Please log in again to process the payment.",
          variant: "destructive"
        });
      } else if (error.message.includes('Network')) {
        toast({
          title: "Network Error",
          description: "Please check your internet connection and try again.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Payment Failed",
          description: error.message,
          variant: "destructive"
        });
      }
    } else {
      toast({
        title: "Unexpected Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  }
};
`;

/**
 * Utility function to validate payment data
 */
export function validatePaymentData(data: PaymentData): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!data.amount || data.amount <= 0) {
    errors.push("Amount must be greater than 0");
  }

  if (!data.payment_method) {
    errors.push("Payment method is required");
  }

  if (!data.payment_date) {
    errors.push("Payment date is required");
  }

  if (data.amount > 100000) {
    errors.push("Amount exceeds maximum limit");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Utility function to format payment data for API
 */
export function formatPaymentDataForAPI(data: PaymentData) {
  return {
    amount: data.amount,
    payment_method: data.payment_method,
    payment_date: data.payment_date,
    remarks: data.remarks || "",
    fee_type: data.fee_type || "tuition",
    academic_year: data.academic_year || new Date().getFullYear().toString(),
  };
}

/**
 * Utility function to validate income ID for receipt regeneration
 */
export function validateIncomeId(incomeId: number | undefined): {
  isValid: boolean;
  error?: string;
} {
  if (!incomeId) {
    return {
      isValid: false,
      error: "Income ID is required for receipt regeneration",
    };
  }

  if (incomeId <= 0) {
    return {
      isValid: false,
      error: "Invalid income ID",
    };
  }

  return {
    isValid: true,
  };
}
