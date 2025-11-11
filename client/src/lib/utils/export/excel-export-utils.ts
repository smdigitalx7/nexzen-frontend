import ExcelJS from 'exceljs';

/**
 * Enhanced Excel export utility with professional and creative design
 * Reusable for exporting any tabular data to Excel
 */

export interface ExcelExportOptions {
  filename?: string;
  sheetName?: string;
  title?: string;
  subtitle?: string;
  includeMetadata?: boolean;
  columnWidths?: number[];
  freezeHeader?: boolean;
  autoFilter?: boolean;
  showGridlines?: boolean;
  companyName?: string;
  reportType?: string;
  dateRange?: string;
  customFooter?: string;
}

export interface ExcelExportColumn {
  header: string;
  key: string;
  width?: number;
  format?: (value: any) => string;
  alignment?: 'left' | 'center' | 'right';
  numberFormat?: string;
  bold?: boolean;
  highlight?: boolean; // Highlight this column with light background
  maxWidth?: number; // Maximum width for this column
  minWidth?: number; // Minimum width for this column
}

/**
 * Professional neutral color palette for Excel exports
 * Corporate-grade design with excellent readability
 */
const EXCEL_COLORS = {
  // Primary Neutral Colors - Professional Gray Scale
  primary: { argb: 'FF374151' }, // Gray-700 - Professional Dark Gray
  primaryLight: { argb: 'FF4B5563' }, // Gray-600
  primaryDark: { argb: 'FF1F2937' }, // Gray-800 - Very Dark Gray
  
  // Accent Colors (for status indicators only)
  accent: { argb: 'FF10B981' }, // Emerald Green
  accentLight: { argb: 'FF34D399' }, // Light Green
  warning: { argb: 'FFF59E0B' }, // Amber
  danger: { argb: 'FFEF4444' }, // Red
  info: { argb: 'FF6B7280' }, // Gray-500
  
  // Header Colors - Professional Dark Gray
  headerBg: { argb: 'FF374151' }, // Gray-700 - Professional Dark Gray
  headerText: { argb: 'FFFFFFFF' }, // White - High Contrast
  headerSecondary: { argb: 'FF4B5563' }, // Gray-600
  headerBorder: { argb: 'FF1F2937' }, // Gray-800 - Dark Border
  
  // Border Colors - Subtle and Professional
  border: { argb: 'FFD1D5DB' }, // Gray-300 - Standard Border
  borderLight: { argb: 'FFE5E7EB' }, // Gray-200 - Light Border
  borderMedium: { argb: 'FF9CA3AF' }, // Gray-400 - Medium Border
  borderDark: { argb: 'FF6B7280' }, // Gray-500 - Dark Border
  
  // Row Colors - Alternating for Readability
  alternateRow: { argb: 'FFF9FAFB' }, // Gray-50 - Very Light Gray
  alternateRowDark: { argb: 'FFF3F4F6' }, // Gray-100 - Light Gray
  white: { argb: 'FFFFFFFF' }, // Pure White
  
  // Text Colors - High Contrast for Readability
  text: { argb: 'FF111827' }, // Gray-900 - Very Dark Text
  textSecondary: { argb: 'FF4B5563' }, // Gray-600 - Secondary Text
  textMuted: { argb: 'FF6B7280' }, // Gray-500 - Muted Text
  textLight: { argb: 'FF9CA3AF' }, // Gray-400 - Light Text
  
  // Background Colors - Neutral and Professional
  bgLight: { argb: 'FFF8F9FA' }, // Very Light Gray
  bgPrimary: { argb: 'FFF3F4F6' }, // Gray-100 - Light Background
  bgSecondary: { argb: 'FFE5E7EB' }, // Gray-200 - Medium Background
  bgSuccess: { argb: 'FFECFDF5' }, // Green-50
  bgWarning: { argb: 'FFFFFBEB' }, // Amber-50
  bgDanger: { argb: 'FFFEF2F2' }, // Red-50
};

