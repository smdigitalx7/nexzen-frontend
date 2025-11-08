import React from "react";
import { FormDialog } from "@/components/shared";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import type { PayrollUpdate } from "@/lib/types/general/payrolls";
import { useFormState } from "@/lib/hooks/common";
import { toast } from "@/hooks/use-toast";

interface EditPayrollFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PayrollUpdate) => void;
  selectedPayroll: any;
}

export const EditPayrollForm = ({
  isOpen,
  onClose,
  onSubmit,
  selectedPayroll,
}: EditPayrollFormProps) => {
  const {
    formData,
    updateField,
  } = useFormState({
    initialData: {
      other_deductions: selectedPayroll?.other_deductions || 0,
      advance_amount: selectedPayroll?.advance_deduction || 0,
      paid_amount: selectedPayroll?.paid_amount || 0,
      payment_notes: selectedPayroll?.payment_notes || "",
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPayroll) {
      toast({
        title: "Validation Error",
        description: "No payroll selected for update",
        variant: "destructive",
      });
      return;
    }

    // Validate payment information for update
    if (formData.paid_amount === undefined || formData.paid_amount === null || Number(formData.paid_amount) < 0) {
      toast({
        title: "Validation Error",
        description: "Paid amount is required and must be greater than or equal to 0",
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

    const payrollData: PayrollUpdate = {
      other_deductions: Number(formData.other_deductions) || 0,
      advance_amount: Number(formData.advance_amount) || 0,
      paid_amount: Number(formData.paid_amount),
      payment_notes: formData.payment_notes,
    };

    onSubmit(payrollData);
  };

  const handleInputChange = (field: string, value: any) => {
    updateField(field as keyof typeof formData, value);
  };

  const handleSave = () => {
    const form = document.getElementById('edit-payroll-form') as HTMLFormElement;
    if (form) {
      form.requestSubmit();
    }
  };

  if (!selectedPayroll) {
    return null;
  }

  return (
    <FormDialog
      open={isOpen}
      onOpenChange={onClose}
      title="Edit Payroll Entry"
      description="Update payroll information. Only payrolls with PENDING status can be updated."
      size="MEDIUM"
      onSave={handleSave}
      saveText="Update Payroll"
      cancelText="Close"
    >
      <form id="edit-payroll-form" onSubmit={handleSubmit} className="space-y-4">
        {/* Other Deductions */}
        <div>
          <Label htmlFor="other_deductions" className="text-sm font-medium">
            Other Deductions
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm font-bold text-muted-foreground">₹</span>
            <Input
              type="number"
              id="other_deductions"
              value={formData.other_deductions}
              onChange={(e) => handleInputChange("other_deductions", Number(e.target.value))}
              placeholder="0"
              className="pl-10 h-11"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Advance Amount */}
        <div>
          <Label htmlFor="advance_amount" className="text-sm font-medium">
            Advance Amount
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm font-bold text-muted-foreground">₹</span>
            <Input
              type="number"
              id="advance_amount"
              value={formData.advance_amount}
              onChange={(e) => handleInputChange("advance_amount", Number(e.target.value))}
              placeholder="0"
              className="pl-10 h-11"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        {/* Paid Amount */}
        <div>
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

        {/* Payment Notes */}
        <div>
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
      </form>
    </FormDialog>
  );
};
