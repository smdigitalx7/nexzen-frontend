import React from "react";
import { FormDialog } from "@/components/shared";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface LeaveRejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: string;
  onReasonChange: (value: string) => void;
  onReject: () => void;
  isLoading?: boolean;
}

const LeaveRejectDialog = ({ open, onOpenChange, reason, onReasonChange, onReject, isLoading = false }: LeaveRejectDialogProps) => {
  const handleSave = () => {
    if (reason.trim() && !isLoading) {
      onReject();
    }
  };
  
  return (
    <FormDialog
      open={open}
      onOpenChange={(newOpen) => {
        // Prevent closing while loading
        if (!isLoading) {
          onOpenChange(newOpen);
        }
      }}
      title="Reject Leave Request"
      description="Please provide a reason for rejecting this leave request."
      size="MEDIUM"
      onSave={handleSave}
      saveText="Reject"
      cancelText="Cancel"
      saveVariant="destructive"
      disabled={!reason.trim() || isLoading}
      isLoading={isLoading}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="reject_reason">Rejection Reason *</Label>
          <Textarea
            id="reject_reason"
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            placeholder="Please provide a reason for rejection..."
            rows={3}
            required
            disabled={isLoading}
          />
        </div>
      </div>
    </FormDialog>
  );
};

export default React.memo(LeaveRejectDialog);


