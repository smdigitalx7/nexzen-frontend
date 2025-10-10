import React, { useRef } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface AdvanceAmountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (amountPaid: number) => void;
}

const AdvanceAmountDialog = ({ open, onOpenChange, onUpdate }: AdvanceAmountDialogProps) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Update Amount Paid</AlertDialogTitle>
          <AlertDialogDescription>
            Update the amount paid for this advance.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="amount_paid">Amount Paid (₹)</Label>
            <Input id="amount_paid" type="number" placeholder="Enter amount paid" min="0" step="0.01" ref={inputRef} />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={() => onUpdate(parseFloat(inputRef.current?.value || "0"))} className="bg-blue-600 hover:bg-blue-700">
            Update Amount
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default React.memo(AdvanceAmountDialog);


