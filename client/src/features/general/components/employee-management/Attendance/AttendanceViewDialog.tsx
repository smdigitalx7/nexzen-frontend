import { FormDialog } from "@/common/components/shared";
import { Badge } from "@/common/components/ui/badge";
import { Calendar, User, Clock, CheckCircle, CalendarDays } from "lucide-react";

interface AttendanceViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attendance: any;
  employee: any;
}

export const AttendanceViewDialog = ({ open, onOpenChange, attendance, employee }: AttendanceViewDialogProps) => {
  // Don't render content if attendance is not provided, but keep dialog structure for React reconciliation
  if (!attendance) {
    return (
      <FormDialog
        open={open}
        onOpenChange={onOpenChange}
        title=""
        description=""
        size="LARGE"
        showFooter={false}
      >
        <div />
      </FormDialog>
    );
  }

  const calculateAttendancePercentage = () => {
    if (!attendance.total_working_days || attendance.total_working_days === 0) return 0;
    return Math.round((attendance.days_present / attendance.total_working_days) * 100);
  };

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Attendance Record Details"
      description="View employee attendance information and statistics"
      size="LARGE"
      showFooter={false}
    >
      <div className="space-y-3">
        {/* Employee Information */}
        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <User className="h-4 w-4" />
            Employee Information
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Employee Name</label>
              <p className="text-lg font-semibold">{attendance.employee_name || employee?.employee_name || `Employee ${attendance.employee_id}`}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Employee Code</label>
              <p className="text-lg font-semibold">{employee?.employee_code || `EMP-${attendance.employee_id}`}</p>
            </div>
          </div>
        </div>

        {/* Attendance Period */}
        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <CalendarDays className="h-4 w-4" />
            Attendance Period
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Month</label>
              <p className="text-lg font-semibold flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {(() => {
                  let month: number | null = null;
                  
                  if (typeof attendance.attendance_month === 'number') {
                    month = attendance.attendance_month;
                  } else if (typeof attendance.attendance_month === 'string') {
                    // Try to parse string format (YYYY-MM-DD or just month number as string)
                    const dateMatch = attendance.attendance_month.match(/^(\d{4})-(\d{2})/);
                    if (dateMatch) {
                      month = parseInt(dateMatch[2], 10);
                    } else {
                      // Try parsing as a simple number string
                      const parsed = parseInt(attendance.attendance_month, 10);
                      if (!isNaN(parsed)) {
                        month = parsed;
                      }
                    }
                  }
                  
                  if (month && month >= 1 && month <= 12) {
                    const monthNames = ["January", "February", "March", "April", "May", "June", 
                                      "July", "August", "September", "October", "November", "December"];
                    return monthNames[month - 1];
                  }
                  return 'N/A';
                })()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Year</label>
              <p className="text-lg font-semibold">
                {(() => {
                  let year: number | null = null;
                  
                  if (typeof attendance.attendance_year === 'number') {
                    year = attendance.attendance_year;
                  } else if (typeof attendance.attendance_year === 'string') {
                    const parsed = parseInt(attendance.attendance_year, 10);
                    if (!isNaN(parsed) && parsed > 0) {
                      year = parsed;
                    }
                  } else if (typeof attendance.attendance_month === 'string') {
                    // If attendance_year is missing but attendance_month is a date string, extract year from it
                    const dateMatch = attendance.attendance_month.match(/^(\d{4})-(\d{2})/);
                    if (dateMatch) {
                      year = parseInt(dateMatch[1], 10);
                    }
                  }
                  
                  return (year && year > 0) ? year : 'N/A';
                })()}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Working Days</label>
              <p className="text-lg font-semibold text-blue-600">
                {attendance.total_working_days || 0} days
              </p>
            </div>
          </div>
        </div>

        {/* Attendance Statistics */}
        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Attendance Statistics
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Days Present</label>
              <p className="text-lg font-semibold text-green-600">
                {attendance.days_present || 0} days
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Paid Leaves</label>
              <p className="text-lg font-semibold text-blue-600">
                {attendance.paid_leaves || 0} days
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Unpaid Leaves</label>
              <p className="text-lg font-semibold text-orange-600">
                {attendance.unpaid_leaves || 0} days
              </p>
            </div>
          </div>
        </div>

        {/* Attendance Percentage */}
        <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
          <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Attendance Performance
          </h3>
          <div className="space-y-2">
            <div>
              <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Attendance Percentage</label>
              <div className="flex items-center gap-3 mt-1">
                <div className="flex-1 bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${calculateAttendancePercentage()}%` }}
                  ></div>
                </div>
                <span className={`text-2xl font-bold ${getPercentageColor(calculateAttendancePercentage())}`}>
                  {calculateAttendancePercentage()}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Record Information */}
        {(attendance.created_at || attendance.updated_at) && (
          <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg">
            <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Record Information
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {attendance.created_at && (
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Created At</label>
                  <p className="text-lg font-semibold flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(attendance.created_at).toLocaleDateString()}
                  </p>
                </div>
              )}
              {attendance.updated_at && (
                <div>
                  <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Last Updated</label>
                  <p className="text-lg font-semibold flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {new Date(attendance.updated_at).toLocaleDateString()}
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
