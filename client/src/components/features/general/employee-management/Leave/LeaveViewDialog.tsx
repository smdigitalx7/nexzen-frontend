import { FormDialog } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, FileText, Clock, CalendarDays } from "lucide-react";

interface LeaveViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leave: any;
  employee: any;
}

export const LeaveViewDialog = ({ open, onOpenChange, leave, employee }: LeaveViewDialogProps) => {
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
      case "SICK":
        return "bg-red-100 text-red-800 border-red-200";
      case "CASUAL":
        return "bg-green-100 text-green-800 border-green-200";
      case "ANNUAL":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "EMERGENCY":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "MATERNITY":
        return "bg-pink-100 text-pink-800 border-pink-200";
      case "PATERNITY":
        return "bg-cyan-100 text-cyan-800 border-cyan-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Leave Request Details"
      description="View leave request information and status"
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
              <p className="text-lg font-semibold">{employee?.employee_name || `Employee ${leave.employee_id}`}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Employee Code</label>
              <p className="text-lg font-semibold">{employee?.employee_code || `EMP-${leave.employee_id}`}</p>
            </div>
          </div>
        </div>

        {/* Leave Information */}
        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Leave Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Leave ID</label>
              <p className="text-lg font-semibold">{leave.leave_id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Status</label>
              <div className="mt-1">
                <Badge className={`${getStatusColor(leave.leave_status)}`}>
                  {leave.leave_status}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Leave Type</label>
              <div className="mt-1">
                <Badge className={`${getLeaveTypeColor(leave.leave_type)}`}>
                  {leave.leave_type}
                </Badge>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Days</label>
              <p className="text-lg font-semibold text-blue-600">
                {leave.total_days} {leave.total_days === 1 ? 'day' : 'days'}
              </p>
            </div>
          </div>
        </div>

        {/* Date Information */}
        <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
          <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Date Information
          </h3>
          <div className="grid grid-cols-2 gap-4">
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
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
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
          <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              Approval Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Approved By</label>
                <p className="text-lg font-semibold">{leave.approved_by}</p>
              </div>
              {leave.approved_at && (
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Approved At</label>
                  <p className="text-lg font-semibold flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(leave.approved_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </FormDialog>
  );
};
