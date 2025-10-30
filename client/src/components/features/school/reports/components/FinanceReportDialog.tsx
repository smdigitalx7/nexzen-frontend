import React from 'react';
import { motion } from 'framer-motion';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  DollarSign, 
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
import { formatCurrency } from '@/lib/utils';
import { SchoolFinanceReport } from '@/lib/types/school/income';
import { exportFinanceReportToExcel, generateExportFilename } from '@/lib/utils/export-utils';
import { Loading } from '@/components/ui/loading';

interface FinanceReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reportData: SchoolFinanceReport[];
  loading?: boolean;
}

export const FinanceReportDialog: React.FC<FinanceReportDialogProps> = ({
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
          
          <div className="flex items-center justify-center py-12">
            <Loading 
              size="lg" 
              variant="spinner" 
              context="data" 
              message="Loading finance report data..."
            />
          </div>
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
              Finance Report
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
    switch (status.toUpperCase()) {
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
    switch (status.toUpperCase()) {
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


  const handleDownload = () => {
    try {
      const filename = generateExportFilename(reportData);
      exportFinanceReportToExcel(reportData, filename);
    } catch (error) {
      console.error('Error exporting finance report:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Finance Report
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
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>

        <ScrollArea className="h-[70vh]">
          <div className="space-y-6">
            {reportData.map((report, index) => (
              <motion.div
                key={`${report.branch_id}-${report.report_date}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border rounded-lg p-6 bg-white"
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
                      <DollarSign className="h-4 w-4 text-green-600" />
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
                    
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2 font-medium">S.No</th>
                            <th className="text-left p-2 font-medium">Receipt No</th>
                            <th className="text-left p-2 font-medium">Student</th>
                            <th className="text-left p-2 font-medium">ID No</th>
                            <th className="text-left p-2 font-medium">Purpose</th>
                            <th className="text-left p-2 font-medium">Payment Method</th>
                            <th className="text-right p-2 font-medium">Amount</th>
                            <th className="text-left p-2 font-medium">Created By</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.income_object.income_list.map((income, idx) => (
                            <tr key={idx} className="border-b hover:bg-gray-50">
                              <td className="p-2">{income.sNo}</td>
                              <td className="p-2 font-mono text-sm">{income.receipt_no}</td>
                              <td className="p-2">{income.student_name}</td>
                              <td className="p-2 font-mono text-sm">{income.identity_no}</td>
                              <td className="p-2">
                                <Badge variant="outline" className="text-xs">
                                  {income.purpose}
                                </Badge>
                              </td>
                              <td className="p-2">
                                <Badge variant="secondary" className="text-xs">
                                  {income.payment_method}
                                </Badge>
                              </td>
                              <td className="p-2 text-right font-medium text-green-700">
                                {formatCurrency(income.amount)}
                              </td>
                              <td className="p-2 text-sm text-muted-foreground">
                                {income.created_by}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Expenditure Details */}
                {report.expenditure_object.expenditure_list.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-red-600" />
                      Expenditure Details ({report.expenditure_object.expenditure_count} transactions)
                    </h4>
                    
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2 font-medium">S.No</th>
                            <th className="text-left p-2 font-medium">Voucher No</th>
                            <th className="text-left p-2 font-medium">Bill Date</th>
                            <th className="text-left p-2 font-medium">Purpose</th>
                            <th className="text-left p-2 font-medium">Payment Method</th>
                            <th className="text-right p-2 font-medium">Amount</th>
                            <th className="text-left p-2 font-medium">Created By</th>
                          </tr>
                        </thead>
                        <tbody>
                          {report.expenditure_object.expenditure_list.map((expenditure, idx) => (
                            <tr key={idx} className="border-b hover:bg-gray-50">
                              <td className="p-2">{expenditure.sNo}</td>
                              <td className="p-2 font-mono text-sm">{expenditure.voucher_no}</td>
                              <td className="p-2">
                                {new Date(expenditure.bill_date).toLocaleDateString()}
                              </td>
                              <td className="p-2">{expenditure.purpose}</td>
                              <td className="p-2">
                                <Badge variant="secondary" className="text-xs">
                                  {expenditure.payment_method}
                                </Badge>
                              </td>
                              <td className="p-2 text-right font-medium text-red-700">
                                {formatCurrency(expenditure.amount)}
                              </td>
                              <td className="p-2 text-sm text-muted-foreground">
                                {expenditure.created_by}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
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

export default FinanceReportDialog;

