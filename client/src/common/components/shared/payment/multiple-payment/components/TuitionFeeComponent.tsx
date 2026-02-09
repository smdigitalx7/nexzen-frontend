/**
 * Tuition Fee Component
 * Handles tuition fee payment input for multiple payment form
 */

import React, { useState, useEffect, useRef } from 'react';
import { GraduationCap, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/common/components/ui/button';
import { Label } from '@/common/components/ui/label';
import { Input } from '@/common/components/ui/input';
import { Checkbox } from '@/common/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Alert, AlertDescription } from "@/common/components/ui/alert";
import { Badge } from "@/common/components/ui/badge";
import {
  PaymentValidator,
  getAvailableTerms,
} from "../../validation/PaymentValidation";
import type {
  PurposeSpecificComponentProps,
  PaymentItem,
  PaymentMethod,
} from "../../types/PaymentTypes";



interface TuitionFeeComponentProps extends PurposeSpecificComponentProps {
  isOpen: boolean;
}

export const TuitionFeeComponent: React.FC<TuitionFeeComponentProps> = ({
  student,
  feeBalances,
  config,
  onAdd,
  onCancel,
  isOpen,
}) => {
  const [selectedTerms, setSelectedTerms] = useState<number[]>([]);
  const [termAmounts, setTermAmounts] = useState<Record<number, string>>({});
  const [lockedTerms, setLockedTerms] = useState<number[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [termErrors, setTermErrors] = useState<Record<number, boolean>>({});
  const initializedRef = useRef(false);

  // Get available terms for tuition fee
  // Both colleges and schools use term-based tuition fees (Term 1, Term 2, Term 3)
  const availableTerms = getAvailableTerms('TUITION_FEE', feeBalances, config.institutionType);
  
  // Check if there are any outstanding payments (term-based for both colleges and schools)
  const hasOutstandingPayments = availableTerms.some(term => term.outstanding > 0);
  const allTermsPaid = availableTerms.length > 0 && availableTerms.every(term => term.paid);

  useEffect(() => {
    // Only initialize term amounts if we haven't initialized yet
    // Both colleges and schools use term-based amounts
    if (!initializedRef.current) {
      const initialAmounts: Record<number, string> = {};
      
      availableTerms.forEach(term => {
        if (term.available && term.outstanding > 0) {
          initialAmounts[term.term] = term.outstanding.toString();
        }
      });
      
      setTermAmounts(initialAmounts);
      initializedRef.current = true;
    }
  }, [availableTerms]);

  const handleTermSelection = (termNumber: number, checked: boolean) => {
    if (checked) {
      // Prevent duplicate term selection
      if (selectedTerms.includes(termNumber)) {
        return;
      }

      // Add term to selection
      const newSelectedTerms = [...selectedTerms, termNumber];
      setSelectedTerms(newSelectedTerms);

      // Lock all previous terms except the last one
      const termsToLock = newSelectedTerms.slice(0, -1);
      setLockedTerms(termsToLock);

      // Set amounts for locked terms to full outstanding amount (non-editable)
      const newAmounts = { ...termAmounts };
      termsToLock.forEach((term) => {
        const termData = availableTerms.find((t) => t.term === term);
        if (termData && termData.outstanding > 0) {
          newAmounts[term] = termData.outstanding.toString();
        }
      });

      // Set amount for the last selected term (can be custom)
      const lastTerm = newSelectedTerms[newSelectedTerms.length - 1];
      const lastTermData = availableTerms.find((t) => t.term === lastTerm);
      if (lastTermData && lastTermData.outstanding > 0) {
        newAmounts[lastTerm] = lastTermData.outstanding.toString();
      }

      setTermAmounts(newAmounts);
    } else {
      // Remove term from selection
      const newSelectedTerms = selectedTerms.filter(
        (term) => term !== termNumber
      );
      setSelectedTerms(newSelectedTerms);

      // Update locked terms
      const newLockedTerms = newSelectedTerms.slice(0, -1);
      setLockedTerms(newLockedTerms);

      // Clear amount for removed term
      setTermAmounts((prev) => {
        const newAmounts = { ...prev };
        delete newAmounts[termNumber];
        return newAmounts;
      });
    }
  };

  const handleTermAmountChange = (termNumber: number, value: string) => {
    // Only allow changes for the last selected term (not locked terms)
    const lastSelectedTerm = selectedTerms[selectedTerms.length - 1];
    if (termNumber !== lastSelectedTerm) {
      return; // Don't allow changes to locked terms
    }

    setTermAmounts((prev) => {
      const newAmounts = { ...prev };
      newAmounts[termNumber] = value;
      return newAmounts;
    });

    // Validate after a short delay to ensure state is updated
    setTimeout(() => {
      validateTermAmount(termNumber, value);
    }, 0);
  };

  const validateTermAmount = (termNumber: number, value: string) => {
    const numAmount = parseFloat(value);
    const validation = PaymentValidator.validateAmount(
      numAmount,
      config.validationRules
    );

    let hasExceededAmount = false;

    // Check if amount exceeds outstanding balance for this term
    // Both colleges and schools use term-based validation
    const termData = availableTerms.find(t => t.term === termNumber);
    if (termData && numAmount > termData.outstanding) {
      validation.errors.push(`Amount cannot exceed outstanding balance of ${formatAmount(termData.outstanding)}`);
      hasExceededAmount = true;
    }

    // Clear error if amount is valid
    if (!hasExceededAmount && validation.errors.length === 0) {
      hasExceededAmount = false;
    }

    // Update term error state
    setTermErrors((prev) => ({
      ...prev,
      [termNumber]: hasExceededAmount,
    }));

    setErrors(validation.errors);
  };

  const handleSubmit = () => {
    // Prevent duplicate submission
    if (isSubmitting) {
      return;
    }
    
    // Both colleges and schools use term-based selection
    if (selectedTerms.length === 0) {
      setErrors(['Please select at least one term']);
      return;
    }

    // Validate all selected terms
    // Both colleges and schools use term-based validation
    const validationErrors: string[] = [];
    
    selectedTerms.forEach(termNumber => {
      const amount = termAmounts[termNumber];
      if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        validationErrors.push(`Please enter a valid amount for Term ${termNumber}`);
        return;
      }

      const numAmount = parseFloat(amount);
      const validation = PaymentValidator.validateAmount(numAmount, config.validationRules);
      if (!validation.isValid) {
        validationErrors.push(...validation.errors.map(error => `Term ${termNumber}: ${error}`));
      }

      // Check if amount exceeds outstanding balance for this term
      const termData = availableTerms.find(t => t.term === termNumber);
      if (termData && numAmount > termData.outstanding) {
        validationErrors.push(`Term ${termNumber}: Amount cannot exceed outstanding balance of ${formatAmount(termData.outstanding)}`);
      }
    });

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Create payment items for each selected term
    // Both colleges and schools use term-based payments
    const uniqueSelectedTerms = Array.from(new Set(selectedTerms)); // Remove duplicates
    setIsSubmitting(true);

    uniqueSelectedTerms.forEach((termNumber) => {
      const amount = parseFloat(termAmounts[termNumber]);
      const paymentItem: PaymentItem = {
        id: `tuition-fee-term-${termNumber}-${Date.now()}-${Math.random()}`,
        purpose: "TUITION_FEE",
        termNumber: termNumber,
        amount: amount,
        paymentMethod: paymentMethod,
      };
      onAdd(paymentItem);
    });

    setIsSubmitting(false);
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Both colleges and schools use term-based validation
  const isFormValid = selectedTerms.length > 0 && selectedTerms.every(term => {
    const amount = termAmounts[term];
    return amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0;
  }) && errors.length === 0;

  // Helper function to determine if a term can be selected
  const canSelectTerm = (termNumber: number): boolean => {
    const term = availableTerms.find((t) => t.term === termNumber);
    if (!term) return false;

    // Can't select if fully paid (no outstanding amount)
    // Allow selection if there's any outstanding balance, even if partially paid
    if (term.outstanding <= 0) return false;

    // For sequential selection:
    // - Previous terms with outstanding balance must be fully paid OR selected in current session
    // - Exception: If current term is partially paid, allow continuing that partial payment
    if (termNumber > 1) {
      const isCurrentTermPartiallyPaid = term.paid && term.outstanding > 0;

      for (let prevTermNum = 1; prevTermNum < termNumber; prevTermNum++) {
        const prevTerm = availableTerms.find((t) => t.term === prevTermNum);
        if (prevTerm) {
          // Skip if previous term is fully paid (no outstanding)
          if (prevTerm.outstanding <= 0) {
            continue;
          }

          // If previous term has outstanding balance:
          // - Must be selected in current session, OR
          // - Current term is partially paid (allow continuing partial payments)
          if (
            prevTerm.outstanding > 0 &&
            !selectedTerms.includes(prevTermNum) &&
            !isCurrentTermPartiallyPaid
          ) {
            return false;
          }
        }
      }
    }

    return true;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b border-blue-200 bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
          <DialogTitle className="flex items-center gap-2 text-lg text-gray-900">
            <div className="p-2 bg-blue-100 rounded-lg">
              <GraduationCap className="h-5 w-5 text-blue-600" />
            </div>
            Tuition Fee Payment
          </DialogTitle>
          <DialogDescription className="text-sm text-gray-600 mt-2">
            Add tuition fee payment for{" "}
            <span className="font-medium text-gray-900">{student.name}</span> (
            {student.admissionNo})
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto scrollbar-hide px-6 py-4">
          <div className="space-y-6">

          {/* Term Selection - Compact term boxes */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Select Terms *</Label>
            {!hasOutstandingPayments ? (
              <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50/80 p-4">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    {allTermsPaid ? "All Tuition Fees Paid" : "No Outstanding Tuition Fees"}
                  </p>
                  <p className="text-xs text-green-700 mt-0.5">
                    {allTermsPaid ? "All terms paid in full." : "No outstanding tuition for this student."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                {availableTerms.map((term) => (
                  <div
                    key={term.term}
                    className={`rounded-lg border p-3 transition-colors ${
                      selectedTerms.includes(term.term)
                        ? "border-blue-300 bg-blue-50/60"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    } ${!canSelectTerm(term.term) ? "opacity-75" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={`term-${term.term}`}
                        checked={selectedTerms.includes(term.term)}
                        onCheckedChange={(checked) => handleTermSelection(term.term, checked as boolean)}
                        disabled={!canSelectTerm(term.term)}
                        className="mt-0.5 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Label htmlFor={`term-${term.term}`} className="font-medium text-sm cursor-pointer">
                            Term {term.term}
                          </Label>
                          {term.outstanding <= 0 && term.paid && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Paid</Badge>
                          )}
                          {term.paid && term.outstanding > 0 && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-orange-600 border-orange-300">Partial</Badge>
                          )}
                          {term.term > 1 && !canSelectTerm(term.term) && term.outstanding > 0 && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-amber-600">Prev first</Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">Outstanding: {formatAmount(term.outstanding)}</p>
                        {selectedTerms.includes(term.term) && (
                          <div className="mt-2">
                            <div className="relative flex items-center rounded-md border border-input bg-background">
                              <span className="pl-2.5 text-sm font-medium text-muted-foreground">₹</span>
                              <Input
                                id={`amount-term-${term.term}`}
                                type="text"
                                placeholder="0"
                                value={termAmounts[term.term] || ""}
                                onChange={(e) => handleTermAmountChange(term.term, e.target.value)}
                                disabled={lockedTerms.includes(term.term)}
                                className={`h-8 border-0 bg-transparent pl-1 pr-2 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 ${lockedTerms.includes(term.term) ? "bg-muted/50 cursor-not-allowed" : ""} ${termErrors[term.term] ? "text-destructive" : ""}`}
                              />
                            </div>
                            {termErrors[term.term] && (
                              <p className="text-[10px] text-red-500 mt-0.5">Max {formatAmount(term.outstanding)}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method */}
          {/* <div className="space-y-2">
            <Label htmlFor="payment-method" className="text-sm font-medium">
              Payment Method *
            </Label>
            <Select value={paymentMethod} onValueChange={(value: PaymentMethod) => setPaymentMethod(value)}>
              <SelectTrigger id="payment-method">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div> */}

          {/* Hint */}
          <Alert className="py-2">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <AlertDescription className="text-xs">
              Pay terms in order (1 → 2 → 3). Paid terms can be skipped.
              {selectedTerms.length > 0 && (
                <span className="block mt-1 font-medium">
                  Total: {formatAmount(
                    selectedTerms.reduce(
                      (sum, term) =>
                        sum + (availableTerms.find((t) => t.term === term)?.outstanding || 0),
                      0
                    )
                  )}
                </span>
              )}
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>

            {hasOutstandingPayments ? (
              <Button
                onClick={handleSubmit}
                disabled={!isFormValid}
                className="flex-1 gap-2"
              >
                <GraduationCap className="h-4 w-4" />
                Add {selectedTerms.length} Term Payment
                {selectedTerms.length > 1 ? "s" : ""}
              </Button>
            ) : (
              <Button onClick={onCancel} className="flex-1 gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Close
              </Button>
            )}
          </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TuitionFeeComponent;
