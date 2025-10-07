import { useMemo } from "react";
import { Edit, Trash2, Eye, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { DataTableWithFilters, ConfirmDialog } from "@/components/shared";
import type { ColumnDef } from "@tanstack/react-table";
import {
  createTextColumn,
  createDateColumn,
  createBadgeColumn,
  createActionColumn,
  createViewAction,
  createEditAction,
  createDeleteAction
} from "@/lib/utils/columnFactories.tsx";

interface EmployeeAttendanceRead {
  attendance_id: number;
  employee_id: number;
  date: string;
  status: string;
  check_in_time?: string;
  check_out_time?: string;
  notes?: string;
  employee_name?: string;
}

interface AttendanceTableProps {
  attendance: EmployeeAttendanceRead[];
  isLoading: boolean;
  onAddAttendance: () => void;
  onEditAttendance: (attendance: EmployeeAttendanceRead) => void;
  onDeleteAttendance: (id: number) => void;
  onViewAttendance: (attendance: EmployeeAttendanceRead) => void;
}

export const AttendanceTable = ({
  attendance,
  isLoading,
  onAddAttendance,
  onEditAttendance,
  onDeleteAttendance,
  onViewAttendance,
}: AttendanceTableProps) => {
  // Helper function for styling moved into static mapping if needed; using outline badge here

  // Define columns for the data table using column factories
  const columns: ColumnDef<EmployeeAttendanceRead>[] = useMemo(() => [
    createTextColumn<EmployeeAttendanceRead>("employee_name", { header: "Employee", className: "font-medium", fallback: (undefined as unknown) as any }),
    createDateColumn<EmployeeAttendanceRead>("date", { header: "Date" }),
    createBadgeColumn<EmployeeAttendanceRead>("status", { header: "Status", variant: "outline" }),
    createTextColumn<EmployeeAttendanceRead>("check_in_time", { header: "Check In", fallback: "-" }),
    createTextColumn<EmployeeAttendanceRead>("check_out_time", { header: "Check Out", fallback: "-" }),
    createTextColumn<EmployeeAttendanceRead>("notes", { header: "Notes", className: "max-w-xs truncate", fallback: "-" }),
    createActionColumn<EmployeeAttendanceRead>([
      createViewAction((row) => onViewAttendance(row)),
      createEditAction((row) => onEditAttendance(row)),
      createDeleteAction((row) => onDeleteAttendance(row.attendance_id))
    ])
  ], [onViewAttendance, onEditAttendance, onDeleteAttendance]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DataTableWithFilters
      data={attendance}
      columns={columns}
      title="Employee Attendance"
      description="Manage employee attendance records"
      searchKey="employee_name"
      exportable={true}
      onAdd={onAddAttendance}
    />
  );
};