import { useMemo } from "react";
import { motion } from "framer-motion";
import { Calculator, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import type { PayrollCreate, PayrollUpdate } from "@/lib/types/payrolls";
import { PayrollStatusEnum, PaymentMethodEnum } from "@/lib/types/payrolls";
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            {selectedPayroll ? "Edit Payroll" : "Create New Payroll"}
          </DialogTitle>
          <DialogDescription>
            {selectedPayroll 
              ? "Update employee payroll information and calculations."
              : "Add a new payroll entry for an employee."
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Employee Selection */}
            <div className="space-y-2">
              <Label htmlFor="employee">Employee</Label>
              <Select
                value={formData.employee_id.toString()}
                onValueChange={(value) => handleInputChange("employee_id", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.employee_id} value={employee.employee_id.toString()}>
                      {employee.employee_name} (ID: {employee.employee_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pay Period */}
            <div className="space-y-2">
              <Label htmlFor="payroll_month">Pay Period</Label>
              <div className="flex gap-2">
                <Select
                  value={formData.payroll_month.toString()}
                  onValueChange={(value) => handleInputChange("payroll_month", value)}
                >
                  <SelectTrigger className="w-32">
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
                <Input
                  type="number"
                  value={formData.payroll_year}
                  onChange={(e) => handleInputChange("payroll_year", e.target.value)}
                  placeholder="Year"
                  className="w-20"
                />
              </div>
            </div>
          </div>

          {/* Salary Calculation */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Salary Calculation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gross_pay">Gross Pay</Label>
                  <Input
                    type="number"
                    value={formData.gross_pay}
                    onChange={(e) => handleInputChange("gross_pay", Number(e.target.value))}
                    placeholder="Enter gross salary"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lop">Loss of Pay (LOP)</Label>
                  <Input
                    type="number"
                    value={formData.lop}
                    onChange={(e) => handleInputChange("lop", Number(e.target.value))}
                    placeholder="Enter LOP amount"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="advance_deduction">Advance Deduction</Label>
                  <Input
                    type="number"
                    value={formData.advance_deduction}
                    onChange={(e) => handleInputChange("advance_deduction", Number(e.target.value))}
                    placeholder="Enter advance deduction"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="other_deductions">Other Deductions</Label>
                  <Input
                    type="number"
                    value={formData.other_deductions}
                    onChange={(e) => handleInputChange("other_deductions", Number(e.target.value))}
                    placeholder="Enter other deductions"
                  />
                </div>
              </div>

              {/* Net Salary Display */}
              <div className="bg-muted p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Net Salary:</span>
                  <span className="text-lg font-bold">{formatCurrency(calculatedNet)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select
                value={formData.payment_method}
                onValueChange={(value) => handleInputChange("payment_method", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PaymentMethodEnum.BANK_TRANSFER}>Bank Transfer</SelectItem>
                  <SelectItem value={PaymentMethodEnum.CASH}>Cash</SelectItem>
                  <SelectItem value={PaymentMethodEnum.CHEQUE}>Cheque</SelectItem>
                  <SelectItem value={PaymentMethodEnum.UPI}>UPI</SelectItem>
                  <SelectItem value={PaymentMethodEnum.OTHER}>Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleInputChange("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={PayrollStatusEnum.PENDING}>Pending</SelectItem>
                  <SelectItem value={PayrollStatusEnum.PAID}>Paid</SelectItem>
                  <SelectItem value={PayrollStatusEnum.HOLD}>On Hold</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_notes">Payment Notes</Label>
            <Input
              value={formData.payment_notes}
              onChange={(e) => handleInputChange("payment_notes", e.target.value)}
              placeholder="Enter payment notes (optional)"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button type="submit">
              <Save className="h-4 w-4 mr-2" />
              {selectedPayroll ? "Update Payroll" : "Create Payroll"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
