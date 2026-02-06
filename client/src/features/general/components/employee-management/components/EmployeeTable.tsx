import { useMemo } from "react";
import { Eye, Edit, Trash2 } from "lucide-react";
import { DataTable } from "@/common/components/shared/DataTable";
import { useCanViewUIComponent, useCanCreate } from "@/core/permissions";
import type { ColumnDef } from "@tanstack/react-table";
import { 
  createAvatarColumn, 
  createTextColumn, 
  createCurrencyColumn, 
  createDateColumn, 
  createStatusColumn, 
  StatusColors,
  StatusIcons
} from "@/common/utils/factory/columnFactories";

interface EmployeeRead {
  employee_id: number;
  employee_name: string;
  employee_code: string;
  email?: string | null;
  mobile_no?: string | null;
  designation: string;
  department?: string;
  date_of_joining: string;
  salary: number;
  status: string;
  branch_id?: number;
  created_at: string;
  updated_at?: string | null;
}

interface EmployeeTableProps {
  employees: EmployeeRead[];
  isLoading: boolean;
  onAddEmployee: () => void;
  onEditEmployee: (employee: EmployeeRead) => void;
  onDeleteEmployee: (id: number) => void;
  onViewEmployee: (employee: EmployeeRead) => void;
  onUpdateStatus?: (id: number, status: string) => void;
  showSearch?: boolean;
}

export const EmployeeTable = ({
  employees,
  isLoading,
  onAddEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onViewEmployee,
  onUpdateStatus,
  showSearch = true,
}: EmployeeTableProps) => {

  // Define columns for the data table using column factories
  const columns = useMemo((): ColumnDef<EmployeeRead>[] => [
    createAvatarColumn<EmployeeRead>("employee_name", "employee_code", { header: "Employee" }),
    createTextColumn<EmployeeRead>("designation", { header: "Designation", className: "font-medium" }),
    createTextColumn<EmployeeRead>("mobile_no", { header: "Mobile", fallback: "N/A" }),
    createCurrencyColumn<EmployeeRead>("salary", { header: "Salary" }),
    createDateColumn<EmployeeRead>("date_of_joining", { header: "Joining Date" }),
    createStatusColumn<EmployeeRead>("status", StatusColors.employee, StatusIcons.employee, { header: "Status" })
  ], []);

  // Check permissions
  const canEditEmployee = useCanViewUIComponent("employees", "button", "employee-edit");
  const canDeleteEmployee = useCanViewUIComponent("employees", "button", "employee-delete");
  const canCreateEmployee = useCanCreate("employees");

  // ✅ MIGRATED: Use DataTable V2 actions format
  const actions = useMemo(() => [
    {
      id: "view",
      label: "View",
      icon: Eye,
      onClick: (row: EmployeeRead) => onViewEmployee(row)
    },
    {
      id: "edit",
      label: "Edit",
      icon: Edit,
      onClick: (row: EmployeeRead) => onEditEmployee(row),
      show: () => canEditEmployee
    },
    {
      id: "delete",
      label: "Delete",
      icon: Trash2,
      variant: "destructive" as const,
      onClick: (row: EmployeeRead) => onDeleteEmployee(row.employee_id),
      show: () => canDeleteEmployee
    }
  ], [onViewEmployee, onEditEmployee, onDeleteEmployee, canEditEmployee, canDeleteEmployee]);

  return (
    <DataTable
      data={employees}
      columns={columns as any}
      title="Employees"
      loading={isLoading}
      searchKey="employee_name"
      export={{ enabled: true, filename: "employees" }}
      showSearch={showSearch}
      onAdd={canCreateEmployee ? onAddEmployee : undefined}
      addButtonText="Add Employee"
      actions={actions}
    />
  );
};