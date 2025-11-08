import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar, User, FileText, Clock, CalendarDays, Check, X } from "lucide-react";
import { DIALOG_SIZES } from "@/lib/constants";
import { cn } from "@/lib/utils";

interface LeaveViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leave: any;
  employee: any;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
}

export const LeaveViewDialog = ({ open, onOpenChange, leave, employee, onApprove, onReject }: LeaveViewDialogProps) => {
  if (!leave) return null;

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

  const getLeaveTypeColor = (leaveType: string) => {
    switch (leaveType) {
      case "PAID":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "UNPAID":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={cn(DIALOG_SIZES.LARGE, "max-h-[90vh] flex flex-col p-0")}
        onOpenAutoFocus={(e) => {
          e.preventDefault();
        }}
      >
        <DialogHeader className="px-6 pt-4 pb-2 flex-shrink-0 border-b border-gray-200 pr-12">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <DialogTitle>Leave Request Details</DialogTitle>
              <DialogDescription className="mt-0.5">
                View leave request information and status
              </DialogDescription>
            </div>
            {/* Action Buttons - Show only for pending leaves - Beside heading */}
            {(leave.leave_status === "PENDING" || leave.status === "PENDING") && (onApprove || onReject) && (
              <div className="flex items-center gap-3 ml-4 mr-2">
                {onReject && (
                  <Button
                    variant="destructive"
                    onClick={() => onReject(leave.leave_id)}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Reject
                  </Button>
                )}
                {onApprove && (
                  <Button
                    variant="default"
                    onClick={() => onApprove(leave.leave_id)}
                    className="flex items-center gap-2"
                  >
                    <Check className="h-4 w-4" />
                    Approve
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogHeader>
        
        <div 
          className="flex-1 overflow-y-auto scrollbar-hide px-6 pt-2 pb-3" 
          role="main" 
          aria-label="Form content"
          tabIndex={-1}
        >
          <div className="space-y-1.5">
            {/* Employee Information */}
        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <User className="h-4 w-4" />
            Employee Information
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Employee Name</label>
              <p className="text-lg font-semibold">{leave.employee_name || employee?.employee_name || `Employee ${leave.employee_id}`}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Employee Code</label>
              <p className="text-lg font-semibold">{employee?.employee_code || `EMP-${leave.employee_id}`}</p>
            </div>
          </div>
        </div>

        {/* Leave Information */}
        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Leave Information
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</label>
              <div className="mt-0.5">
                <Badge className={`${getStatusColor(leave.leave_status || leave.status)}`}>
                  {leave.leave_status || leave.status}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Leave Type</label>
              <div className="mt-0.5">
                <Badge className={`${getLeaveTypeColor(leave.leave_type)}`}>
                  {leave.leave_type}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Days</label>
              <p className="text-lg font-semibold text-blue-600">
                {leave.total_days || leave.days} {(leave.total_days || leave.days) === 1 ? 'day' : 'days'}
              </p>
            </div>
          </div>
        </div>

        {/* Date Information */}
        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date Information
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">From Date</label>
              <p className="text-lg font-semibold flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(leave.from_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">To Date</label>
              <p className="text-lg font-semibold flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(leave.to_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Applied Date</label>
              <p className="text-lg font-semibold flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {new Date(leave.applied_date).toLocaleDateString()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Duration</label>
              <p className="text-lg font-semibold text-green-600">
                {Math.ceil((new Date(leave.to_date).getTime() - new Date(leave.from_date).getTime()) / (1000 * 60 * 60 * 24)) + 1} days
              </p>
            </div>
          </div>
        </div>

        {/* Reason */}
        {leave.reason && (
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Leave Reason
            </h3>
            <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
              {leave.reason}
            </p>
          </div>
        )}

        {/* Additional Information */}
        {leave.approved_by && (
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              Approval Information
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Approved By</label>
                <p className="text-lg font-semibold">{leave.approved_by}</p>
              </div>
              {leave.approved_date && (
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Approved At</label>
                  <p className="text-lg font-semibold flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(leave.approved_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Rejection Information */}
        {leave.rejection_reason && (
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <X className="h-4 w-4" />
              Rejection Information
            </h3>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Rejection Reason</label>
              <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap mt-0.5">
                {leave.rejection_reason}
              </p>
            </div>
          </div>
        )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
