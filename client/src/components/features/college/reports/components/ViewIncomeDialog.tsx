import { motion } from "framer-motion";
import { Calendar, User, Hash, FileText, CreditCard, Clock, Phone, Receipt } from "lucide-react";
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
import type { CollegeIncomeRead, CollegeIncomeReceipt } from "@/lib/types/college";
import { CollegeIncomeService } from "@/lib/services/college";
import { useQuery } from "@tanstack/react-query";

interface ViewIncomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  income: CollegeIncomeRead | null;
  isLoading?: boolean;
  error?: Error | null;
}

export const ViewIncomeDialog = ({ 
  open, 
  onOpenChange, 
  income, 
  isLoading = false, 
  error = null 
}: ViewIncomeDialogProps) => {
  // Fetch receipt data for more detailed information
  const { 
    data: receiptData, 
    isLoading: receiptLoading, 
    error: receiptError 
  } = useQuery({
    queryKey: ['college-income-receipt', income?.income_id],
    queryFn: () => CollegeIncomeService.getIncomeReceipt(income!.income_id),
    enabled: !!income?.income_id && open,
  });

  if (isLoading || receiptLoading) {
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

  if (error || receiptError) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Error Loading Income Details</DialogTitle>
            <DialogDescription>There was an error loading the income details.</DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-red-600">Error: {(error || receiptError)?.message}</p>
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

  const getPurposeBadgeVariant = (purpose: string) => {
    switch (purpose) {
      case "TUITION_FEE":
        return "default";
      case "ADMISSION_FEE":
        return "secondary";
      case "APPLICATION_FEE":
        return "outline";
      case "TRANSPORT_FEE":
        return "destructive";
      case "BOOK_FEE":
        return "secondary";
      case "RESERVATION_FEE":
        return "outline";
      default:
        return "default";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-xl font-bold text-green-600">₹</span>
            </div>
            <div>
              <div>Income Receipt Details</div>
              <div className="text-sm font-normal text-muted-foreground">
                Complete payment information and student details
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          {/* Header Card */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-6 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">
                  {receiptData?.student_name || income.student_name || "Unknown Student"}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Hash className="h-4 w-4" />
                    <span>ID: #{income.income_id}</span>
                  </div>
                  {receiptData?.receipt_no && (
                    <div className="flex items-center gap-1">
                      <Receipt className="h-4 w-4" />
                      <span>Receipt: {receiptData.receipt_no}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right space-y-2">
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(receiptData?.total_amount || income.total_amount)}
                </div>
                {receiptData?.receipt_type && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                    {receiptData.receipt_type}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Details Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Student Information Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User className="h-5 w-5 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Student Information</h4>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Admission Number</span>
                  <span className="text-sm font-semibold text-gray-900 font-mono">
                    {receiptData?.admission_no || income.admission_no || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Roll Number</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {income.roll_number || "N/A"}
                  </span>
                </div>
                {receiptData?.father_or_guardian_name && (
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm font-medium text-gray-600">Guardian/Father</span>
                    <span className="text-sm font-semibold text-gray-900">{receiptData.father_or_guardian_name}</span>
                  </div>
                )}
                {receiptData?.father_or_guardian_mobile && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium text-gray-600">Guardian Mobile</span>
                    <span className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {receiptData.father_or_guardian_mobile}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Information Card */}
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Payment Information</h4>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Payment Method</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {receiptData?.payment_mode || "N/A"}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Receipt Number</span>
                  <span className="text-sm font-semibold text-gray-900 font-mono">
                    {receiptData?.receipt_no || income.receipt_no || "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-600">Created Date</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatDate(income.created_at)}
                  </span>
                </div>
                {receiptData?.academic_year && (
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm font-medium text-gray-600">Academic Year</span>
                    <span className="text-sm font-semibold text-gray-900">{receiptData.academic_year}</span>
                  </div>
                )}
              </div>
            </div>
          </div>


          {/* Payment Particulars */}
          {receiptData?.particulars && receiptData.particulars.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Receipt className="h-5 w-5 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Payment Breakdown</h4>
              </div>
              <div className="space-y-4">
                {receiptData.particulars.map((particular, index) => (
                  <div key={index} className="flex justify-between items-center py-3 px-4 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">{particular.desc}</span>
                    <span className="text-sm font-bold text-green-600">
                      {formatCurrency(particular.amount)}
                    </span>
                  </div>
                ))}
                <div className="border-t-2 border-gray-200 pt-4">
                  <div className="flex justify-between items-center py-3 px-4 bg-green-50 rounded-lg">
                    <span className="text-base font-bold text-gray-900">Total Amount</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(receiptData.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          {income.remarks && (
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <FileText className="h-5 w-5 text-orange-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900">Additional Notes</h4>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="text-sm text-gray-700 leading-relaxed">{income.remarks}</p>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="flex justify-between items-center pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-500">
              Last updated: {income.updated_at ? formatDate(income.updated_at) : formatDate(income.created_at)}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => onOpenChange(false)} className="px-6">
                Close
              </Button>
              <Button className="px-6 bg-green-600 hover:bg-green-700">
                <Receipt className="h-4 w-4 mr-2" />
                Print Receipt
              </Button>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
};
