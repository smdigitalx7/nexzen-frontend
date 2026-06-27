import React, { useState, useMemo } from "react";
import { useBiometricYearlyMatrix } from "../hooks/useBiometricReports";
import { BiometricFilters } from "../components/BiometricFilters";
import { DataTable } from "@/common/components/shared/DataTable/DataTable";
import { Card, CardContent } from "@/common/components/ui/card";
import type { ColumnDef } from "@tanstack/react-table";
import type { YearlyMatrixRecord } from "../types/biometric-reports";

const YearlyMatrixPage = () => {
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

  const { data: reportData, isLoading, refetch } = useBiometricYearlyMatrix(queryParams);

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

  const columns = useMemo((): ColumnDef<YearlyMatrixRecord>[] => [
    {
      accessorKey: "report_year",
      header: "Year",
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
      accessorKey: "jan_present",
      header: "Jan",
      cell: ({ getValue }) => (getValue() as number)?.toFixed(1) || "0.0",
    },
    {
      accessorKey: "feb_present",
      header: "Feb",
      cell: ({ getValue }) => (getValue() as number)?.toFixed(1) || "0.0",
    },
    {
      accessorKey: "mar_present",
      header: "Mar",
      cell: ({ getValue }) => (getValue() as number)?.toFixed(1) || "0.0",
    },
    {
      accessorKey: "apr_present",
      header: "Apr",
      cell: ({ getValue }) => (getValue() as number)?.toFixed(1) || "0.0",
    },
    {
      accessorKey: "may_present",
      header: "May",
      cell: ({ getValue }) => (getValue() as number)?.toFixed(1) || "0.0",
    },
    {
      accessorKey: "jun_present",
      header: "Jun",
      cell: ({ getValue }) => (getValue() as number)?.toFixed(1) || "0.0",
    },
    {
      accessorKey: "jul_present",
      header: "Jul",
      cell: ({ getValue }) => (getValue() as number)?.toFixed(1) || "0.0",
    },
    {
      accessorKey: "aug_present",
      header: "Aug",
      cell: ({ getValue }) => (getValue() as number)?.toFixed(1) || "0.0",
    },
    {
      accessorKey: "sep_present",
      header: "Sep",
      cell: ({ getValue }) => (getValue() as number)?.toFixed(1) || "0.0",
    },
    {
      accessorKey: "oct_present",
      header: "Oct",
      cell: ({ getValue }) => (getValue() as number)?.toFixed(1) || "0.0",
    },
    {
      accessorKey: "nov_present",
      header: "Nov",
      cell: ({ getValue }) => (getValue() as number)?.toFixed(1) || "0.0",
    },
    {
      accessorKey: "dec_present",
      header: "Dec",
      cell: ({ getValue }) => (getValue() as number)?.toFixed(1) || "0.0",
    },
    {
      accessorKey: "yearly_total_present",
      header: "Total P",
      cell: ({ getValue }) => (getValue() as number)?.toFixed(1) || "0.0",
    },
    {
      accessorKey: "yearly_total_absent",
      header: "Total A",
      cell: ({ getValue }) => (getValue() as number)?.toFixed(1) || "0.0",
    },
    {
      accessorKey: "yearly_total_leaves",
      header: "Total L",
      cell: ({ getValue }) => (getValue() as number)?.toFixed(1) || "0.0",
    },
    {
      accessorKey: "yearly_total_weekly_offs",
      header: "Total WO",
    },
    {
      accessorKey: "yearly_total_holidays",
      header: "Total H",
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
        title="Yearly Attendance Matrix Grid"
        loading={isLoading}
        searchKey="employee_name"
        export={{ enabled: true, filename: "yearly_biometric_matrix_grid" }}
        showSearch={true}
        emptyMessage="No biometric attendance yearly matrix records found"
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

export default YearlyMatrixPage;
