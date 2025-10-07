import { useMemo } from "react";
import { Edit, Eye, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { DataTableWithFilters } from "@/components/shared";
import type { PayrollRead } from "@/lib/types/payrolls";
import type { ColumnDef } from "@tanstack/react-table";
import {
  createTextColumn,
  createCurrencyColumn,
  createBadgeColumn,
  createActionColumn,
  createViewAction,
  createEditAction,
  createDeleteAction
} from "@/lib/utils/columnFactories.tsx";

// Extended interface that includes employee information
interface PayrollWithEmployee extends PayrollRead {
  employee_name: string;
  payroll_year: number;
}

interface EmployeePayrollTableProps {
  payrolls: PayrollWithEmployee[];
  isLoading: boolean;
  onEditPayroll: (payroll: PayrollWithEmployee) => void;
  onViewPayslip: (payroll: PayrollWithEmployee) => void;
  onUpdateStatus: (id: number, status: string) => void;
  getStatusColor: (status: string) => string;
  getStatusText: (status: string) => string;
}

export const EmployeePayrollTable = ({
  payrolls,
  isLoading,
  onEditPayroll,
  onViewPayslip,
  onUpdateStatus,
  getStatusColor,
  getStatusText,
}: EmployeePayrollTableProps) => {
  // Define columns for the data table using column factories
  const columns: ColumnDef<PayrollWithEmployee>[] = useMemo(() => [
    createTextColumn<PayrollWithEmployee>("employee_name", { header: "Employee", className: "font-medium" }),
    createTextColumn<PayrollWithEmployee>("payroll_month", { header: "Pay Period" }),
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
    createActionColumn<PayrollWithEmployee>([
      createViewAction((row) => onViewPayslip(row)),
      createEditAction((row) => onEditPayroll(row)),
      createDeleteAction((row) => onUpdateStatus(row.payroll_id, "PAID"))
    ])
  ], [onViewPayslip, onEditPayroll, onUpdateStatus]);

  // Define filter options
  const statusFilterOptions = [
    { value: "all", label: "All Status" },
    { value: "PENDING", label: "Pending" },
    { value: "PAID", label: "Paid" },
    { value: "OVERDUE", label: "Overdue" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <DataTableWithFilters
      data={payrolls}
      columns={columns}
      title="Employee Payrolls"
      description="Track employee salary payments and deductions"
      searchKey="employee_name"
      exportable={true}
      filters={[
        {
          key: "status",
          label: "Status",
          options: statusFilterOptions,
          value: "all",
          onChange: () => {}, // This will be handled by the DataTableWithFilters component
        },
      ]}
    />
  );
};
