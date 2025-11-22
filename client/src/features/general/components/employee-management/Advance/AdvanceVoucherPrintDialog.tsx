import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Button } from "@/common/components/ui/button";
import { Printer, FileText } from "lucide-react";
import { motion } from "framer-motion";
import type { AdvanceRead } from "@/features/general/types/advances";

interface AdvanceVoucherPrintDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  advance: AdvanceRead | null;
  employeeName: string;
  onPrint: () => void;
}

export const AdvanceVoucherPrintDialog: React.FC<AdvanceVoucherPrintDialogProps> = ({
  open,
  onOpenChange,
  advance,
  employeeName,
  onPrint,
}) => {
  const handlePrint = () => {
    onPrint();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Advance Created Successfully
          </DialogTitle>
          <DialogDescription>
            Advance voucher has been generated. Would you like to print it now?
          </DialogDescription>
        </DialogHeader>

        {advance && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Employee:</span>
                  <span className="font-semibold">{employeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Amount:</span>
                  <span className="font-semibold text-blue-600">
                    ₹{advance.advance_amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-600 dark:text-gray-400">Date:</span>
                  <span className="font-semibold">
                    {new Date(advance.advance_date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <DialogFooter className="flex gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            onClick={handlePrint}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Printer className="h-4 w-4 mr-2" />
            Print Advance Voucher
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};



