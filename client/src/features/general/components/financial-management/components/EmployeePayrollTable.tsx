import { useMemo, useState } from "react";
import { formatCurrency } from "@/common/utils";
import { DataTable } from "@/common/components/shared/DataTable";
import { Eye, Edit } from "lucide-react";
import type { PayrollRead } from "@/features/general/types/payrolls";
import { PayrollStatusEnum } from "@/features/general/types/payrolls";
import type { ColumnDef } from "@tanstack/react-table";
import {
  createCurrencyColumn,
  createBadgeColumn,
} from "@/common/utils/factory/columnFactories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { Badge } from "@/common/components/ui/badge";

// Extended interface that includes employee information
interface PayrollWithEmployee extends Omit<PayrollRead, "payroll_month"> {
  employee_name: string;
  employee_type?: string;
  payroll_month: number | string; // API can return number or date string
  payroll_year?: number;
}

interface EmployeePayrollTableProps {
  payrolls: PayrollWithEmployee[];
  isLoading: boolean;
  onEditPayroll: (payroll: PayrollWithEmployee) => void;
  onViewPayslip: (payroll: PayrollWithEmployee) => void;
  onUpdateStatus?: (id: number, status: string) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
  currentPage: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  pageSize: number;
  onPageSizeChange: (pageSize: number) => void;
}

export const EmployeePayrollTable = ({
  payrolls,
  isLoading,
  onEditPayroll,
  onViewPayslip,
  onUpdateStatus,
  getStatusColor: _getStatusColor,
  getStatusText: _getStatusText,
  currentPage,
  totalCount,
  onPageChange,
  pageSize,
  onPageSizeChange,
}: EmployeePayrollTableProps) => {
  const [updatingStatusId, setUpdatingStatusId] = useState<number | null>(null);

  // Helper function to get allowed status transitions
  const getAllowedStatuses = (currentStatus: string): PayrollStatusEnum[] => {
    switch (currentStatus) {
      case PayrollStatusEnum.PENDING:
        return [PayrollStatusEnum.HOLD, PayrollStatusEnum.PAID];
      case PayrollStatusEnum.HOLD:
        return [PayrollStatusEnum.PAID];
      case PayrollStatusEnum.PAID:
        return []; // Cannot change status once paid
      default:
        return [];
    }
  };

  const handleStatusChange = async (
    payrollId: number,
    newStatus: string,
    currentStatus: string
  ) => {
    // Validate status transition
    const allowedStatuses = getAllowedStatuses(currentStatus);
    if (!allowedStatuses.includes(newStatus as PayrollStatusEnum)) {
      return; // Invalid transition, don't update
    }

    if (onUpdateStatus) {
      setUpdatingStatusId(payrollId);
      try {
        await onUpdateStatus(payrollId, newStatus);
      } finally {
        setUpdatingStatusId(null);
      }
    }
  };
  // Define columns for the data table using column factories
  const columns: ColumnDef<PayrollWithEmployee>[] = useMemo(
    () => [
      {
        accessorKey: "employee_name",
        header: "Employee",
        cell: ({ row }) => {
          // ✅ FIX: Explicitly access employee_name and provide fallback
          const employeeName = row.original.employee_name;
          return (
            <span className="font-medium">
              {employeeName || `Employee #${row.original.employee_id}`}
            </span>
          );
        },
      },
      {
        accessorKey: "payroll_month",
        header: "Pay Period",
        cell: ({ row }) => {
          const month = row.original.payroll_month;
          let year = row.original.payroll_year;

          // Fix invalid years (1970) by using generated_at date
          if (!year || year === 1970 || year < 2000) {
            if (row.original.generated_at) {
              const generatedDate = new Date(row.original.generated_at);
              year = generatedDate.getFullYear();
            } else {
              year = new Date().getFullYear();
            }
          }

          if (
            month &&
            year &&
            typeof month === "number" &&
            typeof year === "number"
          ) {
            const monthNames = [
              "Jan",
              "Feb",
              "Mar",
              "Apr",
              "May",
              "Jun",
              "Jul",
              "Aug",
              "Sep",
              "Oct",
              "Nov",
              "Dec",
            ];
            return (
              <span>
                {monthNames[month - 1]} {year}
              </span>
            );
          }
          return <span>-</span>;
        },
      },
      createCurrencyColumn<PayrollWithEmployee>("gross_pay", {
        header: "Gross Pay",
      }),
      {
        id: "deductions",
        header: "Deductions",
        cell: ({ row }) => {
          const p = row.original;
          const total =
            (p.lop || 0) +
            (p.advance_deduction || 0) +
            (p.other_deductions || 0);
          return <span>{formatCurrency(total)}</span>;
        },
      },
      createCurrencyColumn<PayrollWithEmployee>("net_pay", {
        header: "Net Pay",
      }),
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const payroll = row.original;
          const currentStatus = payroll.status;
          const allowedStatuses = getAllowedStatuses(currentStatus);
          const isUpdating = updatingStatusId === payroll.payroll_id;
          const isPaid = currentStatus === PayrollStatusEnum.PAID;

          // If status update handler is provided and not paid, show dropdown
          if (onUpdateStatus && !isPaid && allowedStatuses.length > 0) {
            return (
              <Select
                value={currentStatus}
                onValueChange={(newStatus) =>
                  handleStatusChange(
                    payroll.payroll_id,
                    newStatus,
                    currentStatus
                  )
                }
                disabled={isUpdating}
              >
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue>
                    <Badge
                      // In this branch we already know status is NOT PAID.
                      variant={
                        currentStatus === PayrollStatusEnum.PENDING
                          ? "secondary"
                          : "destructive"
                      }
                      className="text-xs"
                    >
                      {_getStatusText(currentStatus)}
                    </Badge>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={currentStatus} disabled>
                    {_getStatusText(currentStatus)} (Current)
                  </SelectItem>
                  {allowedStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {_getStatusText(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            );
          }

          // Otherwise, show badge only
          return (
            <Badge
              variant={
                currentStatus === PayrollStatusEnum.PAID
                  ? "default"
                  : currentStatus === PayrollStatusEnum.PENDING
                    ? "secondary"
                    : "destructive"
              }
            >
              {_getStatusText(currentStatus)}
            </Badge>
          );
        },
      },
    ],
    [onUpdateStatus, updatingStatusId, _getStatusText]
  );

  // ✅ MIGRATED: Use DataTable V2 actions format
  const actions = useMemo(
    () => [
      {
        id: "view",
        label: "View Payslip",
        icon: Eye,
        onClick: (row: PayrollWithEmployee) => onViewPayslip(row),
      },
      {
        id: "edit",
        label: "Edit",
        icon: Edit,
        onClick: (row: PayrollWithEmployee) => onEditPayroll(row),
      },
    ],
    [onViewPayslip, onEditPayroll]
  );

  return (
    <DataTable
      data={payrolls}
      columns={columns as any}
      title="Employee Payrolls"
      loading={isLoading}
      searchKey="employee_name"
      searchPlaceholder="Search by employee name..."
      export={{ enabled: true, filename: "payrolls" }}
      actions={actions}
      emptyMessage="No payroll records found for the selected filters."
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
