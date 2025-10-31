import { useState, useMemo, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Eye, Edit, Trash2, Printer } from "lucide-react";
import type { CollegeIncomeSummary, CollegeIncomeSummaryParams } from "@/lib/types/college";
import { useCollegeIncomeSummary } from "@/lib/hooks/college/use-college-income";
import { formatCurrency, formatDate } from "@/lib/utils";
import { EnhancedDataTable } from "@/components/shared/EnhancedDataTable";
import { createTextColumn, createCurrencyColumn } from "@/lib/utils/columnFactories";
import type { ColumnDef } from "@tanstack/react-table";
import { handleRegenerateReceipt } from "@/lib/api";
import { ReceiptPreviewModal } from "@/components/shared";
import { toast } from "@/hooks/use-toast";

interface IncomeTableProps {
  onViewIncome?: (income: CollegeIncomeSummary) => void;
  params?: CollegeIncomeSummaryParams;
}

export const IncomeTable = ({
  onViewIncome,
  params = {},
}: IncomeTableProps) => {
  // Receipt modal state
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptBlobUrl, setReceiptBlobUrl] = useState<string | null>(null);

  // Fetch income summary data using the hook
  const { 
    data: incomeResponse, 
    isLoading, 
    error, 
    refetch 
  } = useCollegeIncomeSummary(params);

  const incomeData = incomeResponse?.items || [];
  const totalCount = incomeResponse?.total || 0;

  const uniqueReceiptNos = Array.from(new Set(incomeData.map(i => i.receipt_no).filter(Boolean)));

  // Define columns for EnhancedDataTable
  const columns: ColumnDef<CollegeIncomeSummary>[] = [
    {
      id: 'created_at',
      header: 'Date',
      cell: ({ row }) => {
        const value = row.original.created_at;
        return formatDate(value);
      },
    },
    {
      id: 'receipt_no',
      header: 'Receipt No',
      cell: ({ row }) => {
        const value = row.original.receipt_no;
        return value || "-";
      },
    },
    {
      id: 'student_name',
      header: 'Student',
      cell: ({ row }) => {
        const value = row.original.student_name;
        return value || "-";
      },
    },
    {
      id: 'identity_no',
      header: 'Identity No',
      cell: ({ row }) => {
        const value = row.original.identity_no;
        return value || "-";
      },
    },
    {
      id: 'purpose',
      header: 'Purpose',
      cell: ({ row }) => {
        const value = row.original.purpose;
        return value || "-";
      },
    },
    createCurrencyColumn<CollegeIncomeSummary>("total_amount", {
      header: "Amount",
      className: "text-green-600 font-bold",
    }),
  ];

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(() => [
    ...(onViewIncome ? [{
      type: 'view' as const,
      onClick: (income: CollegeIncomeSummary) => {
        if (!income || !income.income_id) {
          console.error("Invalid income object:", income);
          return;
        }
        onViewIncome(income);
      }
    }] : [])
  ], [onViewIncome]);

  // Handle print receipt action
  const handlePrintReceipt = useCallback(async (income: CollegeIncomeSummary) => {
    if (!income || !income.income_id) {
      toast({
        title: "Receipt Not Available",
        description: "This income record does not have a valid income ID.",
        variant: "destructive",
      });
      return;
    }

    try {
      const blobUrl = await handleRegenerateReceipt(income.income_id, 'college');
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

  // Action buttons for EnhancedDataTable (including print receipt)
  const actionButtons = useMemo(() => [
    {
      id: 'print-receipt',
      label: 'Print Receipt',
      icon: Printer,
      variant: 'outline' as const,
      onClick: (income: CollegeIncomeSummary) => handlePrintReceipt(income),
    }
  ], [handlePrintReceipt]);

  // Prepare filter options for EnhancedDataTable
  const filterOptions = [
    {
      key: 'receipt_no',
      label: 'Receipt No',
      options: uniqueReceiptNos.map(receiptNo => ({ value: receiptNo!, label: receiptNo! })),
      value: 'all',
      onChange: (value: string) => {
        // This will be handled by EnhancedDataTable's built-in filtering
      }
    }
  ];

  // Handle loading and error states
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-500">Loading income data...</div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-center p-8">
          <div className="text-red-500">Error loading income data. Please try again.</div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >
      <EnhancedDataTable
        data={incomeData}
        columns={columns}
        title="Income Records"
        searchKey="receipt_no"
        searchPlaceholder="Search by receipt no, student name, or identity no..."
        exportable={true}
        filters={filterOptions}
        showActions={true}
        actionButtonGroups={actionButtonGroups}
        actionButtons={actionButtons}
        actionColumnHeader="Actions"
        showActionLabels={false}
      />

      {/* Receipt Preview Modal */}
      <ReceiptPreviewModal
        isOpen={showReceiptModal}
        onClose={handleCloseReceiptModal}
        blobUrl={receiptBlobUrl || null}
      />

    </motion.div>
  );
};
