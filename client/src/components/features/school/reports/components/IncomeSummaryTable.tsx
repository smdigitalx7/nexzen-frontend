import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Receipt, Eye, Edit, Trash2, Printer } from "lucide-react";
import { SchoolIncomeService } from "@/lib/services/school/income.service";
import type { SchoolIncomeSummary, SchoolIncomeSummaryParams } from "@/lib/types/school/income";
import { ViewIncomeDialog } from "./ViewIncomeDialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { EnhancedDataTable } from "@/components/shared/EnhancedDataTable";
import { createCurrencyColumn } from "@/lib/utils/columnFactories";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { handleRegenerateReceipt } from "@/lib/api";
import { ReceiptPreviewModal } from "@/components/shared";
import { toast } from "@/hooks/use-toast";

interface IncomeSummaryTableProps {
  onExportCSV?: () => void;
  onAddIncome?: () => void;
}

export const IncomeSummaryTable = ({
  onExportCSV,
  onAddIncome,
}: IncomeSummaryTableProps) => {
  // View dialog state
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewIncomeId, setViewIncomeId] = useState<number | null>(null);
  
  // Receipt modal state
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptBlobUrl, setReceiptBlobUrl] = useState<string | null>(null);
  
  // Build query parameters
  const queryParams: SchoolIncomeSummaryParams = {};

  // Fetch income summary data
  const { 
    data: incomeData, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['school-income-summary', queryParams],
    queryFn: () => SchoolIncomeService.getIncomeSummary(queryParams),
  });


  // Fetch income receipt for viewing
  const { data: viewReceipt, isLoading: isViewLoading, error: viewError } = useQuery({
    queryKey: ['school-income-receipt-view', viewIncomeId],
    queryFn: () => SchoolIncomeService.getIncomeReceipt(viewIncomeId!),
    enabled: !!viewIncomeId,
  });

  // Handle view action
  const handleView = (income: SchoolIncomeSummary) => {
    if (!income || !income.income_id) {
      console.error("Invalid income object:", income);
      return;
    }
    setViewIncomeId(income.income_id);
    setShowViewDialog(true);
  };

  // Handle print receipt action
  const handlePrintReceipt = useCallback(async (income: SchoolIncomeSummary) => {
    if (!income || !income.income_id) {
      toast({
        title: "Receipt Not Available",
        description: "This income record does not have a valid income ID.",
        variant: "destructive",
      });
      return;
    }

    try {
      const blobUrl = await handleRegenerateReceipt(income.income_id, 'school');
      setReceiptBlobUrl(blobUrl);
      setShowReceiptModal(true);
      
      toast({
        title: "Receipt Generated",
        description: "Receipt has been generated and is ready for viewing.",
        variant: "success",
      });
    } catch (error) {
      console.error("Receipt regeneration failed:", error);
      toast({
        title: "Receipt Generation Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  }, []);

  const handleCloseReceiptModal = useCallback(() => {
    setShowReceiptModal(false);
    if (receiptBlobUrl) {
      URL.revokeObjectURL(receiptBlobUrl);
      setReceiptBlobUrl(null);
    }
  }, [receiptBlobUrl]);


  // Define columns for EnhancedDataTable
  const columns: ColumnDef<SchoolIncomeSummary>[] = [
    {
      accessorKey: 'created_at',
      header: 'Date',
      cell: ({ row }) => formatDate(row.getValue("created_at") as string),
    },
    {
      accessorKey: 'receipt_no',
      header: 'Receipt No',
      cell: ({ row }) => row.getValue("receipt_no") || "-",
    },
    {
      accessorKey: 'student_name',
      header: 'Student',
      cell: ({ row }) => row.getValue("student_name") || "-",
    },
    {
      accessorKey: 'identity_no',
      header: 'Admission/Reservation No',
      cell: ({ row }) => row.getValue("identity_no") || "-",
    },
    {
      accessorKey: 'purpose',
      header: 'Purpose',
      cell: ({ row }) => {
        const purpose = row.getValue("purpose") as string;
        return (
          <Badge variant="secondary" className="max-w-[200px] truncate">
            {purpose || "-"}
          </Badge>
        );
      },
    },
    createCurrencyColumn<SchoolIncomeSummary>("total_amount", { 
      header: "Amount",
      className: "text-green-600 font-bold",
    }),
  ];

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(() => [
    {
      type: 'view' as const,
      onClick: (income: SchoolIncomeSummary) => {
        if (income) {
          handleView(income);
        } else {
          console.error("income is undefined");
        }
      }
    }
  ], []);

  // Action buttons for EnhancedDataTable (including print receipt)
  const actionButtons = useMemo(() => [
    {
      id: 'print-receipt',
      label: 'Print Receipt',
      icon: Printer,
      variant: 'outline' as const,
      onClick: (income: SchoolIncomeSummary) => handlePrintReceipt(income),
    }
  ], [handlePrintReceipt]);


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <div className="text-red-600 text-sm">
              ❌ Error loading income data: {error.message}
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refetch()}
              className="ml-4"
            >
              Retry
            </Button>
          </div>
        </div>
      )}
      
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Loading income data...</span>
        </div>
      )}
      
      {/* Empty State */}
      {!isLoading && !error && (!incomeData?.items || incomeData.items.length === 0) && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No income records found</p>
          <Button 
            variant="outline" 
            onClick={() => refetch()}
            className="mt-2"
          >
            Refresh
          </Button>
        </div>
      )}
      
      {/* Data Table */}
      <EnhancedDataTable
        data={incomeData?.items || []}
        columns={columns}
        title="Income Summary"
        searchKey="receipt_no"
        searchPlaceholder="Search by receipt no, student name, or identity no..."
        exportable={true}
        loading={isLoading}
        showActions={true}
        actionButtonGroups={actionButtonGroups}
        actionButtons={actionButtons}
        actionColumnHeader="Actions"
        showActionLabels={false}
      />

      {/* View Income Dialog */}
      {showViewDialog && viewIncomeId && (
        <ViewIncomeDialog
          open={showViewDialog}
          onOpenChange={(open) => {
            if (!open) {
              setShowViewDialog(false);
              setViewIncomeId(null);
            }
          }}
          receipt={viewReceipt || null}
          isLoading={isViewLoading}
          error={viewError}
        />
      )}

      {/* Receipt Preview Modal */}
      <ReceiptPreviewModal
        isOpen={showReceiptModal}
        onClose={handleCloseReceiptModal}
        blobUrl={receiptBlobUrl || null}
      />
    </motion.div>
  );
};
