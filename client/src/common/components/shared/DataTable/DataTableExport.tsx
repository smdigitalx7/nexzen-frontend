// DataTable V2 - Lazy Excel Export
// Only loads ExcelJS when user actually clicks export

import { useState, useCallback } from "react";
import { Download, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Progress } from "@/common/components/ui/progress";
import type { ColumnDef } from "@tanstack/react-table";

interface ExportConfig {
  filename?: string;
  sheetName?: string;
  title?: string;
}

interface DataTableExportProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  config?: ExportConfig;
  disabled?: boolean;
  className?: string;
}

export function DataTableExport<TData>({
  data,
  columns,
  config = {},
  disabled = false,
  className,
}: DataTableExportProps<TData>) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [exportStatus, setExportStatus] = useState<"idle" | "loading" | "processing" | "complete" | "error">("idle");

  const handleExport = useCallback(async () => {
    if (data.length === 0) return;

    setShowDialog(true);
    setExportStatus("loading");
    setProgress(10);

    try {
      // Lazy load ExcelJS - only when user actually exports
      setProgress(20);
      const ExcelJSModule = await import("exceljs");
      const ExcelJS = ExcelJSModule.default || ExcelJSModule;

      setExportStatus("processing");
      setProgress(30);

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(config.sheetName || "Data Export");

      // Professional styling
      worksheet.properties.defaultRowHeight = 20;

      // Filter exportable columns (exclude action columns)
      const exportableColumns = columns.filter((col) => {
        const typedCol = col as any;
        const isActionColumn = 
          col.id?.toLowerCase().includes("action") ||
          col.id === "select";
        return typedCol.accessorKey && !isActionColumn;
      });

      setProgress(40);

      // Add title if provided
      if (config.title) {
        const titleRow = worksheet.addRow([config.title]);
        titleRow.font = { bold: true, size: 14 };
        titleRow.height = 25;
        worksheet.mergeCells(1, 1, 1, exportableColumns.length);
        worksheet.addRow([]); // Empty row for spacing
      }

      // Add headers
      const headers = exportableColumns.map((col) => {
        const typedCol = col as any;
        if (typeof col.header === "string") return col.header;
        return typedCol.accessorKey || col.id || "";
      });

      const headerRow = worksheet.addRow(headers);
      headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
      headerRow.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF374151" },
      };
      headerRow.height = 24;

      setProgress(50);

      // Add data rows
      const totalRows = data.length;
      let processedRows = 0;

      for (const row of data) {
        const rowData = exportableColumns.map((col) => {
          const typedCol = col as any;
          const key = typedCol.accessorKey;
          if (!key) return "";

          const value = (row as Record<string, unknown>)[key];

          // Format values
          if (value === null || value === undefined) return "-";
          if (typeof value === "boolean") return value ? "Yes" : "No";
          if (value instanceof Date) {
            return value.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            });
          }
          if (typeof value === "number") {
            return Number.isInteger(value)
              ? value.toLocaleString()
              : value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          }
          return String(value);
        });

        const dataRow = worksheet.addRow(rowData);
        dataRow.height = 20;

        // Alternating row colors
        if (processedRows % 2 === 1) {
          dataRow.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFF9FAFB" },
          };
        }

        processedRows++;
        setProgress(50 + Math.floor((processedRows / totalRows) * 40));
      }

      // Auto-fit columns
      exportableColumns.forEach((_, index) => {
        const column = worksheet.getColumn(index + 1);
        let maxLength = 10;
        column.eachCell?.({ includeEmpty: true }, (cell: any) => {
          const length = cell.value ? String(cell.value).length : 10;
          maxLength = Math.max(maxLength, Math.min(length, 40));
        });
        column.width = maxLength + 2;
      });

      setProgress(95);

      // Generate and download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${config.filename || "export"}_${new Date().toISOString().split("T")[0]}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);

      setProgress(100);
      setExportStatus("complete");

      // Auto-close after success
      setTimeout(() => {
        setShowDialog(false);
        setExportStatus("idle");
        setProgress(0);
      }, 1500);

    } catch (error) {
      console.error("Export failed:", error);
      setExportStatus("error");
    }
  }, [data, columns, config]);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExport}
        disabled={disabled || data.length === 0 || isExporting}
        className={className}
      >
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {exportStatus === "complete" ? (
                <>
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  Export Complete
                </>
              ) : exportStatus === "error" ? (
                "Export Failed"
              ) : (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Exporting Data...
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {exportStatus === "loading" && "Loading export library..."}
              {exportStatus === "processing" && `Processing ${data.length} rows...`}
              {exportStatus === "complete" && "Your file has been downloaded."}
              {exportStatus === "error" && "Something went wrong. Please try again."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2 text-center">
              {progress}%
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
