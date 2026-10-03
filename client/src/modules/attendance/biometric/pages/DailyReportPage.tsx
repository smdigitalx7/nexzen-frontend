import React, { useState, useMemo, useCallback } from "react";
import { useBiometricDailyReport } from "../hooks/useBiometricReports";
import { BiometricReportsService } from "../services/biometric-reports.service";
import { BiometricFilters } from "../components/BiometricFilters";
import { DataTable } from "@/common/components/shared/DataTable/DataTable";
import { Card, CardContent } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/common/components/ui/dropdown-menu";
import {
  Clock,
  Download,
  ChevronDown,
  FileText,
  FileSpreadsheet,
  FileDown,
  UserCheck,
  UserX,
  Loader2,
} from "lucide-react";
import { cn } from "@/common/utils";
import type { ColumnDef } from "@tanstack/react-table";
import type { DailyAttendanceRecord } from "../types/biometric-reports";
import type { ExcelExportColumn } from "@/common/utils/export/excel-export-utils";

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
  const [search, setSearch] = useState<string>("");
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  // Pagination State for UI Table
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Paginated Query for UI Table Rendering (Fast DOM)
  const queryParams = useMemo(() => ({
    attendanceDate: date || undefined,
    employeeId: employeeId || undefined,
    companyId: companyId || undefined,
    departmentId: departmentId || undefined,
    categoryId: categoryId || undefined,
    page,
    pageSize,
    search: search || undefined,
  }), [date, employeeId, companyId, departmentId, categoryId, page, pageSize, search]);

  const { data: reportData, isLoading, refetch } = useBiometricDailyReport(queryParams);

  const records: DailyAttendanceRecord[] = useMemo(() => {
    if (!reportData) return [];
    if (Array.isArray(reportData)) return reportData;
    if (Array.isArray(reportData.data)) return reportData.data;
    return [];
  }, [reportData]);

  const totalCount = useMemo(() => {
    if (!reportData) return 0;
    if (typeof reportData.total === "number") return reportData.total;
    if (Array.isArray(reportData)) return reportData.length;
    if (Array.isArray(reportData.data)) return reportData.data.length;
    return records.length;
  }, [reportData, records]);

  const presentCount = useMemo(() => records.filter(r => r.status_code?.toUpperCase() === "P").length, [records]);
  const absentCount = useMemo(() => records.filter(r => r.status_code?.toUpperCase() === "A").length, [records]);
  const lateCount = useMemo(() => records.filter(r => (r.late_by_minutes || 0) > 0).length, [records]);

  // On-Demand Full Dataset Fetcher for 100% Complete Reports (omits page & pageSize)
  const fetchAllForExport = async (): Promise<DailyAttendanceRecord[]> => {
    const res = await BiometricReportsService.fetchDailyReport({
      attendanceDate: date || undefined,
      employeeId: employeeId || undefined,
      companyId: companyId || undefined,
      departmentId: departmentId || undefined,
      categoryId: categoryId || undefined,
      search: search || undefined,
    });
    if (Array.isArray(res)) return res;
    if (Array.isArray(res?.data)) return res.data;
    return [];
  };

  const handleRefresh = async () => {
    setIsSyncing(true);
    try {
      const d = date ? new Date(date) : new Date();
      await BiometricReportsService.syncAttendance(d.getFullYear(), d.getMonth() + 1);
    } catch (err) {
      console.warn("Biometric sync failed, falling back to refetch:", err);
    } finally {
      await refetch();
      setIsSyncing(false);
    }
  };

  const handleReset = () => {
    setDate(todayStr);
    setEmployeeId(null);
    setCompanyId(null);
    setDepartmentId(null);
    setCategoryId(null);
    setSearch("");
    setPage(1);
  };

  const handleSearchChange = useCallback((newSearch: string) => {
    setSearch(newSearch);
    setPage(1);
  }, []);

  // CSV Exporter
  const exportToCSV = (data: DailyAttendanceRecord[], exportDate: string) => {
    const headers = [
      "S.No",
      "Attendance Date",
      "Emp Code",
      "Employee Name",
      "Designation",
      "Shift",
      "In Time",
      "Out Time",
      "Work Duration (Hrs)",
      "Late (Mins)",
      "Early (Mins)",
      "Status",
      "Overtime (Mins)",
    ];

    const rows = data.map((r, i) => [
      i + 1,
      `"${r.attendance_date || exportDate}"`,
      `"${r.employee_code || ""}"`,
      `"${(r.employee_name || "").replace(/"/g, '""')}"`,
      `"${(r.designation || "").replace(/"/g, '""')}"`,
      `"${(r.shift_fname || "").replace(/"/g, '""')}"`,
      `"${r.in_time || "-"}"`,
      `"${r.out_time || "-"}"`,
      r.work_duration_hours !== null && r.work_duration_hours !== undefined
        ? r.work_duration_hours.toFixed(2)
        : "0.00",
      r.late_by_minutes || 0,
      r.early_by_minutes || 0,
      `"${r.attendance_status || (r.status_code === "P" ? "Present" : r.status_code === "A" ? "Absent" : "-")}"`,
      r.over_time_minutes || 0,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `daily_biometric_attendance_${exportDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Excel Exporter
  const exportToExcelFormatted = async (
    data: DailyAttendanceRecord[],
    exportDate: string
  ) => {
    const { exportToExcel } = await import("@/common/utils/export/excel-export-utils");

    const excelColumns: ExcelExportColumn[] = [
      { header: "S.No", key: "sno", width: 8, alignment: "center" },
      { header: "Attendance Date", key: "attendance_date", width: 16, alignment: "center" },
      { header: "Employee Code", key: "employee_code", width: 16 },
      { header: "Employee Name", key: "employee_name", width: 28 },
      { header: "Designation", key: "designation", width: 22 },
      { header: "Shift", key: "shift_fname", width: 18 },
      { header: "In Time", key: "in_time", width: 14, alignment: "center" },
      { header: "Out Time", key: "out_time", width: 14, alignment: "center" },
      { header: "Work Hours", key: "work_duration_hours", width: 14, alignment: "right" },
      { header: "Late (Mins)", key: "late_by_minutes", width: 14, alignment: "right" },
      { header: "Early (Mins)", key: "early_by_minutes", width: 14, alignment: "right" },
      { header: "Status", key: "attendance_status", width: 16, alignment: "center" },
      { header: "OT (Mins)", key: "over_time_minutes", width: 14, alignment: "right" },
    ];

    const flatData = data.map((record, index) => ({
      sno: index + 1,
      attendance_date: record.attendance_date || exportDate,
      employee_code: record.employee_code || "-",
      employee_name: record.employee_name || "-",
      designation: record.designation || "-",
      shift_fname: record.shift_fname || "-",
      in_time: record.in_time || "-",
      out_time: record.out_time || "-",
      work_duration_hours: record.work_duration_hours ? Number(record.work_duration_hours.toFixed(2)) : 0,
      late_by_minutes: record.late_by_minutes || 0,
      early_by_minutes: record.early_by_minutes || 0,
      attendance_status: record.attendance_status || (record.status_code === "P" ? "Present" : record.status_code === "A" ? "Absent" : "-"),
      over_time_minutes: record.over_time_minutes || 0,
    }));

    await exportToExcel(flatData, excelColumns, {
      filename: `daily_biometric_attendance_${exportDate}.xlsx`,
      sheetName: "Daily Attendance",
      title: `DAILY BIOMETRIC ATTENDANCE REPORT - ${exportDate}`,
      subtitle: `Total: ${data.length} Employees | Present: ${presentCount} | Absent: ${absentCount} | Late: ${lateCount}`,
      companyName: "Velocity ERP",
      reportType: "Daily Attendance Report",
      dateRange: exportDate,
      includeMetadata: true,
      autoFilter: true,
      freezeHeader: true,
    });
  };

  // Download Daily Report Handler (Fetches 100% full dataset on-demand)
  const handleDownloadReport = async (
    format: "pdf" | "excel" | "csv" | "present_only" | "absent_only" | "late_only"
  ) => {
    try {
      setDownloading("Preparing report data...");
      const allRows = await fetchAllForExport();
      if (!allRows || allRows.length === 0) {
        setDownloading(null);
        return;
      }

      const pCount = allRows.filter(r => r.status_code?.toUpperCase() === "P").length;
      const aCount = allRows.filter(r => r.status_code?.toUpperCase() === "A").length;
      const lCount = allRows.filter(r => (r.late_by_minutes || 0) > 0).length;

      if (format === "pdf") {
        setDownloading("Downloading PDF report...");
        const { exportDailyAttendanceReportToPDF } = await import("../utils/pdfExport");
        const doc = await exportDailyAttendanceReportToPDF(allRows, date, `daily_biometric_attendance_${date}`);
        doc.save(`daily_biometric_attendance_${date}.pdf`);
      } else if (format === "present_only") {
        setDownloading("Downloading Present staff PDF...");
        const presentRecords = allRows.filter(r => r.status_code?.toUpperCase() === "P");
        const { exportDailyAttendanceReportToPDF } = await import("../utils/pdfExport");
        const doc = await exportDailyAttendanceReportToPDF(
          presentRecords,
          date,
          `daily_attendance_present_${date}`,
          "Filtered: Present Staff Only"
        );
        doc.save(`daily_attendance_present_${date}.pdf`);
      } else if (format === "absent_only") {
        setDownloading("Downloading Absent staff PDF...");
        const absentRecords = allRows.filter(r => r.status_code?.toUpperCase() === "A");
        const { exportDailyAttendanceReportToPDF } = await import("../utils/pdfExport");
        const doc = await exportDailyAttendanceReportToPDF(
          absentRecords,
          date,
          `daily_attendance_absent_${date}`,
          "Filtered: Absent Staff Only"
        );
        doc.save(`daily_attendance_absent_${date}.pdf`);
      } else if (format === "late_only") {
        setDownloading("Downloading Late arrivals PDF...");
        const lateRecords = allRows.filter(r => (r.late_by_minutes || 0) > 0);
        const { exportDailyAttendanceReportToPDF } = await import("../utils/pdfExport");
        const doc = await exportDailyAttendanceReportToPDF(
          lateRecords,
          date,
          `daily_attendance_late_${date}`,
          "Filtered: Late Arrivals Only"
        );
        doc.save(`daily_attendance_late_${date}.pdf`);
      } else if (format === "excel") {
        setDownloading("Downloading Excel spreadsheet...");
        await exportToExcelFormatted(allRows, date);
      } else if (format === "csv") {
        setDownloading("Downloading CSV data...");
        exportToCSV(allRows, date);
      }
    } catch (error) {
      console.error("Report download failed:", error);
    } finally {
      setDownloading(null);
    }
  };

  // WhatsApp Share Handler (Fetches 100% full dataset on-demand)
  const handleShareWhatsApp = useCallback(async () => {
    try {
      setDownloading("Preparing report for WhatsApp...");
      const allRows = await fetchAllForExport();
      if (!allRows || allRows.length === 0) {
        setDownloading(null);
        return;
      }

      const pCount = allRows.filter(r => r.status_code?.toUpperCase() === "P").length;
      const aCount = allRows.filter(r => r.status_code?.toUpperCase() === "A").length;
      const lCount = allRows.filter(r => (r.late_by_minutes || 0) > 0).length;
      const lvCount = allRows.filter(r => r.status_code?.toUpperCase() === "L").length;
      const hdCount = allRows.filter(r => r.status_code?.toUpperCase() === "HD").length;

      const { exportDailyAttendanceReportToPDF } = await import("../utils/pdfExport");
      const pdf = await exportDailyAttendanceReportToPDF(allRows, date, `daily_attendance_report_${date}`);

      const presentPercent = allRows.length > 0 ? Math.round((pCount / allRows.length) * 100) : 0;
      const absentPercent = allRows.length > 0 ? Math.round((aCount / allRows.length) * 100) : 0;

      let summaryText = `*Daily Attendance Summary - ${date}*\n`;
      summaryText += `• Present: ${pCount} (${presentPercent}%)\n`;
      summaryText += `• Absent: ${aCount} (${absentPercent}%)\n`;
      summaryText += `• Late: ${lCount}\n`;
      summaryText += `• Leave: ${lvCount}\n`;
      if (hdCount > 0) summaryText += `• Half Day: ${hdCount}\n`;
      summaryText += `Total Employees: ${allRows.length}`;

      const blob = pdf.output("blob");
      const file = new File([blob], `daily_attendance_report_${date}.pdf`, {
        type: "application/pdf",
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `Daily Biometric Attendance Report - ${date}`,
            text: summaryText,
          });
          return;
        } catch (shareError) {
          console.warn("Native share failed, falling back:", shareError);
        }
      }

      pdf.save(`daily_attendance_report_${date}.pdf`);

      let whatsappText = `${summaryText}\n\n`;
      whatsappText += `_Note: The complete PDF report ("daily_attendance_report_${date}.pdf") with all ${allRows.length} employees has been downloaded. You can attach it to this message._`;

      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`;
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("WhatsApp share failed:", error);
    } finally {
      setDownloading(null);
    }
  }, [date, employeeId, companyId, departmentId, categoryId]);

  // Dynamic row highlight: Absent rows in soft red, Present rows in subtle green
  const getRowClassName = useCallback((row: DailyAttendanceRecord) => {
    const code = row.status_code?.toUpperCase();
    if (code === "P") {
      return "bg-emerald-50/15 hover:bg-emerald-50/35 dark:bg-emerald-950/5 dark:hover:bg-emerald-950/10 text-emerald-950 dark:text-emerald-100 border-emerald-100/50";
    }
    if (code === "A") {
      return "bg-rose-50/25 hover:bg-rose-50/45 dark:bg-rose-950/15 dark:hover:bg-rose-950/25 text-rose-600 dark:text-rose-400 font-medium border-rose-100/50";
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
        if (!inTime) return <span className="text-slate-400">-</span>;
        const isLate = (row.original.late_by_minutes || 0) > 0;
        return (
          <span className={cn(
            "font-semibold",
            isLate ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
          )}>
            {inTime}
          </span>
        );
      },
    },
    {
      accessorKey: "out_time",
      header: "Out Time",
      cell: ({ row }) => {
        const outTime = row.original.out_time;
        if (!outTime) return <span className="text-slate-400">-</span>;
        const isEarly = (row.original.early_by_minutes || 0) > 0;
        return (
          <span className={cn(
            "font-semibold",
            isEarly ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
          )}>
            {outTime}
          </span>
        );
      },
    },
    {
      accessorKey: "work_duration_hours",
      header: "Work Hrs",
      cell: ({ row }) => {
        const hrs = row.original.work_duration_hours;
        if (hrs === null || hrs === undefined || hrs === 0) {
          return <span className={cn(row.original.status_code === "A" ? "text-rose-600 dark:text-rose-400" : "text-slate-400")}>0.00</span>;
        }
        const isFullDay = hrs >= 8.0;
        return (
          <span className={cn(
            "font-semibold",
            isFullDay ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"
          )}>
            {hrs.toFixed(2)}
          </span>
        );
      },
    },
    {
      accessorKey: "late_by_minutes",
      header: "Late (min)",
      cell: ({ row }) => {
        const late = row.original.late_by_minutes || 0;
        if (late > 0) {
          return (
            <span className="inline-flex items-center gap-1 text-rose-600 font-bold px-2 py-0.5 bg-rose-50 border border-rose-100 rounded text-xs dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400">
              <Clock className="h-3 w-3" />
              {late}
            </span>
          );
        }
        return <span className="text-slate-400">0</span>;
      },
    },
    {
      accessorKey: "early_by_minutes",
      header: "Early (min)",
      cell: ({ row }) => {
        const early = row.original.early_by_minutes || 0;
        if (early > 0) {
          return (
            <span className="inline-flex items-center gap-1 text-rose-600 font-bold px-2 py-0.5 bg-rose-50 border border-rose-100 rounded text-xs dark:bg-rose-950/20 dark:border-rose-900/30 dark:text-rose-400">
              {early}
            </span>
          );
        }
        return <span className="text-slate-400">0</span>;
      },
    },
    {
      accessorKey: "attendance_status",
      header: "Status",
      cell: ({ row }) => {
        const code = row.original.status_code?.toUpperCase();
        if (code === "P") {
          return (
            <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300">
              Present
            </Badge>
          );
        } else if (code === "A") {
          return (
            <Badge variant="destructive" className="bg-rose-100 text-rose-800 hover:bg-rose-100 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300">
              Absent
            </Badge>
          );
        } else if (code === "HD") {
          return (
            <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300">
              Half Day
            </Badge>
          );
        } else if (code === "WO") {
          return (
            <Badge className="bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200 dark:bg-slate-800 dark:text-slate-300">
              Weekly Off
            </Badge>
          );
        } else if (code === "L") {
          return (
            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300">
              Leave
            </Badge>
          );
        }
        return <Badge variant="outline">{row.original.attendance_status}</Badge>;
      },
    },
    {
      accessorKey: "over_time_minutes",
      header: "OT (min)",
      cell: ({ row }) => row.original.over_time_minutes || 0,
    },
  ], []);

  return (
    <div className={cn("space-y-6 relative", !isEmbedded && "p-6")}>
      {/* Simple Circle Spinner Loader during Report Download / WhatsApp Share */}
      {downloading && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs select-none"
          style={{ cursor: "wait" }}
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 animate-in fade-in zoom-in-95 duration-150">
            <Loader2 className="h-5 w-5 animate-spin text-slate-700 dark:text-slate-300 shrink-0" />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {downloading}
            </span>
          </div>
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <BiometricFilters
            showDate
            date={date}
            employeeId={employeeId}
            companyId={companyId}
            departmentId={departmentId}
            categoryId={categoryId}
            onDateChange={(val) => { setDate(val); setPage(1); }}
            onEmployeeChange={(val) => { setEmployeeId(val); setPage(1); }}
            onCompanyChange={(val) => { setCompanyId(val); setPage(1); }}
            onDepartmentChange={(val) => { setDepartmentId(val); setPage(1); }}
            onCategoryChange={(val) => { setCategoryId(val); setPage(1); }}
            onReset={handleReset}
            onRefresh={handleRefresh}
            isLoading={isLoading}
            isSyncing={isSyncing}
          />
        </CardContent>
      </Card>

      <DataTable
        data={records}
        columns={columns}
        title={isEmbedded ? undefined : `Daily Biometric Attendance Report (${totalCount} Employees)`}
        loading={isLoading || isSyncing}
        searchKey="employee_name"
        searchValue={search}
        onSearchChange={handleSearchChange}
        showSearch={true}
        emptyMessage="No biometric attendance records found"
        pagination="server"
        currentPage={page}
        totalCount={totalCount}
        onPageChange={setPage}
        pageSize={pageSize}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
        pageSizeOptions={[10, 25, 50, 100]}
        getRowClassName={getRowClassName}
        tableElementClassName="min-w-[1600px]"
        toolbarRightContent={
          <div className="flex items-center gap-2">
            {/* Share on WhatsApp Button */}
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:border-emerald-500 dark:text-emerald-400 dark:hover:bg-emerald-950/20"
              onClick={handleShareWhatsApp}
              disabled={records.length === 0 || !!downloading}
            >
              <WhatsAppIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              Share on WhatsApp
            </Button>

            {/* Professional Dropdown Button with Download Daily Report */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                  disabled={records.length === 0 || !!downloading}
                >
                  <Download className="h-4 w-4 text-slate-500" />
                  <span>Download Daily Report</span>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 opacity-80" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-lg border-slate-200 dark:border-slate-800">
                <DropdownMenuItem
                  onClick={() => handleDownloadReport("pdf")}
                  className="flex items-center gap-2.5 p-2 cursor-pointer text-sm"
                >
                  <FileText className="h-4 w-4 text-rose-500" />
                  <span>Download as PDF</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => handleDownloadReport("excel")}
                  className="flex items-center gap-2.5 p-2 cursor-pointer text-sm"
                >
                  <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                  <span>Download as Excel</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => handleDownloadReport("csv")}
                  className="flex items-center gap-2.5 p-2 cursor-pointer text-sm"
                >
                  <FileDown className="h-4 w-4 text-blue-500" />
                  <span>Download as CSV</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1" />

                <DropdownMenuItem
                  onClick={() => handleDownloadReport("present_only")}
                  className="flex items-center justify-between p-2 cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Present Staff Only</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">({presentCount})</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => handleDownloadReport("absent_only")}
                  className="flex items-center justify-between p-2 cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2">
                    <UserX className="h-3.5 w-3.5 text-rose-500" />
                    <span>Absent Staff Only</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">({absentCount})</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={() => handleDownloadReport("late_only")}
                  className="flex items-center justify-between p-2 cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-amber-500" />
                    <span>Late Arrivals Only</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">({lateCount})</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />
    </div>
  );
};

export default DailyReportPage;
