import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle, 
  Download, 
  Share2, 
  Copy, 
  X,
  Clock,
  CreditCard,
  Receipt,
  Check
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
import { ReceiptDownload } from './ReceiptDownload';
import { cn } from '@/common/utils';
import { PaymentData } from './PaymentProcessor';

export interface PaymentSuccessProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentData: PaymentData;
  onClose: () => void;
}

const PaymentSuccess: React.FC<PaymentSuccessProps> = ({
  open,
  onOpenChange,
  paymentData,
  onClose
}) => {
  const [showReceipt, setShowReceipt] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleClose = () => {
    onClose();
    onOpenChange(false);
  };

  const handleCopyTransactionId = async () => {
    if (paymentData.transactionId) {
      try {
        await navigator.clipboard.writeText(paymentData.transactionId);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy transaction ID:', err);
      }
    }
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

  const containerVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
        staggerChildren: 0.1
      }
    },
    exit: {
      opacity: 0,
      scale: 0.8,
      transition: { duration: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const successIconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 15,
        duration: 0.6
      }
    }
  };

  const pulseVariants = {
    hidden: { scale: 1, opacity: 0.8 },
    visible: {
      scale: [1, 1.1, 1],
      opacity: [0.8, 1, 0.8],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" size="lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            Payment Successful
          </DialogTitle>
          <DialogDescription>
            Your payment has been processed successfully
          </DialogDescription>
        </DialogHeader>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="space-y-6"
        >
          {/* Success Animation */}
          <motion.div
            variants={itemVariants}
            className="flex justify-center"
          >
            <div className="relative">
              <motion.div
                variants={successIconVariants}
                className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center"
              >
                <CheckCircle className="w-12 h-12 text-green-600" />
              </motion.div>
              <motion.div
                variants={pulseVariants}
                className="absolute inset-0 w-20 h-20 bg-green-200 rounded-full -z-10"
              />
            </div>
          </motion.div>

          {/* Success Message */}
          <motion.div
            variants={itemVariants}
            className="text-center space-y-2"
          >
            <h3 className="text-xl font-semibold text-green-600">
              Payment Completed!
            </h3>
            <p className="text-muted-foreground">
              Your payment of {paymentData.currency} {paymentData.amount.toFixed(2)} has been processed successfully.
            </p>
          </motion.div>

          {/* Transaction Details */}
          <motion.div variants={itemVariants}>
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Receipt className="w-5 h-5" />
                  Transaction Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Transaction ID</span>
                    <div className="flex items-center gap-2 mt-1">
                      <code className="font-mono text-xs bg-white px-2 py-1 rounded border">
                        {paymentData.transactionId}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyTransactionId}
                        className="h-6 w-6 p-0"
                      >
                        {copied ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-muted-foreground">Date & Time</span>
                    <p className="font-medium">
                      {paymentData.timestamp ? formatDate(paymentData.timestamp) : 'N/A'}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Amount</span>
                    <span className="font-medium">
                      {paymentData.currency} {paymentData.amount.toFixed(2)}
                    </span>
                  </div>
                  
                  {paymentData.fees && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Processing Fee</span>
                      <span className="font-medium">
                        {paymentData.currency} {paymentData.fees.toFixed(2)}
                      </span>
                    </div>
                  )}
                  
                  {paymentData.totalAmount && (
                    <>
                      <Separator />
                      <div className="flex justify-between text-sm font-semibold">
                        <span>Total Amount</span>
                        <span className="text-green-600">
                          {paymentData.currency} {paymentData.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Payment Method</span>
                  <Badge variant="secondary" className="capitalize">
                    {paymentData.paymentMethod}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            variants={itemVariants}
            className="flex gap-3"
          >
            <Button
              onClick={() => setShowReceipt(true)}
              className="flex-1"
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Receipt
            </Button>
            
            <Button
              onClick={handleClose}
              className="flex-1"
            >
              <Check className="w-4 h-4 mr-2" />
              Done
            </Button>
          </motion.div>

          {/* Additional Info */}
          <motion.div
            variants={itemVariants}
            className="text-center text-xs text-muted-foreground space-y-1"
          >
            <p>A confirmation email has been sent to your registered email address.</p>
            <p>Keep this transaction ID for your records.</p>
          </motion.div>
        </motion.div>

        {/* Receipt Download Dialog */}
        <ReceiptDownload
          open={showReceipt}
          onOpenChange={setShowReceipt}
          paymentData={paymentData}
        />
      </DialogContent>
    </Dialog>
  );
};

export { PaymentSuccess };
