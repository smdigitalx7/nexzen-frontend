/**
 * Multiple Payment Form Component
 * Main orchestrator for multiple payment functionality
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, AlertCircle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PurposeSelectionModal } from './PurposeSelectionModal';
import { PaymentItemsList } from './PaymentItemsList';
import { PaymentSummary } from './PaymentSummary';
import { BookFeeComponent } from './components/BookFeeComponent';
import { TuitionFeeComponent } from './components/TuitionFeeComponent';
import { TransportFeeComponent } from './components/TransportFeeComponent';
import { OtherComponent } from './components/OtherComponent';
import { PaymentValidator } from '../validation/PaymentValidation';
import type { 
  MultiplePaymentFormProps, 
  PaymentItem, 
  PaymentPurpose, 
  PaymentMethod,
  MultiplePaymentData,
  PaymentError 
} from '../types/PaymentTypes';

export const MultiplePaymentForm: React.FC<MultiplePaymentFormProps> = ({
  student,
  feeBalances,
  config,
  onPaymentComplete,
  onCancel
}) => {
  const [paymentItems, setPaymentItems] = useState<PaymentItem[]>([]);
  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [remarks, setRemarks] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);

  // Modal states
  const [showPurposeModal, setShowPurposeModal] = useState<boolean>(false);
  const [showPurposeComponent, setShowPurposeComponent] = useState<boolean>(false);
  const [selectedPurpose, setSelectedPurpose] = useState<PaymentPurpose | null>(null);

  // Calculate total amount whenever payment items change
  useEffect(() => {
    const total = paymentItems.reduce((sum, item) => sum + item.amount, 0);
    setTotalAmount(total);
  }, [paymentItems]);

  // Validate form whenever payment items change
  useEffect(() => {
    if (paymentItems.length > 0) {
      const validation = PaymentValidator.validateForm(
        {
          studentId: student.studentId,
          admissionNo: student.admissionNo,
          details: paymentItems,
          remarks,
          totalAmount
        },
        config.validationRules
      );
      
      setErrors(validation.errors);
      setWarnings(validation.warnings);
    } else {
      setErrors([]);
      setWarnings([]);
    }
  }, [paymentItems, remarks, totalAmount, student, config.validationRules]);

  const handleAddPayment = () => {
    setShowPurposeModal(true);
  };

  const handlePurposeSelect = (purpose: PaymentPurpose) => {
    setSelectedPurpose(purpose);
    setShowPurposeModal(false);
    setShowPurposeComponent(true);
  };

  const handlePurposeComponentCancel = () => {
    setShowPurposeComponent(false);
    setSelectedPurpose(null);
  };

  const handlePaymentItemAdd = (item: PaymentItem) => {
    setPaymentItems(prev => [...prev, item]);
    setShowPurposeComponent(false);
    setSelectedPurpose(null);
  };

  const handlePaymentItemEdit = (item: PaymentItem) => {
    // Remove the item and open the appropriate component for editing
    setPaymentItems(prev => prev.filter(i => i.id !== item.id));
    setSelectedPurpose(item.purpose);
    setShowPurposeComponent(true);
  };

  const handlePaymentItemRemove = (itemId: string) => {
    setPaymentItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      const paymentData: MultiplePaymentData = {
        studentId: student.studentId,
        admissionNo: student.admissionNo,
        details: paymentItems,
        remarks: remarks.trim() || undefined,
        totalAmount
      };

      // Final validation
      const validation = PaymentValidator.validateForm(paymentData, config.validationRules);
      if (!validation.isValid) {
        setErrors(validation.errors);
        setIsSubmitting(false);
        return;
      }

      await onPaymentComplete(paymentData);
    } catch (error) {
      console.error('Payment submission error:', error);
      setErrors(['Payment submission failed. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getAvailablePurposes = (): PaymentPurpose[] => {
    const allPurposes: PaymentPurpose[] = ['BOOK_FEE', 'TUITION_FEE', 'TRANSPORT_FEE', 'OTHER'];
    const addedPurposes = paymentItems.map(item => item.purpose);
    
    // Filter out duplicates based on business rules
    return allPurposes.filter(purpose => {
      if (purpose === 'BOOK_FEE') {
        return !addedPurposes.includes('BOOK_FEE');
      }
      return true; // Allow multiple tuition, transport, and other payments
    });
  };

  const getAddedPurposes = (): PaymentPurpose[] => {
    return paymentItems.map(item => item.purpose);
  };

  const renderPurposeComponent = () => {
    if (!selectedPurpose || !showPurposeComponent) return null;

    const commonProps = {
      student,
      feeBalances,
      config,
      onAdd: handlePaymentItemAdd,
      onCancel: handlePurposeComponentCancel
    };

    switch (selectedPurpose) {
      case 'BOOK_FEE':
        return <BookFeeComponent {...commonProps} />;
      case 'TUITION_FEE':
        return <TuitionFeeComponent {...commonProps} />;
      case 'TRANSPORT_FEE':
        return <TransportFeeComponent {...commonProps} />;
      case 'OTHER':
        return <OtherComponent {...commonProps} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Student Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Student Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <span className="text-sm text-gray-600">Student Name:</span>
              <p className="font-medium">{student.name}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Admission No:</span>
              <p className="font-medium">{student.admissionNo}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Class:</span>
              <p className="font-medium">{student.className}</p>
            </div>
            <div>
              <span className="text-sm text-gray-600">Academic Year:</span>
              <p className="font-medium">{student.academicYear}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Items List */}
      <PaymentItemsList
        items={paymentItems}
        onAdd={handleAddPayment}
        onEdit={handlePaymentItemEdit}
        onRemove={handlePaymentItemRemove}
        institutionType={config.institutionType}
        errors={errors}
        warnings={warnings}
      />

      {/* Payment Summary */}
      {paymentItems.length > 0 && (
        <PaymentSummary
          totalAmount={totalAmount}
          paymentMethod={paymentMethod}
          remarks={remarks}
          onPaymentMethodChange={setPaymentMethod}
          onRemarksChange={setRemarks}
          onSubmit={handleSubmit}
          onCancel={onCancel}
          isSubmitting={isSubmitting}
          disabled={errors.length > 0}
        />
      )}

      {/* Purpose Selection Modal */}
      <PurposeSelectionModal
        isOpen={showPurposeModal}
        availablePurposes={getAvailablePurposes()}
        addedPurposes={getAddedPurposes()}
        onPurposeSelect={handlePurposeSelect}
        onClose={() => setShowPurposeModal(false)}
      />

      {/* Purpose-Specific Component */}
      <AnimatePresence>
        {showPurposeComponent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {renderPurposeComponent()}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success/Error Messages */}
      <AnimatePresence>
        {errors.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {errors.map((error, index) => (
                    <div key={index} className="text-sm">
                      {error}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {warnings.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {warnings.map((warning, index) => (
                    <div key={index} className="text-sm">
                      {warning}
                    </div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MultiplePaymentForm;