/**
 * Enhanced Excel export with professional styling
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
    subtitle,
    includeMetadata = true,
    columnWidths,
    freezeHeader = true,
    autoFilter = true,
    showGridlines = false,
    companyName = 'Velonex ERP',
    reportType,
    dateRange,
    customFooter,
  } = options;

  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = companyName;
    workbook.created = new Date();
    workbook.modified = new Date();
    workbook.lastModifiedBy = companyName;

    const worksheet = workbook.addWorksheet(sheetName);

    // Worksheet properties for better viewing
    worksheet.properties.defaultRowHeight = 20;
    worksheet.views = [
      {
        state: 'frozen',
        ySplit: freezeHeader ? (title ? 4 : 2) : 0,
        activeCell: 'A1',
        showGridLines: showGridlines,
      },
    ];

    let currentRow = 1;

    // ============================================
    // HEADER SECTION - Modern Clean Design
    // ============================================
    if (title) {
      // Main Title Row - Clean and Modern
      const titleRow = worksheet.addRow([title]);
      titleRow.height = 32;
      titleRow.font = {
        name: 'Calibri',
        bold: true,
        size: 16,
        color: EXCEL_COLORS.text,
      };
      titleRow.alignment = { 
        horizontal: 'left', 
        vertical: 'middle',
        wrapText: false 
      };
      titleRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: EXCEL_COLORS.white,
      };
      
      // Merge and style title
      worksheet.mergeCells(1, 1, 1, columns.length);
      const titleCell = worksheet.getCell(1, 1);
      titleCell.border = {
        bottom: { style: 'medium', color: EXCEL_COLORS.headerBg },
      };
      
      currentRow++;
      
      // Subtitle Row (if provided) - Clean styling
      if (subtitle) {
        const subtitleRow = worksheet.addRow([subtitle]);
        subtitleRow.height = 20;
        subtitleRow.font = {
          name: 'Calibri',
          size: 11,
          color: EXCEL_COLORS.textSecondary,
        };
        subtitleRow.alignment = { 
          horizontal: 'left', 
          vertical: 'middle' 
        };
        subtitleRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: EXCEL_COLORS.white,
        };
        worksheet.mergeCells(currentRow, 1, currentRow, columns.length);
        currentRow++;
      }
      
      // Spacer row
      worksheet.addRow([]);
      currentRow++;
    }

    // ============================================
    // METADATA SECTION - Enhanced Design
    // ============================================
    if (includeMetadata) {
      const metadataRow = worksheet.addRow([]);
      metadataRow.height = 22;
      
      // Left side metadata - Clean format
      const leftMetadata = [
        companyName,
        reportType ? reportType : null,
        dateRange ? dateRange : null,
      ].filter(Boolean).join(' • ');
      
      // Right side metadata - Clean date format
      const now = new Date();
      const exportDate = `${now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })} at ${now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      })}`;
      const rightMetadata = `Total Records: ${data.length} | Generated: ${exportDate}`;
      
      // Create metadata cells
      const metadataCell1 = worksheet.getCell(currentRow, 1);
      metadataCell1.value = leftMetadata;
      metadataCell1.font = {
        name: 'Calibri',
        size: 9,
        color: EXCEL_COLORS.textSecondary,
      };
      metadataCell1.alignment = { horizontal: 'left', vertical: 'middle' };
      metadataCell1.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: EXCEL_COLORS.white,
      };
      
      const metadataCell2 = worksheet.getCell(currentRow, columns.length);
      metadataCell2.value = rightMetadata;
      metadataCell2.font = {
        name: 'Calibri',
        size: 9,
        color: EXCEL_COLORS.textSecondary,
      };
      metadataCell2.alignment = { horizontal: 'right', vertical: 'middle' };
      metadataCell2.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: EXCEL_COLORS.white,
      };
      
      // Merge middle cells
      if (columns.length > 2) {
        worksheet.mergeCells(currentRow, 2, currentRow, columns.length - 1);
      }
      
      // Add border to metadata row
      for (let col = 1; col <= columns.length; col++) {
        const cell = worksheet.getCell(currentRow, col);
        cell.border = {
          bottom: { style: 'thin', color: EXCEL_COLORS.border },
        };
      }
      
      currentRow++;
      worksheet.addRow([]); // Empty spacer row
      currentRow++;
    }

    // ============================================
    // COLUMN HEADERS - Enhanced Design
    // ============================================
    const headers = columns.map((col) => col.header);
    const headerRow = worksheet.addRow(headers);
    headerRow.height = 26; // More compact header height
    
    // Enhanced header styling
    headerRow.font = {
      name: 'Calibri',
      bold: true,
      size: 11,
      color: EXCEL_COLORS.headerText,
    };
    headerRow.alignment = { 
      horizontal: 'center', 
      vertical: 'middle', 
      wrapText: true 
    };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: EXCEL_COLORS.headerBg,
    };

    // Style each header cell individually
    headerRow.eachCell((cell, colNumber) => {
      const column = columns[colNumber - 1];
      
      // Highlight important columns in header
      if (column.highlight) {
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4B5563' }, // Slightly lighter gray for highlighted headers
        };
      }
      
      // Professional borders - Dark top/bottom, light sides
      cell.border = {
        top: { style: 'medium', color: EXCEL_COLORS.headerBorder },
        left: { style: 'thin', color: EXCEL_COLORS.borderLight },
        bottom: { style: 'medium', color: EXCEL_COLORS.headerBorder },
        right: { style: 'thin', color: EXCEL_COLORS.borderLight },
      };
      
      // Custom alignment if specified
      if (column.alignment) {
        cell.alignment = {
          ...cell.alignment,
          horizontal: column.alignment,
        };
      }
    });

    // ============================================
    // DATA ROWS - Professional Styling
    // ============================================
    data.forEach((row, index) => {
      const rowData = columns.map((col) => {
        const value = row[col.key];
        if (col.format) {
          return col.format(value);
        }
        // Enhanced default formatting
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
      dataRow.height = 20; // More compact row height
      dataRow.alignment = { vertical: 'middle' };

      // Enhanced alternating row colors with pattern
      const isEvenRow = index % 2 === 0;
      const rowFillColor = isEvenRow ? EXCEL_COLORS.white : EXCEL_COLORS.alternateRow;

      // Style each data cell
      dataRow.eachCell((cell, colNumber) => {
        const column = columns[colNumber - 1];
        
        // Font styling
        cell.font = {
          name: 'Calibri',
          size: 10,
          color: EXCEL_COLORS.text,
          bold: column.bold || false,
        };
        
        // Alignment
        cell.alignment = { 
          vertical: 'middle', 
          horizontal: column.alignment || 'left',
          wrapText: false // Disable wrap for compact design
        };
        
        // Fill color - Highlight important columns
        let cellFillColor = rowFillColor;
        if (column.highlight) {
          // Light highlight for important columns
          cellFillColor = isEvenRow 
            ? { argb: 'FFF0F4F8' } // Very light blue-gray for even rows
            : { argb: 'FFE8EDF2' }; // Slightly darker for odd rows
        }
        
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: cellFillColor,
        };
        
      // Professional subtle borders for data cells
      cell.border = {
        top: { style: 'thin', color: EXCEL_COLORS.border },
        left: { style: 'thin', color: EXCEL_COLORS.border },
        bottom: { style: 'thin', color: EXCEL_COLORS.border },
        right: { style: 'thin', color: EXCEL_COLORS.border },
      };
        
        // Number format if specified
        if (column.numberFormat) {
          cell.numFmt = column.numberFormat;
        }
        
        // Conditional formatting for status columns
        const cellValue = String(cell.value || '').toUpperCase();
        if (column.key.toLowerCase().includes('status') || column.key.toLowerCase().includes('payment')) {
          if (cellValue.includes('CONFIRMED') || cellValue.includes('PAID') || cellValue === 'YES') {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFECFDF5' }, // Light green background
            };
            cell.font = {
              ...cell.font,
              color: { argb: 'FF059669' }, // Green text
              bold: true,
            };
          } else if (cellValue.includes('PENDING') || cellValue.includes('UNPAID') || cellValue === 'NO') {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: 'FFFFFBEB' }, // Light yellow background
            };
            cell.font = {
              ...cell.font,
              color: { argb: 'FFD97706' }, // Amber text
              bold: true,
            };
          }
        }
      });
    });

    // ============================================
    // SUMMARY ROW (Optional)
    // ============================================
    if (data.length > 0) {
      const summaryRow = worksheet.addRow([]);
      summaryRow.height = 24;
      
      // Add summary text
      const summaryCell = worksheet.getCell(summaryRow.number, 1);
      summaryCell.value = `Total: ${data.length} record${data.length !== 1 ? 's' : ''}`;
      summaryCell.font = {
        name: 'Calibri',
        size: 10,
        bold: true,
        color: EXCEL_COLORS.text,
      };
      summaryCell.alignment = { horizontal: 'left', vertical: 'middle' };
      summaryCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: EXCEL_COLORS.bgPrimary,
      };
      summaryCell.border = {
        top: { style: 'medium', color: EXCEL_COLORS.borderDark },
        bottom: { style: 'thin', color: EXCEL_COLORS.border },
        left: { style: 'thin', color: EXCEL_COLORS.border },
        right: { style: 'thin', color: EXCEL_COLORS.border },
      };
      
      worksheet.mergeCells(summaryRow.number, 1, summaryRow.number, columns.length);
    }

    // ============================================
    // COLUMN WIDTHS - Optimized Auto-sizing
    // ============================================
    columns.forEach((col, index) => {
      // Use explicit width if provided
      if (columnWidths?.[index] !== undefined) {
        worksheet.getColumn(index + 1).width = columnWidths[index];
        return;
      }
      
      // Use column-specific width if provided
      if (col.width !== undefined) {
        worksheet.getColumn(index + 1).width = col.width;
        return;
      }
      
      // Smart auto-sizing with reasonable limits
      const headerLength = col.header.length;
      const maxDataLength = data.length > 0 
        ? Math.max(...data.map(row => {
            const value = row[col.key];
            if (value === null || value === undefined) return 0;
            // For dates, use shorter format length
            if (value instanceof Date) return 12;
            // For numbers, use formatted length
            if (typeof value === 'number') return String(value).length;
            return String(value).length;
          }))
        : 0;
      
      // Calculate optimal width
      const contentLength = Math.max(headerLength, maxDataLength);
      
      // Set min and max widths based on column type
      const minWidth = col.minWidth ?? 10; // More compact minimum
      const maxWidth = col.maxWidth ?? 35; // Reduced from 50 to 35 for compact design
      
      // Special handling for common column types
      let optimalWidth = contentLength + 2; // Add small padding
      
      // Adjust for specific column types
      if (col.key.toLowerCase().includes('status')) {
        optimalWidth = Math.min(Math.max(optimalWidth, 12), 18); // Status columns: 12-18
      } else if (col.key.toLowerCase().includes('date')) {
        optimalWidth = Math.min(Math.max(optimalWidth, 12), 18); // Date columns: 12-18
      } else if (col.key.toLowerCase().includes('no') || col.key.toLowerCase().includes('id')) {
        optimalWidth = Math.min(Math.max(optimalWidth, 15), 25); // ID columns: 15-25
      } else if (col.key.toLowerCase().includes('name')) {
        optimalWidth = Math.min(Math.max(optimalWidth, 20), maxWidth); // Name columns: 20-max
      } else if (col.key.toLowerCase().includes('amount') || col.key.toLowerCase().includes('fee')) {
        optimalWidth = Math.min(Math.max(optimalWidth, 15), 20); // Amount columns: 15-20
      } else {
        optimalWidth = Math.min(Math.max(optimalWidth, minWidth), maxWidth);
      }
      
      worksheet.getColumn(index + 1).width = optimalWidth;
    });

    // ============================================
    // AUTO FILTER - Enhanced
    // ============================================
    if (autoFilter && data.length > 0) {
      const headerRowNumber = title ? (subtitle ? 4 : 3) : (includeMetadata ? 2 : 1);
      worksheet.autoFilter = {
        from: {
          row: headerRowNumber,
          column: 1,
        },
        to: {
          row: headerRowNumber,
          column: columns.length,
        },
      };
    }

    // ============================================
    // FOOTER SECTION (Optional)
    // ============================================
    if (customFooter) {
      const footerRow = worksheet.addRow([]);
      footerRow.height = 20;
      const footerCell = worksheet.getCell(footerRow.number, 1);
      footerCell.value = customFooter;
      footerCell.font = {
        name: 'Calibri',
        size: 8,
        color: EXCEL_COLORS.textMuted,
        italic: true,
      };
      footerCell.alignment = { horizontal: 'center', vertical: 'middle' };
      worksheet.mergeCells(footerRow.number, 1, footerRow.number, columns.length);
    }

    // ============================================
    // PAGE SETUP - Print Optimization
    // ============================================
    worksheet.pageSetup = {
      orientation: 'landscape',
      fitToPage: true,
      fitToWidth: 1,
      fitToHeight: 0,
      paperSize: 9, // A4
      margins: {
        left: 0.5,
        right: 0.5,
        top: 0.75,
        bottom: 0.75,
        header: 0.3,
        footer: 0.3,
      },
      printTitlesRow: '1:1',
      printTitlesColumn: 'A:A',
    };

    // ============================================
    // GENERATE AND DOWNLOAD
    // ============================================
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

/**
 * Helper function to format currency values
 */
export function formatCurrency(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '₹0.00';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '₹0.00';
  return `₹${numValue.toLocaleString('en-IN', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`;
}

/**
 * Helper function to format percentage values
 */
export function formatPercentage(value: number | string | null | undefined): string {
  if (value === null || value === undefined) return '0.00%';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '0.00%';
  return `${numValue.toFixed(2)}%`;
}

/**
 * Helper function to format date values
 */
export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return '-';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Helper function to format datetime values
 */
export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return '-';
  const date = typeof value === 'string' ? new Date(value) : value;
  if (isNaN(date.getTime())) return '-';
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
