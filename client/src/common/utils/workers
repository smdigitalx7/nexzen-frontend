// Web Worker for Excel export to prevent UI blocking
import ExcelJS from 'exceljs';

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

self.onmessage = async (e: MessageEvent<ExportData>) => {
  const { headers, rows, sheetName, fileName } = e.data;

  try {
    // Send initial progress
    self.postMessage({
      progress: 0,
      status: 'processing' as const,
      message: 'Initializing export...',
    } as ExportProgress);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Velocity ERP';
    workbook.created = new Date();
    workbook.modified = new Date();

    const worksheet = workbook.addWorksheet(sheetName);

    // Header row with styling
    const headerRow = worksheet.addRow(headers);
    headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2C3E50' },
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'middle' };
    headerRow.height = 25;

    // Send progress update
    self.postMessage({
      progress: 10,
      status: 'processing' as const,
      message: 'Adding data rows...',
    } as ExportProgress);

    // Process rows in chunks to allow progress updates
    const chunkSize = 100;
    const totalRows = rows.length;

    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      
      chunk.forEach((row) => {
        const worksheetRow = worksheet.addRow(row);
        worksheetRow.alignment = { vertical: 'middle' };
      });

      // Send progress update
      const progress = Math.min(10 + Math.floor((i / totalRows) * 70), 80);
      self.postMessage({
        progress,
        status: 'processing' as const,
        message: `Processing ${Math.min(i + chunkSize, totalRows)} of ${totalRows} rows...`,
      } as ExportProgress);

      // Yield to prevent blocking
      await new Promise((resolve) => setTimeout(resolve, 0));
    }

    // Send progress update
    self.postMessage({
      progress: 80,
      status: 'processing' as const,
      message: 'Formatting worksheet...',
    } as ExportProgress);

    // Set column widths (auto-size based on content)
    worksheet.columns.forEach((column, index) => {
      if (column) {
        const headerLength = headers[index]?.length || 10;
        const maxContentLength = Math.max(
          headerLength,
          ...rows.map((row) => String(row[index] || '').length)
        );
        column.width = Math.min(Math.max(maxContentLength + 2, 10), 50);
      }
    });

    // Add borders to all cells
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

    // Send progress update
    self.postMessage({
      progress: 90,
      status: 'processing' as const,
      message: 'Generating file...',
    } as ExportProgress);

    // Generate Excel file buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Send completion with buffer
    self.postMessage({
      progress: 100,
      status: 'completed' as const,
      message: 'Export completed',
      buffer: buffer,
      fileName: fileName,
    } as ExportProgress & { buffer: ArrayBuffer; fileName: string });
  } catch (error) {
    // Send error
    self.postMessage({
      progress: 0,
      status: 'error' as const,
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    } as ExportProgress);
  }
};

