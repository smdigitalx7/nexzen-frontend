import React, { useState, useMemo } from "react";
import { useBiometricYearlySummary } from "../hooks/useBiometricReports";
import { BiometricFilters } from "../components/BiometricFilters";
import { DataTable } from "@/common/components/shared/DataTable/DataTable";
import { Card, CardContent } from "@/common/components/ui/card";
import { Clock } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import type { YearlySummaryRecord } from "../types/biometric-reports";

const YearlySummaryPage = () => {
  const currentYear = new Date().getFullYear();

  // Filters State
  const [year, setYear] = useState<number>(currentYear);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);

  // Pagination State
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const queryParams = useMemo(() => ({
    year,
    employeeId: employeeId || undefined,
    companyId: companyId || undefined,
    departmentId: departmentId || undefined,
    categoryId: categoryId || undefined,
    page,
    pageSize,
  }), [year, employeeId, companyId, departmentId, categoryId, page, pageSize]);

  const { data: reportData, isLoading, refetch } = useBiometricYearlySummary(queryParams);

  const records = useMemo(() => reportData?.data || [], [reportData]);
  const totalCount = useMemo(() => reportData?.total || 0, [reportData]);

  const handleReset = () => {
    setYear(currentYear);
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

  const columns = useMemo((): ColumnDef<YearlySummaryRecord>[] => [
    {
      accessorKey: "report_year",
      header: "Year",
    },
    {
      accessorKey: "report_month_name",
      header: "Month",
      cell: ({ getValue }) => {
        const name = getValue() as string;
        return name?.trim() || "-";
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
      header: "Leave Days",
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
      header: "Weekly Offs",
    },
    {
      accessorKey: "total_holidays",
      header: "Holidays",
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
    {
      accessorKey: "company_sname",
      header: "Company",
    },
  ], []);

  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardContent className="pt-6">
          <BiometricFilters
            showYear
            year={year}
            employeeId={employeeId}
            companyId={companyId}
            departmentId={departmentId}
            categoryId={categoryId}
            onYearChange={setYear}
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
        title="Yearly Attendance Summary Report"
        loading={isLoading}
        searchKey="employee_name"
        export={{ enabled: true, filename: "yearly_biometric_summary_report" }}
        showSearch={true}
        emptyMessage="No biometric attendance yearly summary records found"
        pagination="server"
        currentPage={page}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[10, 25, 50, 100]}
        tableElementClassName="min-w-[1500px]"
      />
    </div>
  );
};

export default YearlySummaryPage;
