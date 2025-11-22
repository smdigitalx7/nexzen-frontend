import React, { useRef, useState, useEffect } from "react";
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
import { Label } from "@/common/components/ui/label";
import { Input } from "@/common/components/ui/input";
import { Alert, AlertDescription } from "@/common/components/ui/alert";
import type { AdvanceRead } from "@/features/general/types/advances";

interface AdvanceAmountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (amountPaid: number) => void;
  advance?: AdvanceRead | null;
}

const AdvanceAmountDialog = ({ open, onOpenChange, onUpdate, advance }: AdvanceAmountDialogProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [amountPaid, setAmountPaid] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (open) {
      setAmountPaid("");
      setError("");
      // Focus input when dialog opens
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  const remainingBalance = advance?.remaining_balance ?? advance?.advance_amount ?? 0;

  const handleUpdate = () => {
    const amount = parseFloat(amountPaid);
    
    // Validation
    if (isNaN(amount) || amount <= 0) {
      setError("Amount must be greater than 0");
      return;
    }

    if (amount > remainingBalance) {
      setError(`Amount cannot exceed remaining balance of ₹${remainingBalance.toLocaleString()}`);
      return;
    }

    setError("");
    onUpdate(amount);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update Amount Paid</AlertDialogTitle>
          <AlertDialogDescription>
            Create a manual (BY_HAND) repayment for this advance. The amount must be greater than 0 and cannot exceed the remaining balance.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4">
          {advance && (
            <div className="grid grid-cols-2 gap-4 p-3 bg-gray-50 rounded-md">
              <div>
                <Label className="text-xs text-gray-500">Advance Amount</Label>
                <p className="text-sm font-medium">₹{advance.advance_amount?.toLocaleString() || '0'}</p>
              </div>
              <div>
                <Label className="text-xs text-gray-500">Remaining Balance</Label>
                <p className="text-sm font-medium text-red-600">₹{remainingBalance.toLocaleString()}</p>
              </div>
            </div>
          )}
          <div>
            <Label htmlFor="amount_paid">Amount Paid (₹) *</Label>
            <Input
              id="amount_paid"
              type="number"
              placeholder="Enter amount paid"
              min="0.01"
              step="0.01"
              max={remainingBalance}
              value={amountPaid}
              onChange={(e) => {
                setAmountPaid(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleUpdate();
                }
              }}
              ref={inputRef}
              leftIcon="₹"
            />
            {error && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleUpdate}
            disabled={!amountPaid || parseFloat(amountPaid) <= 0 || parseFloat(amountPaid) > remainingBalance}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Update Amount
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default React.memo(AdvanceAmountDialog);


