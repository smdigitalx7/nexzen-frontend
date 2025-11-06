/**
 * Payment Item Card Component
 * Displays individual payment items in the multiple payment form
 */

import React from "react";
import { motion } from "framer-motion";
import { Trash2, BookOpen, GraduationCap, Truck, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PaymentItemCardProps } from "../types/PaymentTypes";

const purposeIcons = {
  BOOK_FEE: BookOpen,
  TUITION_FEE: GraduationCap,
  TRANSPORT_FEE: Truck,
  OTHER: Plus,
};

export const PaymentItemCard = React.forwardRef<
  HTMLDivElement,
  PaymentItemCardProps
>(({ item, onRemove, institutionType, orderNumber, allItems = [] }, ref) => {
  const PurposeIcon = purposeIcons[item.purpose as keyof typeof purposeIcons];

  // Check if this term can be deleted (must be the last term in sequence)
  const canDeleteTerm = (): boolean => {
    if (item.purpose !== "TUITION_FEE" && item.purpose !== "TRANSPORT_FEE") {
      return true; // Non-term items can always be deleted
    }

    // For college transport fees with paymentMonth, allow deletion (monthly payments are independent)
    if (item.purpose === 'TRANSPORT_FEE' && institutionType === 'college' && item.paymentMonth) {
      return true;
    }

    if (!item.termNumber) {
      return true; // Items without term numbers can be deleted
    }

    // Find all items of the same purpose
    const samePurposeItems = allItems.filter((i) => i.purpose === item.purpose);

    if (samePurposeItems.length <= 1) {
      return true; // Only one item of this purpose, can be deleted
    }

    // Find the highest term number for this purpose
    const maxTermNumber = Math.max(
      ...samePurposeItems.map((i) => i.termNumber || 0)
    );

    // Can only delete if this is the highest term number
    return item.termNumber === maxTermNumber;
  };

  const canDelete = canDeleteTerm();

  const formatPaymentMonth = (monthString: string): string => {
    if (!monthString) return '';
    try {
      // Parse YYYY-MM-01 format
      const date = new Date(monthString);
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch {
      return monthString;
    }
  };

  const getPurposeLabel = () => {
    switch (item.purpose) {
      case "BOOK_FEE":
        return "Book Fee";
      case "TUITION_FEE":
        return `Tuition Fee - Term ${item.termNumber}`;
      case "TRANSPORT_FEE":
        // For colleges, use paymentMonth; for schools, use termNumber
        if (institutionType === 'college' && item.paymentMonth) {
          return `Transport Fee - ${formatPaymentMonth(item.paymentMonth)}`;
        } else if (item.termNumber) {
          return `Transport Fee - Term ${item.termNumber}`;
        } else {
          return 'Transport Fee';
        }
      case "OTHER":
        return item.customPurposeName || "Other";
      default:
        return item.purpose;
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-l-4 border-l-blue-500 border border-gray-200 hover:border-l-blue-600 hover:shadow-md transition-all bg-white">
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4">
            {/* Left side - Purpose and Amount */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {/* Order Number */}
              {orderNumber && (
                <div className="flex items-center justify-center w-9 h-9 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold shrink-0 border-2 border-blue-200">
                  {orderNumber}
                </div>
              )}

              <div className="p-2.5 rounded-lg bg-blue-50 border border-blue-200 shrink-0">
                <PurposeIcon className="h-5 w-5 text-blue-600" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <h3 className="font-semibold text-gray-900 text-base">
                    {getPurposeLabel()}
                  </h3>
                  <Badge
                    variant="outline"
                    className="text-xs border-blue-200 text-blue-700 bg-blue-50"
                  >
                    {item.purpose.replace("_", " ")}
                  </Badge>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-lg text-blue-700">
                    {formatAmount(item.amount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Right side - Action Buttons */}
            <div className="flex items-center shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemove(item.id)}
                disabled={!canDelete}
                className={`h-9 w-9 p-0 ${
                  canDelete
                    ? "hover:bg-red-50 hover:text-red-600 text-red-500"
                    : "opacity-40 cursor-not-allowed"
                }`}
                title={!canDelete ? "Delete higher terms first" : "Delete item"}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Additional Info for Term-based Payments */}
          {(item.purpose === "TUITION_FEE" ||
            item.purpose === "TRANSPORT_FEE") && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex items-center justify-between text-xs text-gray-600">
                <span>
                  {item.purpose === "TRANSPORT_FEE" && institutionType === "college" && item.paymentMonth
                    ? "Payment Month"
                    : institutionType === "college"
                    ? "College Term"
                    : "School Term"}
                </span>
                <span className="font-medium">
                  {item.purpose === "TRANSPORT_FEE" && institutionType === "college" && item.paymentMonth
                    ? formatPaymentMonth(item.paymentMonth)
                    : `Term ${item.termNumber}`}
                </span>
              </div>

              {/* Deletion Order Warning */}
              {!canDelete && item.termNumber && (
                <div className="mt-2 p-2 bg-gray-50 border border-gray-200 rounded text-xs text-gray-600">
                  Delete higher terms first (Term{" "}
                  {Math.max(
                    ...allItems
                      .filter((i) => i.purpose === item.purpose)
                      .map((i) => i.termNumber || 0)
                  )}
                  )
                </div>
              )}
            </div>
          )}

          {/* Additional Info for Custom Purpose */}
          {item.purpose === "OTHER" && item.customPurposeName && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="text-xs text-gray-600">
                <span className="font-medium">Custom Purpose:</span>{" "}
                {item.customPurposeName}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
});

PaymentItemCard.displayName = "PaymentItemCard";

export default PaymentItemCard;
