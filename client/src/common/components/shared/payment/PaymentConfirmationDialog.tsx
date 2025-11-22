import React from 'react';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Shield, 
  AlertTriangle, 
  CheckCircle,
  X,
  Lock
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/common/components/ui/dialog';
import { Button } from '@/common/components/ui/button';
import { Card, CardContent } from '@/common/components/ui/card';
import { Badge } from '@/common/components/ui/badge';
import { Separator } from '@/common/components/ui/separator';
import { cn } from '@/common/utils';
import { PaymentData } from './PaymentProcessor';

export interface PaymentConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentData: PaymentData;
  onConfirm: () => void;
  onCancel: () => void;
}

const PaymentConfirmationDialog: React.FC<PaymentConfirmationDialogProps> = ({
  open,
  onOpenChange,
  paymentData,
  onConfirm,
  onCancel
}) => {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  const handleCancel = () => {
    onCancel();
    onOpenChange(false);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case 'card': return CreditCard;
      case 'upi': return 'UPI';
      case 'netbanking': return '🏦';
      case 'wallet': return '💳';
      default: return CreditCard;
    }
  };

  const PaymentMethodIcon = getPaymentMethodIcon(paymentData.paymentMethod);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" size="md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-600" />
            Confirm Payment
          </DialogTitle>
          <DialogDescription>
            Please review your payment details before proceeding
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Payment Summary Card */}
          <Card className="border-2 border-blue-100 bg-blue-50/50">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Amount</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {paymentData.currency} {paymentData.amount.toFixed(2)}
                  </span>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Description</span>
                    <span className="text-right max-w-[200px] truncate">
                      {paymentData.description}
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Merchant</span>
                    <span>{paymentData.merchant}</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Payment Method</span>
                    <div className="flex items-center gap-2">
                      {typeof PaymentMethodIcon === 'string' ? (
                        <span className="text-lg">{PaymentMethodIcon}</span>
                      ) : (
                        <PaymentMethodIcon className="w-4 h-4" />
                      )}
                      <Badge variant="secondary" className="capitalize">
                        {paymentData.paymentMethod}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Notice */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg"
          >
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-green-800">Secure Payment</p>
              <p className="text-xs text-green-700">
                Your payment is protected by bank-level security. We never store your card details.
              </p>
            </div>
          </motion.div>

          {/* Payment Method Info */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="p-3 bg-blue-50 border border-blue-200 rounded-lg"
          >
            <div className="flex items-center gap-2">
              {typeof PaymentMethodIcon === 'string' ? (
                <span className="text-lg">{PaymentMethodIcon}</span>
              ) : (
                <PaymentMethodIcon className="w-4 h-4 text-blue-600" />
              )}
              <span className="text-sm font-medium text-blue-800 capitalize">
                {paymentData.paymentMethod} Payment
              </span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              {paymentData.paymentMethod === 'card' 
                ? 'Your card details will be securely processed by our payment partner.'
                : paymentData.paymentMethod === 'upi'
                ? 'You will be redirected to your UPI app to complete the payment.'
                : paymentData.paymentMethod === 'netbanking'
                ? 'You will be redirected to your bank\'s secure portal.'
                : paymentData.paymentMethod === 'wallet'
                ? 'You will be redirected to your digital wallet to complete the payment.'
                : 'Your payment will be securely processed.'
              }
            </p>
          </motion.div>

          {/* Warning Notice */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg"
          >
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-800">Important</p>
              <p className="text-xs text-amber-700">
                Once confirmed, this payment cannot be cancelled. Please ensure all details are correct.
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="flex gap-3 pt-4"
        >
          <Button
            onClick={handleCancel}
            variant="outline"
            className="flex-1"
          >
            <X className="w-4 h-4 mr-2" />
            Cancel
          </Button>
          
          <Button
            onClick={handleConfirm}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            <Lock className="w-4 h-4 mr-2" />
            Confirm Payment
          </Button>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};

export { PaymentConfirmationDialog };
