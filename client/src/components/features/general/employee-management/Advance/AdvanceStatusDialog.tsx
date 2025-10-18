import React from "react";
import { ConfirmDialog } from "@/components/shared";

interface AdvanceStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: () => void;
}

const AdvanceStatusDialog = ({ open, onOpenChange, onApprove }: AdvanceStatusDialogProps) => {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Update Advance Status"
      description="Are you sure you want to update the status of this advance?"
      confirmText="Approve"
      cancelText="Cancel"
      variant="default"
      onConfirm={onApprove}
    />
  );
};

export default React.memo(AdvanceStatusDialog);


