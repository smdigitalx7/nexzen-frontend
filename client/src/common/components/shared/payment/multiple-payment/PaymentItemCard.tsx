/**
 * Payment Item Card Component - Modern Redesign
 * Displays individual payment items with modern shadcn/21st.dev UI
 */

import React, { useMemo, memo } from "react";
import { motion } from "framer-motion";
import { Trash2, BookOpen, GraduationCap, Truck, Plus, X } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import type { PaymentItemCardProps } from "../types/PaymentTypes";

const purposeIcons = {
  BOOK_FEE: BookOpen,
  TUITION_FEE: GraduationCap,
  TRANSPORT_FEE: Truck,
  OTHER: Plus,
};

const purposeColors = {
  BOOK_FEE: {
    bg: "from-blue-50 to-blue-50/50",
    border: "border-blue-200/60",
    icon: "bg-blue-100 text-blue-600",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    amount: "text-blue-700",
  },
  TUITION_FEE: {
    bg: "from-emerald-50 to-emerald-50/50",
    border: "border-emerald-200/60",
    icon: "bg-emerald-100 text-emerald-600",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    amount: "text-emerald-700",
  },
  TRANSPORT_FEE: {
    bg: "from-orange-50 to-orange-50/50",
    border: "border-orange-200/60",
    icon: "bg-orange-100 text-orange-600",
    badge: "bg-orange-50 text-orange-700 border-orange-200",
    amount: "text-orange-700",
  },
  OTHER: {
    bg: "from-purple-50 to-purple-50/50",
    border: "border-purple-200/60",
    icon: "bg-purple-100 text-purple-600",
    badge: "bg-purple-50 text-purple-700 border-purple-200",
    amount: "text-purple-700",
  },
};

export const PaymentItemCard = memo(
  React.forwardRef<HTMLDivElement, PaymentItemCardProps>(
    ({ item, onRemove, institutionType, orderNumber, allItems = [] }, ref) => {
      const PurposeIcon = purposeIcons[item.purpose as keyof typeof purposeIcons];
      const colors = purposeColors[item.purpose as keyof typeof purposeColors] || purposeColors.OTHER;

      // Check if this term can be deleted (must be the last term in sequence)
      const canDeleteTerm = useMemo((): boolean => {
        if (item.purpose !== "TUITION_FEE" && item.purpose !== "TRANSPORT_FEE") {
          return true;
        }

        if (item.purpose === 'TRANSPORT_FEE' && institutionType === 'college' && item.paymentMonth) {
          return true;
        }

        if (!item.termNumber) {
          return true;
        }

        const samePurposeItems = allItems.filter((i) => i.purpose === item.purpose);

        if (samePurposeItems.length <= 1) {
          return true;
        }

        const maxTermNumber = Math.max(
          ...samePurposeItems.map((i) => i.termNumber || 0)
        );

        return item.termNumber === maxTermNumber;
      }, [item, allItems, institutionType]);

      const formatPaymentMonth = useMemo(
        () => (monthString: string): string => {
          if (!monthString) return '';
          try {
            const date = new Date(monthString);
            return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
          } catch {
            return monthString;
          }
        },
        []
      );

      const getPurposeLabel = useMemo(() => {
        switch (item.purpose) {
          case "BOOK_FEE":
            return "Book Fee";
          case "TUITION_FEE":
            return `Tuition Fee - Term ${item.termNumber}`;
          case "TRANSPORT_FEE":
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
      }, [item, institutionType, formatPaymentMonth]);

      const formatAmount = useMemo(
        () => (amount: number) => {
          return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(amount);
        },
        []
      );

      return (
        <motion.div
          ref={ref}
          layout
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <Card className={`border border-gray-200 shadow-sm bg-white hover:shadow-md transition-all`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                {/* Left side - Purpose and Amount */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Order Number */}
                  {orderNumber && (
                    <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${colors.icon} text-sm font-semibold shrink-0`}>
                      {orderNumber}
                    </div>
                  )}

                  {/* Icon - Simplified */}
                  <div className={`p-1.5 rounded ${colors.icon} shrink-0`}>
                    <PurposeIcon className="h-4 w-4" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 text-base">
                        {getPurposeLabel}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`text-xs ${colors.badge} font-medium px-2 py-0.5`}
                      >
                        {item.purpose.replace("_", " ")}
                      </Badge>
                    </div>

                    <div className="flex items-center">
                      <span className={`font-bold text-lg ${colors.amount}`}>
                        {formatAmount(item.amount)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side - Action Button */}
                <div className="flex items-center shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemove(item.id)}
                    disabled={!canDeleteTerm}
                    className={`h-9 w-9 p-0 transition-colors ${
                      canDeleteTerm
                        ? "hover:bg-red-50 hover:text-red-600 text-red-500"
                        : "opacity-40 cursor-not-allowed"
                    }`}
                    title={!canDeleteTerm ? "Delete higher terms first" : "Remove item"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Additional Info for Term-based Payments */}
              {(item.purpose === "TUITION_FEE" ||
                item.purpose === "TRANSPORT_FEE") && (
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                      {item.purpose === "TRANSPORT_FEE" && institutionType === "college" && item.paymentMonth
                        ? "Payment Month"
                        : institutionType === "college"
                        ? "College Term"
                        : "School Term"}
                    </span>
                    <span className="font-medium text-gray-900">
                      {item.purpose === "TRANSPORT_FEE" && institutionType === "college" && item.paymentMonth
                        ? formatPaymentMonth(item.paymentMonth)
                        : `Term ${item.termNumber}`}
                    </span>
                  </div>

                  {/* Deletion Order Warning */}
                  {!canDeleteTerm && item.termNumber && (
                    <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-sm text-amber-800">
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
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Custom Purpose:</span>{" "}
                    <span className="text-gray-900">{item.customPurposeName}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      );
    }
  )
);

PaymentItemCard.displayName = "PaymentItemCard";

export default PaymentItemCard;
