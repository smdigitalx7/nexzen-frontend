import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle,
  User,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { handleCollegePayByReservation } from "@/lib/api-college";
import type { CollegeIncomeRead } from "@/lib/types/college/income";
import type { ReservationPaymentData } from "./ReservationPaymentProcessor";
import { cn } from "@/lib/utils";

export interface CollegeReservationPaymentProcessorProps {
  reservationData: ReservationPaymentData;
  onPaymentComplete?: (
    incomeRecord: CollegeIncomeRead,
    receiptBlobUrl: string
  ) => void;
  onPaymentFailed?: (error: string) => void;
  onPaymentCancel?: () => void;
  className?: string;
}

const CollegeReservationPaymentProcessor: React.FC<
  CollegeReservationPaymentProcessorProps
> = ({
  reservationData,
  onPaymentComplete,
  onPaymentFailed,
  onPaymentCancel,
  className,
}) => {
  const [currentStep, setCurrentStep] = useState<
    "confirm" | "processing" | "success" | "failed"
  >("confirm");
  const [receiptBlobUrl, setReceiptBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [incomeRecord, setIncomeRecord] = useState<CollegeIncomeRead | null>(
    null
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<
    "CASH" | "ONLINE"
  >("CASH");

  const handleConfirmPayment = async () => {
    try {
      setCurrentStep("processing");

      // Use the reservation fee amount (read-only, not editable)
      const amount = reservationData.reservationFee;
      const payload = {
        details: [
          {
            purpose: "APPLICATION_FEE" as const, // Reservation fee purpose
            paid_amount: amount,
            payment_method: selectedPaymentMethod,
          },
        ],
        remarks:
          reservationData.note ||
          `Payment for reservation ${reservationData.reservationNo}`,
      };

      console.log("🔄 Processing college reservation payment...");

      // Call the college payment API
      const { blobUrl, income_id, paymentData } = await handleCollegePayByReservation(
        reservationData.reservationNo,
        payload
      );

      console.log("✅ Payment processed successfully, receipt generated");
      console.log("🆔 Actual income_id from backend:", income_id);
      console.log("📦 Full payment data:", paymentData);

      // Create income record for UI display using the actual income_id from backend
      const incomeRecord: CollegeIncomeRead = {
        income_id: income_id,
        reservation_id: reservationData.reservationId,
        total_amount:
          paymentData.data?.context?.total_amount ||
          reservationData.reservationFee,
        receipt_no: paymentData.data?.context?.receipt_no || null,
        student_name: reservationData.studentName,
        remarks: reservationData.note || null,
        created_at: new Date().toISOString(),
      };

      setIncomeRecord(incomeRecord);
      setCurrentStep("success");

      // Pass the receipt blob URL to parent component to display
      setReceiptBlobUrl(blobUrl);

      // Pass both income record and receipt blob URL to parent
      onPaymentComplete?.(incomeRecord, blobUrl);

      console.log(
        "✅ Payment flow completed successfully - Receipt URL passed to parent"
      );
    } catch (err: any) {
      console.error("❌ Payment failed:", err);
      setCurrentStep("failed");
      setError(err?.message || "Failed to record payment method");
      onPaymentFailed?.(err?.message || "Failed to record payment method");
    }
  };

  const handleRetry = () => {
    setCurrentStep("confirm");
    setError(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
        return "text-green-600 bg-green-50 border-green-200";
      case "failed":
        return "text-red-600 bg-red-50 border-red-200";
      case "processing":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return CheckCircle;
      case "failed":
        return XCircle;
      case "processing":
        return Loader2;
      default:
        return CreditCard;
    }
  };

  const StatusIcon = getStatusIcon(currentStep);

  return (
    <div className={cn("w-full max-w-3xl mx-auto", className)}>
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Reservation Payment
            </CardTitle>
            <Badge
              variant="outline"
              className={cn(
                "flex items-center gap-1",
                getStatusColor(currentStep)
              )}
            >
              <StatusIcon
                className={cn(
                  "w-3 h-3",
                  currentStep === "processing" && "animate-spin"
                )}
              />
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
                <p className="font-medium">{reservationData.reservationNo}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Payment Details */}
          {currentStep === "confirm" && (
            <div className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-md font-semibold flex items-center gap-2">
                  <IndianRupee className="w-4 h-4" />
                  Payment Amount
                </h3>
                <div className="bg-muted/50 rounded-lg p-4 border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Application Fee</span>
                    <span className="text-2xl font-bold">
                      ₹{reservationData.reservationFee.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-md font-semibold flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment Method
                </h3>
                <RadioGroup
                  value={selectedPaymentMethod}
                  onValueChange={(value) =>
                    setSelectedPaymentMethod(value as "CASH" | "ONLINE")
                  }
                  className="grid grid-cols-2 gap-3"
                >
                  <label
                    htmlFor="cash"
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedPaymentMethod === "CASH"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30"
                    }`}
                  >
                    <RadioGroupItem value="CASH" id="cash" />
                    <span
                      className={`font-medium ${
                        selectedPaymentMethod === "CASH"
                          ? "text-blue-700"
                          : "text-gray-700"
                      }`}
                    >
                      Cash
                    </span>
                  </label>
                  <label
                    htmlFor="online"
                    className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedPaymentMethod === "ONLINE"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/30"
                    }`}
                  >
                    <RadioGroupItem value="ONLINE" id="online" />
                    <span
                      className={`font-medium ${
                        selectedPaymentMethod === "ONLINE"
                          ? "text-blue-700"
                          : "text-gray-700"
                      }`}
                    >
                      Online
                    </span>
                  </label>
                </RadioGroup>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  onClick={handleConfirmPayment}
                  disabled={currentStep !== "confirm"}
                  className="flex-1"
                >
                  <CreditCard className="w-4 h-4 mr-2" />
                  Confirm Payment (₹
                  {reservationData.reservationFee.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })})
                </Button>
                {onPaymentCancel && (
                  <Button
                    variant="outline"
                    onClick={onPaymentCancel}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Processing State */}
          {currentStep === "processing" && (
            <div className="flex flex-col items-center justify-center py-8 space-y-4">
              <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
              <p className="text-muted-foreground">Processing payment...</p>
            </div>
          )}

          {/* Success State */}
          {currentStep === "success" && incomeRecord && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Payment Successful!</h3>
                <p className="text-muted-foreground">
                  Payment has been processed and receipt has been generated.
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Income ID:</span>
                  <span className="font-medium">{incomeRecord.income_id}</span>
                </div>
                {incomeRecord.receipt_no && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Receipt No:</span>
                    <span className="font-medium">{incomeRecord.receipt_no}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">
                    ₹{incomeRecord.total_amount.toLocaleString()}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Failed State */}
          {currentStep === "failed" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-center">
                <XCircle className="w-16 h-16 text-red-600" />
              </div>
              <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold">Payment Failed</h3>
                <p className="text-muted-foreground">{error}</p>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleRetry} className="flex-1">
                  Retry
                </Button>
                {onPaymentCancel && (
                  <Button
                    variant="outline"
                    onClick={onPaymentCancel}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CollegeReservationPaymentProcessor;

