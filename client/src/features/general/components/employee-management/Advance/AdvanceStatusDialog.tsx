import React from "react";
import { FormDialog } from "@/common/components/shared";
import { Label } from "@/common/components/ui/label";
import { Textarea } from "@/common/components/ui/textarea";
import { Check, X } from "lucide-react";
import { cn } from "@/common/utils";

interface AdvanceStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  status: string;
  onStatusChange: (status: string) => void;
  reason: string;
  onReasonChange: (reason: string) => void;
  onConfirm: () => void;
}

const AdvanceStatusDialog = ({
  open,
  onOpenChange,
  status,
  onStatusChange,
  reason,
  onReasonChange,
  onConfirm,
}: AdvanceStatusDialogProps) => {
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
      title="Update advance status"
      description="Choose to approve or reject this advance request."
      size="MEDIUM"
      onSave={handleSave}
      saveText="Update status"
      cancelText="Cancel"
      saveVariant={isDestructive ? "destructive" : "default"}
      disabled={!status.trim()}
    >
      <div className="space-y-5 py-1">
        <div>
          <p className="text-sm font-semibold text-slate-800 mb-3">
            Select status
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onStatusChange("APPROVED")}
              className={cn(
                "flex flex-col items-center gap-2.5 rounded-xl border-2 p-4 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                status === "APPROVED"
                  ? "border-emerald-500 bg-emerald-50/80"
                  : "border-slate-200 bg-slate-50/50 hover:border-emerald-200 hover:bg-emerald-50/50"
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
                  status === "APPROVED"
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-500"
                )}
              >
                <Check className="h-5 w-5" />
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  status === "APPROVED" ? "text-emerald-800" : "text-slate-700"
                )}
              >
                Approve
              </span>
              <span className="text-xs text-slate-500">Grant the advance</span>
            </button>

            <button
              type="button"
              onClick={() => onStatusChange("REJECTED")}
              className={cn(
                "flex flex-col items-center gap-2.5 rounded-xl border-2 p-4 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2",
                status === "REJECTED"
                  ? "border-red-500 bg-red-50/80"
                  : "border-slate-200 bg-slate-50/50 hover:border-red-200 hover:bg-red-50/50"
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
                  status === "REJECTED"
                    ? "bg-red-600 text-white"
                    : "bg-slate-200 text-slate-500"
                )}
              >
                <X className="h-5 w-5" />
              </span>
              <span
                className={cn(
                  "text-sm font-medium",
                  status === "REJECTED" ? "text-red-800" : "text-slate-700"
                )}
              >
                Reject
              </span>
              <span className="text-xs text-slate-500">Deny the request</span>
            </button>
          </div>
        </div>

        {(status === "REJECTED" || status === "CANCELLED") && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-200">
            <Label
              htmlFor="advance-reject-reason"
              className="text-sm font-medium text-slate-700 mb-1.5 block"
            >
              Reason for rejection <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="advance-reject-reason"
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              placeholder="Provide a reason for rejecting this request..."
              rows={3}
              className="resize-none border-slate-200 bg-white focus:border-red-300 focus:ring-red-100 rounded-lg"
              required
            />
          </div>
        )}
      </div>
    </FormDialog>
  );
};

export default React.memo(AdvanceStatusDialog);
