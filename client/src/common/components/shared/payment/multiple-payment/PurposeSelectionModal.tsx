/**
 * Purpose Selection Modal Component
 * Allows users to select payment purpose for multiple payment form
 */

import React from "react";
import { BookOpen, GraduationCap, Truck, Plus } from "lucide-react";
import { Card, CardContent } from "@/common/components/ui/card";
import { Badge } from "@/common/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import type {
  PurposeSelectionProps,
  PaymentPurpose,
} from "../types/PaymentTypes";
import { getAllFeePurposeAvailability } from "../validation/PaymentValidation";

const purposeConfig = {
  BOOK_FEE: {
    label: "Book Fee",
    icon: BookOpen,
    description: "One-time book fee payment",
    color: "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100",
    disabledColor:
      "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed",
  },
  TUITION_FEE: {
    label: "Tuition Fee",
    icon: GraduationCap,
    description: "Term-based tuition payments",
    color: "bg-green-50 border-green-200 text-green-700 hover:bg-green-100",
    disabledColor:
      "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed",
  },
  TRANSPORT_FEE: {
    label: "Transport Fee",
    icon: Truck,
    description: "Transport payments", // Description will be set dynamically based on institutionType
    color: "bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100",
    disabledColor:
      "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed",
  },
  OTHER: {
    label: "Other",
    icon: Plus,
    description: "Custom purpose payments",
    color: "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100",
    disabledColor:
      "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed",
  },
};

