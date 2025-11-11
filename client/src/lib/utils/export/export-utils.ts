import { SchoolFinanceReport } from '@/lib/types/school/income';
import { CollegeFinanceReport } from '@/lib/types/college/income';
import jsPDF from 'jspdf';
import ExcelJS from 'exceljs';

/**
 * Export finance report data to Excel format with professional styling
 */
export const exportFinanceReportToExcel = async (
  reportData: SchoolFinanceReport[] | CollegeFinanceReport[],
  filename: string = 'day-sheet-report'
) => {
  if (!reportData || reportData.length === 0) {
    console.warn('No data to export');
    return;
  }

  try {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Velocity ERP';
    workbook.created = new Date();
    workbook.modified = new Date();

    // Process each report
    reportData.forEach((report, reportIndex) => {
      const sheet = workbook.addWorksheet(
        report.branch_name.substring(0, 31) || `Report ${reportIndex + 1}`
      );

      generateDaySheetExcel(sheet, report);
    });

    // Generate Excel file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    // Fallback to CSV if Excel export fails
    const csvContent = generateFinanceReportCSV(reportData);
    downloadCSV(csvContent, filename);
  }
};

/**
 * Generate Day Sheet Excel with professional formatting
 */
const generateDaySheetExcel = (
  worksheet: ExcelJS.Worksheet,
  report: SchoolFinanceReport | CollegeFinanceReport
) => {
  // Helper to format currency
  const formatCurrency = (amount: number): string => {
    return `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  let currentRow = 1;

  // Header Section
  worksheet.mergeCells(currentRow, 1, currentRow, 8);
  const headerCell = worksheet.getCell(currentRow, 1);
  headerCell.value = report.institute_name.toUpperCase();
  headerCell.font = { size: 16, bold: true };
  headerCell.alignment = { horizontal: 'center', vertical: 'middle' };
  headerCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF374151' } // Professional Dark Gray - Consistent with other exports
  };
  headerCell.font = { size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(currentRow).height = 25;
  currentRow++;

  worksheet.mergeCells(currentRow, 1, currentRow, 8);
  const titleCell = worksheet.getCell(currentRow, 1);
  // Determine if it's a daily report or custom date range report
  const reportDate = new Date(report.report_date);
  const isDailyReport = reportDate.toDateString() === new Date().toDateString();
  titleCell.value = isDailyReport ? 'DAY SHEET REPORT' : 'FINANCE REPORT';
  titleCell.font = { size: 14, bold: true };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF374151' } // Professional Dark Gray - Consistent with other exports
  };
  titleCell.font = { size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(currentRow).height = 20;
  currentRow += 2;

  // Branch Information
  const branchNameCell = worksheet.getCell(currentRow, 1);
  branchNameCell.value = report.branch_name.toUpperCase();
  branchNameCell.font = { size: 12, bold: true };
  currentRow++;

  worksheet.getCell(currentRow, 1).value = `${report.branch_type} | ${report.branch_address}`;
  worksheet.getCell(currentRow, 1).font = { size: 10 };
  currentRow++;

  worksheet.getCell(currentRow, 1).value = `Phone: ${report.branch_phone} | Email: ${report.branch_email}`;
  worksheet.getCell(currentRow, 1).font = { size: 10 };
  currentRow++;

  worksheet.getCell(currentRow, 1).value = `Report Date: ${new Date(report.report_date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })}`;
  worksheet.getCell(currentRow, 1).font = { size: 10, bold: true };
  currentRow += 2;

  // Financial Summary Section
  worksheet.mergeCells(currentRow, 1, currentRow, 8);
  const summaryHeader = worksheet.getCell(currentRow, 1);
  summaryHeader.value = 'FINANCIAL SUMMARY';
  summaryHeader.font = { size: 11, bold: true };
  summaryHeader.alignment = { horizontal: 'left', vertical: 'middle' };
  currentRow++;

  // Summary Table Header
  const summaryHeaders = ['Total Income', 'Total Expenditure', 'Net Result', 'Status'];
  summaryHeaders.forEach((header, idx) => {
    const cell = worksheet.getCell(currentRow, idx + 1);
    cell.value = header;
    cell.font = { size: 10, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF5F5F5' } // Light gray
    };
    cell.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    };
  });
  worksheet.getRow(currentRow).height = 20;
  currentRow++;

  // Summary Values
  const summaryValues = [
    formatCurrency(report.total_income),
    formatCurrency(report.total_expenditure),
    formatCurrency(report.profit_loss),
    report.financial_status.replace('_', ' ').toUpperCase()
  ];
  summaryValues.forEach((value, idx) => {
    const cell = worksheet.getCell(currentRow, idx + 1);
    cell.value = value;
    cell.font = { size: 11, bold: true };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    };
  });
  worksheet.getRow(currentRow).height = 20;
  currentRow += 2;

  // Income Details Section
  if (report.income_object.income_list.length > 0) {
    worksheet.mergeCells(currentRow, 1, currentRow, 8);
    const incomeHeader = worksheet.getCell(currentRow, 1);
    incomeHeader.value = `INCOME DETAILS (${report.income_object.income_count} transactions)`;
    incomeHeader.font = { size: 11, bold: true };
    incomeHeader.alignment = { horizontal: 'left', vertical: 'middle' };
    currentRow++;

    // Income Table Headers
    const incomeHeaders = ['S.No', 'Receipt No', 'Student Name', 'ID No', 'Purpose', 'Payment', 'Amount', 'Created By'];
    incomeHeaders.forEach((header, idx) => {
      const cell = worksheet.getCell(currentRow, idx + 1);
      cell.value = header;
      cell.font = { size: 10, bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF5F5F5' }
      };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    worksheet.getRow(currentRow).height = 18;
    currentRow++;

    // Income Table Data
    report.income_object.income_list.forEach((income) => {
      const rowData = [
        income.sNo,
        income.receipt_no || '-',
        income.student_name || '-',
        income.identity_no || '-',
        income.purpose,
        income.payment_method,
        formatCurrency(income.amount),
        income.created_by || '-'
      ];

      rowData.forEach((value, idx) => {
        const cell = worksheet.getCell(currentRow, idx + 1);
        cell.value = value;
        cell.font = { size: 10 };
        cell.alignment = { horizontal: idx === 0 || idx === 6 ? 'center' : 'left', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
      worksheet.getRow(currentRow).height = 18;
      currentRow++;
    });

    // Total Income Row
    worksheet.mergeCells(currentRow, 1, currentRow, 6);
    const totalLabel = worksheet.getCell(currentRow, 1);
    totalLabel.value = 'TOTAL INCOME';
    totalLabel.font = { size: 10, bold: true };
    totalLabel.alignment = { horizontal: 'right', vertical: 'middle' };
    totalLabel.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF0F0F0' }
    };
    totalLabel.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    };

    const totalAmount = worksheet.getCell(currentRow, 7);
    totalAmount.value = formatCurrency(report.income_object.total_income);
    totalAmount.font = { size: 10, bold: true };
    totalAmount.alignment = { horizontal: 'center', vertical: 'middle' };
    totalAmount.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF0F0F0' }
    };
    totalAmount.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    };

    worksheet.getCell(currentRow, 8).border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    };
    worksheet.getRow(currentRow).height = 20;
    currentRow += 2;
  }

  // Expenditure Details Section
  if (report.expenditure_object.expenditure_list.length > 0) {
    worksheet.mergeCells(currentRow, 1, currentRow, 7);
    const expenditureHeader = worksheet.getCell(currentRow, 1);
    expenditureHeader.value = `EXPENDITURE DETAILS (${report.expenditure_object.expenditure_count} transactions)`;
    expenditureHeader.font = { size: 11, bold: true };
    expenditureHeader.alignment = { horizontal: 'left', vertical: 'middle' };
    currentRow++;

    // Expenditure Table Headers
    const expenditureHeaders = ['S.No', 'Voucher No', 'Bill Date', 'Purpose', 'Payment', 'Amount', 'Created By'];
    expenditureHeaders.forEach((header, idx) => {
      const cell = worksheet.getCell(currentRow, idx + 1);
      cell.value = header;
      cell.font = { size: 10, bold: true };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF5F5F5' }
      };
      cell.border = {
        top: { style: 'thin' },
        bottom: { style: 'thin' },
        left: { style: 'thin' },
        right: { style: 'thin' }
      };
    });
    worksheet.getRow(currentRow).height = 18;
    currentRow++;

    // Expenditure Table Data
    report.expenditure_object.expenditure_list.forEach((expenditure) => {
      const rowData = [
        expenditure.sNo,
        expenditure.voucher_no || '-',
        new Date(expenditure.bill_date).toLocaleDateString('en-IN'),
        expenditure.purpose,
        expenditure.payment_method,
        formatCurrency(expenditure.amount),
        expenditure.created_by || '-'
      ];

      rowData.forEach((value, idx) => {
        const cell = worksheet.getCell(currentRow, idx + 1);
        cell.value = value;
        cell.font = { size: 10 };
        cell.alignment = { horizontal: idx === 0 || idx === 5 ? 'center' : 'left', vertical: 'middle' };
        cell.border = {
          top: { style: 'thin' },
          bottom: { style: 'thin' },
          left: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
      worksheet.getRow(currentRow).height = 18;
      currentRow++;
    });

    // Total Expenditure Row
    worksheet.mergeCells(currentRow, 1, currentRow, 5);
    const totalExpLabel = worksheet.getCell(currentRow, 1);
    totalExpLabel.value = 'TOTAL EXPENDITURE';
    totalExpLabel.font = { size: 10, bold: true };
    totalExpLabel.alignment = { horizontal: 'right', vertical: 'middle' };
    totalExpLabel.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF0F0F0' }
    };
    totalExpLabel.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    };

    const totalExpAmount = worksheet.getCell(currentRow, 6);
    totalExpAmount.value = formatCurrency(report.expenditure_object.total_expenditure);
    totalExpAmount.font = { size: 10, bold: true };
    totalExpAmount.alignment = { horizontal: 'center', vertical: 'middle' };
    totalExpAmount.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF0F0F0' }
    };
    totalExpAmount.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    };

    worksheet.getCell(currentRow, 7).border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: { style: 'thin' },
      right: { style: 'thin' }
    };
    worksheet.getRow(currentRow).height = 20;
    currentRow += 2;
  }

  // Footer
  worksheet.mergeCells(currentRow, 1, currentRow, 8);
  const footerCell = worksheet.getCell(currentRow, 1);
  footerCell.value = `Generated on ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
  footerCell.font = { size: 9, italic: true };
  footerCell.alignment = { horizontal: 'center', vertical: 'middle' };

  // Set column widths
  worksheet.columns = [
    { width: 8 },   // S.No
    { width: 25 }, // Receipt/Voucher No
    { width: 30 }, // Student Name / Bill Date
    { width: 20 }, // ID No / Purpose
    { width: 20 }, // Purpose / Payment
    { width: 18 }, // Payment / Amount
    { width: 20 }, // Amount / Created By
    { width: 20 }  // Created By
  ];
};

