import { useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, Save, X, User, Calendar, CreditCard, AlertCircle, CheckCircle } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { PayrollCreate, PayrollUpdate } from "@/lib/types/general/payrolls";
import { PayrollStatusEnum, PaymentMethodEnum } from "@/lib/types/general/payrolls";
import { formatCurrency } from "@/lib/utils";
import { useFormState } from "@/lib/hooks/common";

interface SalaryCalculationFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PayrollCreate | PayrollUpdate) => void;
  employees: any[];
  selectedPayroll?: any;
}

export const SalaryCalculationForm = ({
  isOpen,
  onClose,
  onSubmit,
  employees,
  selectedPayroll,
}: SalaryCalculationFormProps) => {
  // Using shared form state management
  const {
    formData,
    setFormData,
    updateField,
    resetForm,
    errors,
    setFieldError,
    clearFieldError,
  } = useFormState({
    initialData: {
      employee_id: selectedPayroll?.employee_id || "",
      payroll_month: selectedPayroll?.payroll_month || new Date().getMonth() + 1,
      payroll_year: selectedPayroll?.payroll_year || new Date().getFullYear(),
      previous_balance: selectedPayroll?.previous_balance || 0,
      gross_pay: selectedPayroll?.gross_pay || 0,
      lop: selectedPayroll?.lop || 0,
      advance_deduction: selectedPayroll?.advance_deduction || 0,
      other_deductions: selectedPayroll?.other_deductions || 0,
      paid_amount: selectedPayroll?.paid_amount || 0,
      payment_method: selectedPayroll?.payment_method || PaymentMethodEnum.BANK_TRANSFER,
      payment_notes: selectedPayroll?.payment_notes || "",
      status: selectedPayroll?.status || PayrollStatusEnum.PENDING,
    }
  });

  const calculatedNet = useMemo(() => {
    const gross = formData.gross_pay || 0;
    const lop = formData.lop || 0;
    const advance = formData.advance_deduction || 0;
    const other = formData.other_deductions || 0;
    return gross - lop - advance - other;
  }, [formData.gross_pay, formData.lop, formData.advance_deduction, formData.other_deductions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const netSalary = calculatedNet;
    
    const payrollData = {
      ...formData,
      employee_id: Number(formData.employee_id),
      payroll_month: Number(formData.payroll_month),
      payroll_year: Number(formData.payroll_year),
      net_salary: netSalary,
    };

    onSubmit(payrollData);
    onClose();
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
            {selectedPayroll ? "Edit Payroll Entry" : "Create New Payroll"}
          </DialogTitle>
          <DialogDescription className="text-base">
            {selectedPayroll 
              ? "Update employee payroll information and calculations."
              : "Add a new payroll entry for an employee with automatic calculations."
            }
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
                  <Select
                    value={formData.employee_id.toString()}
                    onValueChange={(value) => handleInputChange("employee_id", value)}
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Choose an employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {employees.map((employee) => (
                        <SelectItem key={employee.employee_id} value={employee.employee_id.toString()}>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{employee.employee_name}</span>
                            <Badge variant="outline" className="text-xs">
                              ID: {employee.employee_id}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                        value={formData.payroll_month.toString()}
                        onValueChange={(value) => handleInputChange("payroll_month", value)}
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
                        onChange={(e) => handleInputChange("payroll_year", e.target.value)}
                        placeholder="Year"
                        className="h-11"
                        min="2020"
                        max="2030"
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </motion.div>

          <Separator />

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
                    />
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
                    />
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="payment_method" className="text-sm font-medium">Payment Method</Label>
                <Select
                  value={formData.payment_method}
                  onValueChange={(value) => handleInputChange("payment_method", value)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PaymentMethodEnum.BANK_TRANSFER}>
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        Bank Transfer
                      </div>
                    </SelectItem>
                    <SelectItem value={PaymentMethodEnum.CASH}>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">₹</span>
                        Cash
                      </div>
                    </SelectItem>
                    <SelectItem value={PaymentMethodEnum.CHEQUE}>Cheque</SelectItem>
                    <SelectItem value={PaymentMethodEnum.UPI}>UPI</SelectItem>
                    <SelectItem value={PaymentMethodEnum.OTHER}>Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label htmlFor="status" className="text-sm font-medium">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange("status", value)}
                >
                  <SelectTrigger className="h-11">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={PayrollStatusEnum.PENDING}>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-yellow-500" />
                        Pending
                      </div>
                    </SelectItem>
                    <SelectItem value={PayrollStatusEnum.PAID}>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        Paid
                      </div>
                    </SelectItem>
                    <SelectItem value={PayrollStatusEnum.HOLD}>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                        On Hold
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <Label htmlFor="payment_notes" className="text-sm font-medium">Payment Notes</Label>
              <Input
                id="payment_notes"
                value={formData.payment_notes}
                onChange={(e) => handleInputChange("payment_notes", e.target.value)}
                placeholder="Add any additional notes about this payment (optional)"
                className="h-11"
              />
            </div>
          </motion.div>

          <Separator />

          <DialogFooter className="pt-4">
            <div className="flex gap-3 w-full">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {selectedPayroll ? "Update Payroll" : "Create Payroll"}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
