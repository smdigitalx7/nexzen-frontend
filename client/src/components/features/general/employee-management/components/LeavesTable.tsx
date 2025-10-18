import { useMemo } from "react";
import { DataTableWithFilters } from "@/components/shared";
import type { ColumnDef } from "@tanstack/react-table";
import {
  createTextColumn,
  createDateColumn,
  createActionColumn,
  createViewAction,
  createEditAction,
  createDeleteAction
} from "@/lib/utils/columnFactories.tsx";
import { EmployeeLeaveRead } from "@/lib/types/general/employee-leave";

interface LeavesTableProps {
  leaves: EmployeeLeaveRead[];
  isLoading: boolean;
  onAddLeave: () => void;
  onEditLeave: (leave: EmployeeLeaveRead) => void;
  onDeleteLeave: (id: number) => void;
  onViewLeave: (leave: EmployeeLeaveRead) => void;
  onApproveLeave?: (leave: EmployeeLeaveRead) => void;
  onRejectLeave?: (leave: EmployeeLeaveRead) => void;
}

export const LeavesTable = ({
  leaves,
  isLoading,
  onAddLeave,
  onEditLeave,
  onDeleteLeave,
  onViewLeave,
  onApproveLeave,
  onRejectLeave,
}: LeavesTableProps) => {

  // Define columns for the data table using column factories
  const columns: ColumnDef<EmployeeLeaveRead>[] = useMemo(() => [
    createTextColumn<EmployeeLeaveRead>("employee_name", { header: "Employee", className: "font-medium" }),
    createTextColumn<EmployeeLeaveRead>("leave_type", { header: "Leave Type", className: "capitalize" }),
    createDateColumn<EmployeeLeaveRead>("from_date", { header: "From Date" }),
    createDateColumn<EmployeeLeaveRead>("to_date", { header: "To Date" }),
    createTextColumn<EmployeeLeaveRead>("total_days", { header: "Days", className: "font-medium" }),
    { 
      accessorKey: "leave_status", 
      header: "Status", 
      cell: ({ row }) => {
        const status = row.original.leave_status;
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
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
            {status}
          </span>
        );
      }
    },
    createDateColumn<EmployeeLeaveRead>("applied_date", { header: "Applied Date" }),
    createActionColumn<EmployeeLeaveRead>([
      createViewAction((row) => onViewLeave(row)),
      createEditAction((row) => onEditLeave(row)),
      createDeleteAction((row) => onDeleteLeave(row.leave_id))
    ])
  ], [onViewLeave, onEditLeave, onDeleteLeave]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DataTableWithFilters
      data={leaves}
      columns={columns as any}
      title="Employee Leaves"
      description="Manage employee leave requests and approvals"
      searchKey={false as any}
      showSearch={false}
      exportable={true}
      onAdd={onAddLeave}
    />
  );
};
