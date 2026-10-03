import { useMemo, useState, useEffect } from "react";
import { useDebounce } from "@/common/hooks/useDebounce";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/common/components/ui/dialog";
import { DataTable } from "@/common/components/shared/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { createTextColumn } from "@/common/utils/factory/columnFactories";
import { MonthYearFilter } from "@/common/components/shared";
import {
  Plus,
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  Users,
  FileSpreadsheet,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { useEmployeesByBranch } from "@/features/general/hooks/useEmployees";
import { usePayrollsByBranch } from "@/features/general/hooks/usePayrollManagement";
import type { EmployeeRead } from "@/features/general/types/employees";
import type { PayrollRead } from "@/features/general/types/payrolls";
import { PayrollStatusEnum } from "@/features/general/types/payrolls";

interface GeneratePayrollPageProps {
  onGenerate: (employeeId: number, employeeName: string) => void;
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
  const debouncedSearchQuery = useDebounce(searchQuery, 400);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Pre-payroll reminder
  const [reminderOpen, setReminderOpen] = useState(false);
  const [pendingGenerate, setPendingGenerate] = useState<{ id: number; name: string } | null>(null);

  const handleGenerateClick = (employeeId: number, employeeName: string) => {
    setPendingGenerate({ id: employeeId, name: employeeName });
    setReminderOpen(true);
  };

  const handleConfirmGenerate = () => {
    if (pendingGenerate) {
      setReminderOpen(false);
      onGenerate(pendingGenerate.id, pendingGenerate.name);
      setPendingGenerate(null);
    }
  };

  // Reset to first page when debounced search query changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery]);

  // Fetch employees with pagination and server search
  const { data: employeesResponse, isLoading: isEmployeesLoading } =
    useEmployeesByBranch(true, page, pageSize, debouncedSearchQuery);

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
                onClick={() => handleGenerateClick(row.original.employee_id, row.original.employee_name)}
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

  const monthName = new Date(year, month - 1).toLocaleString("default", { month: "long" });

  return (
    <div className="space-y-5">

      {/* ── Pre-payroll Reminder Dialog ── */}
      <Dialog open={reminderOpen} onOpenChange={setReminderOpen}>
        <DialogContent className="sm:max-w-[380px] p-0 overflow-hidden">
          {/* Amber top bar */}
          <div className="bg-amber-500 dark:bg-amber-600 px-5 py-3.5 flex items-center gap-2.5">
            <AlertTriangle className="h-4.5 w-4.5 text-white flex-shrink-0" />
            <DialogTitle className="text-sm font-bold text-white leading-snug">
              Quick Reminder Before Payroll
            </DialogTitle>
          </div>

          <div className="px-5 pt-4 pb-1">
            <DialogDescription className="text-[13px] text-slate-600 dark:text-slate-300 leading-relaxed">
              Make sure the following are updated for{" "}
              <span className="font-semibold text-slate-800 dark:text-white">{monthName} {year}</span>
              :
            </DialogDescription>

            <ul className="mt-3 space-y-2">
              {[
                "Holidays declared for this month",
                "Employee leave requests approved / rejected",
                "Employee advances recorded",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-[13px] text-slate-700 dark:text-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <DialogFooter className="px-5 py-4 flex flex-row items-center justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setReminderOpen(false)}
              className="h-8 text-xs text-slate-500 hover:text-slate-700 px-3"
            >
              Go Update
            </Button>
            <Button
              type="button"
              onClick={handleConfirmGenerate}
              className="h-8 gap-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4"
            >
              Yes, Proceed
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Header & Filter Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-blue-600" />
              Generate Monthly Payroll
            </h3>
            <p className="text-xs text-muted-foreground">
              Select an employee to preview biometric attendance, adjust LOP and deductions, and disburse salary.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider whitespace-nowrap">
              Pay Period:
            </span>
            <MonthYearFilter
              month={month}
              year={year}
              onMonthChange={onMonthChange}
              onYearChange={onYearChange}
              monthId="gen-payroll-month"
              yearId="gen-payroll-year"
              monthWidth="200px"
              yearWidth="115px"
              monthClassName="h-11 text-sm font-semibold bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
              yearClassName="h-11 text-sm font-semibold bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
              showLabels={false}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-muted-foreground font-medium">Total Staff</div>
            <div className="text-xl font-bold text-slate-900 dark:text-slate-100">{totalEmployees}</div>
          </div>
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-lg">
            <Users className="h-5 w-5" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-muted-foreground font-medium">
              Generated ({new Date(0, month - 1).toLocaleString('default', { month: 'short' })})
            </div>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">{payrollsMap.size}</div>
          </div>
          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <CheckCircle className="h-5 w-5" />
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3.5 flex items-center justify-between shadow-xs">
          <div>
            <div className="text-xs text-muted-foreground font-medium">Pending Generation</div>
            <div className="text-xl font-bold text-amber-600 dark:text-amber-400">{Math.max(0, totalEmployees - payrollsMap.size)}</div>
          </div>
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-lg">
            <Clock className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="">
        <DataTable
            data={employees}
            columns={columns}
            title="Eligible Employees"
            loading={isLoading}
            searchKey="employee_name"
            searchValue={searchQuery}
            onSearchChange={(term: string) => {
              setSearchQuery(term);
              setPage(1);
            }}
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
