import { motion } from "framer-motion";
import { Calendar, FileText, CreditCard, DollarSign } from "lucide-react";
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
import type { CollegeExpenditureRead } from "@/lib/types/college";

interface ViewExpenditureDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expenditure: CollegeExpenditureRead | null;
  isLoading?: boolean;
  error?: Error | null;
}

export const ViewExpenditureDialog = ({
  open,
  onOpenChange,
  expenditure,
  isLoading = false,
  error = null,
}: ViewExpenditureDialogProps) => {
  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Loading Expenditure Details...</DialogTitle>
            <DialogDescription>Please wait while we fetch the expenditure details.</DialogDescription>
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
            <DialogTitle>Error Loading Expenditure Details</DialogTitle>
            <DialogDescription>There was an error loading the expenditure details.</DialogDescription>
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

  if (!expenditure) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Expenditure Not Found</DialogTitle>
            <DialogDescription>The requested expenditure record could not be found.</DialogDescription>
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
            Expenditure Details
          </DialogTitle>
          <DialogDescription>
            View detailed information about this expenditure record.
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
                <h3 className="text-lg font-semibold">Expenditure ID: #{expenditure.expenditure_id}</h3>
                <p className="text-sm text-muted-foreground">
                  {expenditure.expenditure_purpose.replace(/_/g, " ")}
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-red-600">
                  {formatCurrency(expenditure.amount)}
                </div>
                <Badge variant="secondary">
                  {expenditure.payment_method || "N/A"}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Bill Date:</span>
                <span className="text-sm font-medium">{formatDate(expenditure.bill_date)}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Payment Method:</span>
                <span className="text-sm font-medium">{expenditure.payment_method || "N/A"}</span>
              </div>
            </div>
          </div>

          {expenditure.remarks && (
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Remarks
              </h4>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm">{expenditure.remarks}</p>
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
              <span className="text-sm font-bold text-red-600">{formatCurrency(expenditure.amount)}</span>
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
                <span className="text-sm font-medium">{formatDate(expenditure.created_at)}</span>
              </div>
              {expenditure.updated_at && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Updated:</span>
                  <span className="text-sm font-medium">{formatDate(expenditure.updated_at)}</span>
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


