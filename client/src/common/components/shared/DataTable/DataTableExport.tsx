// DataTable V2 - Lazy Excel Export
// Uses shared excel-export-utils for consistent global design (title, metadata, borders, freeze, styling)

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
import type { ExcelExportColumn } from "@/common/utils/export/excel-export-utils";

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

function formatCellValue(value: unknown): string {
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
  if (typeof value === "object" && value !== null) return "-";
  return String(value);
}

export function DataTableExport<TData>({
  data,
  columns,
  config = {},
  disabled = false,
  className,
}: DataTableExportProps<TData>) {
  const [progress, setProgress] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [exportStatus, setExportStatus] = useState<"idle" | "loading" | "processing" | "complete" | "error">("idle");

  const handleExport = useCallback(async () => {
    if (!data || data.length === 0) return;

    setShowDialog(true);
    setExportStatus("loading");
    setProgress(10);

    try {
      setProgress(20);
      const { exportToExcel } = await import("@/common/utils/export/excel-export-utils");

      setExportStatus("processing");
      setProgress(30);

      // Filter exportable columns (exclude action columns)
      const exportableColumns = columns.filter((col) => {
        const typedCol = col as { accessorKey?: string; accessorFn?: (row: unknown, index: number) => unknown };
        const isActionColumn =
          col.id?.toLowerCase().includes("action") ||
          col.id === "select";
        const hasDataSource = typedCol.accessorKey || col.id || typedCol.accessorFn;
        return hasDataSource && !isActionColumn;
      });

      setProgress(40);

      // Build ExcelExportColumn[] and flat data for shared export utility
      const excelColumns: ExcelExportColumn[] = exportableColumns.map((col) => {
        const typedCol = col as { accessorKey?: string };
        const key = typedCol.accessorKey || col.id || "";
        const header = typeof col.header === "string" ? col.header : key;
        return { header, key, width: Math.min(Math.max(header.length, 10), 35) };
      });

      const flatData: Record<string, string | number>[] = data.map((row) => {
        const record: Record<string, string | number> = {};
        exportableColumns.forEach((col, colIndex) => {
          const typedCol = col as { accessorKey?: string; accessorFn?: (row: { original: TData }, index: number) => unknown };
          const key = typedCol.accessorKey || col.id || "";
          if (!key) return;
          let value: unknown;
          if (typeof typedCol.accessorFn === "function") {
            const rowObj = { original: row };
            value = typedCol.accessorFn(rowObj, colIndex);
          } else {
            value = (row as Record<string, unknown>)[key];
          }
          record[key] = formatCellValue(value) as string | number;
        });
        return record;
      });

      setProgress(50);

      await exportToExcel(flatData, excelColumns, {
        filename: config.filename || "export",
        sheetName: config.sheetName || "Data Export",
        title: config.title,
        includeMetadata: true,
      });

      setProgress(100);
      setExportStatus("complete");

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

  const isExporting = exportStatus === "loading" || exportStatus === "processing";

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
