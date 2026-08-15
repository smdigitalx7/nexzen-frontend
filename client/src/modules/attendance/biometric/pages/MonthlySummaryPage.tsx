import React, { useState, useMemo } from "react";
import { useBiometricMonthlySummary } from "../hooks/useBiometricReports";
import { BiometricFilters } from "../components/BiometricFilters";
import { DataTable } from "@/common/components/shared/DataTable/DataTable";
import { Card, CardContent } from "@/common/components/ui/card";
import { Clock } from "lucide-react";
import { cn } from "@/common/utils";
import type { ColumnDef } from "@tanstack/react-table";
import type { MonthlySummaryRecord } from "../types/biometric-reports";

const MonthlySummaryPage = () => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  // Filters State
  const [year, setYear] = useState<number>(currentYear);
  const [month, setMonth] = useState<number>(currentMonth);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);

  // Pagination State
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const queryParams = useMemo(() => ({
    year,
    month,
    employeeId: employeeId || undefined,
    companyId: companyId || undefined,
    departmentId: departmentId || undefined,
    categoryId: categoryId || undefined,
    page,
    pageSize,
  }), [year, month, employeeId, companyId, departmentId, categoryId, page, pageSize]);

  const { data: reportData, isLoading, refetch } = useBiometricMonthlySummary(queryParams);

  const records = useMemo(() => reportData?.data || [], [reportData]);
  const totalCount = useMemo(() => reportData?.total || 0, [reportData]);

  const handleReset = () => {
    setYear(currentYear);
    setMonth(currentMonth);
    setEmployeeId(null);
    setCompanyId(null);
    setDepartmentId(null);
    setCategoryId(null);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
  };

  const columns = useMemo((): ColumnDef<MonthlySummaryRecord>[] => [
    {
      accessorKey: "report_year",
      header: "Year",
    },
    {
      accessorKey: "report_month",
      header: "Month",
      cell: ({ getValue }) => {
        const m = getValue() as number;
        return new Date(2000, m - 1).toLocaleString("default", { month: "short" });
      },
    },
    {
      accessorKey: "employee_name",
      header: "Employee Details",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-semibold text-slate-800 dark:text-slate-100">{row.original.employee_name}</span>
          <span className="text-xs font-mono text-slate-400">{row.original.employee_code}</span>
        </div>
      ),
    },
    {
      accessorKey: "department_sname",
      header: "Department",
    },
    {
      accessorKey: "designation",
      header: "Designation",
    },
    {
      accessorKey: "total_calendar_days",
      header: "Cal Days",
    },
    {
      accessorKey: "total_present_days",
      header: "Present Days",
      cell: ({ getValue }) => {
        const val = getValue() as number;
        if (!val) return "0.0";
        return (
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 font-bold text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-md dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30">
            {val.toFixed(1)}
          </span>
        );
      },
    },
    {
      accessorKey: "total_absent_days",
      header: "Absent Days",
      cell: ({ getValue }) => {
        const val = getValue() as number;
        if (!val) return <span className="text-slate-300">0.0</span>;
        return (
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 font-bold text-xs bg-rose-50 text-rose-700 border border-rose-100 rounded-md dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30">
            {val.toFixed(1)}
          </span>
        );
      },
    },
    {
      accessorKey: "total_leave_days",
      header: "Leaves",
      cell: ({ getValue }) => {
        const val = getValue() as number;
        if (!val) return "0.0";
        return (
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 font-bold text-xs bg-blue-50 text-blue-700 border border-blue-100 rounded-md dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30">
            {val.toFixed(1)}
          </span>
        );
      },
    },
    {
      accessorKey: "total_weekly_offs",
      header: "Weekly Off",
    },
    {
      accessorKey: "total_holidays",
      header: "Holidays",
    },
    {
      accessorKey: "total_late_days",
      header: "Late Days",
      cell: ({ row }) => {
        const days = row.original.total_late_days;
        if (days > 0) {
          return (
            <span className="inline-flex items-center gap-1 text-rose-600 font-semibold dark:text-rose-400">
              <Clock className="h-3.5 w-3.5" />
              {days} days
            </span>
          );
        }
        return days || "0";
      },
    },
    {
      accessorKey: "total_late_minutes",
      header: "Late (min)",
      cell: ({ row }) => {
        const mins = row.original.total_late_minutes;
        if (mins > 0) {
          return (
            <span className="text-rose-600 font-bold dark:text-rose-400">
              {mins} mins
            </span>
          );
        }
        return mins || "0";
      },
    },
    {
      accessorKey: "total_early_going_days",
      header: "Early Days",
    },
    {
      accessorKey: "total_early_going_minutes",
      header: "Early (min)",
    },
    {
      accessorKey: "total_over_time_minutes",
      header: "OT (min)",
    },
    {
      accessorKey: "total_worked_hours",
      header: "Worked Hrs",
      cell: ({ getValue }) => {
        const val = getValue() as number;
        if (!val) return "0.00";
        return (
          <span className="inline-flex items-center gap-1 font-mono text-xs text-slate-700 bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
            <Clock className="h-3 w-3 text-slate-400" />
            {val.toFixed(2)}
          </span>
        );
      },
    },
  ], []);

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardContent className="pt-6">
          <BiometricFilters
            showYear
            showMonth
            year={year}
            month={month}
            employeeId={employeeId}
            companyId={companyId}
            departmentId={departmentId}
            categoryId={categoryId}
            onYearChange={setYear}
            onMonthChange={setMonth}
            onEmployeeChange={setEmployeeId}
            onCompanyChange={setCompanyId}
            onDepartmentChange={setDepartmentId}
            onCategoryChange={setCategoryId}
            onReset={handleReset}
            onRefresh={refetch}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <DataTable
        data={records}
        columns={columns}
        title="Monthly Attendance Summary Report"
        loading={isLoading}
        searchKey="employee_name"
        export={{ enabled: true, filename: "monthly_biometric_summary_report" }}
        showSearch={true}
        emptyMessage="No summary records found"
        pagination="server"
        currentPage={page}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[10, 25, 50, 100]}
        tableElementClassName="min-w-[1800px]"
      />
    </div>
  );
};

export default MonthlySummaryPage;
