/**
 * Payment Items List Component
 * Manages the list of payment items in the multiple payment form
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PaymentItemCard } from './PaymentItemCard';
import type { PaymentItem, PaymentPurpose } from '../../types/PaymentTypes';

interface PaymentItemsListProps {
  items: PaymentItem[];
  onAdd: () => void;
  onEdit: (item: PaymentItem) => void;
  onRemove: (itemId: string) => void;
  institutionType: 'school' | 'college';
  errors?: string[];
  warnings?: string[];
}

export const PaymentItemsList: React.FC<PaymentItemsListProps> = ({
  items,
  onAdd,
  onEdit,
  onRemove,
  institutionType,
  errors = [],
  warnings = []
}) => {
  const getAddedPurposes = (): PaymentPurpose[] => {
    return items.map(item => item.purpose);
  };

  const getAvailablePurposes = (): PaymentPurpose[] => {
    const allPurposes: PaymentPurpose[] = ['BOOK_FEE', 'TUITION_FEE', 'TRANSPORT_FEE', 'OTHER'];
    const addedPurposes = getAddedPurposes();
    
    // Filter out duplicates based on business rules
    return allPurposes.filter(purpose => {
      if (purpose === 'BOOK_FEE') {
        return !addedPurposes.includes('BOOK_FEE');
      }
      return true; // Allow multiple tuition, transport, and other payments
    });
  };

  const formatTotalAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Payment Items
          </CardTitle>
          <Button
            onClick={onAdd}
            size="sm"
            className="gap-2"
            disabled={getAvailablePurposes().length === 0}
          >
            <Plus className="h-4 w-4" />
            Add Payment
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Error Messages */}
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

        {/* Warning Messages */}
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

        {/* Payment Items */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {items.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-8 text-gray-500"
              >
                <div className="space-y-2">
                  <div className="text-4xl">💳</div>
                  <p className="text-sm">No payment items added yet</p>
                  <p className="text-xs text-gray-400">
                    Click "Add Payment" to start adding payment items
                  </p>
                </div>
              </motion.div>
            ) : (
              items.map((item) => (
                <PaymentItemCard
                  key={item.id}
                  item={item}
                  onEdit={onEdit}
                  onRemove={onRemove}
                  institutionType={institutionType}
                />
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Total Amount Summary */}
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-4 border-t border-gray-200"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">
                Total Amount ({items.length} item{items.length !== 1 ? 's' : ''})
              </span>
              <span className="text-lg font-bold text-gray-900">
                {formatTotalAmount(totalAmount)}
              </span>
            </div>
          </motion.div>
        )}

        {/* Add Payment Button (when no items) */}
        {items.length === 0 && (
          <div className="text-center">
            <Button
              onClick={onAdd}
              variant="outline"
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Your First Payment
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PaymentItemsList;
