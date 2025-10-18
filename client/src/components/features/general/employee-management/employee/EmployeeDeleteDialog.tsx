import React from "react";
import { ConfirmDialog } from "@/components/shared";

interface EmployeeDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: { employee_name?: string } | null;
  onConfirm: () => void;
  isPending: boolean;
}

const EmployeeDeleteDialog = ({ open, onOpenChange, employee, onConfirm, isPending }: EmployeeDeleteDialogProps) => {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Employee"
      description={`Are you sure you want to delete ${employee?.employee_name}? This action cannot be undone and will permanently remove the employee record.`}
      confirmText={isPending ? "Deleting..." : "Delete"}
      cancelText="Cancel"
      variant="destructive"
      onConfirm={onConfirm}
      disabled={isPending}
    />
  );
};

export default React.memo(EmployeeDeleteDialog);
