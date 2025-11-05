import { FormDialog } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, User, FileText, Clock, CheckCircle, XCircle, X } from "lucide-react";

interface AdvanceViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  advance: any;
  employee: any;
  onChangeStatus?: (id: number) => void;
  onUpdateAmount?: (id: number) => void;
}

export const AdvanceViewDialog = ({ open, onOpenChange, advance, employee, onChangeStatus, onUpdateAmount }: AdvanceViewDialogProps) => {
  if (!advance) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "ACTIVE":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      case "REPAID":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "CANCELLED":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Advance Details"
      description="View advance request information and payment details"
      size="LARGE"
      showFooter={false}
    >
      <div className="space-y-6">
        {/* Employee Information */}
        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <User className="h-4 w-4" />
            Employee Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Employee Name</label>
              <p className="text-lg font-semibold">{employee?.employee_name || `Employee ${advance.employee_id}`}</p>
            </div>
          </div>
        </div>

        {/* Advance Information */}
        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <span className="text-sm font-bold">₹</span>
            Advance Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</label>
              <div className="mt-1">
                <Badge className={`${getStatusColor(advance.status)}`}>
                  {advance.status}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Advance Amount</label>
              <p className="text-lg font-semibold text-green-600">
                ₹{advance.advance_amount?.toLocaleString() || '0'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Advance Date</label>
              <p className="text-lg font-semibold flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(advance.advance_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Payment Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Amount Paid</label>
              <p className="text-lg font-semibold text-blue-600">
                ₹{advance.total_repayment_amount?.toLocaleString() || '0'}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Remaining Balance</label>
              <p className="text-lg font-semibold text-red-600">
                ₹{(advance.remaining_balance ?? advance.advance_amount)?.toLocaleString() || '0'}
              </p>
            </div>
          </div>
        </div>

        {/* Request Reason */}
        {advance.request_reason && (
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Request Reason
            </h3>
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {advance.request_reason}
            </p>
          </div>
        )}

        {/* Rejection/Cancellation Reason - Show if status is REJECTED or CANCELLED */}
        {(advance.status === "REJECTED" || advance.status === "CANCELLED") && (
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <X className="h-4 w-4" />
              {advance.status === "REJECTED" ? "Rejection Information" : "Cancellation Information"}
            </h3>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {advance.status === "REJECTED" ? "Rejection Reason" : "Cancellation Reason"}
              </label>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap mt-1">
                {advance.reason || "No reason provided"}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {(onChangeStatus || onUpdateAmount) && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t">
            {onChangeStatus && (
              <Button
                variant="outline"
                onClick={() => onChangeStatus(advance.advance_id)}
                className="flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                Change Status
              </Button>
            )}
            {onUpdateAmount && (
              <Button
                variant="default"
                onClick={() => onUpdateAmount(advance.advance_id)}
                className="flex items-center gap-2"
              >
                <span className="text-sm font-bold">₹</span>
                Update Amount Paid
              </Button>
            )}
          </div>
        )}
      </div>
    </FormDialog>
  );
};
