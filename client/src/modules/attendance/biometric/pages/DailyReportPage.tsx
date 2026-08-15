import React, { useState, useMemo, useCallback } from "react";
import { useBiometricDailyReport } from "../hooks/useBiometricReports";
import { BiometricFilters } from "../components/BiometricFilters";
import { DataTable } from "@/common/components/shared/DataTable/DataTable";
import { Card, CardContent } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Clock } from "lucide-react";
import { cn } from "@/common/utils";
import type { ColumnDef } from "@tanstack/react-table";
import type { DailyAttendanceRecord } from "../types/biometric-reports";

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436.002 9.858-4.417 9.86-9.858.002-2.637-1.01-5.116-2.858-6.97-1.848-1.854-4.321-2.875-6.962-2.875-5.44 0-9.862 4.418-9.864 9.86-.001 1.71.458 3.38 1.328 4.871l-.999 3.65 3.754-.984zm12.16-5.834c-.11-.082-.647-.32-7.47-.674-.11-.055-.19-.082-.26-.01l-.31.39c-.08.1-.16.11-.27.055-.11-.055-.46-.17-.878-.543-.325-.29-.544-.648-.607-.758-.063-.11-.007-.169.049-.224.05-.05.11-.12.165-.18.056-.06.074-.1.112-.17.037-.07.019-.13-.009-.19-.028-.06-.252-.607-.346-.832-.09-.22-.19-.19-.26-.19-.06-.003-.13-.003-.2-.003-.07 0-.18.026-.278.134-.097.108-.372.364-.372.887s.38.1.43.14c.05.04.747 1.14 1.8 1.594.25.1.445.17.596.22.25.08.477.067.657.04.2-.03.647-.264.737-.52.09-.254.09-.472.063-.52-.027-.046-.1-.082-.21-.136z" />
  </svg>
);

interface DailyReportPageProps {
  isEmbedded?: boolean;
}

const DailyReportPage = ({ isEmbedded = false }: DailyReportPageProps) => {
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

  // Whatsapp Share Handler
  const handleShareWhatsApp = useCallback(async () => {
    if (!records || records.length === 0) return;

    try {
      // 1. Generate PDF
      const { exportDailyAttendanceReportToPDF } = await import("../utils/pdfExport");
      const pdf = await exportDailyAttendanceReportToPDF(records, date);
      
      const presentCount = records.filter(r => r.status_code?.toUpperCase() === "P").length;
      const absentCount = records.filter(r => r.status_code?.toUpperCase() === "A").length;
      const lateCount = records.filter(r => r.late_by_minutes > 0).length;
      const leaveCount = records.filter(r => r.status_code?.toUpperCase() === "L").length;

      // Concise, clean text summary
      let summaryText = `*Daily Attendance Summary - ${date}*\n`;
      summaryText += `• Present: ${presentCount}\n`;
      summaryText += `• Absent: ${absentCount}\n`;
      summaryText += `• Late: ${lateCount}\n`;
      summaryText += `• Leave: ${leaveCount}\n`;
      summaryText += `Total: ${records.length} Employees.`;

      // 2. Try native web sharing (attaches actual PDF on mobile & supported desktops)
      const blob = pdf.output("blob");
      const file = new File([blob], `daily_attendance_report_${date}.pdf`, {
        type: "application/pdf"
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `Daily Attendance Report - ${date}`,
            text: summaryText
          });
          return; // Shared natively
        } catch (shareError) {
          console.warn("Native share failed, falling back:", shareError);
        }
      }

      // 3. Fallback: Save PDF locally and open WhatsApp link
      pdf.save(`daily_attendance_report_${date}.pdf`);

      let whatsappText = `${summaryText}\n\n`;
      whatsappText += `_Note: The detailed PDF report ("daily_attendance_report_${date}.pdf") has been downloaded. You can attach it to this WhatsApp message._`;

      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`;
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("WhatsApp share failed:", error);
    }
  }, [records, date]);

  // Dynamic row highlight callback
  const getRowClassName = useCallback((row: DailyAttendanceRecord) => {
    const code = row.status_code?.toUpperCase();
    if (code === "P") {
      return "bg-emerald-50/15 hover:bg-emerald-50/35 dark:bg-emerald-950/5 dark:hover:bg-emerald-950/10 text-emerald-900 dark:text-emerald-100 border-emerald-100/50";
    }
    if (code === "A") {
      return "bg-rose-50/25 hover:bg-rose-50/45 dark:bg-rose-950/10 dark:hover:bg-rose-950/15 text-rose-900 dark:text-rose-100 border-rose-100/50";
    }
    return "";
  }, []);

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
    <div className={cn("space-y-6", !isEmbedded && "p-6")}>
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
        title={isEmbedded ? undefined : "Daily Biometric Attendance Report"}
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
        getRowClassName={getRowClassName}
        tableElementClassName="min-w-[1600px]"
        toolbarRightContent={
          <Button
            variant="outline"
            className="h-8 gap-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-950/20"
            onClick={handleShareWhatsApp}
          >
            <WhatsAppIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            Share on WhatsApp
          </Button>
        }
      />
    </div>
  );
};

export default DailyReportPage;
