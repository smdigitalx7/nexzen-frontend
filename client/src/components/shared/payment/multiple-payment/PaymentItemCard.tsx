/**
 * Payment Item Card Component
 * Displays individual payment items in the multiple payment form
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, BookOpen, GraduationCap, Truck, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { PaymentItemCardProps, PaymentPurpose } from '@/components/shared/payment/types/PaymentTypes';

const purposeIcons = {
  BOOK_FEE: BookOpen,
  TUITION_FEE: GraduationCap,
  TRANSPORT_FEE: Truck,
  OTHER: Plus
};

const purposeColors = {
  BOOK_FEE: 'text-blue-600 bg-blue-50 border-blue-200',
  TUITION_FEE: 'text-green-600 bg-green-50 border-green-200',
  TRANSPORT_FEE: 'text-orange-600 bg-orange-50 border-orange-200',
  OTHER: 'text-purple-600 bg-purple-50 border-purple-200'
};

const paymentMethodColors = {
  CASH: 'text-gray-600 bg-gray-50 border-gray-200',
  ONLINE: 'text-blue-600 bg-blue-50 border-blue-200',
  CHEQUE: 'text-green-600 bg-green-50 border-green-200',
  DD: 'text-purple-600 bg-purple-50 border-purple-200'
};

export const PaymentItemCard: React.FC<PaymentItemCardProps> = ({
  item,
  onEdit,
  onRemove,
  institutionType
}) => {
  const PurposeIcon = purposeIcons[item.purpose];
  const purposeColor = purposeColors[item.purpose];
  const methodColor = paymentMethodColors[item.paymentMethod];

  const getPurposeLabel = () => {
    switch (item.purpose) {
      case 'BOOK_FEE':
        return 'Book Fee';
      case 'TUITION_FEE':
        return `Tuition Fee - Term ${item.termNumber}`;
      case 'TRANSPORT_FEE':
        return `Transport Fee - Term ${item.termNumber}`;
      case 'OTHER':
        return item.customPurposeName || 'Other';
      default:
        return item.purpose;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Left side - Purpose and Amount */}
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-lg ${purposeColor}`}>
                <PurposeIcon className="h-5 w-5" />
              </div>
              
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-medium text-gray-900">
                    {getPurposeLabel()}
                  </h3>
                  <Badge variant="outline" className={`text-xs ${purposeColor}`}>
                    {item.purpose.replace('_', ' ')}
                  </Badge>
                </div>
                
                <div className="flex items-center space-x-3 text-sm text-gray-600">
                  <span className="font-semibold text-lg text-gray-900">
                    {formatAmount(item.amount)}
                  </span>
                  <Badge variant="outline" className={`text-xs ${methodColor}`}>
                    {item.paymentMethod}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Right side - Action Buttons */}
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(item)}
                className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
              >
                <Edit className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(item.id)}
                className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Additional Info for Term-based Payments */}
          {(item.purpose === 'TUITION_FEE' || item.purpose === 'TRANSPORT_FEE') && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">
                  {institutionType === 'college' ? 'College Term' : 'School Term'}
                </span>
                <span className="font-medium text-gray-900">
                  Term {item.termNumber}
                </span>
              </div>
            </div>
          )}

          {/* Additional Info for Custom Purpose */}
          {item.purpose === 'OTHER' && item.customPurposeName && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="text-sm text-gray-600">
                <span className="font-medium">Custom Purpose:</span> {item.customPurposeName}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PaymentItemCard;
