import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calculator, Save, X, User, Calendar, CreditCard, AlertCircle, CheckCircle, Eye, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EmployeeCombobox } from "@/components/ui/employee-combobox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PayrollCreate, PayrollUpdate, PayrollPreview } from "@/lib/types/general/payrolls";
import { PayrollStatusEnum, PaymentMethodEnum } from "@/lib/types/general/payrolls";
import { formatCurrency } from "@/lib/utils";
import { useFormState } from "@/lib/hooks/common";
import { PayrollsService } from "@/lib/services/general/payrolls.service";
import { toast } from "@/hooks/use-toast";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";

interface SalaryCalculationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PayrollCreate) => void;
  employees: any[];
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
  const [pendingPayrollData, setPendingPayrollData] = useState<PayrollCreate | null>(null);

  // Using shared form state management
  const {
    formData,
    updateField,
  } = useFormState({
    initialData: {
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
    }
  });

  const calculatedNet = useMemo(() => {
    const gross = formData.gross_pay || 0;
    const lop = formData.lop || 0;
    const advance = formData.advance_deduction || 0;
    const other = formData.other_deductions || 0;
    return gross - lop - advance - other;
  }, [formData.gross_pay, formData.lop, formData.advance_deduction, formData.other_deductions]);

  const handlePreview = async () => {
    if (!formData.employee_id || !formData.payroll_month || !formData.payroll_year) {
      toast({
        title: "Validation Error",
        description: "Please select employee, month, and year to preview",
        variant: "destructive",
      });
      return;
    }

    setIsLoadingPreview(true);
    setPreviewData(null);
    try {
      const preview = await PayrollsService.getPreview({
        employee_id: Number(formData.employee_id),
        month: Number(formData.payroll_month),
        year: Number(formData.payroll_year),
      });
      
      setPreviewData(preview);
      
      // Auto-populate form with preview data
      updateField("gross_pay", preview.gross_pay);
      updateField("previous_balance", preview.previous_balance);
      updateField("lop", preview.lop);
      updateField("advance_deduction", preview.advance_deduction);
      updateField("other_deductions", preview.other_deductions);
      
      toast({
        title: "Success",
        description: "Payroll preview loaded successfully",
        variant: "success",
      });
    } catch (error: any) {
      console.error("Failed to get payroll preview:", error);
      toast({
        title: "Error",
        description: error?.message || "Failed to load payroll preview. Please check if employee has attendance for this month.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const canPreview = formData.employee_id && formData.payroll_month && formData.payroll_year;

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

    const payrollData: PayrollCreate = {
      employee_id: Number(formData.employee_id),
      payroll_month: Number(formData.payroll_month),
      payroll_year: Number(formData.payroll_year),
      other_deductions: Number(formData.other_deductions) || 0,
      advance_amount: Number(formData.advance_deduction) || 0, // Use advance_deduction value
      paid_amount: Number(formData.paid_amount),
      payment_method: formData.payment_method,
      payment_notes: formData.payment_notes,
    };

    // Store payroll data and show confirmation dialog
    setPendingPayrollData(payrollData);
    setShowConfirmDialog(true);
  };

  const handleConfirmCreate = () => {
    if (pendingPayrollData) {
      onSubmit(pendingPayrollData);
      setShowConfirmDialog(false);
      setPendingPayrollData(null);
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirmDialog(false);
    setPendingPayrollData(null);
  };

  const handleInputChange = (field: string, value: any) => {
    updateField(field as keyof typeof formData, value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calculator className="h-6 w-6 text-primary" />
            </div>
            Preview Payroll
          </DialogTitle>
          <DialogDescription className="text-base">
            Preview payroll calculations for an employee. Use the 'Get Preview' button to load calculated values from attendance data.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Employee & Period Selection */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <User className="h-4 w-4" />
              Employee & Period Information
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Employee Selection */}
              <Card className="p-4">
                <div className="space-y-3">
                  <Label htmlFor="employee" className="text-sm font-medium flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Select Employee
                  </Label>
                  <EmployeeCombobox
                    value={formData.employee_id?.toString() || ""}
                    onValueChange={(value) => {
                      handleInputChange("employee_id", value);
                      setPreviewData(null); // Clear preview when employee changes
                    }}
                    placeholder="Search and select employee..."
                    className="h-11"
                  />
                </div>
              </Card>

              {/* Pay Period */}
              <Card className="p-4">
                <div className="space-y-3">
                  <Label className="text-sm font-medium flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Pay Period
                  </Label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <Select
                        value={formData.payroll_month?.toString() || ""}
                        onValueChange={(value) => {
                          handleInputChange("payroll_month", value);
                          setPreviewData(null); // Clear preview when month changes
                        }}
                      >
                        <SelectTrigger className="h-11">
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {new Date(0, i).toLocaleString('default', { month: 'long' })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24">
                      <Input
                        type="number"
                        value={formData.payroll_year}
                        onChange={(e) => {
                          handleInputChange("payroll_year", e.target.value);
                          setPreviewData(null); // Clear preview when year changes
                        }}
                        placeholder="Year"
                        className="h-11"
                        min="2020"
                        max="2030"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handlePreview}
                    disabled={!canPreview || isLoadingPreview}
                    className="w-full mt-2"
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
              </Card>
            </div>
          </motion.div>

          <Separator />

          {/* Show full form only after preview is loaded */}
          {previewData ? (
            <>
              {/* Salary Calculation Section */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <span className="text-sm font-bold">₹</span>
              Salary Calculation
            </div>

            <Card className="border-2 border-dashed border-primary/20">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Calculator className="h-5 w-5 text-primary" />
                  Salary Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Gross Pay and Previous Balance */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gross Pay */}
                <div className="space-y-3">
                  <Label htmlFor="gross_pay" className="text-sm font-medium">Gross Salary</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm font-bold text-muted-foreground">₹</span>
                    <Input
                      type="number"
                      id="gross_pay"
                      value={formData.gross_pay}
                      onChange={(e) => handleInputChange("gross_pay", Number(e.target.value))}
                      placeholder="Enter gross salary amount"
                      className="pl-10 h-11 text-lg font-medium"
                      readOnly
                      disabled
                    />
                  </div>
                </div>

                  {/* Previous Balance */}
                  <div className="space-y-3">
                    <Label htmlFor="previous_balance" className="text-sm font-medium">Previous Balance</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm font-bold text-muted-foreground">₹</span>
                      <Input
                        type="number"
                        id="previous_balance"
                        value={formData.previous_balance}
                        onChange={(e) => handleInputChange("previous_balance", Number(e.target.value))}
                        placeholder="Previous balance amount"
                        className="pl-10 h-11"
                        readOnly
                        disabled
                      />
                    </div>
                  </div>
                </div>

                {/* Deductions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="lop" className="text-sm font-medium text-orange-600">Loss of Pay (LOP)</Label>
                    <Input
                      type="number"
                      id="lop"
                      value={formData.lop}
                      onChange={(e) => handleInputChange("lop", Number(e.target.value))}
                      placeholder="0"
                      className="h-10"
                      readOnly
                      disabled
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="advance_deduction" className="text-sm font-medium text-blue-600">Advance Deduction</Label>
                    <Input
                      type="number"
                      id="advance_deduction"
                      value={formData.advance_deduction}
                      onChange={(e) => handleInputChange("advance_deduction", Number(e.target.value))}
                      placeholder="0"
                      className="h-10"
                      min="0"
                    />
                    {previewData && (
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Available Balance: <span className="font-medium">₹{previewData.advance_deduction?.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</span>
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="other_deductions" className="text-sm font-medium text-red-600">Other Deductions</Label>
                    <Input
                      type="number"
                      id="other_deductions"
                      value={formData.other_deductions}
                      onChange={(e) => handleInputChange("other_deductions", Number(e.target.value))}
                      placeholder="0"
                      className="h-10"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>

                {/* Net Salary Display */}
                <div className="bg-gradient-to-r from-primary/5 to-primary/10 p-6 rounded-xl border-2 border-primary/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <span className="text-lg font-semibold">Net Salary</span>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary">
                        {formatCurrency(calculatedNet)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        After all deductions
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <Separator />

          {/* Payment Information */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              Payment Information
            </div>

            <div className="space-y-3">
              <Label htmlFor="payment_method" className="text-sm font-medium">
                Payment Method <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => handleInputChange("payment_method", value)}
                required
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PaymentMethodEnum.CASH}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold">₹</span>
                      Cash
                    </div>
                  </SelectItem>
                  <SelectItem value={PaymentMethodEnum.ONLINE}>
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Online
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label htmlFor="paid_amount" className="text-sm font-medium">
                Paid Amount <span className="text-red-500">*</span>
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm font-bold text-muted-foreground">₹</span>
                <Input
                  type="number"
                  id="paid_amount"
                  value={formData.paid_amount || ""}
                  onChange={(e) => handleInputChange("paid_amount", e.target.value === "" ? "" : Number(e.target.value))}
                  placeholder="Enter paid amount"
                  className="pl-10 h-11"
                  min="0"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="payment_notes" className="text-sm font-medium">
                Payment Notes <span className="text-red-500">*</span>
              </Label>
              <Input
                id="payment_notes"
                value={formData.payment_notes}
                onChange={(e) => handleInputChange("payment_notes", e.target.value)}
                placeholder="Enter payment notes"
                className="h-11"
                required
              />
            </div>
          </motion.div>

          <Separator />
            </>
          ) : null}

          <DialogFooter className="pt-4">
            <div className="flex gap-3 w-full">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
              {previewData && (
                <Button type="submit" className="flex-1">
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
        onOpenChange={setShowConfirmDialog}
        title="Confirm Payroll Creation"
        description={
          pendingPayrollData ? (
            <div className="space-y-2 mt-2">
              <p className="font-medium">Are you sure you want to create this payroll?</p>
              <div className="bg-muted/50 p-3 rounded-md space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employee:</span>
                  <span className="font-medium">
                    {employees.find(emp => emp.employee_id === pendingPayrollData.employee_id)?.employee_name || `ID: ${pendingPayrollData.employee_id}`}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Period:</span>
                  <span className="font-medium">
                    {new Date(0, pendingPayrollData.payroll_month - 1).toLocaleString('default', { month: 'long' })} {pendingPayrollData.payroll_year}
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
      />
    </Dialog>
  );
};
