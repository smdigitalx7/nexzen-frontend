import { SchoolFinanceReport } from '@/lib/types/school/income';
import { CollegeFinanceReport } from '@/lib/types/college/income';

/**
 * Export finance report data to Excel-compatible CSV format
 */
export const exportFinanceReportToExcel = (
  reportData: SchoolFinanceReport[] | CollegeFinanceReport[],
  filename: string = 'finance-report'
) => {
  if (!reportData || reportData.length === 0) {
    console.warn('No data to export');
    return;
  }

  const csvContent = generateFinanceReportCSV(reportData);
  downloadCSV(csvContent, filename);
};

/**
 * Generate CSV content for finance reports
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
