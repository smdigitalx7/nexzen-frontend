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
import { handlePayByReservation } from "@/lib/api-school";
import type { SchoolIncomeRead } from "@/lib/types/school";
import { cn } from "@/lib/utils";

export interface ReservationPaymentData {
  reservationId: number;
  reservationNo: string; // This will be used as reservation_no in the API
  studentName: string;
  className: string;
  reservationFee: number; // Only reservation fee, not tuition/transport
  totalAmount: number;
  paymentMethod: "CASH" | "ONLINE";
  purpose: string;
  note?: string;
}

export interface ReservationPaymentProcessorProps {
  reservationData: ReservationPaymentData;
  onPaymentComplete?: (
    incomeRecord: SchoolIncomeRead,
    receiptBlobUrl: string
  ) => void;
  onPaymentFailed?: (error: string) => void;
  onPaymentCancel?: () => void;
  className?: string;
}

const ReservationPaymentProcessor: React.FC<
  ReservationPaymentProcessorProps
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
  const [incomeRecord, setIncomeRecord] = useState<SchoolIncomeRead | null>(
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
            purpose: "APPLICATION_FEE", // Reservation fee purpose
            paid_amount: amount,
            payment_method: selectedPaymentMethod,
          },
        ],
        remarks:
          reservationData.note ||
          `Payment for reservation ${reservationData.reservationNo}`,
      };

      console.log("🔄 Processing reservation payment...");

      // Call the updated API that returns a PDF receipt as blob and gets income_id from JSON response
      const { blobUrl, income_id, paymentData } = await handlePayByReservation(
        reservationData.reservationNo,
        payload as any
      );

      console.log("✅ Payment processed successfully, receipt generated");
      console.log("🆔 Actual income_id from backend:", income_id);
      console.log("📦 Full payment data:", paymentData);

      // Create income record for UI display using the actual income_id from backend
      const incomeRecord = {
        income_id: income_id, // Actual income_id from backend (e.g., 236)
        application_income_id: income_id, // Use the same income_id
        reservation_id: reservationData.reservationId,
        purpose: "APPLICATION_FEE",
        amount:
          paymentData.data?.context?.total_amount ||
          reservationData.reservationFee,
        income_date: new Date().toISOString().split("T")[0],
        payment_method: selectedPaymentMethod,
        note: reservationData.note,
        created_at: new Date().toISOString(),
      };

      setIncomeRecord(incomeRecord as any);
      setCurrentStep("success");

      // Pass the receipt blob URL to parent component to display
      // Don't show receipt in this component - let parent handle it
      setReceiptBlobUrl(blobUrl);

      // Pass both income record and receipt blob URL to parent
      onPaymentComplete?.(incomeRecord as any, blobUrl);

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
                <p className="font-mono text-xs">
                  {reservationData.reservationNo}
                </p>
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

          {/* Payment Details */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-md font-semibold flex items-center gap-2">
                <IndianRupee className="w-4 h-4" />
                Payment Amount
              </h3>
              <div className="bg-muted/50 rounded-lg p-4 border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Application Fee
                  </span>
                  <span className="text-2xl font-bold">
                    ₹
                    {reservationData.reservationFee.toLocaleString(undefined, {
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
                onValueChange={(value: "CASH" | "ONLINE") =>
                  setSelectedPaymentMethod(value)
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
            {currentStep === "confirm" && (
              <Button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleConfirmPayment();
                }}
                className="w-full"
                size="lg"
                disabled={currentStep !== "confirm"}
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Record Payment (₹
                {reservationData.reservationFee.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
                )
              </Button>
            )}

            {currentStep === "failed" && (
              <div className="space-y-2">
                <Button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleRetry();
                  }}
                  className="w-full"
                  size="lg"
                >
                  Try Again
                </Button>
                <Button
                  type="button"
                  onClick={onPaymentCancel}
                  variant="outline"
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            )}

            {currentStep === "processing" && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Recording payment method...</span>
              </div>
            )}

            {currentStep === "success" && (
              <div className="space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-green-600 mb-2">
                  <CheckCircle className="w-4 h-4" />
                  <span>Payment successful! Receipt will be displayed.</span>
                </div>
                <Button
                  type="button"
                  onClick={onPaymentCancel}
                  variant="outline"
                  className="w-full"
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Note: Receipt modal is now displayed by parent component to prevent unmounting issues */}
    </div>
  );
};

export { ReservationPaymentProcessor };
