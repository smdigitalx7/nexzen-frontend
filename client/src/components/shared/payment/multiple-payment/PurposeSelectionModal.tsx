/**
 * Purpose Selection Modal Component
 * Allows users to select payment purpose for multiple payment form
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, GraduationCap, Truck, Plus, AlertCircle, Star } from 'lucide-react';
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
import type { PurposeSelectionProps, PaymentPurpose, FeeBalance } from '../types/PaymentTypes';
import { getAllFeePurposeAvailability } from '../validation/PaymentValidation';

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
  paymentItems = [],
  onPurposeSelect,
  onClose,
  isOpen = false,
  feeBalances,
  institutionType = 'school'
}) => {
  // Get fee purpose availability based on balances
  const feeAvailability = feeBalances ? getAllFeePurposeAvailability(feeBalances, institutionType, addedPurposes) : {} as Record<PaymentPurpose, { available: boolean; reason?: string; outstandingAmount?: number }>;
  
  // Check if book fee is required first
  const bookFeeOutstanding = feeBalances?.bookFee.outstanding || 0;
  const bookFeeRequired = bookFeeOutstanding > 0 && !addedPurposes.includes('BOOK_FEE');

  const handlePurposeClick = (purpose: PaymentPurpose) => {
    // Check if purpose is available based on balances
    const availability = feeAvailability[purpose];
    if (availability && !availability.available) {
      return; // Don't allow selection if not available due to balance constraints
    }
    
    // For tuition/transport fees, check if items already exist for this purpose
    if (purpose === 'TUITION_FEE' || purpose === 'TRANSPORT_FEE') {
      const hasExistingItems = paymentItems.some(item => item.purpose === purpose);
      if (hasExistingItems) {
        return; // Don't allow selection if items already exist for this purpose
      }
      
      const availableTerms = getAvailableTerms(purpose);
      if (availableTerms.length === 0) {
        return; // Don't allow selection if no terms are available
      }
    }
    
    // Allow re-selection of deleted purposes
    onPurposeSelect(purpose);
  };

  const isPurposeAdded = (purpose: PaymentPurpose) => {
    return addedPurposes.includes(purpose);
  };

  // Check if a specific term is already added for tuition/transport fees
  const isTermAdded = (purpose: PaymentPurpose, termNumber: number): boolean => {
    return paymentItems.some(item => 
      item.purpose === purpose && item.termNumber === termNumber
    );
  };

  // Get available terms for tuition/transport fees
  const getAvailableTerms = (purpose: PaymentPurpose): number[] => {
    if (purpose !== 'TUITION_FEE' && purpose !== 'TRANSPORT_FEE') {
      return []; // Not applicable for other purposes
    }

    const maxTerms = institutionType === 'college' ? 0 : (purpose === 'TRANSPORT_FEE' ? 2 : 3);
    const availableTerms: number[] = [];

    for (let i = 1; i <= maxTerms; i++) {
      // Check if term has outstanding amount and is not already added
      if (feeBalances) {
        let termData;
        if (purpose === 'TUITION_FEE') {
          const termKey = `term${i}` as 'term1' | 'term2' | 'term3';
          termData = feeBalances.tuitionFee[termKey as keyof typeof feeBalances.tuitionFee];
        } else if (purpose === 'TRANSPORT_FEE') {
          const termKey = `term${i}` as 'term1' | 'term2';
          termData = feeBalances.transportFee[termKey as keyof typeof feeBalances.transportFee];
        }

        if (termData && typeof termData === 'object' && 'outstanding' in termData && termData.outstanding > 0) {
          // Check if this specific term is not already added
          if (!isTermAdded(purpose, i)) {
            availableTerms.push(i);
          }
        }
      }
    }

    return availableTerms;
  };

  const isPurposeAvailable = (purpose: PaymentPurpose) => {
    // First check if it's in the available purposes list
    const inAvailableList = availablePurposes.includes(purpose);
    
    // Then check if it's available based on fee balances
    const availability = feeAvailability[purpose];
    const balanceAvailable = !availability || availability.available;
    
    // For tuition/transport fees, check if any terms are available AND no items exist for this purpose
    if (purpose === 'TUITION_FEE' || purpose === 'TRANSPORT_FEE') {
      const availableTerms = getAvailableTerms(purpose);
      const hasExistingItems = paymentItems.some(item => item.purpose === purpose);
      
      // If there are existing items for this purpose, don't allow adding more
      if (hasExistingItems) {
        return false;
      }
      
      return inAvailableList && balanceAvailable && availableTerms.length > 0;
    }
    
    // For other purposes, allow re-selection if not currently added
    const notCurrentlyAdded = !addedPurposes.includes(purpose);
    return inAvailableList && balanceAvailable && notCurrentlyAdded;
  };

  const getPurposeDisabledReason = (purpose: PaymentPurpose) => {
    const availability = feeAvailability[purpose];
    if (availability && !availability.available) {
      return availability.reason;
    }
    
    // For tuition/transport fees, check if no terms are available or if items already exist
    if (purpose === 'TUITION_FEE' || purpose === 'TRANSPORT_FEE') {
      const hasExistingItems = paymentItems.some(item => item.purpose === purpose);
      if (hasExistingItems) {
        return 'Already added';
      }
      
      const availableTerms = getAvailableTerms(purpose);
      if (availableTerms.length === 0) {
        return 'No outstanding amounts';
      }
    }
    
    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
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
          {/* Book Fee Required Warning */}
          {bookFeeRequired && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-yellow-600" />
                <div className="text-sm">
                  <p className="font-medium text-yellow-800">Book Fee Required First</p>
                  <p className="text-yellow-700">
                    You must select and complete the book fee payment before adding other payment types.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Purpose Selection Grid */}
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(purposeConfig).map(([purpose, config]) => {
              const purposeKey = purpose as PaymentPurpose;
              const PurposeIcon = config.icon;
              const isAdded = isPurposeAdded(purposeKey);
              const isAvailable = isPurposeAvailable(purposeKey);
              const isDisabled = !isAvailable;
              const disabledReason = getPurposeDisabledReason(purposeKey);
              const availability = feeAvailability[purposeKey];

              return (
                <motion.div
                  key={purpose}
                  whileHover={!isDisabled ? { scale: 1.02 } : {}}
                  whileTap={!isDisabled ? { scale: 0.98 } : {}}
                >
                  <Card
                    className={`transition-all duration-200 min-h-[160px] ${
                      isDisabled
                        ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                        : purposeKey === 'BOOK_FEE' && bookFeeRequired
                        ? 'bg-yellow-50 border-yellow-300 text-yellow-800 hover:bg-yellow-100 cursor-pointer'
                        : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 cursor-pointer'
                    } ${config.color}`}
                    onClick={() => handlePurposeClick(purposeKey)}
                    title={disabledReason || undefined}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <PurposeIcon className={`h-8 w-8 ${isDisabled ? 'opacity-50' : ''}`} />
                        <div className="space-y-2 w-full">
                          <div className="flex items-center justify-center gap-1">
                            <h3 className={`font-medium text-sm ${isDisabled ? 'opacity-60' : ''}`}>
                              {config.label}
                            </h3>
                            {purposeKey === 'BOOK_FEE' && bookFeeRequired && (
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />
                            )}
                          </div>
                          <p className={`text-xs ${isDisabled ? 'opacity-50' : 'opacity-75'}`}>
                            {config.description}
                          </p>
                          
                          {/* Outstanding Amount */}
                          {availability && availability.outstandingAmount !== undefined && availability.outstandingAmount > 0 && (
                            <p className={`text-xs font-medium ${isDisabled ? 'text-gray-400' : 'text-green-600'}`}>
                              Outstanding: ₹{availability.outstandingAmount.toLocaleString()}
                            </p>
                          )}
                          
                          {/* Book Fee Required Indicator */}
                          {purposeKey === 'BOOK_FEE' && bookFeeRequired && (
                            <p className="text-xs font-medium text-yellow-600">
                              Required First
                            </p>
                          )}
                        </div>
                        
                        {/* Status Badge */}
                        <div className="w-full flex justify-center px-2">
                          <AnimatePresence>
                            {isAdded && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                              >
                                <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 border-green-200 whitespace-nowrap">
                                  ✓ Added
                                </Badge>
                              </motion.div>
                            )}
                            
                            {!isAvailable && disabledReason && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                              >
                                <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200 whitespace-nowrap">
                                  ⚠️ {disabledReason}
                                </Badge>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
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
