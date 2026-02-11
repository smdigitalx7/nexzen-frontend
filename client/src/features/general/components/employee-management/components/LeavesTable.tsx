import { useMemo } from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import { DataTable } from "@/common/components/shared/DataTable";
import { useCanViewUIComponent, useCanEdit, useCanCreate } from "@/core/permissions";
import type { ColumnDef } from "@tanstack/react-table";
import {
  createTextColumn,
  createDateColumn
} from "@/common/utils/factory/columnFactories";
import { EmployeeLeaveRead } from "@/features/general/types/employee-leave";

interface LeavesTableProps {
  leaves: EmployeeLeaveRead[];
  isLoading: boolean;
  onAddLeave: () => void;
  onEditLeave: (leave: EmployeeLeaveRead) => void;
  onDeleteLeave: (id: number) => void;
  onViewLeave: (leave: EmployeeLeaveRead) => void;
  onApproveLeave?: (leave: EmployeeLeaveRead) => void;
  onRejectLeave?: (leave: EmployeeLeaveRead) => void;
  showSearch?: boolean;
  toolbarMiddleContent?: React.ReactNode;
  headerContent?: React.ReactNode;
  currentPage?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
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
  showSearch = true,
  toolbarMiddleContent,
  headerContent,
  currentPage,
  totalCount,
  onPageChange,
  pageSize,
  onPageSizeChange,
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
  ], []);

  // Check permissions
  const canEditLeave = useCanEdit("employee_leaves");
  const canDeleteLeave = useCanViewUIComponent("employee_leaves", "button", "leave-delete");
  const canCreateLeave = useCanCreate("employee_leaves");

  // ✅ MIGRATED: Use DataTable V2 actions format
  const actions = useMemo(() => [
    {
      id: "view",
      label: "View",
      icon: Eye,
      onClick: (row: EmployeeLeaveRead) => onViewLeave(row)
    },
    {
      id: "edit",
      label: "Edit",
      icon: Edit,
      onClick: (row: EmployeeLeaveRead) => onEditLeave(row),
      show: () => canEditLeave
    },
    {
      id: "delete",
      label: "Delete",
      icon: Trash2,
      variant: "destructive" as const,
      onClick: (row: EmployeeLeaveRead) => onDeleteLeave(row.leave_id),
      show: () => canDeleteLeave
    }
  ], [onViewLeave, onEditLeave, onDeleteLeave, canEditLeave, canDeleteLeave]);

  return (
    <DataTable
      data={leaves}
      columns={columns as any}
      title="Employee Leaves"
      loading={isLoading}
      searchKey="employee_name"
      showSearch={showSearch}
      export={{ enabled: true, filename: "leaves" }}
      onAdd={canCreateLeave ? onAddLeave : undefined}
      addButtonText="Add Leave"
      actions={actions}
      toolbarMiddleContent={toolbarMiddleContent}
      headerContent={headerContent}
      pagination="server"
      currentPage={currentPage}
      totalCount={totalCount}
      onPageChange={onPageChange}
      pageSize={pageSize}
      onPageSizeChange={onPageSizeChange}
      pageSizeOptions={[10, 25, 50, 100]}
    />
  );
};
