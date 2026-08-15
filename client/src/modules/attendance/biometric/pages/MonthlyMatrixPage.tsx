import React, { useState, useMemo } from "react";
import { useBiometricMonthlyMatrix } from "../hooks/useBiometricReports";
import { BiometricFilters } from "../components/BiometricFilters";
import { DataTable } from "@/common/components/shared/DataTable/DataTable";
import { Card, CardContent } from "@/common/components/ui/card";
import type { ColumnDef } from "@tanstack/react-table";
import type { MonthlyMatrixRecord } from "../types/biometric-reports";

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month, 0).getDate();
};

const MonthlyMatrixPage = () => {
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

  const { data: reportData, isLoading, refetch } = useBiometricMonthlyMatrix(queryParams);

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

  const columns = useMemo((): ColumnDef<MonthlyMatrixRecord>[] => {
    const days = getDaysInMonth(year, month);
    const baseCols: ColumnDef<MonthlyMatrixRecord>[] = [
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
    ];

    // Day columns 1 to 31
    for (let d = 1; d <= 31; d++) {
      baseCols.push({
        id: `day_${d}`,
        header: `${d}`,
        cell: ({ row }) => {
          if (d > days) {
            return (
              <div className="flex items-center justify-center h-full w-full bg-slate-100/50 dark:bg-slate-800/50 text-slate-400 select-none min-w-[28px] text-[10px] py-1 rounded">
                -
              </div>
            );
          }
          const val = row.original[`day_${d}`] as string;
          if (val === null || val === undefined) {
            return <span className="text-slate-300">-</span>;
          }

          let styleClass = "flex items-center justify-center font-semibold rounded text-[11px] min-w-[28px] h-6 py-0.5 ";
          switch (val.toUpperCase()) {
            case "P":
              styleClass += "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200/50";
              break;
            case "A":
              styleClass += "bg-rose-100 text-rose-800 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200/50";
              break;
            case "WO":
              styleClass += "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200/30";
              break;
            case "H":
              styleClass += "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200/50";
              break;
            case "L":
              styleClass += "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400 border border-blue-200/50";
              break;
            default:
              styleClass += "bg-slate-50 text-slate-600";
          }
          return <span className={styleClass}>{val}</span>;
        },
      });
    }

    baseCols.push(
      {
        accessorKey: "total_present",
        header: "P",
        cell: ({ getValue }) => {
          const val = getValue() as number;
          if (!val) return "0.0";
          return (
            <span className="inline-flex items-center justify-center w-8 h-6 font-bold text-xs bg-emerald-50 text-emerald-700 border border-emerald-200/50 rounded dark:bg-emerald-950/20 dark:text-emerald-400">
              {val.toFixed(1)}
            </span>
          );
        },
      },
      {
        accessorKey: "total_absent",
        header: "A",
        cell: ({ getValue }) => {
          const val = getValue() as number;
          if (!val) return <span className="text-slate-300">0.0</span>;
          return (
            <span className="inline-flex items-center justify-center w-8 h-6 font-bold text-xs bg-rose-50 text-rose-700 border border-rose-200/50 rounded dark:bg-rose-950/20 dark:text-rose-400">
              {val.toFixed(1)}
            </span>
          );
        },
      },
      {
        accessorKey: "total_leaves",
        header: "L",
        cell: ({ getValue }) => {
          const val = getValue() as number;
          if (!val) return "0.0";
          return (
            <span className="inline-flex items-center justify-center w-8 h-6 font-bold text-xs bg-blue-50 text-blue-700 border border-blue-200/50 rounded dark:bg-blue-950/20 dark:text-blue-400">
              {val.toFixed(1)}
            </span>
          );
        },
      },
      {
        accessorKey: "total_weekly_offs",
        header: "WO",
        cell: ({ getValue }) => {
          const val = getValue() as number;
          return (
            <span className="inline-flex items-center justify-center w-8 h-6 font-semibold text-xs bg-slate-50 text-slate-600 border border-slate-200/50 rounded dark:bg-slate-800 dark:text-slate-400">
              {val || 0}
            </span>
          );
        },
      },
      {
        accessorKey: "total_holidays",
        header: "H",
        cell: ({ getValue }) => {
          const val = getValue() as number;
          return (
            <span className="inline-flex items-center justify-center w-8 h-6 font-semibold text-xs bg-amber-50 text-amber-700 border border-amber-200/50 rounded dark:bg-amber-950/20 dark:text-amber-400">
              {val || 0}
            </span>
          );
        },
      }
    );

    return baseCols;
  }, [year, month]);

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
        title="Monthly Attendance Matrix Grid"
        loading={isLoading}
        searchKey="employee_name"
        export={{ enabled: true, filename: "monthly_biometric_matrix_grid" }}
        showSearch={true}
        emptyMessage="No biometric attendance matrix records found"
        pagination="server"
        currentPage={page}
        totalCount={totalCount}
        onPageChange={handlePageChange}
        pageSize={pageSize}
        onPageSizeChange={handlePageSizeChange}
        pageSizeOptions={[10, 25, 50, 100]}
        tableElementClassName="min-w-[2000px]"
      />
    </div>
  );
};

export default MonthlyMatrixPage;
