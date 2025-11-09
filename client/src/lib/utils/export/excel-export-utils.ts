import ExcelJS from 'exceljs';

/**
 * Generic Excel export utility
 * Reusable for exporting any tabular data to Excel
 */
export interface ExcelExportOptions {
  filename?: string;
  sheetName?: string;
  title?: string;
  includeMetadata?: boolean;
  columnWidths?: number[];
}

export interface ExcelExportColumn {
  header: string;
  key: string;
  width?: number;
  format?: (value: any) => string;
}

/**
 * Export data to Excel with professional formatting
 */
export async function exportToExcel(
  data: Record<string, any>[],
  columns: ExcelExportColumn[],
  options: ExcelExportOptions = {}
): Promise<void> {
  const {
    filename = 'export',
    sheetName = 'Data',
    title,
    includeMetadata = true,
    columnWidths,
  } = options;

  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Velocity ERP';
    workbook.created = new Date();
    workbook.modified = new Date();

    const worksheet = workbook.addWorksheet(sheetName);

    // Professional color scheme
    const colors = {
      headerBg: { argb: 'FF2563EB' }, // Blue-600
      headerText: { argb: 'FFFFFFFF' },
      border: { argb: 'FFE5E7EB' }, // Gray-200
      alternateRow: { argb: 'FFF9FAFB' }, // Gray-50
      white: { argb: 'FFFFFFFF' },
      text: { argb: 'FF1F2937' }, // Gray-800
      textSecondary: { argb: 'FF6B7280' }, // Gray-500
    };

    let currentRow = 1;

    // Add title if provided
    if (title) {
      const titleRow = worksheet.addRow([title]);
      titleRow.height = 32;
      titleRow.font = {
        bold: true,
        size: 20,
        color: colors.headerText,
      };
      titleRow.alignment = { horizontal: 'center', vertical: 'middle' };
      titleRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: colors.headerBg,
      };
      worksheet.mergeCells(1, 1, 1, columns.length);
      currentRow++;
      worksheet.addRow([]); // Empty row
      currentRow++;
    }

    // Add metadata if requested
    if (includeMetadata) {
      const exportDate = new Date().toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
      const metadataRow = worksheet.addRow([
        `Generated on: ${exportDate}`,
        '',
        '',
        `Total Records: ${data.length}`,
      ]);
      metadataRow.height = 22;
      metadataRow.font = {
        size: 10,
        color: colors.textSecondary,
        italic: true,
      };
      worksheet.mergeCells(currentRow, 1, currentRow, columns.length);
      const metadataCell = worksheet.getCell(currentRow, 1);
      metadataCell.alignment = { horizontal: 'right', vertical: 'middle' };
      metadataCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF8F9FA' },
      };
      currentRow++;
      worksheet.addRow([]); // Empty row
      currentRow++;
    }

    // Add headers
    const headers = columns.map((col) => col.header);
    const headerRow = worksheet.addRow(headers);
    headerRow.height = 28;
    headerRow.font = {
      bold: true,
      size: 11,
      color: colors.headerText,
    };
    headerRow.alignment = { horizontal: 'left', vertical: 'middle', wrapText: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: colors.headerBg,
    };

    // Style header cells
    headerRow.eachCell((cell) => {
      cell.border = {
        top: { style: 'thin', color: colors.border },
        left: { style: 'thin', color: colors.border },
        bottom: { style: 'thin', color: colors.border },
        right: { style: 'thin', color: colors.border },
      };
    });

    // Add data rows
    data.forEach((row, index) => {
      const rowData = columns.map((col) => {
        const value = row[col.key];
        if (col.format) {
          return col.format(value);
        }
        // Default formatting
        if (value === null || value === undefined) return '-';
        if (typeof value === 'boolean') return value ? 'Yes' : 'No';
        if (typeof value === 'object' && value instanceof Date) {
          return value.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
        }
        return String(value).trim();
      });

      const dataRow = worksheet.addRow(rowData);
      dataRow.height = 22;
      dataRow.alignment = { vertical: 'middle' };

      // Alternating row colors
      const isEvenRow = index % 2 === 0;
      const rowFillColor = isEvenRow ? colors.white : colors.alternateRow;

      // Style data cells
      dataRow.eachCell((cell) => {
        cell.font = {
          size: 10,
          color: colors.text,
        };
        cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: rowFillColor,
        };
        cell.border = {
          top: { style: 'thin', color: colors.border },
          left: { style: 'thin', color: colors.border },
          bottom: { style: 'thin', color: colors.border },
          right: { style: 'thin', color: colors.border },
        };
      });
    });

    // Set column widths
    columns.forEach((col, index) => {
      const width = columnWidths?.[index] ?? col.width ?? 18;
      worksheet.getColumn(index + 1).width = width;
    });

    // Generate and download file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw error;
  }
}

