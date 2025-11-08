import { useMemo } from "react";

import { formatCurrency } from "@/lib/utils";
import { EnhancedDataTable } from "@/components/shared/EnhancedDataTable";
import type { PayrollRead } from "@/lib/types/general/payrolls";
import type { ColumnDef } from "@tanstack/react-table";
import {
  createTextColumn,
  createCurrencyColumn,
  createBadgeColumn
} from "@/lib/utils/factory/columnFactories";

// Extended interface that includes employee information
interface PayrollWithEmployee extends Omit<PayrollRead, 'payroll_month'> {
  employee_name: string;
  employee_type?: string;
  payroll_month: number; // Changed from string to number to match API
  payroll_year: number;
}

interface EmployeePayrollTableProps {
  payrolls: PayrollWithEmployee[];
  isLoading: boolean;
  onAddPayroll?: () => void;
  onEditPayroll: (payroll: PayrollWithEmployee) => void;
  onViewPayslip: (payroll: PayrollWithEmployee) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

export const EmployeePayrollTable = ({
  payrolls,
  isLoading,
  onAddPayroll,
  onEditPayroll,
  onViewPayslip,
  getStatusColor,
  getStatusText,
}: EmployeePayrollTableProps) => {
  // Define columns for the data table using column factories
  const columns: ColumnDef<PayrollWithEmployee>[] = useMemo(() => [
    createTextColumn<PayrollWithEmployee>("employee_name", { header: "Employee", className: "font-medium" }),
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
        
        if (month && year && typeof month === 'number' && typeof year === 'number') {
          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          return <span>{monthNames[month - 1]} {year}</span>;
        }
        return <span>-</span>;
      }
    },
    createCurrencyColumn<PayrollWithEmployee>("gross_pay", { header: "Gross Pay" }),
    {
      id: "deductions",
      header: "Deductions",
      cell: ({ row }) => {
        const p = row.original;
        const total = (p.lop || 0) + (p.advance_deduction || 0) + (p.other_deductions || 0);
        return <span>{formatCurrency(total)}</span>;
      }
    },
    createCurrencyColumn<PayrollWithEmployee>("net_pay", { header: "Net Pay" }),
    createBadgeColumn<PayrollWithEmployee>("status", { header: "Status", variant: "outline" }),
  ], []);

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(() => [
    {
      type: 'view' as const,
      onClick: (row: PayrollWithEmployee) => onViewPayslip(row)
    },
    {
      type: 'edit' as const,
      onClick: (row: PayrollWithEmployee) => onEditPayroll(row)
    }
  ], [onViewPayslip, onEditPayroll]);

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
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Payroll Records Found</h3>
        <p className="text-gray-500 mb-4">
          There are no payroll records for the selected filters. Try adjusting your search criteria or create new payroll entries.
        </p>
        <div className="text-sm text-gray-400">
          💡 <strong>Tip:</strong> Make sure you have payroll data for the selected month and year.
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
      onAdd={onAddPayroll}
      addButtonText="Preview Payroll"
      addButtonVariant="default"
      showActions={true}
      actionButtonGroups={actionButtonGroups}
      actionColumnHeader="Actions"
      showActionLabels={true}
    />
  );
};
