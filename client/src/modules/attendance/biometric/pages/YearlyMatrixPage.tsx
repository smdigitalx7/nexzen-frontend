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
      accessorKey: "jan_present",
      header: "Jan",
      cell: ({ getValue }) => {
        const val = getValue() as number;
        if (!val) return <span className="text-slate-300">0.0</span>;
        return <span className="font-medium text-slate-800 dark:text-slate-200">{val.toFixed(1)}</span>;
      },
    },
    {
      accessorKey: "feb_present",
      header: "Feb",
      cell: ({ getValue }) => {
        const val = getValue() as number;
        if (!val) return <span className="text-slate-300">0.0</span>;
        return <span className="font-medium text-slate-800 dark:text-slate-200">{val.toFixed(1)}</span>;
      },
    },
    {
      accessorKey: "mar_present",
      header: "Mar",
      cell: ({ getValue }) => {
        const val = getValue() as number;
        if (!val) return <span className="text-slate-300">0.0</span>;
        return <span className="font-medium text-slate-800 dark:text-slate-200">{val.toFixed(1)}</span>;
      },
    },
    {
      accessorKey: "apr_present",
      header: "Apr",
      cell: ({ getValue }) => {
        const val = getValue() as number;
        if (!val) return <span className="text-slate-300">0.0</span>;
        return <span className="font-medium text-slate-800 dark:text-slate-200">{val.toFixed(1)}</span>;
      },
    },
    {
      accessorKey: "may_present",
      header: "May",
      cell: ({ getValue }) => {
        const val = getValue() as number;
        if (!val) return <span className="text-slate-300">0.0</span>;
        return <span className="font-medium text-slate-800 dark:text-slate-200">{val.toFixed(1)}</span>;
      },
    },
    {
      accessorKey: "jun_present",
      header: "Jun",
      cell: ({ getValue }) => {
        const val = getValue() as number;
        if (!val) return <span className="text-slate-300">0.0</span>;
        return <span className="font-medium text-slate-800 dark:text-slate-200">{val.toFixed(1)}</span>;
      },
    },
    {
      accessorKey: "jul_present",
      header: "Jul",
      cell: ({ getValue }) => {
        const val = getValue() as number;
        if (!val) return <span className="text-slate-300">0.0</span>;
        return <span className="font-medium text-slate-800 dark:text-slate-200">{val.toFixed(1)}</span>;
      },
    },
    {
      accessorKey: "aug_present",
      header: "Aug",
      cell: ({ getValue }) => {
        const val = getValue() as number;
        if (!val) return <span className="text-slate-300">0.0</span>;
        return <span className="font-medium text-slate-800 dark:text-slate-200">{val.toFixed(1)}</span>;
      },
    },
    {
      accessorKey: "sep_present",
      header: "Sep",
      cell: ({ getValue }) => {
        const val = getValue() as number;
        if (!val) return <span className="text-slate-300">0.0</span>;
        return <span className="font-medium text-slate-800 dark:text-slate-200">{val.toFixed(1)}</span>;
      },
    },
    {
      accessorKey: "oct_present",
      header: "Oct",
      cell: ({ getValue }) => {
        const val = getValue() as number;
        if (!val) return <span className="text-slate-300">0.0</span>;
        return <span className="font-medium text-slate-800 dark:text-slate-200">{val.toFixed(1)}</span>;
      },
    },
    {
      accessorKey: "nov_present",
      header: "Nov",
      cell: ({ getValue }) => {
        const val = getValue() as number;
        if (!val) return <span className="text-slate-300">0.0</span>;
        return <span className="font-medium text-slate-800 dark:text-slate-200">{val.toFixed(1)}</span>;
      },
    },
    {
      accessorKey: "dec_present",
      header: "Dec",
      cell: ({ getValue }) => {
        const val = getValue() as number;
        if (!val) return <span className="text-slate-300">0.0</span>;
        return <span className="font-medium text-slate-800 dark:text-slate-200">{val.toFixed(1)}</span>;
      },
    },
    {
      accessorKey: "yearly_total_present",
      header: "Total P",
      cell: ({ getValue }) => {
        const val = getValue() as number;
        if (!val) return "0.0";
        return (
          <span className="inline-flex items-center justify-center px-2 py-0.5 font-bold text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 rounded">
            {val.toFixed(1)}
          </span>
        );
      },
    },
    {
      accessorKey: "yearly_total_absent",
      header: "Total A",
      cell: ({ getValue }) => {
        const val = getValue() as number;
        if (!val) return <span className="text-slate-300">0.0</span>;
        return (
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 font-bold text-xs bg-rose-50 text-rose-700 border border-rose-100 rounded">
            {val.toFixed(1)}
          </span>
        );
      },
    },
    {
      accessorKey: "yearly_total_leaves",
      header: "Total L",
      cell: ({ getValue }) => {
        const val = getValue() as number;
        if (!val) return "0.0";
        return (
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 font-bold text-xs bg-blue-50 text-blue-700 border border-blue-100 rounded">
            {val.toFixed(1)}
          </span>
        );
      },
    },
    {
      accessorKey: "yearly_total_weekly_offs",
      header: "Total WO",
      cell: ({ getValue }) => {
        const val = getValue() as number;
        return (
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 font-semibold text-xs bg-slate-50 text-slate-600 border border-slate-200/50 rounded dark:bg-slate-800 dark:text-slate-400">
            {val || 0}
          </span>
        );
      },
    },
    {
      accessorKey: "yearly_total_holidays",
      header: "Total H",
      cell: ({ getValue }) => {
        const val = getValue() as number;
        return (
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 font-semibold text-xs bg-amber-50 text-amber-700 border border-amber-200/50 rounded dark:bg-amber-950/20 dark:text-amber-400">
            {val || 0}
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
        tableElementClassName="min-w-[1700px]"
      />
    </div>
  );
};

export default YearlyMatrixPage;
