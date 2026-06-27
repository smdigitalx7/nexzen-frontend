import React, { useState, useMemo } from "react";
import { useBiometricDailyReport } from "../hooks/useBiometricReports";
import { BiometricFilters } from "../components/BiometricFilters";
import { DataTable } from "@/common/components/shared/DataTable/DataTable";
import { Card, CardContent } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { Clock } from "lucide-react";
import { cn } from "@/common/utils";
import type { ColumnDef } from "@tanstack/react-table";
import type { DailyAttendanceRecord } from "../types/biometric-reports";

const DailyReportPage = () => {
  const todayStr = new Date().toISOString().split("T")[0];

  // Filters State
  const [date, setDate] = useState<string>(todayStr);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);

  // Pagination State
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const queryParams = useMemo(() => ({
    attendanceDate: date || undefined,
    employeeId: employeeId || undefined,
    companyId: companyId || undefined,
    departmentId: departmentId || undefined,
    categoryId: categoryId || undefined,
    page,
    pageSize,
  }), [date, employeeId, companyId, departmentId, categoryId, page, pageSize]);

  const { data: reportData, isLoading, refetch } = useBiometricDailyReport(queryParams);

  const records = useMemo(() => reportData?.data || [], [reportData]);
  const totalCount = useMemo(() => reportData?.total || 0, [reportData]);

  const handleReset = () => {
    setDate(todayStr);
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

  const columns = useMemo((): ColumnDef<DailyAttendanceRecord>[] => [
    {
      accessorKey: "attendance_date",
      header: "Date",
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
      accessorKey: "shift_fname",
      header: "Shift",
    },
    {
      accessorKey: "in_time",
      header: "In Time",
      cell: ({ row }) => {
        const inTime = row.original.in_time;
        const isLate = row.original.late_by_minutes > 0;
        if (!inTime) return "-";
        return (
          <span className={cn(isLate && "text-rose-600 font-semibold dark:text-rose-400")}>
            {inTime}
          </span>
        );
      },
    },
    {
      accessorKey: "out_time",
      header: "Out Time",
      cell: ({ row }) => row.original.out_time || "-",
    },
    {
      accessorKey: "work_duration_hours",
      header: "Work Hrs",
      cell: ({ row }) => row.original.work_duration_hours?.toFixed(2) || "0.00",
    },
    {
      accessorKey: "late_by_minutes",
      header: "Late (min)",
      cell: ({ row }) => {
        const late = row.original.late_by_minutes;
        if (late > 0) {
          return (
            <span className="inline-flex items-center gap-1 text-rose-600 font-bold px-2 py-0.5 bg-rose-50 border border-rose-100 rounded text-xs dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400">
              <Clock className="h-3 w-3" />
              {late}
            </span>
          );
        }
        return late || "0";
      },
    },
    {
      accessorKey: "early_by_minutes",
      header: "Early (min)",
    },
    {
      accessorKey: "attendance_status",
      header: "Status",
      cell: ({ row }) => {
        const code = row.original.status_code?.toUpperCase();
        let variant: "default" | "secondary" | "outline" | "destructive" = "default";
        
        if (code === "P") {
          return (
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200">
              Present
            </Badge>
          );
        } else if (code === "A") {
          variant = "destructive";
        } else if (code === "WO" || code === "H") {
          variant = "secondary";
        } else if (code === "L") {
          return (
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200">
              Leave
            </Badge>
          );
        }
        
        return <Badge variant={variant}>{row.original.attendance_status}</Badge>;
      },
    },
    {
      accessorKey: "over_time_minutes",
      header: "OT (min)",
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
            showDate
            date={date}
            employeeId={employeeId}
            companyId={companyId}
            departmentId={departmentId}
            categoryId={categoryId}
            onDateChange={setDate}
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
        title="Daily Biometric Attendance Report"
        loading={isLoading}
        searchKey="employee_name"
        export={{ enabled: true, filename: "daily_biometric_attendance_report" }}
        showSearch={true}
        emptyMessage="No biometric attendance records found"
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

export default DailyReportPage;
