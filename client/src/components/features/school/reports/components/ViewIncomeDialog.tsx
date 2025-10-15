import { motion } from "framer-motion";
import { Calendar, FileText, CreditCard, DollarSign, User, Hash } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { SchoolIncomeRead } from "@/lib/types/school";

interface ViewIncomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  income: SchoolIncomeRead | null;
  isLoading?: boolean;
  error?: Error | null;
}

export const ViewIncomeDialog = ({
  open,
  onOpenChange,
  income,
  isLoading = false,
  error = null,
}: ViewIncomeDialogProps) => {
  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Loading Income Details...</DialogTitle>
            <DialogDescription>Please wait while we fetch the income details.</DialogDescription>
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
            <DialogTitle>Error Loading Income Details</DialogTitle>
            <DialogDescription>There was an error loading the income details.</DialogDescription>
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

  if (!income) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Income Not Found</DialogTitle>
            <DialogDescription>The requested income record could not be found.</DialogDescription>
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
            <DollarSign className="h-5 w-5" />
            Income Details
          </DialogTitle>
          <DialogDescription>
            View detailed information about this income record.
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
                <h3 className="text-lg font-semibold">Income ID: #{income.income_id}</h3>
                <p className="text-sm text-muted-foreground">
                  {income.purpose}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(income.amount)}
                </div>
                <Badge variant="secondary">
                  {income.payment_method || "N/A"}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Income Date:</span>
                <span className="text-sm font-medium">{formatDate(income.income_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Payment Method:</span>
                <span className="text-sm font-medium">{income.payment_method || "N/A"}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Term Number:</span>
                <span className="text-sm font-medium">{income.term_number ? `Term ${income.term_number}` : "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Student Information */}
          {(income.student_name || income.admission_no) && (
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Student Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {income.student_name && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Student Name:</span>
                    <span className="text-sm font-medium">{income.student_name}</span>
                  </div>
                )}
                {income.admission_no && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Admission No:</span>
                    <span className="text-sm font-mono font-medium">{income.admission_no}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {income.note && (
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Note
              </h4>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm">{income.note}</p>
              </div>
            </div>
          )}

          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Amount
            </h4>
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Amount:</span>
              <span className="text-sm font-bold text-green-600">{formatCurrency(income.amount)}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Dates
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Created:</span>
                <span className="text-sm font-medium">{formatDate(income.created_at)}</span>
              </div>
              {income.updated_at && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Updated:</span>
                  <span className="text-sm font-medium">{formatDate(income.updated_at)}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
