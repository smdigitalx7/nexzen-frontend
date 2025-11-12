import { useMemo, memo } from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import { EnhancedDataTable } from "@/components/shared/EnhancedDataTable";
import { useCanViewUIComponent, useCanCreate } from "@/lib/permissions";
import type { ColumnDef } from "@tanstack/react-table";
import {
  createTextColumn,
  createDateColumn
} from "@/lib/utils/factory/columnFactories";

interface EmployeeAdvanceRead {
  advance_id: number;
  employee_id: number;
  employee_name?: string;
  advance_amount: number;
  advance_date: string;
  request_reason?: string;
  status: string;
  total_repayment_amount?: number;
  remaining_balance?: number;
}

interface AdvancesTableProps {
  advances: EmployeeAdvanceRead[];
  isLoading: boolean;
  onAddAdvance: () => void;
  onEditAdvance: (advance: EmployeeAdvanceRead) => void;
  onDeleteAdvance: (id: number) => void;
  onViewAdvance: (advance: EmployeeAdvanceRead) => void;
  onApproveAdvance?: (advance: EmployeeAdvanceRead) => void;
  onRejectAdvance?: (advance: EmployeeAdvanceRead) => void;
  onUpdateAmount?: (advance: EmployeeAdvanceRead) => void;
  showSearch?: boolean;
}

const AdvancesTableComponent = ({
  advances,
  isLoading,
  onAddAdvance,
  onEditAdvance,
  onDeleteAdvance,
  onViewAdvance,
  onApproveAdvance,
  onRejectAdvance,
  onUpdateAmount,
  showSearch = true,
}: AdvancesTableProps) => {

  // Define columns for the data table using column factories
  const columns: ColumnDef<EmployeeAdvanceRead>[] = useMemo(() => [
    createTextColumn<EmployeeAdvanceRead>("employee_name", { header: "Employee", className: "font-medium", fallback: "N/A" }),
    { 
      accessorKey: "advance_amount", 
      header: "Amount", 
      cell: ({ row }) => (
        <span className="font-medium">
          ₹{row.original.advance_amount?.toLocaleString() || '0'}
        </span>
      )
    },
    createDateColumn<EmployeeAdvanceRead>("advance_date", { header: "Date" }),
    { 
      accessorKey: "request_reason", 
      header: "Reason", 
      cell: ({ row }) => (
        <span className="max-w-[200px] truncate" title={row.original.request_reason}>
          {row.original.request_reason || '-'}
        </span>
      )
    },
    { 
      accessorKey: "status", 
      header: "Status", 
      cell: ({ row }) => {
        const status = row.original.status;
        const getStatusColor = (status: string) => {
          switch (status) {
            case "PENDING":
              return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "ACTIVE":
              return "bg-blue-100 text-blue-800 border-blue-200";
            case "APPROVED":
              return "bg-green-100 text-green-800 border-green-200";
            case "REJECTED":
              return "bg-red-100 text-red-800 border-red-200";
            case "REPAID":
              return "bg-emerald-100 text-emerald-800 border-emerald-200";
            case "CANCELLED":
              return "bg-gray-100 text-gray-800 border-gray-200";
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
    { 
      accessorKey: "total_repayment_amount", 
      header: "Paid", 
      cell: ({ row }) => (
        <span className="font-medium">
          ₹{row.original.total_repayment_amount?.toLocaleString() || '0'}
        </span>
      )
    },
    { 
      accessorKey: "remaining_balance", 
      header: "Balance", 
      cell: ({ row }) => {
        const balance = row.original.remaining_balance ?? row.original.advance_amount;
        return (
          <span className="font-medium">
            ₹{balance?.toLocaleString() || '0'}
          </span>
        );
      }
    },
  ], []);

  // Check permissions
  const canEditAdvance = useCanViewUIComponent("employee_advances", "button", "advance-edit");
  const canDeleteAdvance = useCanViewUIComponent("employee_advances", "button", "advance-delete");
  const canCreateAdvance = useCanCreate("employee_advances");

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(() => [
    {
      type: 'view' as const,
      onClick: (row: EmployeeAdvanceRead) => onViewAdvance(row)
    },
    {
      type: 'edit' as const,
      onClick: (row: EmployeeAdvanceRead) => onEditAdvance(row),
      show: () => canEditAdvance
    },
    {
      type: 'delete' as const,
      onClick: (row: EmployeeAdvanceRead) => onDeleteAdvance(row.advance_id),
      show: () => canDeleteAdvance
    }
  ], [onViewAdvance, onEditAdvance, onDeleteAdvance, canEditAdvance, canDeleteAdvance]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <EnhancedDataTable
      data={advances}
      columns={columns as any}
      title="Employee Advances"
      searchKey="employee_name"
      showSearch={showSearch}
      exportable={true}
      onAdd={canCreateAdvance ? onAddAdvance : undefined}
      addButtonText="Add Advance"
      showActions={true}
      actionButtonGroups={actionButtonGroups}
      actionColumnHeader="Actions"
      showActionLabels={false}
    />
  );
};

export const AdvancesTable = memo(AdvancesTableComponent);
