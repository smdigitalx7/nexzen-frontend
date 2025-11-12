import React from "react";
import { ConfirmDialog } from "@/components/shared";

interface LeaveApproveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApprove: () => void;
  isLoading?: boolean;
}

const LeaveApproveDialog = ({ open, onOpenChange, onApprove, isLoading = false }: LeaveApproveDialogProps) => {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(newOpen) => {
        // Prevent closing while loading
        if (!isLoading) {
          onOpenChange(newOpen);
        }
      }}
      title="Approve Leave Request"
      description="Are you sure you want to approve this leave request? This action cannot be undone."
      confirmText="Approve"
      cancelText="Cancel"
      variant="default"
      onConfirm={onApprove}
      isLoading={isLoading}
      loadingText="Approving..."
      disabled={isLoading}
    />
  );
};

export default React.memo(LeaveApproveDialog);


