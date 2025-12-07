import { useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calculator,
  Save,
  User,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Eye,
  Loader2,
} from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/common/components/ui/card";
import { Separator } from "@/common/components/ui/separator";
import { Alert, AlertDescription } from "@/common/components/ui/alert";
import { RadioGroup, RadioGroupItem } from "@/common/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { EmployeeSelect } from "@/common/components/ui/employee-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import type {
  PayrollCreate,
  PayrollPreview,
} from "@/features/general/types/payrolls";
import {
  PayrollStatusEnum,
  PaymentMethodEnum,
} from "@/features/general/types/payrolls";
import { formatCurrency } from "@/common/utils";
import { useFormState } from "@/common/hooks";
import { PayrollsService } from "@/features/general/services/payrolls.service";
import { toast } from "@/common/hooks/use-toast";
import { ConfirmDialog } from "@/common/components/shared/ConfirmDialog";

interface SalaryCalculationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PayrollCreate) => Promise<void> | void;
  employees: Array<{ employee_id: number; employee_name: string }>;
}

export const SalaryCalculationForm = ({
  isOpen,
  onClose,
  onSubmit,
  employees,
}: SalaryCalculationFormProps) => {
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [previewData, setPreviewData] = useState<PayrollPreview | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingPayrollData, setPendingPayrollData] =
    useState<PayrollCreate | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [paymentOption, setPaymentOption] = useState<
    "full" | "half" | "custom"
  >("full");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initial form data
  const initialFormData = {
    employee_id: "",
    payroll_month: new Date().getMonth() + 1,
    payroll_year: new Date().getFullYear(),
    previous_balance: 0,
    gross_pay: 0,
    lop: 0,
    advance_deduction: 0,
    other_deductions: 0,
    paid_amount: 0,
    payment_method: PaymentMethodEnum.CASH,
    payment_notes: "",
    status: PayrollStatusEnum.PENDING,
  };

  // Using shared form state management
  const { formData, updateField, resetForm } = useFormState({
    initialData: initialFormData,
  });

  const calculatedNet = useMemo(() => {
    const gross = formData.gross_pay || 0;
    const lop = formData.lop || 0;
    const advance = formData.advance_deduction || 0;
    const other = formData.other_deductions || 0;
    return gross - lop - advance - other;
  }, [
    formData.gross_pay,
    formData.lop,
    formData.advance_deduction,
    formData.other_deductions,
  ]);

  // Update paid amount based on payment option
  const handlePaymentOptionChange = (option: "full" | "half" | "custom") => {
    setPaymentOption(option);
    if (option === "full") {
      updateField("paid_amount", calculatedNet);
    } else if (option === "half") {
      updateField("paid_amount", calculatedNet / 2);
    } else {
      // For custom, keep current value or set to 0
      if (
        !formData.paid_amount ||
        formData.paid_amount === calculatedNet ||
        formData.paid_amount === calculatedNet / 2
      ) {
        updateField("paid_amount", 0);
      }
    }
  };

  // Update payment option when paid amount changes manually
  const handlePaidAmountChange = (value: number) => {
    updateField("paid_amount", value);
    if (value === calculatedNet) {
      setPaymentOption("full");
    } else if (value === calculatedNet / 2) {
      setPaymentOption("half");
    } else {
      setPaymentOption("custom");
    }
  };

  // Update paid amount when calculatedNet changes
  useEffect(() => {
    if (paymentOption === "full" && calculatedNet > 0) {
      updateField("paid_amount", calculatedNet);
    } else if (paymentOption === "half" && calculatedNet > 0) {
      updateField("paid_amount", calculatedNet / 2);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calculatedNet, paymentOption]);

  const handlePreview = async () => {
    if (
      !formData.employee_id ||
      !formData.payroll_month ||
      !formData.payroll_year
    ) {
      setPreviewError("Please select employee, month, and year to preview");
      return;
    }

    setIsLoadingPreview(true);
    setPreviewData(null);
    setPreviewError(null);
    try {
      const preview = await PayrollsService.getPreview({
        employee_id: Number(formData.employee_id),
        month: Number(formData.payroll_month),
        year: Number(formData.payroll_year),
      });

      setPreviewData(preview);
      setPreviewError(null);

      // Auto-populate form with preview data
      updateField("gross_pay", preview.gross_pay);
      updateField("previous_balance", preview.previous_balance);
      updateField("lop", preview.lop);
      updateField("advance_deduction", preview.advance_deduction);
      updateField("other_deductions", preview.other_deductions);
    } catch (error: unknown) {
      // Extract error message
      let errorMessage = "Failed to load payroll preview.";

      if (error && typeof error === "object") {
        const errorObj = error as Record<string, unknown>;
        const errorData =
          errorObj.data || (errorObj.response as Record<string, unknown>)?.data;
        const errorDetail = (errorData as Record<string, unknown>)?.detail;

        if (
          errorDetail &&
          typeof errorDetail === "object" &&
          "message" in errorDetail
        ) {
          errorMessage = String(errorDetail.message);
        } else if (typeof errorDetail === "string") {
          errorMessage = errorDetail;
        } else if (
          errorData &&
          typeof errorData === "object" &&
          "message" in errorData
        ) {
          errorMessage = String(errorData.message);
        } else if (errorObj.message) {
          errorMessage = String(errorObj.message);
        }
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      setPreviewError(
        errorMessage ||
          "Failed to load payroll preview. Please check if employee has attendance for this month."
      );
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const canPreview =
    formData.employee_id && formData.payroll_month && formData.payroll_year;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Create new payroll
    if (!previewData) {
      toast({
        title: "Validation Error",
        description: "Please get preview data first before creating payroll",
        variant: "destructive",
      });
      return;
    }

    // Validate payment information
    if (!formData.payment_method) {
      toast({
        title: "Validation Error",
        description: "Payment method is required",
        variant: "destructive",
      });
      return;
    }

    if (!formData.paid_amount || Number(formData.paid_amount) <= 0) {
      toast({
        title: "Validation Error",
        description: "Paid amount is required and must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (!formData.payment_notes || formData.payment_notes.trim() === "") {
      toast({
        title: "Validation Error",
        description: "Payment notes are required",
        variant: "destructive",
      });
      return;
    }

    // ✅ FIX: API expects payroll_month as number (1-12) and payroll_year as separate number
    const month = Number(formData.payroll_month);
    const year = Number(formData.payroll_year);

    const payrollData: PayrollCreate = {
      employee_id: Number(formData.employee_id),
      payroll_month: month, // API expects number 1-12
      payroll_year: year, // API expects number (e.g., 2024)
      other_deductions: Number(formData.other_deductions) || 0,
      advance_amount: Number(formData.advance_deduction) || 0, // ✅ FIX: API uses advance_amount, not advance_deduction
      paid_amount: Number(formData.paid_amount),
      payment_method: formData.payment_method,
      payment_notes: formData.payment_notes,
      // Optional fields (might be calculated by backend from attendance)
      gross_pay: Number(formData.gross_pay) || 0,
      previous_balance: Number(formData.previous_balance) || 0,
      lop: Number(formData.lop) || 0,
    };

    // Store payroll data and show confirmation dialog
    setPendingPayrollData(payrollData);
    setShowConfirmDialog(true);
  };

  const handleConfirmCreate = async () => {
    if (!pendingPayrollData) {
      toast({
        title: "Error",
        description: "No payroll data to submit. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // ✅ FIX: Set loading state to prevent multiple submissions
    setIsSubmitting(true);

    try {
      // ✅ FIX: Call onSubmit and wait for it to complete
      await onSubmit(pendingPayrollData);

      // ✅ FIX: Only close and reset after successful submission
      setShowConfirmDialog(false);
      setPendingPayrollData(null);
      setPreviewData(null);
      setPreviewError(null);
      setPaymentOption("full");
      // Reset form using the resetForm function
      resetForm();
      // ✅ FIX: Close main dialog after successful creation
      // The mutation's onSuccess will handle cache invalidation
      setTimeout(() => {
        onClose();
      }, 100);
    } catch (error: unknown) {
      // Error handling is done by the mutation hook (shows toast)
      // Show additional error message if mutation hook didn't handle it
      let errorMessage = "Failed to create payroll. Please try again.";

      if (error && typeof error === "object") {
        const errorObj = error as Record<string, unknown>;
        const response = errorObj.response as
          | Record<string, unknown>
          | undefined;
        const data = response?.data as Record<string, unknown> | undefined;
        const detail = data?.detail as Record<string, unknown> | undefined;

        if (detail?.message) {
          errorMessage = String(detail.message);
        } else if (data?.message) {
          errorMessage = String(data.message);
        } else if (errorObj.message) {
          errorMessage = String(errorObj.message);
        }
      } else if (typeof error === "string") {
        errorMessage = error;
      }

      toast({
        title: "Error Creating Payroll",
        description: errorMessage,
        variant: "destructive",
      });

      // Keep confirmation dialog open on error so user can retry
      // Don't close the dialog - let the user see the error and try again
    } finally {
      // ✅ FIX: Always reset loading state
      setIsSubmitting(false);
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirmDialog(false);
    setPendingPayrollData(null);
  };

  const handleInputChange = (field: string, value: string | number) => {
    updateField(field as keyof typeof formData, value);
  };

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      // Reset all state when dialog closes
      setPreviewData(null);
      setPreviewError(null);
      setPaymentOption("full");
      setShowConfirmDialog(false);
      setPendingPayrollData(null);
      setIsSubmitting(false);
      // Reset form using the resetForm function
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        // ✅ FIX: Prevent dialog from closing when confirmation dialog is open or when submitting
        // Only allow closing if not submitting and confirmation dialog is closed
        if (!open && !showConfirmDialog && !isSubmitting) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto scrollbar-hide p-0 sm:rounded-2xl">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-gray-200 bg-gradient-to-r from-blue-50/50 to-indigo-50/30">
          <DialogTitle className="flex items-center gap-3 text-2xl font-semibold text-gray-900">
            <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-sm">
              <Calculator className="h-6 w-6 text-white" />
            </div>
            Preview Payroll
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-2 leading-relaxed">
            Preview payroll calculations for an employee. Use the 'Get Preview'
            button to load calculated values from attendance data.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-6">
          {/* Employee & Period Selection */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-5"
          >
            <div className="flex items-center gap-2.5 mb-4">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <User className="h-4 w-4 text-blue-600" />
              </div>
              <h3 className="text-base font-semibold text-gray-900">
                Employee & Period Information
              </h3>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Employee Selection */}
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-5">
                  <div className="space-y-3">
                    <Label
                      htmlFor="employee"
                      className="text-sm font-semibold text-gray-700 flex items-center gap-2"
                    >
                      <User className="h-4 w-4 text-gray-500" />
                      Select Employee <span className="text-red-500">*</span>
                    </Label>
                    <EmployeeSelect
                      value={formData.employee_id?.toString() || ""}
                      onValueChange={(value) => {
                        handleInputChange("employee_id", value);
                        setPreviewData(null);
                        setPreviewError(null);
                      }}
                      placeholder="Search and select employee..."
                      className="h-11"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Pay Period */}
              <Card className="border border-gray-200 shadow-sm">
                <CardContent className="p-5">
                  <div className="space-y-3">
                    <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      Pay Period <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <Select
                          value={formData.payroll_month?.toString() || ""}
                          onValueChange={(value) => {
                            handleInputChange("payroll_month", value);
                            setPreviewData(null);
                            setPreviewError(null);
                          }}
                        >
                          <SelectTrigger className="h-11 border-gray-300">
                            <SelectValue placeholder="Month" />
                          </SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => (
                              <SelectItem
                                key={i + 1}
                                value={(i + 1).toString()}
                              >
                                {new Date(0, i).toLocaleString("default", {
                                  month: "long",
                                })}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="w-28">
                        <Input
                          type="number"
                          value={formData.payroll_year}
                          onChange={(e) => {
                            handleInputChange("payroll_year", e.target.value);
                            setPreviewData(null);
                            setPreviewError(null);
                          }}
                          placeholder="Year"
                          className="h-11 border-gray-300"
                          min="2020"
                          max="2030"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="flex justify-center">
              <Button
                type="button"
                onClick={handlePreview}
                disabled={!canPreview || isLoadingPreview}
                className="w-[80%] mt-1 bg-blue-600 hover:bg-blue-700 text-white h-10 font-medium "
              >
                {isLoadingPreview ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading Preview...
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Get Preview
                  </>
                )}
              </Button>
            </div>

            {/* Error Message Display */}
            <AnimatePresence>
              {previewError && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <Alert
                    variant="destructive"
                    className="border-red-200 bg-red-50"
                  >
                    <AlertCircle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-sm text-red-800 font-medium">
                      {previewError}
                    </AlertDescription>
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {previewData && <Separator className="bg-gray-200" />}

          {/* Show full form only after preview is loaded */}
          {previewData ? (
            <>
              {/* Salary Calculation Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-5"
              >
                <div className="flex items-center gap-2.5 mb-4">
                  <div className="p-1.5 bg-green-100 rounded-lg">
                    <Calculator className="h-4 w-4 text-green-600" />
                  </div>
                  <h3 className="text-base font-semibold text-gray-900">
                    Salary Calculation
                  </h3>
                </div>

                <Card className="border border-gray-200 shadow-sm">
                  <CardHeader className="pb-4 px-5 pt-5 border-b border-gray-200">
                    <CardTitle className="flex items-center gap-2.5 text-lg font-semibold text-gray-900">
                      <div className="p-1.5 bg-blue-100 rounded-lg">
                        <Calculator className="h-5 w-5 text-blue-600" />
                      </div>
                      Salary Breakdown
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5 p-5">
                    {/* Gross Pay and Previous Balance */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Gross Pay */}
                      <div className="space-y-2.5">
                        <Label
                          htmlFor="gross_pay"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Gross Salary
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm font-bold text-gray-500">
                            ₹
                          </span>
                          <Input
                            type="number"
                            id="gross_pay"
                            value={formData.gross_pay}
                            onChange={(e) =>
                              handleInputChange(
                                "gross_pay",
                                Number(e.target.value)
                              )
                            }
                            placeholder="Enter gross salary amount"
                            className="pl-10 h-11 text-base font-semibold border-gray-300 bg-gray-50"
                            readOnly
                            disabled
                          />
                        </div>
                      </div>

                      {/* Previous Balance */}
                      <div className="space-y-2.5">
                        <Label
                          htmlFor="previous_balance"
                          className="text-sm font-semibold text-gray-700"
                        >
                          Previous Balance
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm font-bold text-gray-500">
                            ₹
                          </span>
                          <Input
                            type="number"
                            id="previous_balance"
                            value={formData.previous_balance}
                            onChange={(e) =>
                              handleInputChange(
                                "previous_balance",
                                Number(e.target.value)
                              )
                            }
                            placeholder="Previous balance amount"
                            className="pl-10 h-11 border-gray-300 bg-gray-50"
                            readOnly
                            disabled
                          />
                        </div>
                      </div>
                    </div>

                    {/* Deductions Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2.5">
                        <Label
                          htmlFor="lop"
                          className="text-sm font-semibold text-orange-700"
                        >
                          Loss of Pay (LOP)
                        </Label>
                        <Input
                          type="number"
                          id="lop"
                          value={formData.lop}
                          onChange={(e) =>
                            handleInputChange("lop", Number(e.target.value))
                          }
                          placeholder="0"
                          className="h-11 border-gray-300 bg-gray-50"
                          readOnly
                          disabled
                        />
                      </div>

                      <div className="space-y-2.5">
                        <Label
                          htmlFor="advance_deduction"
                          className="text-sm font-semibold text-blue-700"
                        >
                          Advance Deduction
                        </Label>
                        <Input
                          type="number"
                          id="advance_deduction"
                          value={formData.advance_deduction}
                          onChange={(e) =>
                            handleInputChange(
                              "advance_deduction",
                              Number(e.target.value)
                            )
                          }
                          placeholder="0"
                          className="h-11 border-gray-300"
                          min="0"
                        />
                        {previewData && (
                          <p className="text-xs text-gray-600 mt-1.5">
                            Available Balance:{" "}
                            <span className="font-semibold text-gray-900">
                              ₹
                              {previewData.advance_deduction?.toLocaleString(
                                "en-IN",
                                {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }
                              ) || "0.00"}
                            </span>
                          </p>
                        )}
                      </div>

                      <div className="space-y-2.5">
                        <Label
                          htmlFor="other_deductions"
                          className="text-sm font-semibold text-red-700"
                        >
                          Other Deductions
                        </Label>
                        <Input
                          type="number"
                          id="other_deductions"
                          value={formData.other_deductions}
                          onChange={(e) =>
                            handleInputChange(
                              "other_deductions",
                              Number(e.target.value)
                            )
                          }
                          placeholder="0"
                          className="h-11 border-gray-300"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>

                    {/* Net Salary Display */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200 shadow-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <span className="text-base font-semibold text-gray-900 block">
                              Net Salary
                            </span>
                            <span className="text-xs text-gray-600">
                              After all deductions
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-3xl font-bold text-green-700">
                            {formatCurrency(calculatedNet)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <Separator className="bg-gray-200" />

              {/* Payment Information */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="p-1 bg-purple-100 rounded-lg">
                    <CreditCard className="h-3.5 w-3.5 text-purple-600" />
                  </div>
                  <h3 className="text-[15px] font-semibold text-gray-900">
                    Payment Information
                  </h3>
                </div>

                <Card className="border border-gray-200 shadow-sm">
                  <CardContent className="p-4 space-y-4">
                    {/* Payment Method - Radio Buttons */}
                    <div className="space-y-2">
                      <Label className="text-[14px] font-semibold text-gray-700">
                        Payment Method <span className="text-red-500">*</span>
                      </Label>
                      <RadioGroup
                        value={formData.payment_method}
                        onValueChange={(value) =>
                          handleInputChange("payment_method", value)
                        }
                        className="grid grid-cols-2 gap-3"
                      >
                        <label
                          className={`flex items-center gap-2.5 p-3 border rounded-lg cursor-pointer transition-colors text-[14px] ${
                            formData.payment_method === PaymentMethodEnum.CASH
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <RadioGroupItem
                            value={PaymentMethodEnum.CASH}
                            id="cash"
                            className="text-blue-600"
                          />
                          <span className="text-[15px] font-medium">Cash</span>
                        </label>
                        <label
                          className={`flex items-center gap-2.5 p-3 border rounded-lg cursor-pointer transition-colors text-[14px] ${
                            formData.payment_method === PaymentMethodEnum.ONLINE
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <RadioGroupItem
                            value={PaymentMethodEnum.ONLINE}
                            id="online"
                            className="text-blue-600"
                          />
                          <CreditCard className="h-4 w-4 text-gray-600" />
                          <span className="text-[15px] font-medium">
                            Online
                          </span>
                        </label>
                      </RadioGroup>
                    </div>

                    {/* Payment Options */}
                    <div className="space-y-2">
                      <Label className="text-[14px] font-semibold text-gray-700">
                        Payment Option <span className="text-red-500">*</span>
                      </Label>
                      <RadioGroup
                        value={paymentOption}
                        onValueChange={(value) =>
                          handlePaymentOptionChange(
                            value as "full" | "half" | "custom"
                          )
                        }
                        className="grid grid-cols-3 gap-2"
                      >
                        <label
                          className={`flex items-center justify-center gap-2 p-2.5 border rounded-lg cursor-pointer transition-colors text-[13px] ${
                            paymentOption === "full"
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <RadioGroupItem
                            value="full"
                            id="full"
                            className="text-green-600"
                          />
                          <span className="font-medium">Pay in Full</span>
                        </label>
                        <label
                          className={`flex items-center justify-center gap-2 p-2.5 border rounded-lg cursor-pointer transition-colors text-[13px] ${
                            paymentOption === "half"
                              ? "border-orange-500 bg-orange-50"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <RadioGroupItem
                            value="half"
                            id="half"
                            className="text-orange-600"
                          />
                          <span className="font-medium">Pay Half</span>
                        </label>
                        <label
                          className={`flex items-center justify-center gap-2 p-2.5 border rounded-lg cursor-pointer transition-colors text-[13px] ${
                            paymentOption === "custom"
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <RadioGroupItem
                            value="custom"
                            id="custom"
                            className="text-blue-600"
                          />
                          <span className="font-medium">Custom Pay</span>
                        </label>
                      </RadioGroup>
                    </div>

                    {/* Paid Amount */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="paid_amount"
                        className="text-[14px] font-semibold text-gray-700"
                      >
                        Paid Amount <span className="text-red-500">*</span>
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[15px] font-bold text-gray-600">
                          ₹
                        </span>
                        <Input
                          type="number"
                          id="paid_amount"
                          value={formData.paid_amount || ""}
                          onChange={(e) => {
                            const value =
                              e.target.value === ""
                                ? 0
                                : Number(e.target.value);
                            handlePaidAmountChange(value);
                          }}
                          placeholder="Enter paid amount"
                          className="pl-9 h-10 text-[15px] border-gray-300"
                          min="0"
                          step="0.01"
                          required
                          disabled={paymentOption !== "custom"}
                        />
                      </div>
                      {paymentOption !== "custom" && (
                        <p className="text-xs text-gray-500 mt-1">
                          Amount:{" "}
                          <span className="font-semibold">
                            {formatCurrency(
                              paymentOption === "full"
                                ? calculatedNet
                                : calculatedNet / 2
                            )}
                          </span>
                        </p>
                      )}
                    </div>

                    {/* Payment Notes */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="payment_notes"
                        className="text-[14px] font-semibold text-gray-700"
                      >
                        Payment Notes <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="payment_notes"
                        value={formData.payment_notes}
                        onChange={(e) =>
                          handleInputChange("payment_notes", e.target.value)
                        }
                        placeholder="Enter payment notes"
                        className="h-10 text-[15px] border-gray-300"
                        required
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </>
          ) : null}

          <DialogFooter className="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <AlertCircle className="h-4 w-4 text-gray-400" />
                <span>
                  {previewData
                    ? "Review the payroll details above and click 'Create Payroll' to proceed."
                    : "Please select employee, month, and year, then click 'Get Preview' to load payroll calculations."}
                </span>
              </div>
              {previewData && (
                <Button
                  type="submit"
                  className="h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Create Payroll
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={showConfirmDialog}
        onOpenChange={(open) => {
          // ✅ FIX: Only close when explicitly set to false, not when toasts appear
          // This prevents the dialog from closing when toast notifications appear/disappear
          if (!open && !isSubmitting) {
            setShowConfirmDialog(false);
            setPendingPayrollData(null);
          }
        }}
        title="Confirm Payroll Creation"
        description={
          pendingPayrollData ? (
            <div className="space-y-2 mt-2">
              <p className="font-medium">
                Are you sure you want to create this payroll?
              </p>
              <div className="bg-muted/50 p-3 rounded-md space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employee:</span>
                  <span className="font-medium">
                    {employees.find(
                      (emp) =>
                        emp.employee_id === pendingPayrollData.employee_id
                    )?.employee_name || `ID: ${pendingPayrollData.employee_id}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Period:</span>
                  <span className="font-medium">
                    {(() => {
                      // ✅ FIX: payroll_month is now a number (1-12) and payroll_year is separate
                      const month = pendingPayrollData.payroll_month;
                      const year = pendingPayrollData.payroll_year;
                      return new Date(year, month - 1).toLocaleString(
                        "default",
                        { month: "long", year: "numeric" }
                      );
                    })()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paid Amount:</span>
                  <span className="font-medium text-primary">
                    {formatCurrency(pendingPayrollData.paid_amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Payment Method:</span>
                  <span className="font-medium capitalize">
                    {pendingPayrollData.payment_method.toLowerCase()}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            "Are you sure you want to create this payroll?"
          )
        }
        confirmText="Create Payroll"
        cancelText="Cancel"
        onConfirm={handleConfirmCreate}
        onCancel={handleCancelConfirm}
        isLoading={isSubmitting}
        loadingText="Creating payroll..."
        disabled={isSubmitting}
      />
    </Dialog>
  );
};
