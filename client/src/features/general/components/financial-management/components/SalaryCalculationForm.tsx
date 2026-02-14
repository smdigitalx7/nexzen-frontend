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
  initialEmployeeId?: number | null;
}

export const SalaryCalculationForm = ({
  isOpen,
  onClose,
  onSubmit,
  employees,
  initialEmployeeId,
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
  const initialFormData = useMemo(() => ({
    employee_id: initialEmployeeId ? initialEmployeeId.toString() : "",
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
  }), [initialEmployeeId]);

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

  // Auto-fetch preview when dialog opens with an employee ID
  useEffect(() => {
    if (isOpen && initialEmployeeId) {
      // Call preview directly with initialEmployeeId
      const fetchPreview = async () => {
        setIsLoadingPreview(true);
        setPreviewData(null);
        setPreviewError(null);
        
        try {
          const currentMonth = new Date().getMonth() + 1;
          const currentYear = new Date().getFullYear();
          
          const preview = await PayrollsService.getPreview({
            employee_id: Number(initialEmployeeId),
            month: currentMonth,
            year: currentYear,
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
  }, [isOpen, initialEmployeeId]);

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
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto scrollbar-hide p-0 sm:rounded-2xl">
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
          {initialEmployeeId ? (
            <div className="space-y-2">
              <DialogTitle className="flex items-center gap-2.5 text-base font-medium text-gray-600">
                <div className="p-1.5 bg-blue-100 rounded-lg text-blue-600">
                  <Calculator size={16} />
                </div>
                Generate Payroll
              </DialogTitle>
              <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Employee</p>
                    <h3 className="text-lg font-bold text-gray-900">
                      {previewData?.employee_name || employees.find(e => e.employee_id === initialEmployeeId)?.employee_name || "Loading..."}
                    </h3>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Period</p>
                    <p className="text-lg font-bold text-blue-600">
                      {new Date(0, (formData.payroll_month as number) - 1).toLocaleString("default", { month: "long" })} {formData.payroll_year}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <DialogTitle className="flex items-center gap-2.5 text-xl font-semibold text-gray-900">
              <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                <Calculator size={20} />
              </div>
              Preview Payroll
            </DialogTitle>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">

          {/* Employee & Period Selection (If not initial) */}
            {!initialEmployeeId && (
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
              </motion.div>
            )}

            
            {/* Loading State */}
            {isLoadingPreview && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                    <p className="text-gray-500 font-medium">Calculating payroll...</p>
                </div>
            )}

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

          {previewData && <Separator className="bg-gray-200" />}

          {/* Show full form only after preview is loaded */}
          {previewData ? (
            <>
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
            >
              
               {/* Net Salary Display - Highlighted */}
               <div className="bg-slate-900 text-white p-5 rounded-xl shadow-lg relative overflow-hidden">
                  <div className="relative z-10 flex justify-between items-end">
                      <div>
                          <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold mb-1">Net Payable To</p>
                          <p className="text-lg font-medium text-white">
                              {previewData?.employee_name || employees.find(e => e.employee_id === Number(formData.employee_id))?.employee_name || "Employee"}
                          </p>
                      </div>
                      <div className="text-right">
                          <p className="text-slate-400 text-xs mb-1">Total Amount</p>
                          <div className="text-3xl font-bold tracking-tight text-white">
                              {formatCurrency(calculatedNet)}
                          </div>
                      </div>
                  </div>
                  {/* Decorative faint background circle */}
                  <div className="absolute -top-10 -right-10 w-32 h-32 bg-slate-800 rounded-full opacity-50 blur-2xl"></div>
               </div>

               {/* Breakdown Details */}
               <div className="grid grid-cols-2 gap-8 px-1">
                   {/* Earnings */}
                   <div className="space-y-3">
                       <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Earnings</h4>
                       
                       <div className="flex justify-between items-center text-sm">
                           <span className="text-gray-600">Gross Salary</span>
                           <span className="font-medium">{formatCurrency(Number(formData.gross_pay))}</span>
                       </div>
                       
                       <div className="flex justify-between items-center text-sm">
                           <span className="text-gray-600">Previous Balance</span>
                           <span className="font-medium">{formatCurrency(Number(formData.previous_balance))}</span>
                       </div>
                       
                       <div className="pt-2 border-t border-gray-100 flex justify-between items-center font-medium text-green-700">
                           <span>Total Earnings</span>
                           <span>{formatCurrency(Number(formData.gross_pay) + Number(formData.previous_balance))}</span>
                       </div>
                   </div>
                   
                   {/* Deductions */}
                   <div className="space-y-3">
                       <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Deductions</h4>
                       
                       <div className="flex justify-between items-center text-sm">
                           <span className="text-gray-600">LOP</span>
                           <span className="font-medium text-red-600">-{formatCurrency(Number(formData.lop))}</span>
                       </div>
                       
                       <div className="space-y-1">
                           <div className="flex justify-between items-center text-sm">
                               <span className="text-gray-600">Advance</span>
                               <input 
                                  type="number" 
                                  value={formData.advance_deduction}
                                  onChange={(e) => handleInputChange("advance_deduction", Number(e.target.value))}
                                  className="w-20 text-right text-sm border-b border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent py-0.5"
                               />
                           </div>
                           {Number(previewData?.advance_deduction) > 0 && 
                               <p className="text-[10px] text-gray-400 text-right">Max: {previewData?.advance_deduction}</p>
                           }
                       </div>
                       
                       <div className="flex justify-between items-center text-sm">
                           <span className="text-gray-600">Other</span>
                            <input 
                                  type="number" 
                                  value={formData.other_deductions}
                                  onChange={(e) => handleInputChange("other_deductions", Number(e.target.value))}
                                  className="w-20 text-right text-sm border-b border-gray-300 focus:outline-none focus:border-blue-500 bg-transparent py-0.5"
                               />
                       </div>

                        <div className="pt-2 border-t border-gray-100 flex justify-between items-center font-medium text-red-700">
                           <span>Total Deductions</span>
                           <span>-{formatCurrency(Number(formData.lop) + Number(formData.advance_deduction) + Number(formData.other_deductions))}</span>
                       </div>
                   </div>
               </div>

            </motion.div>

            {/* Payment Information */}
            <div className="space-y-4 pt-2 border-t border-gray-100">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-gray-800">Payment Details</h4>
                    <div className="flex items-center gap-2">
                         <RadioGroup
                             value={formData.payment_method}
                             onValueChange={(value) => handleInputChange("payment_method", value)}
                             className="flex gap-2"
                         >
                            <label className={`cursor-pointer px-3 py-1.5 rounded-md text-sm border flex items-center gap-2 ${formData.payment_method === PaymentMethodEnum.CASH ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200'}`}>
                                <RadioGroupItem value={PaymentMethodEnum.CASH} className="text-blue-600 w-3.5 h-3.5" /> Cash
                            </label>
                            <label className={`cursor-pointer px-3 py-1.5 rounded-md text-sm border flex items-center gap-2 ${formData.payment_method === PaymentMethodEnum.UPI ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200'}`}>
                                <RadioGroupItem value={PaymentMethodEnum.UPI} className="text-blue-600 w-3.5 h-3.5" /> UPI
                            </label>
                            {/* <label className={`cursor-pointer px-3 py-1.5 rounded-md text-sm border flex items-center gap-2 ${formData.payment_method === PaymentMethodEnum.CARD ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-white border-gray-200'}`}>
                                <RadioGroupItem value={PaymentMethodEnum.CARD} className="text-blue-600 w-3.5 h-3.5" /> Card
                            </label> */}
                         </RadioGroup>
                    </div>
                </div>

                {/* Paid Amount Input */}
                 <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                       <Label className="text-xs font-medium text-gray-500">Amount Paid</Label>
                       <Input
                          type="number"
                          value={formData.paid_amount || ""}
                          onChange={(e) => handlePaidAmountChange(Number(e.target.value))}
                          className="h-9"
                          placeholder="Amount"
                       />
                     </div>
                     <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-gray-500">
                          Notes <span className="text-red-500">*</span>
                        </Label>
                        <Input
                           value={formData.payment_notes}
                           onChange={(e) => handleInputChange("payment_notes", e.target.value)}
                           className="h-9"
                           placeholder="Reference/Notes (Required)"
                        />
                        {!formData.payment_notes && (
                          <p className="text-xs text-amber-600 flex items-center gap-1">
                            <span className="inline-block w-1 h-1 bg-amber-600 rounded-full"></span>
                            Payment notes are required for record keeping
                          </p>
                        )}
                     </div>
                 </div>
            </div>

          <DialogFooter className="pt-2">
            <Button
              type="submit"
              className="w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-medium"
            >
              Confirm & Generate Payroll
            </Button>
          </DialogFooter>
          </>
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
