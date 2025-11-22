import { motion } from "framer-motion";
import { Calendar, FileText, CreditCard, User, Hash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/common/components/ui/dialog";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { Separator } from "@/common/components/ui/separator";
import { formatCurrency, formatDate } from "@/common/utils";
import type { SchoolIncomeReceipt } from "@/features/school/types";

interface ViewIncomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receipt: SchoolIncomeReceipt | null;
  isLoading?: boolean;
  error?: Error | null;
}

export const ViewIncomeDialog = ({
  open,
  onOpenChange,
  receipt,
  isLoading = false,
  error = null,
}: ViewIncomeDialogProps) => {
  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Loading Receipt Details...</DialogTitle>
            <DialogDescription>Please wait while we fetch the receipt details.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Error Loading Receipt Details</DialogTitle>
            <DialogDescription>There was an error loading the receipt details.</DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-red-600">Error: {error.message}</p>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="mt-4"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!receipt) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Receipt Not Found</DialogTitle>
            <DialogDescription>The requested receipt could not be found.</DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="text-lg font-bold">₹</span>
            Receipt Details
          </DialogTitle>
          <DialogDescription>
            View detailed receipt information for this income record.
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Receipt No: {receipt.receipt_no}</h3>
                <p className="text-sm text-muted-foreground">
                  {receipt.receipt_type.replace(/_/g, " ").toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(receipt.total_amount)}
                </div>
                <Badge variant="secondary">
                  {receipt.payment_mode || "N/A"}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Payment Date:</span>
                <span className="text-sm font-medium">{formatDate(receipt.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Payment Mode:</span>
                <span className="text-sm font-medium">{receipt.payment_mode || "N/A"}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Academic Year:</span>
                <span className="text-sm font-medium">{receipt.academic_year || "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Student Information */}
          {(receipt.student_name || receipt.admission_no) && (
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Student Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {receipt.student_name && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Student Name:</span>
                    <span className="text-sm font-medium">{receipt.student_name}</span>
                  </div>
                )}
                {receipt.admission_no && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Admission No:</span>
                    <span className="text-sm font-mono font-medium">{receipt.admission_no}</span>
                  </div>
                )}
                {receipt.father_or_guardian_name && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Father/Guardian:</span>
                    <span className="text-sm font-medium">{receipt.father_or_guardian_name}</span>
                  </div>
                )}
                {receipt.father_or_guardian_mobile && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Mobile:</span>
                    <span className="text-sm font-mono">{receipt.father_or_guardian_mobile}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Particulars */}
          {receipt.particulars && receipt.particulars.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Payment Particulars
              </h4>
              <div className="border rounded-lg">
                <div className="overflow-x-auto scrollbar-hide">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-medium">Description</th>
                        <th className="text-right p-3 font-medium">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {receipt.particulars.map((particular, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3 text-sm">{particular.desc}</td>
                          <td className="p-3 text-sm text-right font-mono">
                            {formatCurrency(particular.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-muted">
                      <tr className="border-t-2 border-primary">
                        <td className="p-3 font-bold">Total Amount</td>
                        <td className="p-3 text-right font-bold text-green-600">
                          {formatCurrency(receipt.total_amount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
