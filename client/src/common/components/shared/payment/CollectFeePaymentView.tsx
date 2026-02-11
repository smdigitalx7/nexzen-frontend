/**
 * Shared Collect Fee Payment View – same UI for School and College.
 * - Branch name in header
 * - No small student name card
 * - Redesigned categories grid with custom row selector and line-style amount input (₹)
 * - After payment: open receipt in new tab, show toast
 */

import React, { useState, useMemo, useCallback } from "react";
import {
  ArrowLeft,
  Loader2,
  Wallet,
  Building2,
  Bus,
  BookOpen,
  Receipt,
  Plus,
  Check,
  Lock,
  CheckCircle,
  Pencil,
} from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/common/components/ui/card";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/common/components/ui/radio-group";
import { Textarea } from "@/common/components/ui/textarea";
import { Badge } from "@/common/components/ui/badge";
import { Separator } from "@/common/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/common/components/ui/alert-dialog";
import { useToast } from "@/common/hooks/use-toast";
import { formatCurrency } from "@/common/utils";
import { openReceiptInNewTab } from "@/common/utils/payment";
import type { PaymentMethod, MultiplePaymentData } from "./types/PaymentTypes";
import {
  PAYMENT_METHOD_OPTIONS,
  calculateCardCharges,
  calculateTotalWithCardCharges,
} from "./utils/paymentUtils";

export interface FeeItemShape {
  id: string;
  type: "BOOK_FEE" | "TUITION_FEE" | "TRANSPORT_FEE" | "OTHER";
  label: string;
  originalAmount: number;
  termNumber?: number;
  paymentMonth?: string;
}

export interface CollectFeePaymentViewProps {
  branchName: string;
  studentLabel: string;
  admissionNo: string;
  /** BOOK_FEE, TUITION_FEE, TRANSPORT_FEE arrays. OTHER is rendered internally. */
  feeCategories: {
    BOOK_FEE: FeeItemShape[];
    TUITION_FEE: FeeItemShape[];
    TRANSPORT_FEE: FeeItemShape[];
  };
  isBookFeePending: boolean;
  enrollmentId: number;
  onPaymentComplete: (data: MultiplePaymentData) => Promise<{ blobUrl?: string; receiptNo?: string } | void>;
  onUpdateBookFee?: (amount: number) => Promise<void>;
  onCancel: () => void;
}

/* Single colour for all cards. Selected = full green border, pending (not selected) = light red left border. */
const CARD_BORDER = "border-border";
const ROW_SELECTED = "border border-green-500";
const ROW_PENDING = "border-l border-red-200 dark:border-red-900/50";