/**
 * Generate CSV content for finance reports (fallback)
 */
const generateFinanceReportCSV = (reportData: SchoolFinanceReport[] | CollegeFinanceReport[]) => {
  const csvRows: string[] = [];
  
  // Add header
  csvRows.push('Finance Report Export');
  csvRows.push(`Generated on: ${new Date().toLocaleDateString()}`);
  csvRows.push(''); // Empty line
  
  // Process each report
  reportData.forEach((report, reportIndex) => {
    // Report header
    csvRows.push(`Report ${reportIndex + 1}: ${report.branch_name} (${report.branch_type})`);
    csvRows.push(`Institute: ${report.institute_name}`);
    csvRows.push(`Report Date: ${new Date(report.report_date).toLocaleDateString()}`);
    csvRows.push(`Branch Address: ${report.branch_address}`);
    csvRows.push(`Branch Phone: ${report.branch_phone}`);
    csvRows.push(`Branch Email: ${report.branch_email}`);
    csvRows.push(''); // Empty line
    
    // Financial Summary
    csvRows.push('FINANCIAL SUMMARY');
    csvRows.push('Metric,Amount,Count');
    csvRows.push(`Total Income,${report.total_income},${report.income_object.income_count}`);
    csvRows.push(`Total Expenditure,${report.total_expenditure},${report.expenditure_object.expenditure_count}`);
    csvRows.push(`Net Result,${report.profit_loss},`);
    csvRows.push(`Financial Status,${report.financial_status},`);
    csvRows.push(''); // Empty line
    
    // Income Details
    if (report.income_object.income_list.length > 0) {
      csvRows.push('INCOME DETAILS');
      csvRows.push('S.No,Receipt No,Student Name,ID No,Purpose,Payment Method,Amount,Created By');
      
      report.income_object.income_list.forEach((income) => {
        csvRows.push([
          income.sNo,
          income.receipt_no,
          `"${income.student_name}"`, // Wrap in quotes to handle commas in names
          income.identity_no,
          `"${income.purpose}"`,
          income.payment_method,
          income.amount,
          `"${income.created_by}"`
        ].join(','));
      });
      
      csvRows.push(`Total Income,${report.income_object.total_income}`);
      csvRows.push(''); // Empty line
    }
    
    // Expenditure Details
    if (report.expenditure_object.expenditure_list.length > 0) {
      csvRows.push('EXPENDITURE DETAILS');
      csvRows.push('S.No,Voucher No,Bill Date,Purpose,Payment Method,Amount,Created By');
      
      report.expenditure_object.expenditure_list.forEach((expenditure) => {
        csvRows.push([
          expenditure.sNo,
          expenditure.voucher_no,
          new Date(expenditure.bill_date).toLocaleDateString(),
          `"${expenditure.purpose}"`,
          expenditure.payment_method,
          expenditure.amount,
          `"${expenditure.created_by}"`
        ].join(','));
      });
      
      csvRows.push(`Total Expenditure,${report.expenditure_object.total_expenditure}`);
      csvRows.push(''); // Empty line
    }
    
    // Add separator between reports
    if (reportIndex < reportData.length - 1) {
      csvRows.push('='.repeat(50));
      csvRows.push('');
    }
  });
  
  return csvRows.join('\n');
};

