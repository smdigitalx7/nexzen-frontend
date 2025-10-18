import { useMemo } from "react";
import { DataTableWithFilters } from "@/components/shared";
import type { ColumnDef } from "@tanstack/react-table";
import {
  createTextColumn,
  createActionColumn,
  createViewAction,
  createEditAction,
  createDeleteAction
} from "@/lib/utils/columnFactories.tsx";

interface EmployeeAttendanceRead {
  attendance_id: number;
  employee_id: number;
  employee_name?: string;
  attendance_month: number; // 1-12
  attendance_year: number; // 1900-2100
  total_working_days: number;
  days_present: number;
  days_absent: number;
  paid_leaves: number;
  unpaid_leaves: number;
  late_arrivals: number;
  early_departures: number;
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
  // Define columns for the data table using column factories
  const columns: ColumnDef<EmployeeAttendanceRead>[] = useMemo(() => [
    createTextColumn<EmployeeAttendanceRead>("employee_name", { header: "Employee", className: "font-medium", fallback: "N/A" }),
    { 
      accessorKey: "attendance_month", 
      header: "Month", 
      cell: ({ row }) => {
        const month = row.original.attendance_month;
        const year = row.original.attendance_year;
        if (month && year && typeof month === 'number' && typeof year === 'number' && month >= 1 && month <= 12) {
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          return <span>{monthNames[month - 1]} {year}</span>;
        }
        return <span>-</span>;
      }
    },
    createTextColumn<EmployeeAttendanceRead>("total_working_days", { header: "Working Days", fallback: "-" }),
    createTextColumn<EmployeeAttendanceRead>("days_present", { header: "Present", fallback: "-" }),
    createTextColumn<EmployeeAttendanceRead>("days_absent", { header: "Absent", fallback: "-" }),
    createTextColumn<EmployeeAttendanceRead>("late_arrivals", { header: "Late", fallback: "-" }),
    createTextColumn<EmployeeAttendanceRead>("early_departures", { header: "Early", fallback: "-" }),
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
      columns={columns as any}
      title="Employee Attendance"
      description="Manage employee attendance records"
      searchKey={false as any}
      showSearch={false}
      exportable={true}
      onAdd={onAddAttendance}
    />
  );
};