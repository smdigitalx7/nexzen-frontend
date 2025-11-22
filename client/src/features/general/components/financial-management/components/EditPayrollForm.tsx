import React, { useEffect, useRef, useMemo } from "react";
import { FormDialog } from "@/common/components/shared";
import { Label } from "@/common/components/ui/label";
import { Input } from "@/common/components/ui/input";
import type { PayrollUpdate, PayrollRead } from "@/features/general/types/payrolls";
import { useFormState } from "@/common/hooks";
import { toast } from "@/common/hooks/use-toast";

interface PayrollWithEmployee extends Omit<PayrollRead, "payroll_month"> {
  employee_name: string;
  employee_type?: string;
  payroll_month: number; // Changed from string to number to match API
  payroll_year: number;
}

interface EditPayrollFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PayrollUpdate) => void;
  selectedPayroll: PayrollWithEmployee | null;
}

export const EditPayrollForm = ({
  isOpen,
  onClose,
  onSubmit,
  selectedPayroll,
}: EditPayrollFormProps) => {
  // Memoize initial data to prevent recreation on every render
  const initialData = useMemo(() => ({
    other_deductions: selectedPayroll?.other_deductions || 0,
    advance_amount: selectedPayroll?.advance_deduction || 0,
    paid_amount: selectedPayroll?.paid_amount || 0,
    payment_notes: selectedPayroll?.payment_notes || "",
  }), [selectedPayroll?.payroll_id, selectedPayroll?.other_deductions, selectedPayroll?.advance_deduction, selectedPayroll?.paid_amount, selectedPayroll?.payment_notes]);

  const {
    formData,
    updateField,
    setFormData,
    resetForm,
  } = useFormState({
    initialData
  });

  // Track previous payroll ID to avoid unnecessary updates
  const prevPayrollIdRef = useRef<number | null>(null);

  // Reset form data when selectedPayroll changes (only when payroll_id changes)
  useEffect(() => {
    if (selectedPayroll && isOpen) {
      const currentPayrollId = selectedPayroll.payroll_id;
      
      // Only update if payroll_id actually changed
      if (prevPayrollIdRef.current !== currentPayrollId) {
        setFormData({
          other_deductions: selectedPayroll.other_deductions || 0,
          advance_amount: selectedPayroll.advance_deduction || 0,
          paid_amount: selectedPayroll.paid_amount || 0,
          payment_notes: selectedPayroll.payment_notes || "",
        });
        prevPayrollIdRef.current = currentPayrollId;
      }
    } else if (!selectedPayroll) {
      prevPayrollIdRef.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPayroll?.payroll_id, isOpen]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!isOpen) {
      prevPayrollIdRef.current = null;
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

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
    // Handle undefined, null, or invalid numbers
    // Note: formData.paid_amount can be number | undefined, but input may temporarily be empty string
    const paidAmountValue = formData.paid_amount as number | string | undefined;
    const paidAmount = 
      paidAmountValue === "" || 
      paidAmountValue === undefined || 
      paidAmountValue === null
        ? null
        : typeof paidAmountValue === "number"
        ? paidAmountValue
        : Number(paidAmountValue);
    
    if (paidAmount === null || isNaN(paidAmount) || paidAmount < 0) {
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
      paid_amount: paidAmount,
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
          <Input
            type="number"
            id="other_deductions"
            value={formData.other_deductions}
            onChange={(e) => handleInputChange("other_deductions", Number(e.target.value))}
            placeholder="0"
            leftIcon={<span className="text-sm font-bold">₹</span>}
            className="h-11"
            min="0"
            step="0.01"
          />
        </div>

        {/* Advance Amount */}
        <div>
          <Label htmlFor="advance_amount" className="text-sm font-medium">
            Advance Amount
          </Label>
          <Input
            type="number"
            id="advance_amount"
            value={formData.advance_amount}
            onChange={(e) => handleInputChange("advance_amount", Number(e.target.value))}
            placeholder="0"
            leftIcon={<span className="text-sm font-bold">₹</span>}
            className="h-11"
            min="0"
            step="0.01"
          />
        </div>

        {/* Paid Amount */}
        <div>
          <Label htmlFor="paid_amount" className="text-sm font-medium">
            Paid Amount <span className="text-red-500">*</span>
          </Label>
          <Input
            type="number"
            id="paid_amount"
            value={formData.paid_amount || ""}
            onChange={(e) => handleInputChange("paid_amount", e.target.value === "" ? "" : Number(e.target.value))}
            placeholder="Enter paid amount"
            leftIcon={<span className="text-sm font-bold">₹</span>}
            className="h-11"
            min="0"
            required
          />
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