/**
 * Download CSV content as file
 */
const downloadCSV = (csvContent: string, filename: string) => {
  // Create BOM for proper Excel UTF-8 support
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { 
    type: 'text/csv;charset=utf-8;' 
  });
  
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
  
  // Add to DOM, click, and remove
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  URL.revokeObjectURL(url);
};

/**
 * Format currency for CSV export
 */
export const formatCurrencyForExport = (amount: number): string => {
  return amount.toFixed(2);
};

/**
 * Generate filename based on report data
 */
export const generateExportFilename = (reportData: SchoolFinanceReport[] | CollegeFinanceReport[]): string => {
  if (!reportData || reportData.length === 0) {
    return 'finance-report';
  }
  
  const firstReport = reportData[0];
  const dateRange = new Date(firstReport.report_date).toLocaleDateString().replace(/\//g, '-');
  const branchName = firstReport.branch_name.toLowerCase().replace(/\s+/g, '-');
  
  return `${branchName}-finance-report-${dateRange}`;
};

/**
 * Export finance report to PDF format (Day Sheet Report)
 */
export const exportFinanceReportToPDF = (
  reportData: SchoolFinanceReport[] | CollegeFinanceReport[],
  filename: string = 'day-sheet-report'
) => {
  if (!reportData || reportData.length === 0) {
    console.warn('No data to export');
    return;
  }

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4' // A4 landscape for better table display
  });

  // Process each report
  reportData.forEach((report, reportIndex) => {
    if (reportIndex > 0) {
      doc.addPage();
    }

    generateDaySheetPDF(doc, report);
  });

  // Save the PDF
  const finalFilename = `${filename}-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(finalFilename);
};

/**
 * Generate Day Sheet Report PDF content - Professional Monochrome Design
 */
const generateDaySheetPDF = (
  doc: jsPDF,
  report: SchoolFinanceReport | CollegeFinanceReport
) => {
  const pageWidth = doc.internal.pageSize.getWidth(); // Landscape: ~297mm
  const pageHeight = doc.internal.pageSize.getHeight(); // Landscape: ~210mm
  const margin = 8;
  const contentWidth = pageWidth - (margin * 2);
  let yPosition = margin;

  // Helper function to add text with word wrap
  const addText = (text: string, x: number, y: number, options: {
    fontSize?: number;
    fontStyle?: string;
    align?: 'left' | 'center' | 'right';
    maxWidth?: number;
  } = {}) => {
    const {
      fontSize = 9,
      fontStyle = 'normal',
      align = 'left',
      maxWidth = contentWidth
    } = options;

    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    doc.setTextColor(0, 0, 0); // Always black

    const lines = doc.splitTextToSize(text, maxWidth);
    doc.text(lines, x, y, { align });
    return lines.length * (fontSize * 0.4);
  };

  // Helper function to format currency - using "Rs." instead of ₹ symbol for better compatibility
  const formatCurrency = (amount: number): string => {
    return `Rs. ${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Helper function to draw line - thinner borders
  const drawLine = (x1: number, y1: number, x2: number, y2: number, lineWidth: number = 0.2) => {
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(lineWidth);
    doc.line(x1, y1, x2, y2);
  };

  // Header Section - Professional Design
  drawLine(margin, yPosition, pageWidth - margin, yPosition, 0.3);
  yPosition += 4;
  
  addText(report.institute_name.toUpperCase(), pageWidth / 2, yPosition, {
    fontSize: 16,
    fontStyle: 'bold',
    align: 'center'
  });

  yPosition += 5;
  // Determine if it's a daily report or custom date range report
  const reportDate = new Date(report.report_date);
  const isDailyReport = reportDate.toDateString() === new Date().toDateString();
  const reportTitle = isDailyReport ? 'DAY SHEET REPORT' : 'FINANCE REPORT';
  addText(reportTitle, pageWidth / 2, yPosition, {
    fontSize: 12,
    fontStyle: 'bold',
    align: 'center'
  });

  yPosition += 4;
  drawLine(margin, yPosition, pageWidth - margin, yPosition, 0.3);
  yPosition += 5;

  // Branch Information Section - Professional Layout
  const branchInfoY = yPosition;
  addText(report.branch_name.toUpperCase(), margin, branchInfoY, {
    fontSize: 12,
    fontStyle: 'bold'
  });

  yPosition += 4;
  addText(`${report.branch_type} | ${report.branch_address}`, margin, yPosition, {
    fontSize: 8
  });

  yPosition += 3.5;
  addText(`Phone: ${report.branch_phone} | Email: ${report.branch_email}`, margin, yPosition, {
    fontSize: 8
  });

  yPosition += 3.5;
  addText(`Report Date: ${new Date(report.report_date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  })}`, margin, yPosition, {
    fontSize: 9,
    fontStyle: 'bold'
  });

  yPosition += 5;
  drawLine(margin, yPosition, pageWidth - margin, yPosition, 0.3);
  yPosition += 4;

  // Financial Summary Section - Professional Table Design
  addText('FINANCIAL SUMMARY', margin, yPosition, {
    fontSize: 10,
    fontStyle: 'bold'
  });

  yPosition += 4;

  // Summary Table - Better spacing for landscape with proper borders
  const summaryRowHeight = 7;
  const summaryColWidth = (contentWidth - 3) / 4;
  const summaryGap = 1;

  // Table Header with all borders
  doc.setFillColor(245, 245, 245);
  doc.rect(margin, yPosition, contentWidth, summaryRowHeight, 'F');
  // Top border
  drawLine(margin, yPosition, pageWidth - margin, yPosition, 0.3);
  // Bottom border
  drawLine(margin, yPosition + summaryRowHeight, pageWidth - margin, yPosition + summaryRowHeight, 0.3);
  // Left border
  drawLine(margin, yPosition, margin, yPosition + summaryRowHeight * 2, 0.3);
  // Right border
  drawLine(pageWidth - margin, yPosition, pageWidth - margin, yPosition + summaryRowHeight * 2, 0.3);
  
  let xPos = margin + summaryGap;
  const summaryHeaders = ['Total Income', 'Total Expenditure', 'Net Result', 'Status'];
  summaryHeaders.forEach((header, idx) => {
    if (idx > 0) {
      drawLine(xPos - summaryGap, yPosition, xPos - summaryGap, yPosition + summaryRowHeight * 2, 0.3);
    }
    addText(header, xPos + summaryColWidth / 2, yPosition + 4.5, {
      fontSize: 9,
      fontStyle: 'bold',
      align: 'center',
      maxWidth: summaryColWidth - 2
    });
    xPos += summaryColWidth + summaryGap;
  });

  yPosition += summaryRowHeight;

  // Summary Values Row
  drawLine(margin, yPosition, pageWidth - margin, yPosition, 0.3);
  xPos = margin + summaryGap;
  const summaryValues = [
    formatCurrency(report.total_income),
    formatCurrency(report.total_expenditure),
    formatCurrency(report.profit_loss),
    report.financial_status.replace('_', ' ').toUpperCase()
  ];
  
  summaryValues.forEach((value, idx) => {
    addText(value, xPos + summaryColWidth / 2, yPosition + 4.5, {
      fontSize: 10,
      fontStyle: 'bold',
      align: 'center',
      maxWidth: summaryColWidth - 2
    });
    xPos += summaryColWidth + summaryGap;
  });

  yPosition += summaryRowHeight;
  drawLine(margin, yPosition, pageWidth - margin, yPosition, 0.3);
  yPosition += 5;

  // Income Details Section - Professional Table Design
  if (report.income_object.income_list.length > 0) {
    addText(`INCOME DETAILS (${report.income_object.income_count} transactions)`, margin, yPosition, {
      fontSize: 10,
      fontStyle: 'bold'
    });

    yPosition += 4;

    // Table Header - Optimized for landscape A4 with proper borders
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, yPosition, contentWidth, 7, 'F');
    // Top border
    drawLine(margin, yPosition, pageWidth - margin, yPosition, 0.3);
    // Bottom border
    drawLine(margin, yPosition + 7, pageWidth - margin, yPosition + 7, 0.3);
    // Left border
    drawLine(margin, yPosition, margin, yPosition + 7, 0.3);
    // Right border
    drawLine(pageWidth - margin, yPosition, pageWidth - margin, yPosition + 7, 0.3);
    
    // Column widths optimized for landscape A4 (297mm width, ~281mm content width)
    const colWidths = [12, 32, 40, 22, 28, 22, 28, 25];
    const headers = ['S.No', 'Receipt No', 'Student Name', 'ID No', 'Purpose', 'Payment', 'Amount', 'Created By'];
    xPos = margin + 1;

    headers.forEach((header, idx) => {
      if (idx > 0) {
        // Vertical column dividers
        drawLine(xPos - 0.5, yPosition, xPos - 0.5, yPosition + 7, 0.3);
      }
      addText(header, xPos + colWidths[idx] / 2, yPosition + 5, {
        fontSize: 9,
        fontStyle: 'bold',
        align: 'center',
        maxWidth: colWidths[idx] - 2
      });
      xPos += colWidths[idx];
    });

    yPosition += 7;

    // Table Rows - Professional styling with proper spacing
    report.income_object.income_list.forEach((income, idx) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 25) {
        doc.addPage();
        yPosition = margin;
      }

      // Draw top row border
      drawLine(margin, yPosition, pageWidth - margin, yPosition, 0.3);
      // Draw left border
      drawLine(margin, yPosition, margin, yPosition + 6, 0.3);
      // Draw right border
      drawLine(pageWidth - margin, yPosition, pageWidth - margin, yPosition + 6, 0.3);

      xPos = margin + 1;
      const rowData = [
        String(income.sNo),
        income.receipt_no || '-',
        income.student_name || '-',
        income.identity_no || '-',
        income.purpose,
        income.payment_method,
        formatCurrency(income.amount),
        income.created_by || '-'
      ];

      rowData.forEach((cell, cellIdx) => {
        if (cellIdx > 0) {
          // Vertical column dividers
          drawLine(xPos - 0.5, yPosition, xPos - 0.5, yPosition + 6, 0.3);
        }
        addText(cell, xPos + 1, yPosition + 4, {
          fontSize: 8,
          maxWidth: colWidths[cellIdx] - 2
        });
        xPos += colWidths[cellIdx];
      });

      // Draw bottom border for row
      drawLine(margin, yPosition + 6, pageWidth - margin, yPosition + 6, 0.3);
      yPosition += 6;
    });

    // Total Income Row with borders
    yPosition += 2;
    drawLine(margin, yPosition, pageWidth - margin, yPosition, 0.3);
    yPosition += 1;
    doc.setFillColor(250, 250, 250);
    doc.rect(margin, yPosition, contentWidth, 6, 'F');
    // Left and right borders
    drawLine(margin, yPosition, margin, yPosition + 6, 0.3);
    drawLine(pageWidth - margin, yPosition, pageWidth - margin, yPosition + 6, 0.3);
    // Bottom border
    drawLine(margin, yPosition + 6, pageWidth - margin, yPosition + 6, 0.3);
    
    addText('TOTAL INCOME', margin + contentWidth - 50, yPosition + 4, {
      fontSize: 10,
      fontStyle: 'bold',
      align: 'right'
    });
    addText(formatCurrency(report.income_object.total_income), margin + contentWidth - 2, yPosition + 4, {
      fontSize: 10,
      fontStyle: 'bold',
      align: 'right'
    });

    yPosition += 6;
  }

  // Expenditure Details Section
  if (report.expenditure_object.expenditure_list.length > 0) {
    // Check if we need a new page
    if (yPosition > pageHeight - 40) {
      doc.addPage();
      yPosition = margin;
    }

    addText(`EXPENDITURE DETAILS (${report.expenditure_object.expenditure_count} transactions)`, margin, yPosition, {
      fontSize: 10,
      fontStyle: 'bold'
    });

    yPosition += 4;

    // Table Header - Optimized for landscape with proper borders
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, yPosition, contentWidth, 7, 'F');
    // Top border
    drawLine(margin, yPosition, pageWidth - margin, yPosition, 0.3);
    // Bottom border
    drawLine(margin, yPosition + 7, pageWidth - margin, yPosition + 7, 0.3);
    // Left border
    drawLine(margin, yPosition, margin, yPosition + 7, 0.3);
    // Right border
    drawLine(pageWidth - margin, yPosition, pageWidth - margin, yPosition + 7, 0.3);
    
    // Column widths optimized for landscape A4
    const colWidths = [12, 32, 28, 50, 28, 28, 30];
    const headers = ['S.No', 'Voucher No', 'Bill Date', 'Purpose', 'Payment', 'Amount', 'Created By'];
    xPos = margin + 1;

    headers.forEach((header, idx) => {
      if (idx > 0) {
        // Vertical column dividers
        drawLine(xPos - 0.5, yPosition, xPos - 0.5, yPosition + 7, 0.3);
      }
      addText(header, xPos + colWidths[idx] / 2, yPosition + 5, {
        fontSize: 9,
        fontStyle: 'bold',
        align: 'center',
        maxWidth: colWidths[idx] - 2
      });
      xPos += colWidths[idx];
    });

    yPosition += 7;

    // Table Rows - Professional styling with proper spacing
    report.expenditure_object.expenditure_list.forEach((expenditure, idx) => {
      // Check if we need a new page
      if (yPosition > pageHeight - 25) {
        doc.addPage();
        yPosition = margin;
      }

      // Draw top row border
      drawLine(margin, yPosition, pageWidth - margin, yPosition, 0.3);
      // Draw left border
      drawLine(margin, yPosition, margin, yPosition + 6, 0.3);
      // Draw right border
      drawLine(pageWidth - margin, yPosition, pageWidth - margin, yPosition + 6, 0.3);

      xPos = margin + 1;
      const rowData = [
        String(expenditure.sNo),
        expenditure.voucher_no || '-',
        new Date(expenditure.bill_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
        expenditure.purpose,
        expenditure.payment_method,
        formatCurrency(expenditure.amount),
        expenditure.created_by || '-'
      ];

      rowData.forEach((cell, cellIdx) => {
        if (cellIdx > 0) {
          // Vertical column dividers
          drawLine(xPos - 0.5, yPosition, xPos - 0.5, yPosition + 6, 0.3);
        }
        addText(cell, xPos + 1, yPosition + 4, {
          fontSize: 8,
          maxWidth: colWidths[cellIdx] - 2
        });
        xPos += colWidths[cellIdx];
      });

      // Draw bottom border for row
      drawLine(margin, yPosition + 6, pageWidth - margin, yPosition + 6, 0.3);
      yPosition += 6;
    });

    // Total Expenditure Row with borders
    yPosition += 2;
    drawLine(margin, yPosition, pageWidth - margin, yPosition, 0.3);
    yPosition += 1;
    doc.setFillColor(250, 250, 250);
    doc.rect(margin, yPosition, contentWidth, 6, 'F');
    // Left and right borders
    drawLine(margin, yPosition, margin, yPosition + 6, 0.3);
    drawLine(pageWidth - margin, yPosition, pageWidth - margin, yPosition + 6, 0.3);
    // Bottom border
    drawLine(margin, yPosition + 6, pageWidth - margin, yPosition + 6, 0.3);
    
    addText('TOTAL EXPENDITURE', margin + contentWidth - 50, yPosition + 4, {
      fontSize: 10,
      fontStyle: 'bold',
      align: 'right'
    });
    addText(formatCurrency(report.expenditure_object.total_expenditure), margin + contentWidth - 2, yPosition + 4, {
      fontSize: 10,
      fontStyle: 'bold',
      align: 'right'
    });

    yPosition += 6;
  }

  // Footer - Professional
  const footerY = pageHeight - 8;
  drawLine(margin, footerY, pageWidth - margin, footerY, 0.3);

  addText(`Generated on ${new Date().toLocaleDateString('en-IN')} at ${new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`, pageWidth / 2, footerY + 3.5, {
    fontSize: 7,
    align: 'center'
  });
};
