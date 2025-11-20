import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface ExportData {
  headers: string[];
  rows: (string | number)[][];
  sheetName: string;
  fileName: string;
}

export interface ExportProgress {
  progress: number;
  status: 'processing' | 'completed' | 'error';
  message?: string;
}

export const useExcelExport = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const { toast } = useToast();

  const exportToExcel = useCallback(async (data: ExportData) => {
    setIsExporting(true);
    setExportProgress({
      progress: 0,
      status: 'processing',
      message: 'Initializing export...',
    });

    return new Promise<void>((resolve, reject) => {
      try {
        // Check if Web Workers are supported
        if (typeof Worker === 'undefined') {
          // Fallback to synchronous export
          console.warn('Web Workers not supported, using synchronous export');
          exportSynchronously(data, setExportProgress)
            .then(() => {
              setIsExporting(false);
              setExportProgress(null);
              toast({
                title: 'Export Successful',
                description: `${data.fileName} has been exported successfully.`,
                variant: 'success',
              });
              resolve();
            })
            .catch((error) => {
              setIsExporting(false);
              setExportProgress(null);
              toast({
                title: 'Export Failed',
                description: error.message || 'An error occurred during export.',
                variant: 'destructive',
              });
              reject(error);
            });
          return;
        }

        // Use Web Worker for export
        // ✅ FIX: Use inline worker or fallback to synchronous export
        let worker: Worker | null = null;
        try {
          // Try to create Web Worker
          const workerUrl = new URL('../../workers/excel-export.worker.ts', import.meta.url);
          worker = new Worker(workerUrl, { type: 'module' });
        } catch (error) {
          // Fallback to synchronous export if Web Worker fails
          console.warn('Web Worker creation failed, using synchronous export:', error);
          exportSynchronously(data, setExportProgress)
            .then(() => {
              setIsExporting(false);
              setExportProgress(null);
              toast({
                title: 'Export Successful',
                description: `${data.fileName} has been exported successfully.`,
                variant: 'success',
              });
              resolve();
            })
            .catch((exportError) => {
              setIsExporting(false);
              setExportProgress(null);
              toast({
                title: 'Export Failed',
                description: exportError.message || 'An error occurred during export.',
                variant: 'destructive',
              });
              reject(exportError);
            });
          return;
        }

        worker.onmessage = (e: MessageEvent<ExportProgress & { buffer?: ArrayBuffer; fileName?: string }>) => {
          const { progress, status, message, buffer, fileName } = e.data;

          setExportProgress({
            progress,
            status,
            message,
          });

          if (status === 'completed' && buffer && fileName) {
            // Download the file
            const blob = new Blob([buffer], {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
            URL.revokeObjectURL(url);

            setIsExporting(false);
            setExportProgress(null);
            worker.terminate();

            toast({
              title: 'Export Successful',
              description: `${fileName} has been exported successfully.`,
              variant: 'success',
            });
            resolve();
          } else if (status === 'error') {
            setIsExporting(false);
            setExportProgress(null);
            worker.terminate();

            toast({
              title: 'Export Failed',
              description: message || 'An error occurred during export.',
              variant: 'destructive',
            });
            reject(new Error(message || 'Export failed'));
          }
        };

        worker.onerror = (error) => {
          setIsExporting(false);
          setExportProgress(null);
          if (worker) {
            worker.terminate();
          }

          // Fallback to synchronous export on worker error
          console.warn('Web Worker error, falling back to synchronous export:', error);
          exportSynchronously(data, setExportProgress)
            .then(() => {
              setIsExporting(false);
              setExportProgress(null);
              toast({
                title: 'Export Successful',
                description: `${data.fileName} has been exported successfully.`,
                variant: 'success',
              });
              resolve();
            })
            .catch((exportError) => {
              setIsExporting(false);
              setExportProgress(null);
              toast({
                title: 'Export Failed',
                description: exportError.message || 'An error occurred during export.',
                variant: 'destructive',
              });
              reject(exportError);
            });
        };

        // Start export
        if (worker) {
          worker.postMessage(data);
        }
      } catch (error) {
        setIsExporting(false);
        setExportProgress(null);
        toast({
          title: 'Export Failed',
          description: error instanceof Error ? error.message : 'An error occurred during export.',
          variant: 'destructive',
        });
        reject(error);
      }
    });
  }, [toast]);

  return {
    exportToExcel,
    isExporting,
    exportProgress,
  };
};

// Fallback synchronous export function
async function exportSynchronously(
  data: ExportData,
  setProgress: (progress: ExportProgress) => void
): Promise<void> {
  const ExcelJS = (await import('exceljs')).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Velocity ERP';
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet(data.sheetName);

  // Header row
  const headerRow = worksheet.addRow(data.headers);
  headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF2C3E50' },
  };
  headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
  headerRow.height = 25;

  // Data rows
  data.rows.forEach((row) => {
    const worksheetRow = worksheet.addRow(row);
    worksheetRow.alignment = { vertical: 'middle' };
  });

  // Set column widths
  worksheet.columns.forEach((column, index) => {
    if (column) {
      const headerLength = data.headers[index]?.length || 10;
      const maxContentLength = Math.max(
        headerLength,
        ...data.rows.map((row) => String(row[index] || '').length)
      );
      column.width = Math.min(Math.max(maxContentLength + 2, 10), 50);
    }
  });

  // Add borders
  worksheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' },
      };
    });
  });

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = data.fileName;
  a.click();
  URL.revokeObjectURL(url);
}

