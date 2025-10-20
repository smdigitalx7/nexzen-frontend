import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  AlertCircle,
  Receipt,
  User,
  GraduationCap,
  MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { PaymentData } from './PaymentProcessor';
import { PaymentSuccess } from './PaymentSuccess';
import { ReceiptDownload } from './ReceiptDownload';
import { SchoolIncomeService } from '@/lib/services/school/income.service';
import type { SchoolIncomeCreateReservation, SchoolIncomeRead } from '@/lib/types/school';
import { cn } from '@/lib/utils';

export interface ReservationPaymentData {
  reservationId: number;
  reservationNo: string; // This will be used as reservation_no in the API
  studentName: string;
  className: string;
  reservationFee: number; // Only reservation fee, not tuition/transport
  totalAmount: number;
  paymentMethod: 'CASH' | 'ONLINE';
  purpose: string;
  note?: string;
}

export interface ReservationPaymentProcessorProps {
  reservationData: ReservationPaymentData;
  onPaymentComplete?: (incomeRecord: SchoolIncomeRead) => void;
  onPaymentFailed?: (error: string) => void;
  onPaymentCancel?: () => void;
  className?: string;
}

const ReservationPaymentProcessor: React.FC<ReservationPaymentProcessorProps> = ({
  reservationData,
  onPaymentComplete,
  onPaymentFailed,
  onPaymentCancel,
  className
}) => {
  const [currentStep, setCurrentStep] = useState<'confirm' | 'processing' | 'success' | 'failed'>('confirm');
  const [showPaymentProcessor, setShowPaymentProcessor] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showReceipt, setShowReceipt] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [incomeRecord, setIncomeRecord] = useState<SchoolIncomeRead | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'CASH' | 'ONLINE'>('CASH');

  const handleConfirmPayment = async () => {
    try {
      setCurrentStep('processing');

      // Prepare the payload for the API
      const payload = {
        details: [
          {
            purpose: "APPLICATION_FEE", // Reservation fee purpose
            paid_amount: reservationData.totalAmount,
            payment_method: selectedPaymentMethod
          }
        ],
        remarks: reservationData.note || `Payment for reservation ${reservationData.reservationNo}`
      };

      // Call the API to record the payment method
      const response = await SchoolIncomeService.payFeeByReservation(
        reservationData.reservationNo, 
        payload
      );

      // Create income record for UI (API returns PDF, so we create the record for display)
      const incomeRecord = {
        income_id: Date.now(), // Temporary ID for UI
        reservation_id: reservationData.reservationId,
        purpose: "APPLICATION_FEE",
        amount: reservationData.totalAmount,
        income_date: new Date().toISOString().split('T')[0],
        payment_method: selectedPaymentMethod,
        note: reservationData.note,
        created_at: new Date().toISOString()
      };

      setIncomeRecord(incomeRecord as any);
      setCurrentStep('success');
      setShowSuccess(true);
      onPaymentComplete?.(incomeRecord as any);
    } catch (err: any) {
      setCurrentStep('failed');
      setError(err?.message || 'Failed to record payment method');
      onPaymentFailed?.(err?.message || 'Failed to record payment method');
    }
  };


  const handleRetry = () => {
    setCurrentStep('confirm');
    setError(null);
  };

  const handleDownloadReceipt = () => {
    setShowReceipt(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      case 'processing': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return CheckCircle;
      case 'failed': return XCircle;
      case 'processing': return Loader2;
      default: return CreditCard;
    }
  };

  const StatusIcon = getStatusIcon(currentStep);

  // Convert reservation data to payment data format
  const paymentData: PaymentData = {
    id: reservationData.reservationNo,
    amount: reservationData.totalAmount,
    currency: 'INR',
    description: `Reservation payment for ${reservationData.studentName}`,
    merchant: 'School Management System',
    paymentMethod: selectedPaymentMethod.toLowerCase() as any,
    status: currentStep === 'success' ? 'success' : currentStep === 'failed' ? 'failed' : 'pending',
    transactionId: incomeRecord?.income_id?.toString(),
    timestamp: incomeRecord ? new Date(incomeRecord.created_at) : new Date(),
    fees: 0, // No processing fees for school payments
    totalAmount: reservationData.totalAmount
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Reservation Payment</CardTitle>
            <Badge 
              variant="outline" 
              className={cn("flex items-center gap-1", getStatusColor(currentStep))}
            >
              <StatusIcon className={cn("w-3 h-3", currentStep === 'processing' && "animate-spin")} />
              {currentStep.charAt(0).toUpperCase() + currentStep.slice(1)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Student Information */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <User className="w-4 h-4" />
              Student Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Student Name</span>
                <p className="font-medium">{reservationData.studentName}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Class</span>
                <p className="font-medium">{reservationData.className}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Reservation No</span>
                <p className="font-mono text-xs">{reservationData.reservationNo}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Payment Method</span>
                <Badge variant="secondary" className="capitalize">
                  {selectedPaymentMethod}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Method Selection */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              Payment Method
            </h3>
            <div className="space-y-2">
              <Label htmlFor="payment-method">Select Payment Method</Label>
              <Select value={selectedPaymentMethod} onValueChange={(value: any) => setSelectedPaymentMethod(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="ONLINE">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Payment Details */}
          <div className="space-y-4">
            <h3 className="text-md font-semibold flex items-center gap-2">
              <Receipt className="w-4 h-4" />
              Payment Details
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Reservation Fee</span>
                <span>₹{reservationData.reservationFee.toLocaleString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total Amount</span>
                <span className="text-green-600">₹{reservationData.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
            >
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-600">{error}</span>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {currentStep === 'confirm' && (
              <Button 
                onClick={handleConfirmPayment}
                className="w-full"
                size="lg"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Record Payment Method ₹{reservationData.totalAmount.toLocaleString()}
              </Button>
            )}

            {currentStep === 'failed' && (
              <div className="space-y-2">
                <Button 
                  onClick={handleRetry}
                  className="w-full"
                  size="lg"
                >
                  Try Again
                </Button>
                <Button 
                  onClick={onPaymentCancel}
                  variant="outline"
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            )}

            {currentStep === 'processing' && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Recording payment method...</span>
              </div>
            )}

            {currentStep === 'success' && (
              <div className="space-y-2">
                <Button 
                  onClick={handleDownloadReceipt}
                  className="w-full"
                  size="lg"
                >
                  <Receipt className="w-4 h-4 mr-2" />
                  Download Receipt
                </Button>
                <Button 
                  onClick={onPaymentCancel}
                  variant="outline"
                  className="w-full"
                >
                  Done
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>


      {/* Success Dialog */}
      <PaymentSuccess
        open={showSuccess}
        onOpenChange={setShowSuccess}
        paymentData={paymentData}
        onClose={() => setShowSuccess(false)}
      />

      {/* Receipt Download Dialog */}
      <ReceiptDownload
        open={showReceipt}
        onOpenChange={setShowReceipt}
        paymentData={paymentData}
      />
    </div>
  );
};

export { ReservationPaymentProcessor };