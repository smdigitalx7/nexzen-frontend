import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Download, 
  Mail, 
  Share2, 
  FileText, 
  CheckCircle, 
  Loader2,
  X,
  AlertCircle,
  Eye,
  Printer,
  Receipt
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/common/components/ui/dialog';
import { Button } from '@/common/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/common/components/ui/card';
import { Badge } from '@/common/components/ui/badge';
import { Separator } from '@/common/components/ui/separator';
import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { useGeneratePaymentReceipt, useDownloadPaymentReceipt, useSendReceiptEmail } from '@/features/general/hooks/use-payment-receipts';
import { cn } from '@/common/utils';
import { getExportFilename } from '@/common/utils/export/excel-export-utils';
import { PaymentData } from './PaymentProcessor';

export interface ReceiptDownloadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentData: PaymentData;
}

const ReceiptDownload: React.FC<ReceiptDownloadProps> = ({
  open,
  onOpenChange,
  paymentData
}) => {
  const [email, setEmail] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [downloadStatus, setDownloadStatus] = useState<'idle' | 'generating' | 'downloading' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const generateReceiptMutation = useGeneratePaymentReceipt();
  const downloadReceiptMutation = useDownloadPaymentReceipt();
  const sendEmailMutation = useSendReceiptEmail();

  const handleGenerateReceipt = async () => {
    try {
      setDownloadStatus('generating');
      setError(null);

      const receiptData = {
        id: paymentData.id,
        transactionId: paymentData.transactionId || `TXN${Date.now()}`,
        amount: paymentData.amount,
        currency: paymentData.currency,
        description: paymentData.description,
        merchant: paymentData.merchant,
        paymentMethod: paymentData.paymentMethod,
        status: paymentData.status,
        timestamp: paymentData.timestamp?.toISOString() || new Date().toISOString(),
        fees: paymentData.fees,
        totalAmount: paymentData.totalAmount,
        studentName: 'Student Name', // This would come from your student data
        studentId: 'STU001', // This would come from your student data
        classInfo: 'Class 10A', // This would come from your student data
        academicYear: '2024-25', // This would come from your academic year data
        branchName: 'Main Branch' // This would come from your branch data
      };

      const response = await generateReceiptMutation.mutateAsync(receiptData);
      
      setDownloadStatus('downloading');
      
      // Download the receipt
      const blob = await downloadReceiptMutation.mutateAsync(response.receiptId);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = getExportFilename(`payment-receipt-${response.receiptData.transactionId}`, "pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setDownloadStatus('success');
    } catch (err) {
      setDownloadStatus('error');
      setError(err instanceof Error ? err.message : 'Failed to generate receipt');
    }
  };

  const handleSendEmail = async () => {
    if (!email.trim()) return;

    try {
      setError(null);
      await sendEmailMutation.mutateAsync({
        receiptId: paymentData.transactionId || `TXN${Date.now()}`,
        email: email.trim()
      });
      setShowEmailForm(false);
      setEmail('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send email');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'generating': 
      case 'downloading': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return CheckCircle;
      case 'error': return AlertCircle;
      case 'generating': 
      case 'downloading': return Loader2;
      default: return FileText;
    }
  };

  const StatusIcon = getStatusIcon(downloadStatus);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" size="lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-600" />
            Download Receipt
          </DialogTitle>
          <DialogDescription>
            Generate and download your payment receipt
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Receipt Preview */}
          <Card className="border-2 border-blue-100 bg-blue-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Receipt className="w-5 h-5" />
                Payment Receipt Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Transaction ID</span>
                  <p className="font-mono text-xs mt-1">
                    {paymentData.transactionId || 'TXN' + Date.now()}
                  </p>
                </div>
                <div>
                  <span className="text-muted-foreground">Date</span>
                  <p className="font-medium">
                    {paymentData.timestamp ? formatDate(paymentData.timestamp) : 'N/A'}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-semibold text-lg">
                    {paymentData.currency} {paymentData.amount.toFixed(2)}
                  </span>
                </div>
                
                {paymentData.fees && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Processing Fee</span>
                    <span>{paymentData.currency} {paymentData.fees.toFixed(2)}</span>
                  </div>
                )}
                
                {paymentData.totalAmount && (
                  <>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span className="text-green-600">
                        {paymentData.currency} {paymentData.totalAmount.toFixed(2)}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Payment Method</span>
                  <Badge variant="secondary" className="ml-2 capitalize">
                    {paymentData.paymentMethod}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Status</span>
                  <Badge 
                    variant="outline" 
                    className={cn("ml-2", getStatusColor(paymentData.status))}
                  >
                    {paymentData.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Download Status */}
          <AnimatePresence>
            {downloadStatus !== 'idle' && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border",
                  getStatusColor(downloadStatus)
                )}
              >
                <StatusIcon className={cn(
                  "w-5 h-5",
                  (downloadStatus === 'generating' || downloadStatus === 'downloading') && "animate-spin"
                )} />
                <div className="flex-1">
                  <p className="font-medium">
                    {downloadStatus === 'generating' && 'Generating receipt...'}
                    {downloadStatus === 'downloading' && 'Downloading receipt...'}
                    {downloadStatus === 'success' && 'Receipt downloaded successfully!'}
                    {downloadStatus === 'error' && 'Failed to download receipt'}
                  </p>
                  {downloadStatus === 'success' && (
                    <p className="text-sm opacity-75">
                      The receipt has been saved to your downloads folder.
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg"
              >
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-600">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Email Form */}
          <AnimatePresence>
            {showEmailForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3 p-4 bg-gray-50 rounded-lg"
              >
                <Label htmlFor="email">Email Address</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendEmail}
                    disabled={!email.trim() || sendEmailMutation.isPending}
                    size="sm"
                  >
                    {sendEmailMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Mail className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={handleGenerateReceipt}
              disabled={downloadStatus === 'generating' || downloadStatus === 'downloading'}
              className="flex-1"
            >
              {downloadStatus === 'generating' || downloadStatus === 'downloading' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Download className="w-4 h-4 mr-2" />
              )}
              {downloadStatus === 'generating' ? 'Generating...' : 
               downloadStatus === 'downloading' ? 'Downloading...' : 
               'Download PDF'}
            </Button>
            
            <Button
              onClick={() => setShowEmailForm(!showEmailForm)}
              variant="outline"
              className="flex-1"
            >
              <Mail className="w-4 h-4 mr-2" />
              Email
            </Button>
            
            <Button
              onClick={handlePrint}
              variant="outline"
              size="icon"
            >
              <Printer className="w-4 h-4" />
            </Button>
          </div>

          {/* Additional Options */}
          <div className="flex justify-center gap-4 text-sm text-muted-foreground">
            <span>• PDF Format</span>
            <span>• Print Ready</span>
            <span>• Email Support</span>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export { ReceiptDownload };
