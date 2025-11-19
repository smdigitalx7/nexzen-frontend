import React, { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Printer } from "lucide-react";
import { Loader } from "@/components/ui/ProfessionalLoader";
import { SchoolIncomeService } from "@/lib/services/school";
import type {
  SchoolIncomeSummary,
  SchoolIncomeSummaryParams,
} from "@/lib/types/school/income";
import { ViewIncomeDialog } from "./ViewIncomeDialog";
import { formatDate } from "@/lib/utils";
import { EnhancedDataTable } from "@/components/shared/EnhancedDataTable";
import { createCurrencyColumn } from "@/lib/utils/factory/columnFactories";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { handleRegenerateReceipt } from "@/lib/api";
import { ReceiptPreviewModal } from "@/components/shared";
import { toast } from "@/hooks/use-toast";

// ✅ FIX: Create a proper component wrapper for Loader.Button that accepts className
// Moved outside component to prevent recreation on every render
const LoadingIcon = React.memo<{ className?: string }>(({ className }) => (
  <div className={className}>
    <Loader.Button size="xs" />
  </div>
));
LoadingIcon.displayName = "LoadingIcon";

interface IncomeSummaryTableProps {
  onExportCSV?: () => void;
  onAddIncome?: () => void;
  enabled?: boolean; // ✅ OPTIMIZATION: Allow parent to control when to fetch
}

export const IncomeSummaryTable = ({
  onExportCSV,
  onAddIncome,
  enabled = true, // Default to enabled for backward compatibility
}: IncomeSummaryTableProps) => {
  // View dialog state
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewIncomeId, setViewIncomeId] = useState<number | null>(null);

  // Receipt modal state
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptBlobUrl, setReceiptBlobUrl] = useState<string | null>(null);
  const [loadingReceiptId, setLoadingReceiptId] = useState<number | null>(null);

  // ✅ OPTIMIZATION: Stabilize query params (empty object, but still memoize to prevent key changes)
  const queryParams = useMemo<SchoolIncomeSummaryParams>(() => ({}), []);
  
  // ✅ OPTIMIZATION: Stabilize query key
  const incomeQueryKey = useMemo(
    () => ["school-income-summary", queryParams],
    [queryParams]
  );

  // ✅ OPTIMIZATION: Only fetch when enabled (tab is active)
  const {
    data: incomeData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: incomeQueryKey,
    queryFn: () => SchoolIncomeService.getIncomeSummary(queryParams),
    enabled: enabled, // ✅ Only fetch when tab is active
    refetchOnWindowFocus: false, // ✅ OPTIMIZATION: No refetch on tab focus
    refetchOnReconnect: false, // ✅ OPTIMIZATION: No refetch on reconnect
    refetchOnMount: true, // Only refetch on mount if enabled and data is stale
  });

  // ✅ OPTIMIZATION: Stabilize query key
  const receiptQueryKey = useMemo(
    () => ["school-income-receipt-view", viewIncomeId],
    [viewIncomeId]
  );

  // Fetch income receipt for viewing
  const {
    data: viewReceipt,
    isLoading: isViewLoading,
    error: viewError,
  } = useQuery({
    queryKey: receiptQueryKey,
    queryFn: () => SchoolIncomeService.getIncomeReceipt(viewIncomeId!),
    enabled: !!viewIncomeId,
    refetchOnWindowFocus: false, // ✅ OPTIMIZATION: No refetch on tab focus
    refetchOnReconnect: false, // ✅ OPTIMIZATION: No refetch on reconnect
    refetchOnMount: true, // Only refetch on mount if data is stale
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
  const handlePrintReceipt = useCallback(
    async (income: SchoolIncomeSummary) => {
      if (!income || !income.income_id) {
        toast({
          title: "Receipt Not Available",
          description: "This income record does not have a valid income ID.",
          variant: "destructive",
        });
        return;
      }

      setLoadingReceiptId(income.income_id);
      try {
        const blobUrl = await handleRegenerateReceipt(
          income.income_id,
          "school"
        );
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
          description:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred.",
          variant: "destructive",
        });
      } finally {
        setLoadingReceiptId(null);
      }
    },
    []
  );

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
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) => formatDate(row.getValue("created_at")),
    },
    {
      accessorKey: "receipt_no",
      header: "Receipt No",
      cell: ({ row }) => row.getValue("receipt_no") || "-",
    },
    {
      accessorKey: "student_name",
      header: "Student",
      cell: ({ row }) => row.getValue("student_name") || "-",
    },
    {
      accessorKey: "identity_no",
      header: "Admission/Reservation No",
      cell: ({ row }) => row.getValue("identity_no") || "-",
    },
    {
      accessorKey: "purpose",
      header: "Purpose",
      cell: ({ row }) => {
        const purpose = row.getValue("purpose");
        return (
          <Badge variant="secondary" className="max-w-[200px] truncate">
            {purpose && typeof purpose === "string" ? purpose : "-"}
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
  const actionButtonGroups = useMemo(
    () => [
      {
        type: "view" as const,
        onClick: (income: SchoolIncomeSummary) => {
          if (income) {
            handleView(income);
          } else {
            console.error("income is undefined");
          }
        },
      },
    ],
    []
  );

  // Action buttons for EnhancedDataTable (including print receipt)
  const actionButtons = useMemo(
    () => [
      {
        id: "print-receipt",
        label: (income: SchoolIncomeSummary) =>
          loadingReceiptId === income.income_id
            ? "Generating..."
            : "Print Receipt",
        icon: (income: SchoolIncomeSummary) =>
          loadingReceiptId === income.income_id ? LoadingIcon : Printer,
        variant: "outline" as const,
        onClick: (income: SchoolIncomeSummary) => handlePrintReceipt(income),
        show: (income: SchoolIncomeSummary) => true,
        disabled: (income: SchoolIncomeSummary) =>
          loadingReceiptId === income.income_id,
      },
    ],
    [handlePrintReceipt, loadingReceiptId]
  );

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
      {!isLoading &&
        !error &&
        (!incomeData?.items || incomeData.items.length === 0) && (
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
        showActionLabels={true}
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
