/**
 * Purpose Selection Modal Component
 * Allows users to select payment purpose for multiple payment form
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, GraduationCap, Truck, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { PurposeSelectionProps, PaymentPurpose } from '@/components/shared/payment/types/PaymentTypes';

const purposeConfig = {
  BOOK_FEE: {
    label: 'Book Fee',
    icon: BookOpen,
    description: 'One-time book fee payment',
    color: 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100',
    disabledColor: 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
  },
  TUITION_FEE: {
    label: 'Tuition Fee',
    icon: GraduationCap,
    description: 'Term-based tuition payments',
    color: 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100',
    disabledColor: 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
  },
  TRANSPORT_FEE: {
    label: 'Transport Fee',
    icon: Truck,
    description: 'Term-based transport payments',
    color: 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100',
    disabledColor: 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
  },
  OTHER: {
    label: 'Other',
    icon: Plus,
    description: 'Custom purpose payments',
    color: 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100',
    disabledColor: 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
  }
};

export const PurposeSelectionModal: React.FC<PurposeSelectionProps> = ({
  availablePurposes,
  addedPurposes,
  onPurposeSelect,
  onClose,
  isOpen = false
}) => {
  const handlePurposeClick = (purpose: PaymentPurpose) => {
    if (addedPurposes.includes(purpose)) {
      return; // Don't allow selection of already added purposes
    }
    onPurposeSelect(purpose);
  };

  const isPurposeAdded = (purpose: PaymentPurpose) => {
    return addedPurposes.includes(purpose);
  };

  const isPurposeAvailable = (purpose: PaymentPurpose) => {
    return availablePurposes.includes(purpose);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Payment Item
          </DialogTitle>
          <DialogDescription>
            Select the type of payment you want to add to this transaction.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Purpose Selection Grid */}
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(purposeConfig).map(([purpose, config]) => {
              const PurposeIcon = config.icon;
              const isAdded = isPurposeAdded(purpose as PaymentPurpose);
              const isAvailable = isPurposeAvailable(purpose as PaymentPurpose);
              const isDisabled = isAdded || !isAvailable;

              return (
                <motion.div
                  key={purpose}
                  whileHover={!isDisabled ? { scale: 1.02 } : {}}
                  whileTap={!isDisabled ? { scale: 0.98 } : {}}
                >
                  <Card
                    className={`cursor-pointer transition-all duration-200 ${
                      isDisabled
                        ? config.disabledColor
                        : config.color
                    }`}
                    onClick={() => handlePurposeClick(purpose as PaymentPurpose)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="flex flex-col items-center space-y-2">
                        <PurposeIcon className="h-8 w-8" />
                        <div className="space-y-1">
                          <h3 className="font-medium text-sm">
                            {config.label}
                          </h3>
                          <p className="text-xs opacity-75">
                            {config.description}
                          </p>
                        </div>
                        
                        {/* Status Badge */}
                        <AnimatePresence>
                          {isAdded && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.8 }}
                            >
                              <Badge variant="secondary" className="text-xs">
                                Added
                              </Badge>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Added Purposes Summary */}
          {addedPurposes.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-lg p-3"
            >
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                Already Added:
              </h4>
              <div className="flex flex-wrap gap-2">
                {addedPurposes.map((purpose: PaymentPurpose) => {
                  const config = purposeConfig[purpose];
                  return (
                    <Badge key={purpose} variant="outline" className="text-xs">
                      {config.label}
                    </Badge>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* Available Purposes Info */}
          {availablePurposes.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center"
            >
              <p className="text-sm text-gray-600">
                All available payment types have been added to this transaction.
              </p>
            </motion.div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PurposeSelectionModal;