export function CollectFeePaymentView({
  branchName,
  studentLabel,
  admissionNo,
  feeCategories,
  isBookFeePending,
  enrollmentId,
  onPaymentComplete,
  onUpdateBookFee,
  onCancel,
}: CollectFeePaymentViewProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [remarks, setRemarks] = useState("");
  const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
  const [customAmounts, setCustomAmounts] = useState<Record<string, string>>({});
  const [addOtherFee, setAddOtherFee] = useState(false);
  const [otherFeeAmount, setOtherFeeAmount] = useState("");
  const [otherFeeReason, setOtherFeeReason] = useState("");
  const [editingBookFeeId, setEditingBookFeeId] = useState<string | null>(null);
  const [newBookFeeValue, setNewBookFeeValue] = useState("");
  const [isUpdatingBookFee, setIsUpdatingBookFee] = useState(false);

  const allFeeItems = useMemo(
    () => [
      ...feeCategories.BOOK_FEE,
      ...feeCategories.TUITION_FEE,
      ...feeCategories.TRANSPORT_FEE,
    ],
    [feeCategories]
  );

  const totalAmount = useMemo(() => {
    let total = 0;
    allFeeItems.forEach((item) => {
      if (selectedItems[item.id]) {
        const custom = customAmounts[item.id];
        const amount = custom ? parseFloat(custom) : item.originalAmount;
        if (!isNaN(amount)) total += amount;
      }
    });
    if (addOtherFee && otherFeeAmount && parseFloat(otherFeeAmount) > 0) {
      total += parseFloat(otherFeeAmount);
    }
    return total;
  }, [allFeeItems, selectedItems, customAmounts, addOtherFee, otherFeeAmount]);

  const finalTotal = useMemo(
    () =>
      paymentMethod === "CARD"
        ? calculateTotalWithCardCharges(totalAmount)
        : totalAmount,
    [totalAmount, paymentMethod]
  );

  const confirmSummaryLines = useMemo(() => {
    const lines: { label: string; amount: number }[] = [];
    allFeeItems.forEach((item) => {
      if (selectedItems[item.id]) {
        const custom = customAmounts[item.id];
        const amount = custom ? parseFloat(custom) : item.originalAmount;
        if (!isNaN(amount)) lines.push({ label: item.label, amount });
      }
    });
    if (addOtherFee && otherFeeAmount && parseFloat(otherFeeAmount) > 0) {
      lines.push({
        label: otherFeeReason.trim() || "Other fee",
        amount: parseFloat(otherFeeAmount),
      });
    }
    return lines;
  }, [allFeeItems, selectedItems, customAmounts, addOtherFee, otherFeeAmount, otherFeeReason]);

  const handleToggleItem = useCallback((itemId: string, checked: boolean) => {
    setSelectedItems((prev) => {
      const next = { ...prev };
      if (checked) next[itemId] = true;
      else delete next[itemId];
      return next;
    });
    if (!checked) {
      setCustomAmounts((prev) => {
        const next = { ...prev };
        delete next[itemId];
        return next;
      });
    }
  }, []);

  const handleAmountChange = useCallback((itemId: string, value: string) => {
    setCustomAmounts((prev) => ({ ...prev, [itemId]: value }));
  }, []);

  const doSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const details: MultiplePaymentData["details"] = [];
      allFeeItems.forEach((item) => {
        if (selectedItems[item.id]) {
          const custom = customAmounts[item.id];
          const amount = custom ? parseFloat(custom) : item.originalAmount;
          details.push({
            id: item.id,
            purpose: item.type,
            amount,
            paymentMethod,
            termNumber: item.termNumber,
            paymentMonth: item.paymentMonth,
          });
        }
      });
      if (addOtherFee && otherFeeAmount) {
        details.push({
          id: `other_${Date.now()}`,
          purpose: "OTHER",
          amount: parseFloat(otherFeeAmount),
          paymentMethod,
          customPurposeName: otherFeeReason,
        });
      }

      const paymentData: MultiplePaymentData = {
        studentId: "",
        admissionNo,
        enrollmentId,
        details,
        remarks: remarks || undefined,
        totalAmount,
      };

      const result = await onPaymentComplete(paymentData);

      if (result?.blobUrl) {
        openReceiptInNewTab(result.blobUrl, result.receiptNo);
        toast({
          title: "Payment successful",
          description: "Receipt opened in new tab.",
          variant: "success",
        });
      } else {
        toast({
          title: "Payment collected",
          description: "Payment recorded successfully.",
          variant: "success",
        });
      }

      setSelectedItems({});
      setCustomAmounts({});
      setRemarks("");
      setAddOtherFee(false);
      setOtherFeeAmount("");
      setOtherFeeReason("");
    } catch (e) {
      // Error toast handled by parent
    } finally {
      setIsSubmitting(false);
    }
  }, [
    allFeeItems,
    selectedItems,
    customAmounts,
    paymentMethod,
    remarks,
    admissionNo,
    addOtherFee,
    otherFeeAmount,
    otherFeeReason,
    onPaymentComplete,
    toast,
  ]);

  const handleConfirmClick = useCallback(() => {
    if (totalAmount <= 0) {
      toast({
        title: "Select items",
        description: "Please select at least one fee item to pay.",
        variant: "destructive",
      });
      return;
    }
    if (
      addOtherFee &&
      (!otherFeeAmount || parseFloat(otherFeeAmount) <= 0 || !otherFeeReason.trim())
    ) {
      toast({
        title: "Other fee",
        description: "Enter amount and reason for miscellaneous fee.",
        variant: "destructive",
      });
      return;
    }
    setShowConfirmDialog(true);
  }, [
    totalAmount,
    addOtherFee,
    otherFeeAmount,
    otherFeeReason,
    toast,
  ]);

  const handleConfirmSubmit = useCallback(() => {
    setShowConfirmDialog(false);
    void doSubmit();
  }, [doSubmit]);

  const renderCategorySection = (
    title: string,
    icon: React.ReactNode,
    items: FeeItemShape[],
    _type: "TUITION_FEE" | "TRANSPORT_FEE",
    locked: boolean
  ) => {
    return (
      <div className={`group relative overflow-hidden rounded-lg border ${CARD_BORDER} bg-background p-4 transition-all hover:shadow-sm`}>
        {/* Header */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-md text-foreground">
              {icon}
            </div>
            <div>
              <h3 className="text-base font-semibold text-foreground">{title}</h3>
              {items.length > 0 && !locked && (
                <p className="text-sm text-muted-foreground tabular-nums">{items.length} pending</p>
              )}
            </div>
          </div>
          {locked && (
            <div className="flex h-6 items-center gap-1.5 rounded border border-border px-2 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>Locked</span>
            </div>
          )}
        </div>
        <div className="space-y-2">
          {items.length === 0 ? (
            <div className="flex items-center justify-center py-4">
              <div className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-muted/50">
                  <CheckCircle className="h-5 w-5 text-muted-foreground/60" />
                </div>
                <p className="mt-1.5 text-sm font-medium text-muted-foreground">All clear</p>
                <p className="text-xs text-muted-foreground/80">No outstanding dues</p>
              </div>
            </div>
          ) : (
            <ul className="space-y-2">
              {items.map((item) => {
                const isSelected = !!selectedItems[item.id];
                const amountVal =
                  customAmounts[item.id] !== undefined
                    ? String(customAmounts[item.id])
                    : String(item.originalAmount);
                return (
                  <li key={item.id} className="list-none">
                    <button
                      type="button"
                      disabled={locked}
                      onClick={() => !locked && handleToggleItem(item.id, !isSelected)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          if (!locked) handleToggleItem(item.id, !isSelected);
                        }
                      }}
                      className={`
                        w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-left transition-all
                        ${locked ? "opacity-50 cursor-not-allowed" : "cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-inset"}
                        ${isSelected ? ROW_SELECTED : ROW_PENDING}
                      `}
                      aria-pressed={isSelected}
                      aria-label={`${item.label}, ${formatCurrency(item.originalAmount)}${isSelected ? ", selected" : ""}`}
                    >
                      <div
                        className={`
                          flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors
                          ${isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"}
                        `}
                      >
                        {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="font-semibold text-base text-foreground">{item.label}</span>
                        {item.paymentMonth && (
                          <span className="text-sm text-muted-foreground ml-2">
                            {new Date(item.paymentMonth).toLocaleString("default", {
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        )}
                      </div>
                      {isSelected ? (
                        <div
                          className="flex items-center gap-0.5 w-24 shrink-0"
                          onClick={(e) => e.stopPropagation()}
                          onKeyDown={(e) => e.stopPropagation()}
                        >
                          <span className="text-muted-foreground text-sm">₹</span>
                          <Input
                            type="number"
                            value={amountVal}
                            onChange={(e) => handleAmountChange(item.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            onKeyDown={(e) => e.stopPropagation()}
                            className="h-9 border-0 border-b-2 border-muted-foreground/40 rounded-none px-1 text-right text-base font-bold bg-transparent focus-visible:ring-0 focus-visible:border-primary"
                            step="0.01"
                            min="0"
                            aria-label={`Amount for ${item.label}`}
                          />
                        </div>
                      ) : (
                        <span className="font-semibold text-sm tabular-nums text-foreground shrink-0">
                          {formatCurrency(item.originalAmount)}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header: Back + Branch */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <Badge variant="outline" className="font-normal">
          {branchName}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Categories layout */}
        <div className="lg:col-span-2 space-y-5">
          {/* Header section - no card */}
          <div>
            <h2 className="flex items-center gap-2 text-xl font-semibold tracking-tight text-foreground">
              <Wallet className="h-5 w-5 text-primary" />
              Outstanding fees
            </h2>
            <p className="mt-1.5 text-base text-muted-foreground">
              Select items to pay. Adjust amounts if needed.
            </p>
            {isBookFeePending && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-amber-400 px-3 py-2">
                <Lock className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Pay Book fee first to unlock Tuition and Transport.
                </p>
              </div>
            )}
          </div>

          {/* Book fee: one full-width bar, small height, no-due tick when empty */}
          <div className={`rounded-lg border ${CARD_BORDER} bg-background transition-all hover:shadow-sm`}>
            {feeCategories.BOOK_FEE.length === 0 ? (
              <div className="flex items-center gap-3 px-4 py-3">
                <BookOpen className="h-5 w-5 text-foreground shrink-0" />
                <span className="text-base font-semibold text-foreground">Book fee</span>
                <div className="ml-auto flex items-center gap-2 text-muted-foreground">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0" />
                  <span className="text-sm font-medium">No dues</span>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2.5 border-b border-border/50 px-4 py-2">
                  <BookOpen className="h-4 w-4 text-foreground shrink-0" />
                  <h3 className="text-sm font-semibold text-foreground">Book fee</h3>
                  <span className="text-xs text-muted-foreground tabular-nums">{feeCategories.BOOK_FEE.length} pending</span>
                </div>
                <ul className="space-y-2 p-3 pt-2">
                  {feeCategories.BOOK_FEE.map((item) => {
                    const isSelected = !!selectedItems[item.id];
                    const isEditing = editingBookFeeId === item.id;
                    const amountVal = customAmounts[item.id] !== undefined ? String(customAmounts[item.id]) : String(item.originalAmount);

                    const handleSaveBookFee = async (e: React.MouseEvent) => {
                      e.stopPropagation();
                      if (!onUpdateBookFee) return;
                      const val = parseFloat(newBookFeeValue);
                      if (isNaN(val) || val < 0) return;
                      
                      setIsUpdatingBookFee(true);
                      try {
                        await onUpdateBookFee(val);
                        setEditingBookFeeId(null);
                        toast({
                          title: "Book fee updated",
                          description: "The allocated book fee has been permanently changed.",
                          variant: "success",
                        });
                      } catch (err) {
                        toast({
                          title: "Error",
                          description: "Failed to update book fee.",
                          variant: "destructive",
                        });
                      } finally {
                        setIsUpdatingBookFee(false);
                      }
                    };

                    return (
                      <li key={item.id} className="list-none">
                        <div className="group/item flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => !isEditing && handleToggleItem(item.id, !isSelected)}
                            onKeyDown={(e) => { if (!isEditing && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); handleToggleItem(item.id, !isSelected); } }}
                            className={`flex-1 flex items-center gap-3 rounded-md px-3 py-2.5 text-left transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-inset ${isSelected ? ROW_SELECTED : ROW_PENDING} ${isEditing ? "cursor-default" : ""}`}
                            aria-pressed={isSelected}
                            aria-label={`${item.label}, ${formatCurrency(item.originalAmount)}${isSelected ? ", selected" : ""}`}
                          >
                            <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${isSelected ? "border-primary bg-primary" : "border-muted-foreground/40"}`}>
                              {isSelected && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="font-semibold text-sm text-foreground">{item.label}</span>
                              {item.paymentMonth && <span className="text-xs text-muted-foreground ml-1.5">{new Date(item.paymentMonth).toLocaleString("default", { month: "short", year: "numeric" })}</span>}
                            </div>
                            
                            {isEditing ? (
                              <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                                <div className="flex items-center gap-0.5 w-20 shrink-0">
                                  <span className="text-muted-foreground text-xs">₹</span>
                                  <Input 
                                    autoFocus
                                    type="number" 
                                    value={newBookFeeValue} 
                                    onChange={(e) => setNewBookFeeValue(e.target.value)}
                                    className="h-8 border-0 border-b border-primary/50 rounded-none px-1 text-right text-sm font-bold bg-transparent focus-visible:ring-0 focus-visible:border-primary" 
                                    step="0.01" 
                                    min="0" 
                                  />
                                </div>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-7 px-2 text-primary hover:bg-primary/10" 
                                  onClick={handleSaveBookFee}
                                  disabled={isUpdatingBookFee}
                                >
                                  {isUpdatingBookFee ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-7 px-2 text-muted-foreground hover:bg-muted" 
                                  onClick={() => setEditingBookFeeId(null)}
                                  disabled={isUpdatingBookFee}
                                >
                                  Esc
                                </Button>
                              </div>
                            ) : (
                              <>
                                {isSelected ? (
                                  <div className="flex items-center gap-0.5 w-20 shrink-0" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
                                    <span className="text-muted-foreground text-xs">₹</span>
                                    <Input 
                                      type="number" 
                                      value={amountVal} 
                                      readOnly 
                                      className="h-8 border-0 border-b border-muted-foreground/20 rounded-none px-1 text-right text-sm font-bold bg-transparent focus-visible:ring-0 cursor-not-allowed opacity-80" 
                                      aria-label={`Amount for ${item.label} (Read-only)`} 
                                    />
                                  </div>
                                ) : (
                                  <span className="text-sm font-bold tabular-nums text-foreground shrink-0">{formatCurrency(item.originalAmount)}</span>
                                )}
                              </>
                            )}
                          </button>
                          
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </>
            )}
          </div>

          {/* Tuition and Transport: side by side */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {renderCategorySection(
              "Tuition fee",
              <Building2 className="h-5 w-5" />,
              feeCategories.TUITION_FEE,
              "TUITION_FEE",
              isBookFeePending
            )}
            {renderCategorySection(
              "Transport fee",
              <Bus className="h-5 w-5" />,
              feeCategories.TRANSPORT_FEE,
              "TRANSPORT_FEE",
              isBookFeePending
            )}
          </div>

          {/* Other fee: single full-width bar */}
          <div className={`rounded-lg border ${CARD_BORDER} bg-background p-4 transition-all hover:shadow-sm`}>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-md text-foreground">
                <Plus className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Other fee</h3>
            </div>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setAddOtherFee(!addOtherFee)}
                className={`w-full flex items-center gap-3 rounded-md px-3 py-2.5 text-left transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-inset ${addOtherFee ? ROW_SELECTED : ROW_PENDING}`}
                aria-pressed={addOtherFee}
                aria-label={addOtherFee ? "Remove miscellaneous fee" : "Add miscellaneous fee"}
              >
                <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${addOtherFee ? "border-primary bg-primary" : "border-muted-foreground/40"}`}>
                  {addOtherFee && <Check className="h-2.5 w-2.5 text-primary-foreground" />}
                </div>
                <span className="text-base font-semibold text-foreground">Add miscellaneous fee</span>
              </button>
              {addOtherFee && (
                <div className="mt-4 ml-7 space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Reason</Label>
                    <Input placeholder="e.g. Fine, Late fee" value={otherFeeReason} onChange={(e) => setOtherFeeReason(e.target.value)} className="mt-2 h-10 rounded-lg border border-border text-base" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Amount</Label>
                    <div className="mt-2 flex items-center gap-1.5 rounded-lg border border-border px-3 py-2.5 focus-within:ring-2 focus-within:ring-primary/20">
                      <span className="text-muted-foreground text-base">₹</span>
                      <Input type="number" placeholder="0.00" value={otherFeeAmount} onChange={(e) => setOtherFeeAmount(e.target.value)} className="h-9 border-0 p-0 text-base font-semibold focus-visible:ring-0" step="0.01" min="0" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Payment details – bento tile */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4 overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-background via-background to-muted/10 shadow-lg transition-shadow hover:shadow-xl">
            <div className="h-1 bg-gradient-to-r from-primary/40 via-primary/60 to-primary/40" />
            <CardHeader className="border-b border-border/50 bg-muted/20 px-5 py-4">
              <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Receipt className="h-4 w-4" />
                </div>
                Payment details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <div className="space-y-3 rounded-xl border border-border/50 bg-gradient-to-br from-muted/40 to-muted/20 p-5 shadow-sm">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Selected</span>
                  <span className="font-medium">
                    {Object.keys(selectedItems).length + (addOtherFee ? 1 : 0)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(totalAmount)}</span>
                </div>
                {paymentMethod === "CARD" && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Card charges (1.2%)</span>
                    <span>+{formatCurrency(calculateCardCharges(totalAmount))}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between items-baseline">
                  <span className="font-semibold">Total payable</span>
                  <span className="text-xl font-bold text-primary">
                    ₹{finalTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm">Payment method</Label>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
                  className="grid grid-cols-3 gap-2"
                >
                  {PAYMENT_METHOD_OPTIONS.map((opt) => (
                    <div key={opt.value}>
                      <RadioGroupItem
                        value={opt.value}
                        id={`pm-${opt.value}`}
                        className="peer sr-only"
                      />
                      <Label
                        htmlFor={`pm-${opt.value}`}
                        className="flex flex-col items-center justify-center rounded-lg border-2 border-muted bg-background p-3 cursor-pointer transition-colors hover:bg-muted/50 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                      >
                        <span className="text-lg">{opt.icon}</span>
                        <span className="text-xs font-medium mt-1">{opt.label}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks" className="text-sm">
                  Remarks (optional)
                </Label>
                <Textarea
                  id="remarks"
                  placeholder="Add notes..."
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="resize-none h-20 text-sm"
                />
              </div>

              <Button
                className="w-full h-12 rounded-xl text-base font-semibold shadow-md transition-all hover:shadow-lg"
                size="lg"
                onClick={handleConfirmClick}
                disabled={isSubmitting || totalAmount <= 0}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>Pay ₹{finalTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}</>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm payment</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="text-left space-y-3 pt-1">
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">{studentLabel}</span>
                  {" "}({admissionNo})
                </p>
                <p className="text-xs text-muted-foreground">
                  Payment method: {PAYMENT_METHOD_OPTIONS.find((o) => o.value === paymentMethod)?.label ?? paymentMethod}
                </p>
                <div className="rounded-lg border bg-muted/30 p-3 space-y-1.5 text-sm">
                  {confirmSummaryLines.map((line, i) => (
                    <div key={`${line.label}-${line.amount}-${i}`} className="flex justify-between gap-2">
                      <span className="text-muted-foreground truncate">{line.label}</span>
                      <span className="font-medium tabular-nums shrink-0">
                        {formatCurrency(line.amount)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-sm font-semibold pt-1">
                  <span>Total</span>
                  <span className="text-primary">
                    ₹{finalTotal.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit}>
              Confirm &amp; Pay
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
