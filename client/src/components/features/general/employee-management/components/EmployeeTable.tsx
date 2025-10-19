import { useMemo } from "react";
import { EnhancedDataTable } from "@/components/shared/EnhancedDataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { 
  createAvatarColumn, 
  createTextColumn, 
  createCurrencyColumn, 
  createDateColumn, 
  createStatusColumn, 
  createActionColumn,
  createEditAction,
  createDeleteAction,
  createViewAction,
  StatusColors,
  StatusIcons
} from "@/lib/utils/columnFactories.tsx";

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
    createStatusColumn<EmployeeRead>("status", StatusColors.employee, StatusIcons.employee, { header: "Status" }),
    createActionColumn<EmployeeRead>([
      createViewAction(onViewEmployee),
      createEditAction(onEditEmployee),
      createDeleteAction((employee) => onDeleteEmployee(employee.employee_id))
    ])
  ], [onViewEmployee, onEditEmployee, onDeleteEmployee, onUpdateStatus]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <EnhancedDataTable
      data={employees}
      columns={columns as any}
      title="Employees"
      description="Manage employee information and details"
      searchKey="employee_name"
      exportable={true}
      showSearch={showSearch}
      onAdd={onAddEmployee}
      addButtonText="Add Employee"
    />
  );
};