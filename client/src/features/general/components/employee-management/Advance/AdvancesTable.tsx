import { useMemo, memo } from "react";
import { DataTable } from "@/common/components/shared/DataTable";
import { Eye, Edit, Coins } from "lucide-react";
import { useCanViewUIComponent, useCanCreate } from "@/core/permissions";
import type { ColumnDef } from "@tanstack/react-table";
import {
  createTextColumn,
  createDateColumn
} from "@/common/utils/factory/columnFactories";

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
  onViewAdvance: (advance: EmployeeAdvanceRead) => void;
  onApproveAdvance?: (advance: EmployeeAdvanceRead) => void;
  onRejectAdvance?: (advance: EmployeeAdvanceRead) => void;
  onUpdateAmount?: (advance: EmployeeAdvanceRead) => void;
  showSearch?: boolean;
  currentPage?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  pageSize?: number;
  onPageSizeChange?: (pageSize: number) => void;
}

const AdvancesTableComponent = ({
  advances,
  isLoading,
  onAddAdvance,
  onEditAdvance,
  onViewAdvance,
  onApproveAdvance,
  onRejectAdvance,
  onUpdateAmount,
  showSearch = true,
  currentPage,
  totalCount,
  onPageChange,
  pageSize,
  onPageSizeChange,
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
            case "REQUESTED":
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
  const canCreateAdvance = useCanCreate("employee_advances");

  // ✅ MIGRATED: Use DataTable V2 actions format
  const actions = useMemo(() => {
    const baseActions: any[] = [
      {
        id: "view",
        label: "View",
        icon: Eye,
        onClick: (row: EmployeeAdvanceRead) => onViewAdvance(row)
      },
      {
        id: "edit",
        label: "Edit",
        icon: Edit,
        onClick: (row: EmployeeAdvanceRead) => onEditAdvance(row),
        show: (row: EmployeeAdvanceRead) => canEditAdvance && row.status?.toUpperCase() !== "REPAID"
      }
    ];

    if (onUpdateAmount) {
      baseActions.push({
        id: "update-amount-paid",
        label: "Update Amount Paid",
        icon: Coins,
        variant: "default" as const,
        onClick: (row: EmployeeAdvanceRead) => onUpdateAmount(row),
        show: (row: EmployeeAdvanceRead) => {
          // Show for ACTIVE or APPROVED status, but not REPAID
          const status = row.status?.toUpperCase();
          return (status === "ACTIVE" || status === "APPROVED") &&
                 (row.remaining_balance ?? row.advance_amount) > 0;
        },
      });
    }

    return baseActions;
  }, [onViewAdvance, onEditAdvance, onUpdateAmount, canEditAdvance]);

  return (
    <DataTable
      data={advances}
      columns={columns as any}
      title="Employee Advances"
      loading={isLoading}
      searchKey="employee_name"
      showSearch={showSearch}
      export={{ enabled: true, filename: "advances" }}
      onAdd={canCreateAdvance ? onAddAdvance : undefined}
      addButtonText="Add Advance"
      actions={actions}
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

export const AdvancesTable = memo(AdvancesTableComponent);
