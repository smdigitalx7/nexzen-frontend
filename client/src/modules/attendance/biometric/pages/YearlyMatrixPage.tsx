import React, { useState, useMemo, useCallback } from "react";
import { useBiometricYearlyMatrix } from "../hooks/useBiometricReports";
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
import { Download, ChevronDown, FileText, FileSpreadsheet, FileDown, Loader2 } from "lucide-react";
import { BiometricReportsService } from "../services/biometric-reports.service";
import type { ColumnDef } from "@tanstack/react-table";
import type { YearlyMatrixRecord } from "../types/biometric-reports";
import type { ExcelExportColumn } from "@/common/utils/export/excel-export-utils";

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436.002 9.858-4.417 9.86-9.858.002-2.637-1.01-5.116-2.858-6.97-1.848-1.854-4.321-2.875-6.962-2.875-5.44 0-9.862 4.418-9.864 9.86-.001 1.71.458 3.38 1.328 4.871l-.999 3.65 3.754-.984zm12.16-5.834c-.11-.082-.647-.32-7.47-.674-.11-.055-.19-.082-.26-.01l-.31.39c-.08.1-.16.11-.27.055-.11-.055-.46-.17-.878-.543-.325-.29-.544-.648-.607-.758-.063-.11-.007-.169.049-.224.05-.05.11-.12.165-.18.056-.06.074-.1.112-.17.037-.07.019-.13-.009-.19-.028-.06-.252-.607-.346-.832-.09-.22-.19-.19-.26-.19-.06-.003-.13-.003-.2-.003-.07 0-.18.026-.278.134-.097.108-.372.364-.372.887s.38.1.43.14c.05.04.747 1.14 1.8 1.594.25.1.445.17.596.22.25.08.477.067.657.04.2-.03.647-.264.737-.52.09-.254.09-.472.063-.52-.027-.046-.1-.082-.21-.136z" />
  </svg>
);

