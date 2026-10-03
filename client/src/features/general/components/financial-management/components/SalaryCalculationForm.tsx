import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Clock,
  IndianRupee,
} from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Badge } from "@/common/components/ui/badge";
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
  initialEmployeeId?: number | null;
  initialEmployeeName?: string;
  initialMonth?: number;
  initialYear?: number;
}

export const SalaryCalculationForm = ({
  isOpen,
  onClose,
  onSubmit,
  employees,
  initialEmployeeId,
  initialEmployeeName = "",
  initialMonth,
  initialYear,
}: SalaryCalculationFormProps) => {
  const navigate = useNavigate();
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
  const initialFormData = useMemo(() => ({
    employee_id: initialEmployeeId ? initialEmployeeId.toString() : "",
    payroll_month: initialMonth || (new Date().getMonth() + 1),
    payroll_year: initialYear || new Date().getFullYear(),
    previous_balance: 0,
    gross_pay: 0,
    lop: 0,
    advance_deduction: 0,
    other_deductions: 0,
    paid_amount: 0,
    payment_method: PaymentMethodEnum.CASH,
    payment_notes: "",
    status: PayrollStatusEnum.PENDING,
  }), [initialEmployeeId, initialMonth, initialYear]);

  // Using shared form state management
  const { formData, updateField, resetForm } = useFormState({
    initialData: initialFormData,
  });

  const calculatedNet = useMemo(() => {
    const gross = Number(formData.gross_pay) || 0;
    const prevBalance = Number(formData.previous_balance) || 0;
    const lop = Number(formData.lop) || 0;
    const advance = Number(formData.advance_deduction) || 0;
    const other = Number(formData.other_deductions) || 0;
    const totalDeductions = lop + advance + other;
    const net = (gross + prevBalance) - totalDeductions;
    return Math.max(0, net);
  }, [
    formData.gross_pay,
    formData.previous_balance,
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

  // Sync employee_id and period into formData when dialog opens or initial props change
  useEffect(() => {
    if (isOpen) {
      if (initialEmployeeId) {
        updateField("employee_id", initialEmployeeId.toString());
      }
      if (initialMonth) {
        updateField("payroll_month", initialMonth);
      }
      if (initialYear) {
        updateField("payroll_year", initialYear);
      }
    }
  }, [isOpen, initialEmployeeId, initialMonth, initialYear, updateField]);

  // Auto-fetch preview when dialog opens with an employee ID or period changes
  useEffect(() => {
    const targetEmpId = initialEmployeeId || (formData.employee_id ? Number(formData.employee_id) : null);
    if (isOpen && targetEmpId) {
      const targetMonth = Number(formData.payroll_month) || initialMonth || (new Date().getMonth() + 1);
      const targetYear = Number(formData.payroll_year) || initialYear || new Date().getFullYear();

      // Call preview directly with targetEmpId
      const fetchPreview = async () => {
        setIsLoadingPreview(true);
        setPreviewData(null);
        setPreviewError(null);
        
        try {
          const preview = import.meta.env.VITE_FEATURE_BIOMETRIC === "true"
            ? await PayrollsService.getBiometricPreview({
                employee_id: targetEmpId,
                month: targetMonth,
                year: targetYear,
              })
            : await PayrollsService.getPreview({
                employee_id: targetEmpId,
                month: targetMonth,
                year: targetYear,
              });

          if (preview && 'success' in preview && preview.success === false) {
            setPreviewError(preview.message || "Failed to load payroll preview.");
            setPreviewData(preview);
            return;
          }

          setPreviewData(preview);
          setPreviewError(null);

          // Auto-populate form with preview data and ensure employee_id is set
          updateField("employee_id", targetEmpId.toString());
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
            }
          }

          setPreviewError(errorMessage);
        } finally {
          setIsLoadingPreview(false);
        }
      };

      fetchPreview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialEmployeeId, initialMonth, initialYear, formData.payroll_month, formData.payroll_year]);

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
      const preview = import.meta.env.VITE_FEATURE_BIOMETRIC === "true"
        ? await PayrollsService.getBiometricPreview({
            employee_id: Number(formData.employee_id),
            month: Number(formData.payroll_month),
            year: Number(formData.payroll_year),
          })
        : await PayrollsService.getPreview({
            employee_id: Number(formData.employee_id),
            month: Number(formData.payroll_month),
            year: Number(formData.payroll_year),
          });

      if (preview && 'success' in preview && preview.success === false) {
        setPreviewError(preview.message || "Failed to load payroll preview.");
        setPreviewData(preview);
        return;
      }

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

  const resolvedEmployeeId = useMemo(() => {
    return (
      Number(formData.employee_id) ||
      (initialEmployeeId ? Number(initialEmployeeId) : 0) ||
      (previewData ? Number((previewData as any).employee_id) : 0)
    );
  }, [formData.employee_id, initialEmployeeId, previewData]);

  const isFormValid = useMemo(() => {
    const hasValidEmployee = resolvedEmployeeId > 0;
    const hasValidPreview = Boolean(previewData && (previewData as any).success !== false);
    const hasPaymentMethod = Boolean(formData.payment_method);
    const hasPaidAmount = Boolean(formData.paid_amount && Number(formData.paid_amount) > 0);
    const hasPaymentNotes = Boolean(formData.payment_notes && formData.payment_notes.trim().length > 0);

    return (
      hasValidEmployee &&
      hasValidPreview &&
      hasPaymentMethod &&
      hasPaidAmount &&
      hasPaymentNotes &&
      !isLoadingPreview &&
      !isSubmitting
    );
  }, [
    resolvedEmployeeId,
    previewData,
    formData.payment_method,
    formData.paid_amount,
    formData.payment_notes,
    isLoadingPreview,
    isSubmitting,
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFormValid) {
      toast({
        title: "Validation Error",
        description: "Please fill all required fields (disbursement amount, payment reference remarks) before proceeding.",
        variant: "destructive",
      });
      return;
    }

    // Create new payroll
    if (!previewData || previewData.success === false) {
      toast({
        title: "Validation Error",
        description: "Please get a valid preview first before creating payroll",
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

    // Resolve employee ID with fallbacks to avoid 0
    const empId =
      Number(formData.employee_id) ||
      (initialEmployeeId ? Number(initialEmployeeId) : 0) ||
      (previewData ? Number((previewData as any).employee_id) : 0);

    if (!empId || empId <= 0) {
      toast({
        title: "Validation Error",
        description: "Valid employee is required to create payroll",
        variant: "destructive",
      });
      return;
    }

    // ✅ FIX: API expects payroll_month as number (1-12) and payroll_year as separate number
    const month = Number(formData.payroll_month) || initialMonth || (new Date().getMonth() + 1);
    const year = Number(formData.payroll_year) || initialYear || new Date().getFullYear();

    const payrollData: PayrollCreate = {
      employee_id: empId,
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
    if (!pendingPayrollData || !pendingPayrollData.employee_id || pendingPayrollData.employee_id <= 0) {
      toast({
        title: "Error",
        description: "Invalid employee ID. Please select an employee and try again.",
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
      // Extract backend error message
      let errorMessage = "Failed to create payroll. Please try again.";

      if (error && typeof error === "object") {
        const errorObj = error as Record<string, unknown>;
        const response = errorObj.response as Record<string, unknown> | undefined;
        const data = response?.data as Record<string, unknown> | undefined;
        const detail = data?.detail;

        // Handle different backend error formats
        if (typeof detail === "string") {
          // FastAPI often returns detail as a string
          errorMessage = detail;
        } else if (detail && typeof detail === "object") {
          // Check for detail.message
          const detailObj = detail as Record<string, unknown>;
          if (detailObj.message && typeof detailObj.message === "string") {
            errorMessage = detailObj.message;
          } else if (detailObj.user_message && typeof detailObj.user_message === "string") {
            errorMessage = detailObj.user_message;
          }
        } else if (data?.message && typeof data.message === "string") {
          errorMessage = data.message;
        } else if (errorObj.message && typeof errorObj.message === "string") {
          errorMessage = errorObj.message;
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
      <DialogContent className="w-[95vw] max-w-6xl xl:max-w-7xl 2xl:max-w-[1400px] max-h-[92vh] overflow-y-auto scrollbar-hide p-0 sm:rounded-xl border border-gray-200 shadow-2xl bg-white">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-gray-200 bg-white">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                Generate Payroll
                {previewData?.existing_record && (
                  <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200 text-xs font-semibold">
                    Update Existing
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500 mt-0.5">
                {initialEmployeeName || previewData?.employee_name
                  ? `${initialEmployeeName || previewData?.employee_name} ${initialEmployeeId ? `(ID: #${initialEmployeeId})` : ""}`
                  : "Calculate attendance, loss of pay (LOP), deductions, and final salary"}
              </DialogDescription>
            </div>

            {/* Pay Period Month & Year Selectors */}
            <div className="flex items-center gap-2.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg shadow-2xs">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider hidden sm:inline">
                Period:
              </span>
              <Select
                value={(formData.payroll_month ?? (new Date().getMonth() + 1)).toString()}
                onValueChange={(val) => {
                  updateField("payroll_month", parseInt(val, 10));
                  setPreviewData(null);
                  setPreviewError(null);
                }}
              >
                <SelectTrigger className="h-11 w-44 sm:w-48 text-sm font-semibold text-gray-800 bg-white border-gray-300 shadow-2xs focus:ring-1 focus:ring-blue-500">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent className="max-h-[280px]">
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()} className="text-sm font-medium py-2">
                      {new Date(0, i).toLocaleString("default", { month: "long" })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={(formData.payroll_year ?? new Date().getFullYear()).toString()}
                onValueChange={(val) => {
                  updateField("payroll_year", parseInt(val, 10));
                  setPreviewData(null);
                  setPreviewError(null);
                }}
              >
                <SelectTrigger className="h-11 w-28 text-sm font-semibold text-gray-800 bg-white border-gray-300 shadow-2xs focus:ring-1 focus:ring-blue-500">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 7 }, (_, i) => {
                    const y = new Date().getFullYear() - 3 + i;
                    return (
                      <SelectItem key={y} value={y.toString()} className="text-sm font-medium py-2">
                        {y}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">

          {/* Employee & Period Selection (When not pre-selected) */}
          {!initialEmployeeId && !previewData && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Employee Selection */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
                  <Label htmlFor="employee" className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    <User className="h-4 w-4 text-blue-600" />
                    Employee Name <span className="text-red-500">*</span>
                  </Label>
                  <EmployeeSelect
                    value={formData.employee_id?.toString() || ""}
                    onValueChange={(value) => {
                      handleInputChange("employee_id", value);
                      setPreviewData(null);
                      setPreviewError(null);
                    }}
                    placeholder="Search and select employee..."
                    className="h-10 text-sm"
                  />
                </div>

                {/* Period Selection */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-2">
                  <Label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 text-blue-600" />
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
                        <SelectTrigger className="h-11 border-gray-300 text-sm font-semibold">
                          <SelectValue placeholder="Select Month" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[280px]">
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()} className="text-sm font-medium py-2">
                              {new Date(0, i).toLocaleString("default", { month: "long" })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-32">
                      <Input
                        type="number"
                        value={formData.payroll_year}
                        onChange={(e) => {
                          handleInputChange("payroll_year", e.target.value);
                          setPreviewData(null);
                          setPreviewError(null);
                        }}
                        placeholder="Year"
                        className="h-11 border-gray-300 text-sm font-semibold"
                        min="2020"
                        max="2030"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  type="button"
                  onClick={handlePreview}
                  disabled={!canPreview || isLoadingPreview}
                  className="bg-blue-600 hover:bg-blue-700 text-white h-10 font-semibold px-6 rounded-lg shadow-sm"
                >
                  {isLoadingPreview ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading Preview...
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Preview Calculation
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoadingPreview && (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
              <p className="text-sm font-semibold text-gray-800">
                Calculating biometric attendance and salary breakdown...
              </p>
              <p className="text-xs text-gray-500">
                Fetching punch logs, approved leaves, advances, and pay rates
              </p>
            </div>
          )}

          {/* Error Message Display */}
          {previewError && (
            <Alert variant="destructive" className="border-red-200 bg-red-50 text-red-800">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-sm font-medium">
                {previewError}
              </AlertDescription>
            </Alert>
          )}

          {/* Unsuccessful Preview Handling */}
          {previewData && previewData.success === false && (
            <div className="py-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-5 flex flex-col items-center text-center gap-3">
                <div className="p-2.5 bg-red-100 text-red-600 rounded-full">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="font-bold text-red-950 text-base">
                    {previewData.message?.includes("PAID") ? "Payroll Already Finalized" : "Salary Profile Incomplete"}
                  </h4>
                  <p className="text-sm text-red-700 mt-1 max-w-md">
                    {previewData.message}
                  </p>
                </div>
                {previewData.message?.includes("salary details") && (
                  <Button
                    type="button"
                    onClick={() => {
                      navigate("/employees");
                      onClose();
                    }}
                    className="mt-2 bg-red-600 hover:bg-red-700 text-white font-medium px-5 py-2 rounded-lg text-xs"
                  >
                    Go to Employee Management
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Main Two-Column Payroll Form */}
          {previewData && previewData.success !== false ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

              {/* LEFT COLUMN: Attendance, Earnings & Deductions */}
              <div className="lg:col-span-7 space-y-4">

                {/* 1. Monthly Attendance Summary */}
                {previewData?.attendance_summary && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-700" />
                        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          Monthly Attendance & Work Record
                        </span>
                      </div>
                      <Badge variant="outline" className="text-slate-600 bg-white border-slate-300 text-xs font-medium">
                        {previewData.attendance_summary.total_calendar_days} Total Days
                      </Badge>
                    </div>

                    <div className="grid grid-cols-6 gap-2.5 text-center">
                      <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs">
                        <div className="text-xs font-medium text-slate-500">Working Days</div>
                        <div className="text-base font-bold text-slate-900 mt-0.5">
                          {previewData.attendance_summary.working_days}
                        </div>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs">
                        <div className="text-xs font-medium text-slate-600 flex items-center justify-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          Present
                        </div>
                        <div className="text-base font-bold text-emerald-700 mt-0.5">
                          {previewData.attendance_summary.present_days}
                        </div>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs">
                        <div className="text-xs font-medium text-slate-600 flex items-center justify-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                          Absent
                        </div>
                        <div className="text-base font-bold text-rose-700 mt-0.5">
                          {previewData.attendance_summary.absent_days}
                        </div>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs">
                        <div className="text-xs font-medium text-slate-500">Sundays / Off</div>
                        <div className="text-base font-bold text-slate-800 mt-0.5">
                          {previewData.attendance_summary.sundays}
                        </div>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-lg p-2.5 shadow-2xs">
                        <div className="text-xs font-medium text-slate-500">Leaves</div>
                        <div className="text-base font-bold text-slate-800 mt-0.5">
                          {previewData.attendance_summary.paid_leaves + previewData.attendance_summary.unpaid_leaves}
                        </div>
                      </div>
                      <div className="bg-white border border-blue-100 rounded-lg p-2.5 shadow-2xs">
                        <div className="text-xs font-medium text-blue-500 flex items-center justify-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                          Holidays
                        </div>
                        <div className="text-base font-bold text-blue-700 mt-0.5">
                          {previewData.attendance_summary.holidays}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Biometric ESSL Sync Warning */}
                {import.meta.env.VITE_FEATURE_BIOMETRIC === "true" && Number(previewData.missing_days) > 0 && (
                  <Alert className="border-amber-200 bg-amber-50 text-amber-900 rounded-lg py-2.5">
                    <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                    <AlertDescription className="text-xs font-medium">
                      Employee has <strong>{previewData.missing_days}</strong> missing punch days from biometric sync. These days are factored into LOP.
                    </AlertDescription>
                  </Alert>
                )}

                {/* Upsert Notice */}
                {import.meta.env.VITE_FEATURE_BIOMETRIC === "true" && previewData.existing_record && (
                  <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 font-medium">
                    <CheckCircle className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>Existing record found ({previewData.existing_status}). Submitting will update this payroll.</span>
                  </div>
                )}

                {/* 2. Earnings & Deductions Ledger Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Earnings Box */}
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                          Gross Earnings
                        </span>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                          Credits (+)
                        </span>
                      </div>

                      <div className="p-4 space-y-3.5 text-sm">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-gray-800">Basic / Gross Salary</div>
                            <div className="text-[11px] text-gray-500">Monthly contracted wage</div>
                          </div>
                          <span className="font-semibold text-gray-900">{formatCurrency(Number(formData.gross_pay))}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium text-gray-800">Previous Balance</div>
                            <div className="text-[11px] text-gray-500">Carried over balance / arrears</div>
                          </div>
                          <span className="font-semibold text-gray-900">{formatCurrency(Number(formData.previous_balance))}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50/60 p-4 border-t border-gray-200 flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">Total Earnings</span>
                      <span className="text-base font-bold text-emerald-600">
                        {formatCurrency(Number(formData.gross_pay) + Number(formData.previous_balance))}
                      </span>
                    </div>
                  </div>

                  {/* Deductions Box */}
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs flex flex-col justify-between">
                    <div>
                      <div className="bg-gray-50/80 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                          Deductions & Adjustments
                        </span>
                        <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                          Debits (-)
                        </span>
                      </div>

                      <div className="p-4 space-y-3 text-sm">
                        {/* LOP */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-medium text-gray-800">
                              Loss of Pay (LOP)
                            </label>
                            {previewData?.suggested_lop !== undefined && (
                              <button
                                type="button"
                                onClick={() => updateField("lop", Number(previewData.suggested_lop))}
                                className="text-[11px] text-blue-600 hover:underline font-medium"
                              >
                                Auto: ₹{previewData.suggested_lop}
                              </button>
                            )}
                          </div>
                          <Input
                            type="number"
                            min="0"
                            max={formData.gross_pay || undefined}
                            value={formData.lop ?? 0}
                            onChange={(e) => updateField("lop", Math.max(0, Number(e.target.value)))}
                            leftIcon={<IndianRupee className="h-3.5 w-3.5 text-gray-500" />}
                            className="h-10 text-xs font-semibold text-gray-900 border-gray-300 focus:border-blue-500"
                          />
                        </div>

                        {/* Advance */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-medium text-gray-800">
                              Advance Repayment
                            </label>
                            {(previewData?.outstanding_advance_balance !== undefined || Number(previewData?.advance_deduction) > 0) && (
                              <span className="text-[11px] text-gray-500 font-medium">
                                Max: ₹{previewData?.outstanding_advance_balance ?? previewData?.advance_deduction}
                              </span>
                            )}
                          </div>
                          <Input
                            type="number"
                            min="0"
                            max={previewData?.outstanding_advance_balance ?? (previewData?.advance_deduction ? Number(previewData.advance_deduction) : undefined)}
                            value={formData.advance_deduction || 0}
                            onChange={(e) => updateField("advance_deduction", Number(e.target.value))}
                            leftIcon={<IndianRupee className="h-3.5 w-3.5 text-gray-500" />}
                            className="h-10 text-xs font-semibold text-gray-900 border-gray-300 focus:border-blue-500"
                          />
                        </div>

                        {/* Other */}
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-800">
                            Other Deductions
                          </label>
                          <Input
                            type="number"
                            min="0"
                            value={formData.other_deductions || 0}
                            onChange={(e) => updateField("other_deductions", Number(e.target.value))}
                            leftIcon={<IndianRupee className="h-3.5 w-3.5 text-gray-500" />}
                            className="h-10 text-xs font-semibold text-gray-900 border-gray-300 focus:border-blue-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50/60 p-4 border-t border-gray-200 flex justify-between items-center">
                      <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">Total Deductions</span>
                      <span className="text-base font-bold text-rose-600">
                        -{formatCurrency(Number(formData.lop) + Number(formData.advance_deduction) + Number(formData.other_deductions))}
                      </span>
                    </div>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Net Payable Summary & Payment Form */}
              <div className="lg:col-span-5 space-y-4">

                {/* Net Salary Summary Card */}
                <div className="bg-slate-900 text-white rounded-xl p-5 border border-slate-800 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Net Payable Salary
                      </p>
                      <h3 className="text-base font-semibold text-white mt-0.5 truncate">
                        {previewData?.employee_name || employees.find(e => e.employee_id === Number(formData.employee_id))?.employee_name || "Employee"}
                      </h3>
                    </div>
                    <Badge variant="outline" className="text-slate-300 border-slate-700 bg-slate-800/60 text-xs font-medium">
                      {new Date(0, (formData.payroll_month ?? 1) - 1).toLocaleString("default", { month: "short" })}{" "}
                      {formData.payroll_year}
                    </Badge>
                  </div>

                  <div className="py-1">
                    <div className="text-3xl font-extrabold text-white tracking-tight">
                      {formatCurrency(calculatedNet)}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-800 text-xs text-slate-400 flex justify-between items-center">
                    <span>Gross: <strong className="text-slate-200">₹{Number(formData.gross_pay) + Number(formData.previous_balance)}</strong></span>
                    <span className="text-slate-600">•</span>
                    <span>Deductions: <strong className="text-rose-400">₹{Number(formData.lop) + Number(formData.advance_deduction) + Number(formData.other_deductions)}</strong></span>
                  </div>
                </div>

                {/* Payment Processing Form */}
                <div className="bg-white border border-gray-200 rounded-xl p-5 space-y-4 shadow-2xs">
                  <div className="border-b border-gray-100 pb-2 flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                      Disbursement Details
                    </span>
                    <span className="text-[11px] text-gray-500 font-medium">Step 2 of 2</span>
                  </div>

                  {/* Payment Mode */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-700">Disbursement Method</Label>
                    <RadioGroup
                      value={formData.payment_method}
                      onValueChange={(value) => handleInputChange("payment_method", value)}
                      className="grid grid-cols-2 gap-2.5"
                    >
                      <label
                        className={`cursor-pointer p-3 rounded-lg text-xs font-medium border flex items-center gap-2.5 transition ${
                          formData.payment_method === PaymentMethodEnum.CASH
                            ? "bg-blue-50/70 border-blue-500 text-blue-900 font-semibold shadow-2xs"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <RadioGroupItem value={PaymentMethodEnum.CASH} className="text-blue-600" />
                        <div>
                          <div className="font-semibold">Cash</div>
                          <div className="text-[10px] text-gray-500 font-normal">Direct Handover</div>
                        </div>
                      </label>
                      <label
                        className={`cursor-pointer p-3 rounded-lg text-xs font-medium border flex items-center gap-2.5 transition ${
                          formData.payment_method === PaymentMethodEnum.UPI
                            ? "bg-blue-50/70 border-blue-500 text-blue-900 font-semibold shadow-2xs"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <RadioGroupItem value={PaymentMethodEnum.UPI} className="text-blue-600" />
                        <div>
                          <div className="font-semibold">Bank / UPI</div>
                          <div className="text-[10px] text-gray-500 font-normal">Account Transfer</div>
                        </div>
                      </label>
                    </RadioGroup>
                  </div>

                  {/* Paid Amount */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs font-semibold text-gray-700">Amount to Disburse</Label>
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => handlePaymentOptionChange("full")}
                          className={`text-xs px-2.5 py-1 rounded font-semibold transition ${
                            paymentOption === "full"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          Pay Full (100%)
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePaymentOptionChange("half")}
                          className={`text-xs px-2.5 py-1 rounded font-semibold transition ${
                            paymentOption === "half"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}
                        >
                          50%
                        </button>
                      </div>
                    </div>
                    <Input
                      type="number"
                      min="0"
                      value={formData.paid_amount || ""}
                      onChange={(e) => handlePaidAmountChange(Number(e.target.value))}
                      leftIcon={<IndianRupee className="h-4 w-4 text-gray-500" />}
                      className="h-11 font-bold text-gray-900 text-base border-gray-300"
                      placeholder="0"
                    />
                    {(!formData.paid_amount || Number(formData.paid_amount) <= 0) && (
                      <p className="text-[11px] text-amber-600 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                        Amount to disburse is required and must be greater than 0
                      </p>
                    )}
                  </div>

                  {/* Payment Notes */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-700">
                      Payment Reference / Voucher Remarks <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={formData.payment_notes}
                      onChange={(e) => handleInputChange("payment_notes", e.target.value)}
                      className={`h-10 text-xs border-gray-300 ${
                        !formData.payment_notes?.trim() ? "border-amber-300 focus:border-amber-500" : ""
                      }`}
                      placeholder="e.g. UTR / IMPS ref, Cheque number, or Cash Voucher ID"
                    />
                    {!formData.payment_notes?.trim() && (
                      <p className="text-[11px] text-amber-600 flex items-center gap-1 font-medium">
                        <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
                        Required for audit logs and finance records
                      </p>
                    )}
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="space-y-2 pt-1">
                  {!isFormValid && (
                    <div className="text-[11px] text-amber-800 bg-amber-50/90 border border-amber-200 rounded-lg py-1.5 px-3 flex items-center gap-1.5 font-medium">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span>
                        {!formData.payment_notes?.trim()
                          ? "Enter Payment Reference / Voucher Remarks to enable button"
                          : (!formData.paid_amount || Number(formData.paid_amount) <= 0)
                          ? "Enter a valid disbursement amount"
                          : "Please fill all required fields to continue"}
                      </span>
                    </div>
                  )}
                  <Button
                    type="submit"
                    disabled={!isFormValid || isSubmitting}
                    className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        {import.meta.env.VITE_FEATURE_BIOMETRIC === "true" && previewData?.existing_record
                          ? "Update Payroll Record"
                          : "Confirm & Generate Payroll"}
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="w-full h-10 text-xs font-medium text-gray-700 border-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                </div>

              </div>

            </div>
          ) : null}
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
        title={
          import.meta.env.VITE_FEATURE_BIOMETRIC === "true" && previewData?.existing_record
            ? "Confirm Payroll Update"
            : "Confirm Payroll Creation"
        }
        description={
          pendingPayrollData ? (
            <div className="space-y-2 mt-2">
              <p className="font-medium">
                {import.meta.env.VITE_FEATURE_BIOMETRIC === "true" && previewData?.existing_record
                  ? "Are you sure you want to update this payroll record?"
                  : "Are you sure you want to create this payroll?"}
              </p>
              <div className="bg-muted/50 p-3 rounded-md space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employee:</span>
                  <span className="font-medium">
                    {previewData?.employee_name || employees.find(
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
            import.meta.env.VITE_FEATURE_BIOMETRIC === "true" && previewData?.existing_record
              ? "Are you sure you want to update this payroll record?"
              : "Are you sure you want to create this payroll?"
          )
        }
        confirmText={
          import.meta.env.VITE_FEATURE_BIOMETRIC === "true" && previewData?.existing_record
            ? "Update Payroll"
            : "Create Payroll"
        }
        cancelText="Cancel"
        onConfirm={handleConfirmCreate}
        onCancel={handleCancelConfirm}
        isLoading={isSubmitting}
        loadingText={
          import.meta.env.VITE_FEATURE_BIOMETRIC === "true" && previewData?.existing_record
            ? "Updating payroll..."
            : "Creating payroll..."
        }
        disabled={
          isSubmitting ||
          !pendingPayrollData ||
          !pendingPayrollData.employee_id ||
          pendingPayrollData.employee_id <= 0 ||
          !pendingPayrollData.paid_amount ||
          pendingPayrollData.paid_amount <= 0 ||
          !pendingPayrollData.payment_notes ||
          pendingPayrollData.payment_notes.trim() === ""
        }
      />
    </Dialog>
  );
};
