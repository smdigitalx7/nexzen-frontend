import { useMemo, useState } from "react";

import { formatCurrency } from "@/common/utils";
import { EnhancedDataTable } from "@/common/components/shared/EnhancedDataTable";
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
}

export const EmployeePayrollTable = ({
  payrolls,
  isLoading,
  onEditPayroll,
  onViewPayslip,
  onUpdateStatus,
  getStatusColor: _getStatusColor,
  getStatusText: _getStatusText,
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
          const currentStatus = payroll.status as PayrollStatusEnum;
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

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(
    () => [
      {
        type: "view" as const,
        onClick: (row: PayrollWithEmployee) => onViewPayslip(row),
      },
      {
        type: "edit" as const,
        onClick: (row: PayrollWithEmployee) => onEditPayroll(row),
      },
    ],
    [onViewPayslip, onEditPayroll]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!payrolls || payrolls.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg
            className="w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No Payroll Records Found
        </h3>
        <p className="text-gray-500 mb-4">
          There are no payroll records for the selected filters. Try adjusting
          your search criteria or create new payroll entries.
        </p>
        <div className="text-sm text-gray-400">
          💡 <strong>Tip:</strong> Make sure you have payroll data for the
          selected month and year.
        </div>
      </div>
    );
  }

  return (
    <EnhancedDataTable
      data={payrolls}
      columns={columns}
      title="Employee Payrolls"
      searchKey="employee_name"
      exportable={true}
      showActions={true}
      actionButtonGroups={actionButtonGroups}
      actionColumnHeader="Actions"
      showActionLabels={true}
    />
  );
};