const YearlyMatrixPage = () => {
  const currentYear = new Date().getFullYear();

  // Filters State
  const [year, setYear] = useState<number>(currentYear);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [companyId, setCompanyId] = useState<number | null>(null);
  const [departmentId, setDepartmentId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [search, setSearch] = useState<string>("");

  const [downloading, setDownloading] = useState<string | null>(null);

  // Pagination State for UI Table (Fast DOM)
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Paginated query for on-screen table
  const queryParams = useMemo(() => ({
    year,
    employeeId: employeeId || undefined,
    companyId: companyId || undefined,
    departmentId: departmentId || undefined,
    categoryId: categoryId || undefined,
    page,
    pageSize,
    search: search || undefined,
  }), [year, employeeId, companyId, departmentId, categoryId, page, pageSize, search]);

  const { data: reportData, isLoading, refetch } = useBiometricYearlyMatrix(queryParams);

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

  const handleReset = () => {
    setYear(currentYear);
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
  const fetchAllForExport = async (): Promise<YearlyMatrixRecord[]> => {
    const res = await BiometricReportsService.fetchYearlyMatrix({
      year,
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
  const exportToCSV = (data: YearlyMatrixRecord[], exportYear: number) => {
    const headers = [
      "S.No",
      "Year",
      "Employee Code",
      "Employee Name",
      "Department",
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
      "Total Present",
      "Total Absent",
      "Total Leaves",
      "Total Weekly Offs",
      "Total Holidays",
    ];

    const rows = data.map((r, i) => [
      i + 1,
      r.report_year || exportYear,
      `"${r.employee_code || ""}"`,
      `"${(r.employee_name || "").replace(/"/g, '""')}"`,
      `"${(r.department_sname || "").replace(/"/g, '""')}"`,
      (r.jan_present || 0).toFixed(1),
      (r.feb_present || 0).toFixed(1),
      (r.mar_present || 0).toFixed(1),
      (r.apr_present || 0).toFixed(1),
      (r.may_present || 0).toFixed(1),
      (r.jun_present || 0).toFixed(1),
      (r.jul_present || 0).toFixed(1),
      (r.aug_present || 0).toFixed(1),
      (r.sep_present || 0).toFixed(1),
      (r.oct_present || 0).toFixed(1),
      (r.nov_present || 0).toFixed(1),
      (r.dec_present || 0).toFixed(1),
      (r.yearly_total_present || 0).toFixed(1),
      (r.yearly_total_absent || 0).toFixed(1),
      (r.yearly_total_leaves || 0).toFixed(1),
      r.yearly_total_weekly_offs || 0,
      r.yearly_total_holidays || 0,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `yearly_attendance_matrix_${exportYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Excel Exporter
  const exportToExcelFormatted = async (
    data: YearlyMatrixRecord[],
    exportYear: number
  ) => {
    const { exportToExcel } = await import("@/common/utils/export/excel-export-utils");

    const excelColumns: ExcelExportColumn[] = [
      { header: "S.No", key: "sno", width: 8, alignment: "center" },
      { header: "Emp Code", key: "employee_code", width: 16 },
      { header: "Employee Name", key: "employee_name", width: 28 },
      { header: "Department", key: "department_sname", width: 22 },
      { header: "Jan", key: "jan_present", width: 10, alignment: "right" },
      { header: "Feb", key: "feb_present", width: 10, alignment: "right" },
      { header: "Mar", key: "mar_present", width: 10, alignment: "right" },
      { header: "Apr", key: "apr_present", width: 10, alignment: "right" },
      { header: "May", key: "may_present", width: 10, alignment: "right" },
      { header: "Jun", key: "jun_present", width: 10, alignment: "right" },
      { header: "Jul", key: "jul_present", width: 10, alignment: "right" },
      { header: "Aug", key: "aug_present", width: 10, alignment: "right" },
      { header: "Sep", key: "sep_present", width: 10, alignment: "right" },
      { header: "Oct", key: "oct_present", width: 10, alignment: "right" },
      { header: "Nov", key: "nov_present", width: 10, alignment: "right" },
      { header: "Dec", key: "dec_present", width: 10, alignment: "right" },
      { header: "Total P", key: "yearly_total_present", width: 12, alignment: "right" },
      { header: "Total A", key: "yearly_total_absent", width: 12, alignment: "right" },
      { header: "Total L", key: "yearly_total_leaves", width: 12, alignment: "right" },
      { header: "Weekly Off", key: "yearly_total_weekly_offs", width: 12, alignment: "right" },
      { header: "Holidays", key: "yearly_total_holidays", width: 12, alignment: "right" },
    ];

    const flatData = data.map((record, index) => ({
      sno: index + 1,
      employee_code: record.employee_code || "-",
      employee_name: record.employee_name || "-",
      department_sname: record.department_sname || "-",
      jan_present: Number((record.jan_present || 0).toFixed(1)),
      feb_present: Number((record.feb_present || 0).toFixed(1)),
      mar_present: Number((record.mar_present || 0).toFixed(1)),
      apr_present: Number((record.apr_present || 0).toFixed(1)),
      may_present: Number((record.may_present || 0).toFixed(1)),
      jun_present: Number((record.jun_present || 0).toFixed(1)),
      jul_present: Number((record.jul_present || 0).toFixed(1)),
      aug_present: Number((record.aug_present || 0).toFixed(1)),
      sep_present: Number((record.sep_present || 0).toFixed(1)),
      oct_present: Number((record.oct_present || 0).toFixed(1)),
      nov_present: Number((record.nov_present || 0).toFixed(1)),
      dec_present: Number((record.dec_present || 0).toFixed(1)),
      yearly_total_present: Number((record.yearly_total_present || 0).toFixed(1)),
      yearly_total_absent: Number((record.yearly_total_absent || 0).toFixed(1)),
      yearly_total_leaves: Number((record.yearly_total_leaves || 0).toFixed(1)),
      yearly_total_weekly_offs: record.yearly_total_weekly_offs || 0,
      yearly_total_holidays: record.yearly_total_holidays || 0,
    }));

    await exportToExcel(flatData, excelColumns, {
      filename: `yearly_attendance_matrix_${exportYear}.xlsx`,
      sheetName: "Yearly Matrix",
      title: `YEARLY ATTENDANCE MATRIX - ${exportYear}`,
      subtitle: `Total Employees: ${data.length}`,
      companyName: "Velocity ERP",
      reportType: "Yearly Matrix Report",
      dateRange: `${exportYear}`,
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
        const { exportYearlyMatrixToPDF } = await import("../utils/pdfExport");
        const doc = await exportYearlyMatrixToPDF(allRows, year);
        doc.save(`yearly_attendance_matrix_${year}.pdf`);
      } else if (format === "excel") {
        setDownloading("Downloading Excel spreadsheet...");
        await exportToExcelFormatted(allRows, year);
      } else if (format === "csv") {
        setDownloading("Downloading CSV data...");
        exportToCSV(allRows, year);
      }
    } catch (error) {
      console.error("Yearly matrix export failed:", error);
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

      const { exportYearlyMatrixToPDF } = await import("../utils/pdfExport");
      const pdf = await exportYearlyMatrixToPDF(allRows, year);

      const totalP = allRows.reduce((acc, r) => acc + (r.yearly_total_present || 0), 0);
      const totalA = allRows.reduce((acc, r) => acc + (r.yearly_total_absent || 0), 0);
      const totalL = allRows.reduce((acc, r) => acc + (r.yearly_total_leaves || 0), 0);

      let summaryText = `*Yearly Attendance Matrix - ${year}*\n`;
      summaryText += `• Total Employees: ${allRows.length}\n`;
      summaryText += `• Total Present Count: ${totalP.toFixed(1)}\n`;
      summaryText += `• Total Absent Count: ${totalA.toFixed(1)}\n`;
      summaryText += `• Total Leaves Count: ${totalL.toFixed(1)}\n`;

      const blob = pdf.output("blob");
      const file = new File([blob], `yearly_attendance_matrix_${year}.pdf`, {
        type: "application/pdf",
      });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: `Yearly Attendance Matrix - ${year}`,
            text: summaryText,
          });
          return;
        } catch (shareError) {
          console.warn("Native share failed, falling back:", shareError);
        }
      }

      pdf.save(`yearly_attendance_matrix_${year}.pdf`);

      let whatsappText = `${summaryText}\n`;
      whatsappText += `_Note: The complete PDF matrix ("yearly_attendance_matrix_${year}.pdf") with all ${allRows.length} employees has been downloaded. You can attach it to this message._`;

      const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`;
      window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("WhatsApp share failed:", error);
    } finally {
      setDownloading(null);
    }
  }, [year, employeeId, companyId, departmentId, categoryId]);

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
      accessorKey: "jan_present",
      header: "Jan",
      cell: ({ getValue }) => {
        const val = getValue() as number;
        if (!val) return <span className="text-slate-300">0.0</span>;
        return <span className="font-semibold text-emerald-700 dark:text-emerald-400">{val.toFixed(1)}</span>;
      },
    },
    {
      accessorKey: "feb_present",
      header: "Feb",
      cell: ({ getValue }) => {
        const val = getValue() as number;
        if (!val) return <span className="text-slate-300">0.0</span>;
        return <span className="font-semibold text-emerald-700 dark:text-emerald-400">{val.toFixed(1)}</span>;
      },
    },
    {
      accessorKey: "mar_present",
      header: "Mar",
      cell: ({ getValue }) => {
        const val = getValue() as number;
        if (!val) return <span className="text-slate-300">0.0</span>;
        return <span className="font-semibold text-emerald-700 dark:text-emerald-400">{val.toFixed(1)}</span>;
      },
    },
    {
      accessorKey: "apr_present",
      header: "Apr",
      cell: ({ getValue }) => {
        const val = getValue() as number;
        if (!val) return <span className="text-slate-300">0.0</span>;
        return <span className="font-semibold text-emerald-700 dark:text-emerald-400">{val.toFixed(1)}</span>;
      },
    },
    {
      accessorKey: "may_present",
      header: "May",
      cell: ({ getValue }) => {
        const val = getValue() as number;
        if (!val) return <span className="text-slate-300">0.0</span>;
        return <span className="font-semibold text-emerald-700 dark:text-emerald-400">{val.toFixed(1)}</span>;
      },
    },
    {
      accessorKey: "jun_present",
      header: "Jun",
      cell: ({ getValue }) => {
        const val = getValue() as number;
        if (!val) return <span className="text-slate-300">0.0</span>;
        return <span className="font-semibold text-emerald-700 dark:text-emerald-400">{val.toFixed(1)}</span>;
      },
    },
    {
      accessorKey: "jul_present",
      header: "Jul",
      cell: ({ getValue }) => {
        const val = getValue() as number;
        if (!val) return <span className="text-slate-300">0.0</span>;
        return <span className="font-semibold text-emerald-700 dark:text-emerald-400">{val.toFixed(1)}</span>;
      },
    },
    {
      accessorKey: "aug_present",
      header: "Aug",
      cell: ({ getValue }) => {
        const val = getValue() as number;
        if (!val) return <span className="text-slate-300">0.0</span>;
        return <span className="font-semibold text-emerald-700 dark:text-emerald-400">{val.toFixed(1)}</span>;
      },
    },
    {
      accessorKey: "sep_present",
      header: "Sep",
      cell: ({ getValue }) => {
        const val = getValue() as number;
        if (!val) return <span className="text-slate-300">0.0</span>;
        return <span className="font-semibold text-emerald-700 dark:text-emerald-400">{val.toFixed(1)}</span>;
      },
    },
    {
      accessorKey: "oct_present",
      header: "Oct",
      cell: ({ getValue }) => {
        const val = getValue() as number;
        if (!val) return <span className="text-slate-300">0.0</span>;
        return <span className="font-semibold text-emerald-700 dark:text-emerald-400">{val.toFixed(1)}</span>;
      },
    },
    {
      accessorKey: "nov_present",
      header: "Nov",
      cell: ({ getValue }) => {
        const val = getValue() as number;
        if (!val) return <span className="text-slate-300">0.0</span>;
        return <span className="font-semibold text-emerald-700 dark:text-emerald-400">{val.toFixed(1)}</span>;
      },
    },
    {
      accessorKey: "dec_present",
      header: "Dec",
      cell: ({ getValue }) => {
        const val = getValue() as number;
        if (!val) return <span className="text-slate-300">0.0</span>;
        return <span className="font-semibold text-emerald-700 dark:text-emerald-400">{val.toFixed(1)}</span>;
      },
    },
    {
      accessorKey: "yearly_total_present",
      header: "Total P",
      cell: ({ getValue }) => {
        const val = getValue() as number;
        if (!val) return "0.0";
        return (
          <span className="inline-flex items-center justify-center px-2.5 py-0.5 font-bold text-xs bg-emerald-50 text-emerald-700 border border-emerald-100 rounded">
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
            year={year}
            employeeId={employeeId}
            companyId={companyId}
            departmentId={departmentId}
            categoryId={categoryId}
            onYearChange={(val) => { setYear(val); setPage(1); }}
            onEmployeeChange={(val) => { setEmployeeId(val); setPage(1); }}
            onCompanyChange={(val) => { setCompanyId(val); setPage(1); }}
            onDepartmentChange={(val) => { setDepartmentId(val); setPage(1); }}
            onCategoryChange={(val) => { setCategoryId(val); setPage(1); }}
            onReset={handleReset}
            onRefresh={refetch}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>

      <DataTable
        data={records}
        columns={columns}
        title={`Yearly Attendance Matrix Grid (${totalCount} Total)`}
        loading={isLoading}
        searchKey="employee_name"
        searchValue={search}
        onSearchChange={handleSearchChange}
        export={{ enabled: false }}
        showSearch={true}
        emptyMessage="No biometric attendance yearly matrix records found"
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
        tableElementClassName="min-w-[1700px]"
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

            {/* Professional Dropdown Button with Download Yearly Matrix */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 gap-1.5 border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200"
                  disabled={records.length === 0 || !!downloading}
                >
                  <Download className="h-4 w-4 text-slate-500" />
                  <span>Download Yearly Matrix</span>
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

export default YearlyMatrixPage;
