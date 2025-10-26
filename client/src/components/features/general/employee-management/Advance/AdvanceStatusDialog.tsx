import React from "react";
import { FormDialog } from "@/components/shared";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface AdvanceStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: string;
  onStatusChange: (status: string) => void;
  reason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
}

const AdvanceStatusDialog = ({ open, onOpenChange, status, onStatusChange, reason, onReasonChange, onConfirm }: AdvanceStatusDialogProps) => {
  const handleSave = () => {
    if (status.trim()) {
      onConfirm();
    }
  };

  const isDestructive = status === "REJECTED" || status === "CANCELLED";

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Update Advance Status"
      description="Update the status of this advance request"
      size="MEDIUM"
      onSave={handleSave}
      saveText="Update Status"
      cancelText="Cancel"
      saveVariant={isDestructive ? "destructive" : "default"}
      disabled={!status.trim()}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="status">Status *</Label>
          <Select value={status} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="REJECTED">Rejected</SelectItem>
              <SelectItem value="REPAID">Repaid</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {(status === "REJECTED" || status === "CANCELLED") && (
          <div>
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="Please provide a reason..."
              rows={3}
              required
            />
          </div>
        )}
      </div>
    </FormDialog>
  );
};

export default React.memo(AdvanceStatusDialog);


