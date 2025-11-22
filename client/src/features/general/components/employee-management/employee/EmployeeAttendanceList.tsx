import React from "react";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Edit, Trash2 } from "lucide-react";

interface EmployeeAttendanceListProps {
  attendance: any[];
  employees: any[];
  onEdit: (record: any) => void;
  onDelete: (record: any) => void;
  page: number;
  pageSize: number;
  total: number;
  setPage: (updater: (p: number) => number) => void;
}

const EmployeeAttendanceList = ({ attendance, employees, onEdit, onDelete, page, pageSize, total, setPage }: EmployeeAttendanceListProps) => {
  return (
    <div className="space-y-4">
      {attendance.map((record) => {
        const employee = employees.find((e: any) => e.employee_id === record.employee_id);
        const attendanceRate = (record.days_present / record.total_working_days) * 100;

        return (
          <div key={record.attendance_id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{employee?.employee_name || `Employee ${record.employee_id}`}</h3>
                <p className="text-sm text-muted-foreground">
                  {new Date(record.attendance_month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={attendanceRate >= 90 ? "default" : attendanceRate >= 75 ? "secondary" : "destructive"}>
                  {attendanceRate.toFixed(1)}% Attendance
                </Badge>
                <Button variant="ghost" size="sm" onClick={() => onEdit(record)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete(record)} className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Working Days:</span>
                <span className="ml-2 font-medium">{record.total_working_days}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Present:</span>
                <span className="ml-2 font-medium text-green-600">{record.days_present}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Absent:</span>
                <span className="ml-2 font-medium text-red-600">{record.days_absent}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Paid Leaves:</span>
                <span className="ml-2 font-medium text-blue-600">{record.paid_leaves}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Unpaid Leaves:</span>
                <span className="ml-2 font-medium">{record.unpaid_leaves}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Late Arrivals:</span>
                <span className="ml-2 font-medium text-orange-600">{record.late_arrivals}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Early Departures:</span>
                <span className="ml-2 font-medium text-yellow-600">{record.early_departures}</span>
              </div>
            </div>
          </div>
        );
      })}

      <div className="flex items-center justify-between pt-2">
        <div className="text-xs text-muted-foreground">
          Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} of {total}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
          <Button variant="outline" size="sm" disabled={page * pageSize >= total} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      </div>
    </div>
  );
};

export default React.memo(EmployeeAttendanceList);


