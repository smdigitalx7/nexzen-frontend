import { useMemo } from "react";
import { Plus } from "lucide-react";
import { EnhancedDataTable } from "@/components/shared/EnhancedDataTable";
import { Button } from "@/components/ui/button";
import { useCanViewUIComponent } from "@/lib/permissions";
import type { ColumnDef } from "@tanstack/react-table";
import {
  createTextColumn
} from "@/lib/utils/factory/columnFactories";

interface EmployeeAttendanceRead {
  attendance_id: number;
  employee_id: number;
  employee_name?: string;
  attendance_month: number; // 1-12
  attendance_year: number; // 1900-2100
  total_working_days: number;
  days_present: number;
  paid_leaves: number;
  unpaid_leaves: number;
}

interface AttendanceTableProps {
  attendance: EmployeeAttendanceRead[];
  isLoading: boolean;
  onAddAttendance: () => void;
  onBulkCreateAttendance?: () => void;
  onEditAttendance: (attendance: EmployeeAttendanceRead) => void;
  onDeleteAttendance: (id: number) => void;
  onViewAttendance: (attendance: EmployeeAttendanceRead) => void;
  showSearch?: boolean;
}

export const AttendanceTable = ({
  attendance,
  isLoading,
  onAddAttendance,
  onBulkCreateAttendance,
  onEditAttendance,
  onDeleteAttendance,
  onViewAttendance,
  showSearch = true,
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
    createTextColumn<EmployeeAttendanceRead>("paid_leaves", { header: "Paid Leaves", fallback: "-" }),
    createTextColumn<EmployeeAttendanceRead>("unpaid_leaves", { header: "Unpaid Leaves", fallback: "-" }),
  ], []);

  // Check permissions
  const canEditAttendance = useCanViewUIComponent("employee_attendance", "button", "attendance-edit");
  const canDeleteAttendance = useCanViewUIComponent("employee_attendance", "button", "attendance-delete");

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(() => [
    {
      type: 'view' as const,
      onClick: (row: EmployeeAttendanceRead) => onViewAttendance(row)
    },
    {
      type: 'edit' as const,
      onClick: (row: EmployeeAttendanceRead) => onEditAttendance(row),
      show: () => canEditAttendance
    },
    {
      type: 'delete' as const,
      onClick: (row: EmployeeAttendanceRead) => onDeleteAttendance(row.attendance_id),
      show: () => canDeleteAttendance
    }
  ], [onViewAttendance, onEditAttendance, onDeleteAttendance, canEditAttendance, canDeleteAttendance]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <EnhancedDataTable
      data={attendance}
      columns={columns as any}
      title="Employee Attendance"
      searchKey="employee_name"
      showSearch={showSearch}
      exportable={true}
      onAdd={onBulkCreateAttendance}
      addButtonText="Bulk Create"
      addButtonVariant="default"
      showActions={true}
      actionButtonGroups={actionButtonGroups}
      actionColumnHeader="Actions"
      showActionLabels={false}
      customAddButton={
        onBulkCreateAttendance ? (
          <div className="flex items-center gap-2">
            <Button
              onClick={onAddAttendance}
              variant="outline"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Attendance
            </Button>
            <Button
              onClick={onBulkCreateAttendance}
              variant="default"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Bulk Create
            </Button>
          </div>
        ) : undefined
      }
    />
  );
};