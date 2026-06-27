import React, { useState, useMemo } from "react";
import { useBiometricYearlySummary } from "../hooks/useBiometricReports";
import { BiometricFilters } from "../components/BiometricFilters";
import { DataTable } from "@/common/components/shared/DataTable/DataTable";
import { Card, CardContent } from "@/common/components/ui/card";
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
      accessorKey: "total_present_days",
      header: "Present Days",
      cell: ({ getValue }) => (getValue() as number)?.toFixed(1),
    },
    {
      accessorKey: "total_absent_days",
      header: "Absent Days",
      cell: ({ getValue }) => (getValue() as number)?.toFixed(1),
    },
    {
      accessorKey: "total_leave_days",
      header: "Leave Days",
      cell: ({ getValue }) => (getValue() as number)?.toFixed(1),
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
      cell: ({ getValue }) => (getValue() as number)?.toFixed(2) || "0.00",
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
      />
    </div>
  );
};

export default YearlySummaryPage;
