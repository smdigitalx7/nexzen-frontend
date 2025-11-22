import React from "react";
import { ConfirmDialog } from "@/common/components/shared";

interface AdvanceDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

const AdvanceDeleteDialog = ({ open, onOpenChange, onConfirm }: AdvanceDeleteDialogProps) => {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Advance"
      description="Are you sure you want to delete this advance? This action cannot be undone."
      confirmText="Delete"
      cancelText="Cancel"
      variant="destructive"
      onConfirm={onConfirm}
    />
  );
};

export default React.memo(AdvanceDeleteDialog);


