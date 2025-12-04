import { useState, useCallback } from 'react';
import { useToast } from '@/common/hooks/use-toast';

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
        // ✅ FIX: Use synchronous export directly (Web Worker file doesn't exist)
        // Synchronous export works well for most use cases and avoids worker setup complexity
        setExportProgress({
          progress: 50,
          status: 'processing',
          message: 'Generating Excel file...',
        });

        exportSynchronously(data, setExportProgress)
          .then(() => {
            setIsExporting(false);
            setExportProgress({
              progress: 100,
              status: 'completed',
              message: 'Export completed',
            });
            setTimeout(() => {
              setExportProgress(null);
            }, 500);
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

// Synchronous export function
async function exportSynchronously(
  data: ExportData,
  setProgress: (progress: ExportProgress) => void
): Promise<void> {
  try {
    setProgress({
      progress: 10,
      status: 'processing',
      message: 'Loading Excel library...',
    });

    const ExcelJS = (await import('exceljs')).default;
    
    setProgress({
      progress: 20,
      status: 'processing',
      message: 'Creating workbook...',
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Velocity ERP';
    workbook.created = new Date();
    workbook.modified = new Date();

    const worksheet = workbook.addWorksheet(data.sheetName);

    setProgress({
      progress: 30,
      status: 'processing',
      message: 'Adding headers...',
    });

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

    setProgress({
      progress: 40,
      status: 'processing',
      message: 'Adding data rows...',
    });

    // Data rows
    const totalRows = data.rows.length;
    data.rows.forEach((row, index) => {
      const worksheetRow = worksheet.addRow(row);
      worksheetRow.alignment = { vertical: 'middle' };
      
      // Update progress for large datasets
      if (totalRows > 100 && index % Math.ceil(totalRows / 10) === 0) {
        const progress = 40 + Math.floor((index / totalRows) * 30);
        setProgress({
          progress,
          status: 'processing',
          message: `Processing row ${index + 1} of ${totalRows}...`,
        });
      }
    });

    setProgress({
      progress: 70,
      status: 'processing',
      message: 'Formatting columns...',
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

    setProgress({
      progress: 80,
      status: 'processing',
      message: 'Applying formatting...',
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

    setProgress({
      progress: 90,
      status: 'processing',
      message: 'Generating file...',
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    
    setProgress({
      progress: 95,
      status: 'processing',
      message: 'Preparing download...',
    });

    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = data.fileName;
    a.click();
    URL.revokeObjectURL(url);

    setProgress({
      progress: 100,
      status: 'completed',
      message: 'Export completed',
    });
  } catch (error) {
    setProgress({
      progress: 0,
      status: 'error',
      message: error instanceof Error ? error.message : 'Export failed',
    });
    throw error;
  }
}

