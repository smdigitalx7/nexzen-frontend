import { FormDialog } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, DollarSign, FileText, Clock } from "lucide-react";

interface AdvanceViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  advance: any;
  employee: any;
}

export const AdvanceViewDialog = ({ open, onOpenChange, advance, employee }: AdvanceViewDialogProps) => {
  if (!advance) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
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
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Employee ID</label>
              <p className="text-lg font-semibold">{advance.employee_id}</p>
            </div>
          </div>
        </div>

        {/* Advance Information */}
        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Advance Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Advance ID</label>
              <p className="text-lg font-semibold">{advance.advance_id}</p>
            </div>
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
      </div>
    </FormDialog>
  );
};
