import React from "react";
import { ConfirmDialog } from "@/components/shared";

interface LeaveApproveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: () => void;
}

const LeaveApproveDialog = ({ open, onOpenChange, onApprove }: LeaveApproveDialogProps) => {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Approve Leave Request"
      description="Are you sure you want to approve this leave request? This action cannot be undone."
      confirmText="Approve"
      cancelText="Cancel"
      variant="default"
      onConfirm={onApprove}
    />
  );
};

export default React.memo(LeaveApproveDialog);


