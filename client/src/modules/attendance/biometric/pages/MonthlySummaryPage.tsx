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
      accessorKey: "employee_code",
      header: "Emp Code",
    },
    {
      accessorKey: "employee_name",
      header: "Employee Name",
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
      header: "Present",
      cell: ({ getValue }) => (getValue() as number)?.toFixed(1),
    },
    {
      accessorKey: "total_absent_days",
      header: "Absent",
      cell: ({ getValue }) => (getValue() as number)?.toFixed(1),
    },
    {
      accessorKey: "total_leave_days",
      header: "Leave",
      cell: ({ getValue }) => (getValue() as number)?.toFixed(1),
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
      cell: ({ getValue }) => (getValue() as number)?.toFixed(2) || "0.00",
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
      />
    </div>
  );
};

export default MonthlySummaryPage;
