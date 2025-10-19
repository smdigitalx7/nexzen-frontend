import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Shield, 
  Clock,
  AlertCircle,
  ArrowRight,
  Lock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { PaymentConfirmationDialog } from '@/components/shared/payment/PaymentConfirmationDialog';
import { PaymentSuccess } from '@/components/shared/payment/PaymentSuccess';

export interface PaymentData {
  id: string;
  amount: number;
  currency: string;
  description: string;
  merchant: string;
  paymentMethod: 'card' | 'upi' | 'netbanking' | 'wallet';
  status: 'pending' | 'processing' | 'success' | 'failed' | 'cancelled';
  transactionId?: string;
  timestamp?: Date;
  fees?: number;
  totalAmount?: number;
}

export interface PaymentProcessorProps {
  paymentData: PaymentData;
  onPaymentComplete?: (paymentData: PaymentData) => void;
  onPaymentFailed?: (error: string) => void;
  onPaymentCancel?: () => void;
  className?: string;
  autoProcess?: boolean;
  processingDelay?: number;
}

const PaymentProcessor: React.FC<PaymentProcessorProps> = ({
  paymentData,
  onPaymentComplete,
  onPaymentFailed,
  onPaymentCancel,
  className,
  autoProcess = false,
  processingDelay = 3000
}) => {
  const [currentStep, setCurrentStep] = useState<'confirm' | 'processing' | 'success' | 'failed'>('confirm');
  const [progress, setProgress] = useState(0);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps = [
    { id: 'confirm', label: 'Confirm Payment', icon: CreditCard },
    { id: 'processing', label: 'Processing', icon: Loader2 },
    { id: 'success', label: 'Success', icon: CheckCircle },
    { id: 'failed', label: 'Failed', icon: XCircle }
  ];

  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  useEffect(() => {
    if (autoProcess && currentStep === 'confirm') {
      handleConfirmPayment();
    }
  }, [autoProcess, currentStep]);

  const handleConfirmPayment = () => {
    setShowConfirmation(true);
  };

  const handleConfirmationConfirm = async () => {
    setShowConfirmation(false);
    setCurrentStep('processing');
    setProgress(0);
    setError(null);

    // Simulate processing with progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    // Simulate processing delay
    setTimeout(() => {
      clearInterval(progressInterval);
      setProgress(100);
      
      // Simulate success/failure (90% success rate)
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        const successData = {
          ...paymentData,
          status: 'success' as const,
          transactionId: `TXN${Date.now()}`,
          timestamp: new Date(),
          fees: paymentData.amount * 0.02, // 2% fee
          totalAmount: paymentData.amount + (paymentData.amount * 0.02)
        };
        
        setCurrentStep('success');
        setShowSuccess(true);
        onPaymentComplete?.(successData);
      } else {
        setCurrentStep('failed');
        setError('Payment processing failed. Please try again.');
        onPaymentFailed?.('Payment processing failed');
      }
    }, processingDelay);
  };

  const handleConfirmationCancel = () => {
    setShowConfirmation(false);
    onPaymentCancel?.();
  };

  const handleRetry = () => {
    setCurrentStep('confirm');
    setProgress(0);
    setError(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'failed': return 'text-red-600 bg-red-50 border-red-200';
      case 'processing': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return CheckCircle;
      case 'failed': return XCircle;
      case 'processing': return Loader2;
      default: return Clock;
    }
  };

  const StatusIcon = getStatusIcon(currentStep);

  return (
    <div className={cn("w-full max-w-md mx-auto", className)}>
      <Card className="overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold">Payment Processing</CardTitle>
            <Badge 
              variant="outline" 
              className={cn("flex items-center gap-1", getStatusColor(currentStep))}
            >
              <StatusIcon className="w-3 h-3" />
              {currentStep.charAt(0).toUpperCase() + currentStep.slice(1)}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Payment Details */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Amount</span>
              <span className="font-semibold">
                {paymentData.currency} {paymentData.amount.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Description</span>
              <span className="text-sm text-right max-w-[200px] truncate">
                {paymentData.description}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Merchant</span>
              <span className="text-sm">{paymentData.merchant}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Payment Method</span>
              <Badge variant="secondary" className="capitalize">
                {paymentData.paymentMethod}
              </Badge>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = index === currentStepIndex;
                const isCompleted = index < currentStepIndex;
                
                return (
                  <div key={step.id} className="flex flex-col items-center space-y-2">
                    <motion.div
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors",
                        isCompleted && "bg-green-500 border-green-500 text-white",
                        isActive && "bg-blue-500 border-blue-500 text-white",
                        !isActive && !isCompleted && "bg-gray-100 border-gray-300 text-gray-400"
                      )}
                      animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                      transition={{ duration: 0.5, repeat: isActive ? Infinity : 0 }}
                    >
                      <StepIcon className="w-4 h-4" />
                    </motion.div>
                    <span className={cn(
                      "text-xs text-center",
                      isActive && "text-blue-600 font-medium",
                      isCompleted && "text-green-600 font-medium",
                      !isActive && !isCompleted && "text-gray-400"
                    )}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Progress Bar */}
            {currentStep === 'processing' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2"
              >
                <div className="flex justify-between text-sm">
                  <span>Processing payment...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </motion.div>
            )}
          </div>

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

          {/* Action Buttons */}
          <div className="space-y-3">
            {currentStep === 'confirm' && (
              <Button 
                onClick={handleConfirmPayment}
                className="w-full"
                size="lg"
              >
                <Shield className="w-4 h-4 mr-2" />
                Confirm & Pay
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            )}

            {currentStep === 'failed' && (
              <div className="space-y-2">
                <Button 
                  onClick={handleRetry}
                  className="w-full"
                  size="lg"
                >
                  Try Again
                </Button>
                <Button 
                  onClick={onPaymentCancel}
                  variant="outline"
                  className="w-full"
                >
                  Cancel
                </Button>
              </div>
            )}

            {currentStep === 'processing' && (
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Lock className="w-4 h-4" />
                <span>Secure payment in progress...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <PaymentConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        paymentData={paymentData}
        onConfirm={handleConfirmationConfirm}
        onCancel={handleConfirmationCancel}
      />

      {/* Success Dialog */}
      <PaymentSuccess
        open={showSuccess}
        onOpenChange={setShowSuccess}
        paymentData={paymentData}
        onClose={() => setShowSuccess(false)}
      />
    </div>
  );
};

export { PaymentProcessor };
