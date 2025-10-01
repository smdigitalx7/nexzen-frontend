import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface LeaveRejectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reason: string;
  onReasonChange: (value: string) => void;
  onReject: () => void;
}

const LeaveRejectDialog = ({ open, onOpenChange, reason, onReasonChange, onReject }: LeaveRejectDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Reject Leave Request</AlertDialogTitle>
          <AlertDialogDescription>
            Please provide a reason for rejecting this leave request.
          </AlertDialogDescription>
        </AlertDialogHeader>
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
            />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onReject} className="bg-red-600 hover:bg-red-700" disabled={!reason.trim()}>
            Reject
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default React.memo(LeaveRejectDialog);