export const PurposeSelectionModal: React.FC<PurposeSelectionProps> = ({
  availablePurposes,
  addedPurposes,
  paymentItems = [],
  onPurposeSelect,
  onClose,
  isOpen = false,
  feeBalances,
  institutionType = "school",
}) => {
  // Get fee purpose availability based on balances
  const feeAvailability = feeBalances
    ? getAllFeePurposeAvailability(feeBalances, institutionType, addedPurposes)
    : ({} as Record<
        PaymentPurpose,
        { available: boolean; reason?: string; outstandingAmount?: number }
      >);

  // Check if book fee is required first
  const bookFeeOutstanding = feeBalances?.bookFee?.outstanding || 0;
  const bookFeeRequired =
    bookFeeOutstanding > 0 && !addedPurposes.includes("BOOK_FEE");

  const handlePurposeClick = (purpose: PaymentPurpose) => {
    // Check if purpose is available based on balances
    const availability = feeAvailability[purpose];
    // Check if there's outstanding amount - if there is, allow it even if book fee is pending
    const hasOutstandingAmount =
      availability?.outstandingAmount && availability.outstandingAmount > 0;

    // Only block if availability is false AND there's no outstanding amount
    if (availability && !availability.available && !hasOutstandingAmount) {
      return; // Don't allow selection if not available due to balance constraints and no outstanding
    }

    // For tuition/transport fees, check if items already exist for this purpose
    if (purpose === "TUITION_FEE" || purpose === "TRANSPORT_FEE") {
      const hasExistingItems = paymentItems.some(
        (item) => item.purpose === purpose
      );
      if (hasExistingItems) {
        return; // Don't allow selection if items already exist for this purpose
      }

      // For colleges, skip term check (use total outstanding amount instead)
      // For schools, check if terms are available OR if there's outstanding amount
      if (institutionType !== "college") {
        const availableTerms = getAvailableTerms(purpose);
        // Allow if there are terms available OR if there's outstanding amount
        if (availableTerms.length === 0 && !hasOutstandingAmount) {
          return; // Don't allow selection if no terms are available and no outstanding
        }
      }
      // For colleges, availability is already checked via feeAvailability above
    }

    // Allow re-selection of deleted purposes
    onPurposeSelect(purpose);
  };

  const isPurposeAdded = (purpose: PaymentPurpose) => {
    return addedPurposes.includes(purpose);
  };

  // Check if a specific term is already added for tuition/transport fees
  const isTermAdded = (
    purpose: PaymentPurpose,
    termNumber: number
  ): boolean => {
    return paymentItems.some(
      (item) => item.purpose === purpose && item.termNumber === termNumber
    );
  };

  // Get available terms for tuition/transport fees
  const getAvailableTerms = (purpose: PaymentPurpose): number[] => {
    if (purpose !== "TUITION_FEE" && purpose !== "TRANSPORT_FEE") {
      return []; // Not applicable for other purposes
    }

    const maxTerms =
      institutionType === "college" ? 0 : purpose === "TRANSPORT_FEE" ? 2 : 3;
    const availableTerms: number[] = [];

    for (let i = 1; i <= maxTerms; i++) {
      // Check if term has outstanding amount and is not already added
      if (feeBalances) {
        let termData;
        if (purpose === "TUITION_FEE") {
          const termKey = `term${i}` as "term1" | "term2" | "term3";
          termData =
            feeBalances.tuitionFee[
              termKey as keyof typeof feeBalances.tuitionFee
            ];
        } else if (purpose === "TRANSPORT_FEE") {
          const termKey = `term${i}` as "term1" | "term2";
          termData =
            feeBalances.transportFee[
              termKey as keyof typeof feeBalances.transportFee
            ];
        }

        if (
          termData &&
          typeof termData === "object" &&
          "outstanding" in termData &&
          termData.outstanding > 0
        ) {
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
    if (!inAvailableList) {
      return false; // Not in available list, so definitely disabled
    }

    // Then check if it's available based on fee balances
    const availability = feeAvailability[purpose];
    // Check if there's outstanding amount - if there is, allow it even if book fee is pending
    // (book fee requirement is just a warning, not a hard block)
    const hasOutstandingAmount =
      availability?.outstandingAmount !== undefined &&
      availability.outstandingAmount > 0;
    const balanceAvailable =
      !availability || availability.available || hasOutstandingAmount;

    // For tuition/transport fees, check if any terms are available AND no items exist for this purpose
    if (purpose === "TUITION_FEE" || purpose === "TRANSPORT_FEE") {
      const hasExistingItems = paymentItems.some(
        (item) => item.purpose === purpose
      );

      // If there are existing items for this purpose, don't allow adding more
      if (hasExistingItems) {
        return false;
      }

      // For colleges: Book fee must be paid first before tuition/transport can be selected
      // For schools: Allow if there are outstanding amounts (book fee is just a warning)
      if (institutionType === "college") {
        // College: Check if book fee is pending and not added
        if (bookFeeRequired) {
          return false; // Disable if book fee is required
        }
        // College: Allow only if book fee is paid and there are outstanding amounts
        if (purpose === "TUITION_FEE") {
          const availableTerms = getAvailableTerms(purpose);
          return availableTerms.length > 0 || hasOutstandingAmount;
        } else if (purpose === "TRANSPORT_FEE") {
          // For colleges, getAvailableTerms returns empty array (no terms), so rely on outstanding amount
          return hasOutstandingAmount;
        }
      } else {
        // School: Allow if there are outstanding amounts (book fee is just a warning)
        if (purpose === "TUITION_FEE") {
          const availableTerms = getAvailableTerms(purpose);
          return availableTerms.length > 0 || hasOutstandingAmount;
        } else if (purpose === "TRANSPORT_FEE") {
          const availableTerms = getAvailableTerms(purpose);
          return availableTerms.length > 0 || hasOutstandingAmount;
        }
      }
    }

    // For other purposes, allow re-selection if not currently added
    const notCurrentlyAdded = !addedPurposes.includes(purpose);
    return balanceAvailable && notCurrentlyAdded;
  };

  const getPurposeDisabledReason = (purpose: PaymentPurpose) => {
    const availability = feeAvailability[purpose];
    if (availability && !availability.available) {
      return availability.reason;
    }

    // For tuition/transport fees, check if no terms are available or if items already exist
    if (purpose === "TUITION_FEE" || purpose === "TRANSPORT_FEE") {
      const hasExistingItems = paymentItems.some(
        (item) => item.purpose === purpose
      );
      if (hasExistingItems) {
        return "Already added";
      }

      // For colleges, availability is checked via feeAvailability (total outstanding)
      // For schools, check if terms are available
      if (institutionType !== "college") {
        const availableTerms = getAvailableTerms(purpose);
        if (availableTerms.length === 0) {
          return "No outstanding amounts";
        }
      }
    }

    return null;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col p-0 sm:rounded-2xl">
        <DialogHeader className="px-5 pt-5 pb-3 flex-shrink-0 border-b border-gray-200">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Add Payment Item
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-1">
            Select the type of payment you want to add to this transaction.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-4">
          <div className="space-y-4">
            {/* Purpose Selection Grid - Simplified */}
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(purposeConfig).map(([purpose, config]) => {
                const purposeKey = purpose as PaymentPurpose;
                const PurposeIcon = config.icon;
                const isAdded = isPurposeAdded(purposeKey);
                const isAvailable = isPurposeAvailable(purposeKey);
                const isDisabled = !isAvailable;
                const disabledReason = getPurposeDisabledReason(purposeKey);
                const availability = feeAvailability[purposeKey];

                // Get dynamic description based on institution type
                const getDescription = () => {
                  if (purposeKey === "TRANSPORT_FEE") {
                    return institutionType === "college"
                      ? "Monthly transport payments"
                      : "Term-based transport payments";
                  }
                  return config.description;
                };

                return (
                  <Card
                    key={purpose}
                    className={`relative transition-all duration-200 min-h-[140px] border ${
                      isDisabled
                        ? "bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed pointer-events-none opacity-60"
                        : purposeKey === "BOOK_FEE" && bookFeeRequired
                          ? "bg-white border-2 border-amber-400 text-gray-900 hover:border-amber-500 hover:shadow-sm cursor-pointer"
                          : "bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:shadow-sm cursor-pointer"
                    }`}
                    onClick={() =>
                      !isDisabled && handlePurposeClick(purposeKey)
                    }
                    title={disabledReason || undefined}
                  >
                    {/* Required First Badge - Top Right Corner */}
                    {purposeKey === "BOOK_FEE" && bookFeeRequired && (
                      <div className="absolute top-2 right-2">
                        <Badge className="text-xs bg-amber-100 text-amber-800 border-amber-200 font-medium px-1.5 py-0">
                          Required First
                        </Badge>
                      </div>
                    )}
                    <CardContent className="p-4 text-center">
                      <div className="flex flex-col items-center space-y-2.5">
                        <div
                          className={`p-2.5 rounded-lg transition-colors ${
                            isDisabled
                              ? "bg-gray-100"
                              : purposeKey === "BOOK_FEE" && bookFeeRequired
                                ? "bg-amber-100"
                                : purposeKey === "BOOK_FEE"
                                  ? "bg-blue-50"
                                  : purposeKey === "TUITION_FEE"
                                    ? "bg-green-50"
                                    : purposeKey === "TRANSPORT_FEE"
                                      ? "bg-orange-50"
                                      : "bg-purple-50"
                          }`}
                        >
                          <PurposeIcon
                            className={`h-6 w-6 ${
                              isDisabled
                                ? "text-gray-400"
                                : purposeKey === "BOOK_FEE" && bookFeeRequired
                                  ? "text-amber-600"
                                  : purposeKey === "BOOK_FEE"
                                    ? "text-blue-600"
                                    : purposeKey === "TUITION_FEE"
                                      ? "text-green-600"
                                      : purposeKey === "TRANSPORT_FEE"
                                        ? "text-orange-600"
                                        : "text-purple-600"
                            }`}
                          />
                        </div>
                        <div className="space-y-1.5 w-full">
                          <h3
                            className={`font-semibold text-sm ${isDisabled ? "text-gray-400" : "text-gray-900"}`}
                          >
                            {config.label}
                          </h3>
                          <p
                            className={`text-xs ${isDisabled ? "text-gray-400" : "text-gray-600"}`}
                          >
                            {getDescription()}
                          </p>

                          {/* Outstanding Amount - Large Font */}
                          {availability &&
                            availability.outstandingAmount !== undefined &&
                            availability.outstandingAmount > 0 && (
                              <div className="mt-2">
                                <p className="text-lg font-bold text-gray-900">
                                  ₹
                                  {availability.outstandingAmount.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  Outstanding
                                </p>
                              </div>
                            )}
                        </div>

                        {/* Status Badge */}
                        {isAdded && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200 font-medium mt-1"
                          >
                            ✓ Added
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {/* Added Purposes Summary - Simplified */}
            {addedPurposes.length > 0 && (
              <div className="border border-gray-200 bg-gray-50 rounded-lg p-3">
                <h4 className="text-xs font-medium text-gray-700 mb-2">
                  Already Added:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {addedPurposes.map((purpose: PaymentPurpose) => {
                    const config = purposeConfig[purpose];
                    return (
                      <Badge
                        key={purpose}
                        variant="outline"
                        className="text-xs border-emerald-200 bg-emerald-50 text-emerald-700 font-medium"
                      >
                        {config.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Available Purposes Info - Simplified */}
            {availablePurposes.length === 0 && (
              <div className="border border-gray-200 bg-gray-50 rounded-lg p-4 text-center">
                <p className="text-sm text-gray-600">
                  All available payment types have been added to this
                  transaction.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons - Simplified */}
        {/* <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            className="border-gray-300"
          >
            Cancel
          </Button>
        </div> */}
      </DialogContent>
    </Dialog>
  );
};

export default PurposeSelectionModal;
