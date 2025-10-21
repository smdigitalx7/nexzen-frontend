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
  Download,
  Printer
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { SchoolFinanceReport } from '@/lib/types/school/income';

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
              No finance report data available for the selected period.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <p className="text-muted-foreground">No data to display</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const report = reportData[0]; // Assuming single report for now

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

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // TODO: Implement download functionality
    console.log('Downloading finance report...');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] print:max-w-none print:max-h-none">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Finance Report
              </DialogTitle>
              <DialogDescription>
                Comprehensive financial report for {report.institute_name}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2 print:hidden">
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button variant="outline" size="sm" onClick={handleDownload}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[70vh] print:h-auto">
          <div className="space-y-6 print:space-y-4">
            {/* Header Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border print:bg-white print:border-gray-300"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {report.institute_name}
                  </h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      {report.branch_name} - {report.branch_type}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {report.branch_phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {report.branch_email}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">Report Date:</span>
                  </div>
                  <p className="text-lg font-semibold">{report.report_date}</p>
                  <p className="text-xs text-gray-500">
                    Generated: {new Date(report.generated_at).toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Financial Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4"
            >
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-800">Total Income</span>
                </div>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(report.total_income)}
                </p>
                <p className="text-xs text-green-600">
                  {report.income_object.income_count} transactions
                </p>
              </div>

              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium text-red-800">Total Expenditure</span>
                </div>
                <p className="text-2xl font-bold text-red-900">
                  {formatCurrency(report.total_expenditure)}
                </p>
                <p className="text-xs text-red-600">
                  {report.expenditure_object.expenditure_count} transactions
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Profit/Loss</span>
                </div>
                <p className={`text-2xl font-bold ${report.profit_loss >= 0 ? 'text-green-900' : 'text-red-900'}`}>
                  {formatCurrency(report.profit_loss)}
                </p>
                <p className="text-xs text-blue-600">
                  {report.profit_loss >= 0 ? 'Profit' : 'Loss'}
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
            </motion.div>

            {/* Income Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Receipt className="h-5 w-5 text-green-600" />
                Income Details
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-green-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                          S.No
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                          Receipt No
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                          Student
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                          Purpose
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">
                          Payment Method
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-green-800 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {report.income_object.income_list.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.sNo}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.receipt_no}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{item.student_name}</div>
                              <div className="text-gray-500">{item.identity_no}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.purpose}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <Badge variant="outline">{item.payment_method}</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-green-100">
                      <tr>
                        <td colSpan={5} className="px-4 py-3 text-right text-sm font-medium text-green-800">
                          Total Income:
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-green-900">
                          {formatCurrency(report.income_object.total_income)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </motion.div>

            {/* Expenditure Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-red-600" />
                Expenditure Details
              </h3>
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-red-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">
                          S.No
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">
                          Voucher No
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">
                          Bill Date
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">
                          Purpose
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-red-800 uppercase tracking-wider">
                          Payment Method
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-red-800 uppercase tracking-wider">
                          Amount
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {report.expenditure_object.expenditure_list.map((item, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.sNo}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.voucher_no}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {new Date(item.bill_date).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item.purpose}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <Badge variant="outline">{item.payment_method}</Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right font-medium">
                            {formatCurrency(item.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-red-100">
                      <tr>
                        <td colSpan={5} className="px-4 py-3 text-right text-sm font-medium text-red-800">
                          Total Expenditure:
                        </td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-red-900">
                          {formatCurrency(report.expenditure_object.total_expenditure)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </motion.div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default FinanceReportDialog;
