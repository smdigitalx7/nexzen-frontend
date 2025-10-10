import { useMemo } from "react";
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
  // Helper function for styling moved into static mapping if needed; using outline badge here

  // Define columns for the data table using column factories
  const columns: ColumnDef<EmployeeAttendanceRead>[] = useMemo(() => [
    createTextColumn<EmployeeAttendanceRead>("employee_name", { header: "Employee", className: "font-medium", fallback: "N/A" }),
    { 
      accessorKey: "attendance_month", 
      header: "Month", 
      cell: ({ row }) => {
        const month = row.original.attendance_month;
        const year = row.original.attendance_year;
        if (month && year && typeof month === 'number' && typeof year === 'number') {
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          return <span>{monthNames[month - 1]} {year}</span>;
        }
        return <span>-</span>;
      }
    },
    { accessorKey: "total_working_days", header: "Working Days", cell: ({ row }) => <span>{row.original.total_working_days ?? '-'}</span> },
    { accessorKey: "days_present", header: "Present", cell: ({ row }) => <span>{row.original.days_present ?? '-'}</span> },
    { accessorKey: "days_absent", header: "Absent", cell: ({ row }) => <span>{row.original.days_absent ?? '-'}</span> },
    { accessorKey: "late_arrivals", header: "Late", cell: ({ row }) => <span>{row.original.late_arrivals ?? '-'}</span> },
    { accessorKey: "early_departures", header: "Early", cell: ({ row }) => <span>{row.original.early_departures ?? '-'}</span> },
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