import React, { useState, useMemo, useCallback } from "react";
import { useBiometricMonthlyMatrix } from "../hooks/useBiometricReports";
import { BiometricFilters } from "../components/BiometricFilters";
import { DataTable } from "@/common/components/shared/DataTable/DataTable";
import { Card, CardContent } from "@/common/components/ui/card";
import { Button } from "@/common/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/common/components/ui/dropdown-menu";
import { RefreshCw, Download, ChevronDown, FileText, FileSpreadsheet, FileDown, Loader2 } from "lucide-react";
import { BiometricReportsService } from "../services/biometric-reports.service";
import type { ColumnDef } from "@tanstack/react-table";
import type { MonthlyMatrixRecord } from "../types/biometric-reports";
import type { ExcelExportColumn } from "@/common/utils/export/excel-export-utils";

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month, 0).getDate();
};

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436.002 9.858-4.417 9.86-9.858.002-2.637-1.01-5.116-2.858-6.97-1.848-1.854-4.321-2.875-6.962-2.875-5.44 0-9.862 4.418-9.864 9.86-.001 1.71.458 3.38 1.328 4.871l-.999 3.65 3.754-.984zm12.16-5.834c-.11-.082-.647-.32-7.47-.674-.11-.055-.19-.082-.26-.01l-.31.39c-.08.1-.16.11-.27.055-.11-.055-.46-.17-.878-.543-.325-.29-.544-.648-.607-.758-.063-.11-.007-.169.049-.224.05-.05.11-.12.165-.18.056-.06.074-.1.112-.17.037-.07.019-.13-.009-.19-.028-.06-.252-.607-.346-.832-.09-.22-.19-.19-.26-.19-.06-.003-.13-.003-.2-.003-.07 0-.18.026-.278.134-.097.108-.372.364-.372.887s.38.1.43.14c.05.04.747 1.14 1.8 1.594.25.1.445.17.596.22.25.08.477.067.657.04.2-.03.647-.264.737-.52.09-.254.09-.472.063-.52-.027-.046-.1-.082-.21-.136z" />
  </svg>
);

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
  const [search, setSearch] = useState<string>("");

  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  // Pagination State for UI Table (Fast DOM)
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Paginated query for on-screen table
  const queryParams = useMemo(() => ({
    year,
    month,
    employeeId: employeeId || undefined,
    companyId: companyId || undefined,
    departmentId: departmentId || undefined,
    categoryId: categoryId || undefined,
    page,
    pageSize,
    search: search || undefined,
  }), [year, month, employeeId, companyId, departmentId, categoryId, page, pageSize, search]);

  const { data: reportData, isLoading, refetch } = useBiometricMonthlyMatrix(queryParams);

  const records = useMemo(() => {
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

  const handleRefresh = async () => {
    setIsSyncing(true);
    try {
      await BiometricReportsService.syncAttendance(year, month);
    } catch (err) {
      console.warn("Biometric sync failed, falling back to refetch:", err);
    } finally {
      await refetch();
      setIsSyncing(false);
    }
  };

  const handleReset = () => {
    setYear(currentYear);
    setMonth(currentMonth);
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

  // Fetch 100% full dataset unpaginated directly from backend
  const fetchAllForExport = async (): Promise<MonthlyMatrixRecord[]> => {
    const res = await BiometricReportsService.fetchMonthlyMatrix({
      year,
      month,
      employeeId: employeeId || undefined,
      companyId: companyId || undefined,
      departmentId: departmentId || undefined,
      categoryId: categoryId || undefined,
      search: search || undefined,
    });
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    return [];
  };

  // CSV Exporter
  const exportToCSV = (data: MonthlyMatrixRecord[], exportYear: number, exportMonth: number) => {
    const days = getDaysInMonth(exportYear, exportMonth);
    const headers = [
      "S.No",
      "Employee Code",
      "Employee Name",
      "Department",
      ...Array.from({ length: days }, (_, i) => `Day ${i + 1}`),
      "Total Present",
      "Total Absent",
      "Total Leaves",
      "Total Weekly Offs",
      "Total Holidays",
    ];

    const rows = data.map((r, i) => {
      const dayValues = Array.from({ length: days }, (_, d) => {
        const val = r[`day_${d + 1}`];
        return `"${val ? String(val) : "-"}"`;
      });

      return [
        i + 1,
        `"${r.employee_code || ""}"`,
        `"${(r.employee_name || "").replace(/"/g, '""')}"`,
        `"${(r.department_sname || "").replace(/"/g, '""')}"`,
        ...dayValues,
        (r.total_present || 0).toFixed(1),
        (r.total_absent || 0).toFixed(1),
        (r.total_leaves || 0).toFixed(1),
        r.total_weekly_offs || 0,
        r.total_holidays || 0,
      ];
    });

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `monthly_attendance_matrix_${exportYear}_${exportMonth}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Excel Exporter
  const exportToExcelFormatted = async (
    data: MonthlyMatrixRecord[],
    exportYear: number,
    exportMonth: number
  ) => {
    const { exportToExcel } = await import("@/common/utils/export/excel-export-utils");
    const days = getDaysInMonth(exportYear, exportMonth);

    const excelColumns: ExcelExportColumn[] = [
      { header: "S.No", key: "sno", width: 8, alignment: "center" },
      { header: "Emp Code", key: "employee_code", width: 16 },
      { header: "Employee Name", key: "employee_name", width: 28 },
      { header: "Department", key: "department_sname", width: 22 },
    ];

    for (let d = 1; d <= days; d++) {
      excelColumns.push({
        header: `${d}`,
        key: `day_${d}`,
        width: 6,
        alignment: "center",
      });
    }

    excelColumns.push(
      { header: "Present (P)", key: "total_present", width: 14, alignment: "right" },
      { header: "Absent (A)", key: "total_absent", width: 14, alignment: "right" },
      { header: "Leaves (L)", key: "total_leaves", width: 14, alignment: "right" },
      { header: "Weekly Off", key: "total_weekly_offs", width: 12, alignment: "right" },
      { header: "Holidays", key: "total_holidays", width: 12, alignment: "right" }
    );

    const flatData = data.map((record, index) => {
      const rowObj: Record<string, any> = {
        sno: index + 1,
        employee_code: record.employee_code || "-",
        employee_name: record.employee_name || "-",
        department_sname: record.department_sname || "-",
        total_present: Number((record.total_present || 0).toFixed(1)),
        total_absent: Number((record.total_absent || 0).toFixed(1)),
        total_leaves: Number((record.total_leaves || 0).toFixed(1)),
        total_weekly_offs: record.total_weekly_offs || 0,
        total_holidays: record.total_holidays || 0,
      };

      for (let d = 1; d <= days; d++) {
        rowObj[`day_${d}`] = record[`day_${d}`] || "-";
      }

      return rowObj;
    });

    const monthName = new Date(exportYear, exportMonth - 1).toLocaleString("default", { month: "long" });

    await exportToExcel(flatData, excelColumns, {
      filename: `monthly_attendance_matrix_${exportYear}_${exportMonth}.xlsx`,
      sheetName: "Monthly Matrix",
      title: `MONTHLY ATTENDANCE MATRIX - ${monthName.toUpperCase()} ${exportYear}`,
      subtitle: `Total Employees: ${data.length}`,
      companyName: "Velocity ERP",
      reportType: "Monthly Matrix Report",
      dateRange: `${monthName} ${exportYear}`,
      includeMetadata: true,
      autoFilter: true,
      freezeHeader: true,
    });
  };

  // Download Handler
  const handleDownloadReport = async (format: "pdf" | "excel" | "csv") => {
    try {
      setDownloading("Preparing report data...");
      const allRows = await fetchAllForExport();
      if (!allRows || allRows.length === 0) {
        setDownloading(null);
        return;
      }

      if (format === "pdf") {
        setDownloading("Downloading PDF matrix...");
        const { exportMonthlyMatrixToPDF } = await import("../utils/pdfExport");
        const doc = await exportMonthlyMatrixToPDF(allRows, year, month);
        doc.save(`monthly_attendance_matrix_${year}_${month}.pdf`);
      } else if (format === "excel") {
        setDownloading("Downloading Excel spreadsheet...");
        await exportToExcelFormatted(allRows, year, month);
      } else if (format === "csv") {
        setDownloading("Downloading CSV data...");
        exportToCSV(allRows, year, month);
      }
    } catch (error) {
      console.error("Monthly matrix export failed:", error);
    } finally {
      setDownloading(null);
    }
  };

  // WhatsApp Share Handler
  const handleShareWhatsApp = useCallback(async () => {
    try {
      setDownloading("Preparing matrix report for WhatsApp...");
      const allRows = await fetchAllForExport();
      if (!allRows || allRows.length === 0) {
        setDownloading(null);
        return;
      }

      const { exportMonthlyMatrixToPDF } = await import("../utils/pdfExport");
      const pdf = await exportMonthlyMatrixToPDF(allRows, year, month);

      const monthName = new Date(year, month - 1).toLocaleString("default", { month: "long" });
      const totalP = allRows.reduce((acc, r) => acc + (r.total_present || 0), 0);
      const totalA = allRows.reduce((acc, r) => acc + (r.total_absent || 0), 0);
      const totalL = allRows.reduce((acc, r) => acc + (r.total_leaves || 0), 0);

      let summaryText = `*Monthly Attendance Matrix - ${monthName} ${year}*\n`;
      summaryText += `• Total Employees: ${allRows.length}\n`;
      summaryText += `• Total Present Count: ${totalP.toFixed(1)}\n`;
      summaryText += `• Total Absent Count: ${totalA.toFixed(1)}\n`;
      summaryText += `• Total Leaves Count: ${totalL.toFixed(1)}\n`;

      const blob = pdf.output("blob");
      const file = new File([blob], `monthly_attendance_matrix_${year}_${month}.pdf`, {
        type: "application/pdf",
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `Monthly Attendance Matrix - ${monthName} ${year}`,
            text: summaryText,
          });
          return;
        } catch (shareError) {
          console.warn("Native share failed, falling back:", shareError);
        }
      }

      pdf.save(`monthly_attendance_matrix_${year}_${month}.pdf`);

      let whatsappText = `${summaryText}\n`;
      whatsappText += `_Note: The complete PDF matrix ("monthly_attendance_matrix_${year}_${month}.pdf") with all ${allRows.length} employees has been downloaded. You can attach it to this message._`;

      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`;
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("WhatsApp share failed:", error);
    } finally {
      setDownloading(null);
    }
  }, [year, month, employeeId, companyId, departmentId, categoryId]);

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
            showYear
            showMonth
            year={year}
            month={month}
            employeeId={employeeId}
            companyId={companyId}
            departmentId={departmentId}
            categoryId={categoryId}
            onYearChange={(val) => { setYear(val); setPage(1); }}
            onMonthChange={(val) => { setMonth(val); setPage(1); }}
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
        title={`Monthly Attendance Matrix Grid (${totalCount} Total)`}
        loading={isLoading || isSyncing}
        searchKey="employee_name"
        searchValue={search}
        onSearchChange={handleSearchChange}
        export={{ enabled: false }}
        showSearch={true}
        emptyMessage="No biometric attendance matrix records found"
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
        tableElementClassName="min-w-[2000px]"
        toolbarRightContent={
          <div className="flex items-center gap-2">
            {/* WhatsApp Share Button */}
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

            {/* Professional Dropdown Button with Download Monthly Matrix */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                  disabled={records.length === 0 || !!downloading}
                >
                  <Download className="h-4 w-4 text-slate-500" />
                  <span>Download Monthly Matrix</span>
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
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />
    </div>
  );
};

export default MonthlyMatrixPage;
