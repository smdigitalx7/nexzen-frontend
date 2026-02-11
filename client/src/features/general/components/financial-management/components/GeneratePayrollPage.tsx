import { useMemo, useState } from "react";
import { format } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/common/components/ui/table";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { DataTable } from "@/common/components/shared/DataTable";
import { useCanViewUIComponent, useCanCreate } from "@/core/permissions";
import type { ColumnDef } from "@tanstack/react-table";
import {
  createTextColumn
} from "@/common/utils/factory/columnFactories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/common/components/ui/select";
import { MonthYearFilter } from "@/common/components/shared";
import {
  Loader2,
  Search,
  Plus,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
} from "lucide-react";
import { useEmployeesByBranch } from "@/features/general/hooks/useEmployees";
import { usePayrollsByBranch } from "@/features/general/hooks/usePayrollManagement";
import type { EmployeeRead } from "@/features/general/types/employees";
import type { PayrollRead } from "@/features/general/types/payrolls";
import { PayrollStatusEnum } from "@/features/general/types/payrolls";

interface GeneratePayrollPageProps {
  onGenerate: (employeeId: number) => void;
  onView: (payroll: PayrollRead) => void;
  month: number;
  year: number;
  onMonthChange: (month: number) => void;
  onYearChange: (year: number) => void;
}

export const GeneratePayrollPage = ({
  onGenerate,
  onView,
  month,
  year,
  onMonthChange,
  onYearChange,
}: GeneratePayrollPageProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Fetch employees with pagination
  const { data: employeesResponse, isLoading: isEmployeesLoading } =
    useEmployeesByBranch(true, page, pageSize);

  const employees = useMemo(() => {
    // Check if the response is paginated (has 'data' property) or array
    if (employeesResponse && 'data' in employeesResponse && Array.isArray(employeesResponse.data)) {
        return employeesResponse.data as EmployeeRead[];
    }
    return Array.isArray(employeesResponse) ? (employeesResponse as EmployeeRead[]) : [];
  }, [employeesResponse]);

  const totalEmployees = useMemo(() => {
    if (employeesResponse && 'total_count' in employeesResponse) {
        return employeesResponse.total_count as number;
    }
    return employees.length; // Fallback
  }, [employeesResponse, employees]);

  const totalPages = Math.ceil(totalEmployees / pageSize);

  // Fetch existing payrolls for the selected period
  // We fetch up to 100 which is the backend limit. 
  // Ideally backend should provide a way to check status for specific employees,
  // but for now this covers most use cases.
  const { data: payrollsResp, isLoading: isPayrollsLoading } =
    usePayrollsByBranch({
      month,
      year,
      page_size: 100, // Max allowed by backend
    });

  const payrollsMap = useMemo(() => {
    const map = new Map<number, PayrollRead>();
    const rawData: any = payrollsResp?.data;

    if (!rawData) return map;

    // Handle flattening if grouped response (similar to other hooks)
    let allPayrolls: any[] = [];
    if (Array.isArray(rawData)) {
        // Check if it's already a flat array of payrolls or grouped
        if (rawData.length > 0 && 'payroll_id' in rawData[0]) {
             allPayrolls = rawData;
        } else {
             allPayrolls = rawData.flatMap((group: any) => group.payrolls || []);
        }
    }

    allPayrolls.forEach((payroll: any) => {
      map.set(payroll.employee_id, payroll);
    });
    return map;
  }, [payrollsResp]);

  const isLoading = isEmployeesLoading || isPayrollsLoading;

  // Columns definition
  const columns: ColumnDef<EmployeeRead>[] = useMemo(() => [
    createTextColumn<EmployeeRead>("employee_code", { header: "Code", className: "font-medium" }),
    {
      accessorKey: "employee_name",
      header: "Employee Name",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.employee_name}</div>
          <div className="text-xs text-muted-foreground">{row.original.email}</div>
        </div>
      )
    },
    createTextColumn<EmployeeRead>("designation", { header: "Designation" }),
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const payroll = payrollsMap.get(row.original.employee_id);
        if (!payroll) {
          return <Badge variant="outline" className="text-slate-500 border-slate-300">Not Generated</Badge>;
        }

        switch (payroll.status) {
          case PayrollStatusEnum.PAID:
            return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="w-3 h-3 mr-1"/> Paid</Badge>;
          case PayrollStatusEnum.PENDING:
            return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white"><Clock className="w-3 h-3 mr-1"/> Pending</Badge>;
          case PayrollStatusEnum.HOLD:
            return <Badge className="bg-red-500 hover:bg-red-600"><AlertCircle className="w-3 h-3 mr-1"/> On Hold</Badge>;
          default:
            return <Badge variant="secondary">{payroll.status}</Badge>;
        }
      }
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => {
        const payroll = payrollsMap.get(row.original.employee_id);
        const isGenerated = !!payroll;

        return (
          <div className="text-right">
            {isGenerated ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(payroll!)}
                className="gap-2"
              >
                <FileText className="h-3.5 w-3.5" />
                View Details
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => onGenerate(row.original.employee_id)}
                className="gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-3.5 w-3.5" />
                Generate
              </Button>
            )}
          </div>
        );
      }
    }
  ], [payrollsMap, onGenerate, onView]);

  return (
    <div className="space-y-6">
      {/* Filters Card */}
      {/* Employees Table */}
      <div className="rounded-md bg-white shadow-sm">
        <DataTable
            data={employees}
            columns={columns}
            title="Employees"
            loading={isLoading}
            searchKey="employee_name" // Note: This will only search current page if backend doesn't support search
            showSearch={true}
            pagination="server"
            currentPage={page}
            totalCount={totalEmployees}
            onPageChange={setPage}
            pageSize={pageSize}
            onPageSizeChange={setPageSize}
            pageSizeOptions={[10, 25, 50, 100]}
        />
      </div>
    </div>
  );
};
