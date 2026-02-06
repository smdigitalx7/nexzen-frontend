import React from 'react';
import { motion } from 'framer-motion';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/common/components/ui/dialog';
import { Badge } from '@/common/components/ui/badge';
import { Button } from '@/common/components/ui/button';
import { ScrollArea } from '@/common/components/ui/scroll-area';
import { 
  TrendingDown, 
  TrendingUp, 
  Minus,
  Calendar,
  Building2,
  Phone,
  Mail,
  FileText,
  Receipt,
  CreditCard,
  Download
} from 'lucide-react';
import { formatCurrency } from '@/common/utils';
import { CollegeFinanceReport } from '@/features/college/types/income';
import { exportFinanceReportToExcel, exportFinanceReportToPDF, generateExportFilename } from '@/common/utils/export/export-utils';
import { Loader } from '@/common/components/ui/ProfessionalLoader';
import { DataTable } from '@/common/components/shared/DataTable';
import { ColumnDef } from '@tanstack/react-table';

interface CollegeFinanceReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportData: CollegeFinanceReport[];
  loading?: boolean;
}

export const CollegeFinanceReportDialog: React.FC<CollegeFinanceReportDialogProps> = ({
  open,
  onOpenChange,
  reportData,
  loading = false,
}) => {
  // Show loader when loading
  if (loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Finance Report
            </DialogTitle>
            <DialogDescription>
              Generating finance report...
            </DialogDescription>
          </DialogHeader>
          
          <Loader.Data message="Loading finance report data..." />
        </DialogContent>
      </Dialog>
    );
  }

  if (!reportData || reportData.length === 0) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              College Finance Report
            </DialogTitle>
            <DialogDescription>
              No financial data available for the selected period.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No data found</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const getFinancialStatusIcon = (status: string) => {
    switch (status) {
      case 'PROFIT':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'LOSS':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'BREAK_EVEN':
        return <Minus className="h-4 w-4 text-yellow-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getFinancialStatusColor = (status: string) => {
    switch (status) {
      case 'PROFIT':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'LOSS':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'BREAK_EVEN':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };


  const handleDownloadExcel = async () => {
    try {
      const filename = generateExportFilename(reportData);
      await exportFinanceReportToExcel(reportData, filename);
    } catch (error) {
      console.error('Error exporting finance report:', error);
    }
  };

  const handleDownloadPDF = () => {
    try {
      const filename = generateExportFilename(reportData);
      exportFinanceReportToPDF(reportData, filename);
    } catch (error) {
      console.error('Error exporting PDF report:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            College Finance Report
          </DialogTitle>
          <DialogDescription>
            Comprehensive financial overview with income and expenditure details
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-between mb-6 mt-4 px-1">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Generated on {new Date().toLocaleDateString()}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm" onClick={handleDownloadExcel}>
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
              <FileText className="h-4 w-4 mr-2" />
              Download PDF
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[calc(90vh-140px)]">
          <div className="space-y-6">
            {reportData.map((report, index) => (
              <motion.div
                key={`${report.branch_id}-${report.report_date}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border rounded-lg p-4 bg-white"
              >
                {/* Branch Information */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-semibold">{report.branch_name}</h3>
                    <Badge variant="outline">{report.branch_type}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span>{report.branch_address}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{report.branch_phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{report.branch_email}</span>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-sm font-medium">{report.institute_name}</p>
                    <p className="text-sm text-muted-foreground">
                      Report Date: {new Date(report.report_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base font-bold text-green-600">₹</span>
                      <span className="text-sm font-medium text-green-800">Total Income</span>
                    </div>
                    <p className="text-2xl font-bold text-green-900">
                      {formatCurrency(report.total_income)}
                    </p>
                    <p className="text-xs text-green-700">
                      {report.income_object.income_count} transactions
                    </p>
                  </div>

                  <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      <span className="text-sm font-medium text-red-800">Total Expenditure</span>
                    </div>
                    <p className="text-2xl font-bold text-red-900">
                      {formatCurrency(report.total_expenditure)}
                    </p>
                    <p className="text-xs text-red-700">
                      {report.expenditure_object.expenditure_count} transactions
                    </p>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">Net Result</span>
                    </div>
                    <p className={`text-2xl font-bold ${
                      report.profit_loss >= 0 ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {formatCurrency(report.profit_loss)}
                    </p>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-2 mb-2">
                      {getFinancialStatusIcon(report.financial_status)}
                      <span className="text-sm font-medium text-gray-800">Status</span>
                    </div>
                    <Badge className={getFinancialStatusColor(report.financial_status)}>
                      {report.financial_status.replace('_', ' ')}
                    </Badge>
                  </div>
                </div>

                {/* Income Details */}
                {report.income_object.income_list.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Receipt className="h-5 w-5 text-green-600" />
                      Income Details ({report.income_object.income_count} transactions)
                    </h4>
                    {(() => {
                      type Row = typeof report.income_object.income_list[number];
                      const columns: ColumnDef<Row>[] = [
                        { accessorKey: 'sNo', header: 'S.No' },
                        { accessorKey: 'receipt_no', header: 'Receipt No' },
                        { accessorKey: 'student_name', header: 'Student' },
                        { accessorKey: 'identity_no', header: 'ID No' },
                        { accessorKey: 'purpose', header: 'Purpose',
                          cell: ({ getValue }) => (
                            <Badge variant="outline" className="text-xs">{String(getValue())}</Badge>
                          )
                        },
                        { accessorKey: 'payment_method', header: 'Payment Method',
                          cell: ({ getValue }) => (
                            <Badge variant="secondary" className="text-xs">{String(getValue())}</Badge>
                          )
                        },
                        { accessorKey: 'amount', header: 'Amount',
                          cell: ({ getValue }) => (
                            <span className="font-medium text-green-700">{formatCurrency(Number(getValue()))}</span>
                          )
                        },
                        { accessorKey: 'created_by', header: 'Created By' },
                      ];
                      return (
                        <DataTable<Row>
                          data={report.income_object.income_list}
                          columns={columns}
                          searchKey={'student_name' as keyof Row}
                          showSearch={true}
                          emptyMessage="No income details"
                        />
                      );
                    })()}
                  </div>
                )}

                {/* Expenditure Details */}
                {report.expenditure_object.expenditure_list.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-red-600" />
                      Expenditure Details ({report.expenditure_object.expenditure_count} transactions)
                    </h4>
                    {(() => {
                      type Row = typeof report.expenditure_object.expenditure_list[number];
                      const columns: ColumnDef<Row>[] = [
                        { accessorKey: 'sNo', header: 'S.No' },
                        { accessorKey: 'voucher_no', header: 'Voucher No' },
                        { accessorKey: 'bill_date', header: 'Bill Date',
                          cell: ({ getValue }) => (
                            <span>{new Date(String(getValue())).toLocaleDateString()}</span>
                          )
                        },
                        { accessorKey: 'purpose', header: 'Purpose' },
                        { accessorKey: 'payment_method', header: 'Payment Method',
                          cell: ({ getValue }) => (
                            <Badge variant="secondary" className="text-xs">{String(getValue())}</Badge>
                          )
                        },
                        { accessorKey: 'amount', header: 'Amount',
                          cell: ({ getValue }) => (
                            <span className="font-medium text-red-700">{formatCurrency(Number(getValue()))}</span>
                          )
                        },
                        { accessorKey: 'created_by', header: 'Created By' },
                      ];
                      return (
                        <DataTable<Row>
                          data={report.expenditure_object.expenditure_list}
                          columns={columns}
                          searchKey={'purpose' as keyof Row}
                          showSearch={true}
                          emptyMessage="No expenditure details"
                        />
                      );
                    })()}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default CollegeFinanceReportDialog;
