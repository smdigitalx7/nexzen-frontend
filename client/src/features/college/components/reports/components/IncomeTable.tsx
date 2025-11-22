import React, { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Printer, Plus } from "lucide-react";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import type {
  CollegeIncomeSummary,
  CollegeIncomeSummaryParams,
} from "@/features/college/types";
import { useCollegeIncomeSummary } from "@/features/college/hooks";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@/common/utils";
import { EnhancedDataTable } from "@/common/components/shared/EnhancedDataTable";
import { createCurrencyColumn } from "@/common/utils/factory/columnFactories";
import type { ColumnDef } from "@tanstack/react-table";
import { handleRegenerateReceipt } from "@/core/api";
import {
  ReceiptPreviewModal,
  TabSwitcher,
  OtherIncomeTable,
} from "@/common/components/shared";
import { toast } from "@/common/hooks/use-toast";
import { useAuthStore } from "@/core/auth/authStore";
import { ROLES } from "@/common/constants";
import { AddOtherIncomeDialog } from "@/common/components/shared/AddOtherIncomeDialog";
import {
  createCollegeOtherIncome,
  getCollegeOtherIncome,
} from "@/core/api/api-college-other-income";
import { useQueryClient } from "@tanstack/react-query";
import { useTabNavigation } from "@/common/hooks/use-tab-navigation";
import { Receipt } from "lucide-react";
import { IndianRupeeIcon } from "@/common/components/shared/IndianRupeeIcon";

// ✅ FIX: Create a proper component wrapper for Loader.Button that accepts className
// Moved outside component to prevent recreation on every render
const LoadingIcon = React.memo<{ className?: string }>(({ className }) => (
  <div className={className}>
    <Loader.Button size="xs" />
  </div>
));
LoadingIcon.displayName = "LoadingIcon";

interface IncomeTableProps {
  onViewIncome?: (income: CollegeIncomeSummary) => void;
  params?: CollegeIncomeSummaryParams;
  enabled?: boolean; // ✅ OPTIMIZATION: Allow parent to control when to fetch
}

export const IncomeTable = ({
  onViewIncome,
  params = {},
  enabled = true, // Default to enabled for backward compatibility
}: IncomeTableProps) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  // Check if user is ADMIN or INSTITUTE_ADMIN
  const canAddOtherIncome =
    user?.role === ROLES.ADMIN || user?.role === ROLES.INSTITUTE_ADMIN;

  // Receipt modal state
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptBlobUrl, setReceiptBlobUrl] = useState<string | null>(null);
  const [loadingReceiptId, setLoadingReceiptId] = useState<number | null>(null);

  // Add Other Income dialog state
  const [showAddOtherIncomeDialog, setShowAddOtherIncomeDialog] =
    useState(false);

  // Tab navigation for Income Summary and Other Income
  // Use a different query parameter to avoid conflict with parent tabs
  const { getQueryParam, setQueryParam } = useTabNavigation("income-summary");
  const activeTab = getQueryParam("incomeTab") || "income-summary";
  const setActiveTab = useCallback(
    (tab: string) => {
      setQueryParam("incomeTab", tab);
    },
    [setQueryParam]
  );

  // ✅ OPTIMIZATION: Only fetch when enabled (tab is active)
  const {
    data: incomeResponse,
    isLoading: isLoadingIncome,
    error: incomeError,
    refetch,
  } = useCollegeIncomeSummary(params, {
    enabled: enabled && activeTab === "income-summary",
  });

  // Fetch other income records (only when other-income tab is active)
  const otherIncomeQueryKey = useMemo(() => ["college-other-income"], []);

  const {
    data: otherIncomeData,
    isLoading: isLoadingOtherIncome,
    error: otherIncomeError,
  } = useQuery({
    queryKey: otherIncomeQueryKey,
    queryFn: () => getCollegeOtherIncome(),
    enabled: enabled && activeTab === "other-income",
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });

  const isLoading = isLoadingIncome;
  const error = incomeError;

  const incomeData = incomeResponse?.items || [];
  const totalCount = incomeResponse?.total || 0;

  // Define columns for EnhancedDataTable
  const columns: ColumnDef<CollegeIncomeSummary>[] = [
    {
      id: "created_at",
      header: "Date",
      cell: ({ row }) => {
        const value = row.original.created_at;
        return formatDate(value);
      },
    },
    {
      id: "receipt_no",
      header: "Receipt No",
      cell: ({ row }) => {
        const value = row.original.receipt_no;
        return value || "-";
      },
    },
    {
      id: "student_name",
      header: "Student",
      cell: ({ row }) => {
        const value = row.original.student_name;
        return value || "-";
      },
    },
    {
      id: "identity_no",
      header: "Identity No",
      cell: ({ row }) => {
        const value = row.original.identity_no;
        return value || "-";
      },
    },
    {
      id: "purpose",
      header: "Purpose",
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
  const actionButtonGroups = useMemo(
    () => [
      ...(onViewIncome
        ? [
            {
              type: "view" as const,
              onClick: (income: CollegeIncomeSummary) => {
                if (!income || !income.income_id) {
                  console.error("Invalid income object:", income);
                  return;
                }
                onViewIncome(income);
              },
            },
          ]
        : []),
    ],
    [onViewIncome]
  );

  // Handle print receipt action
  const handlePrintReceipt = useCallback(
    async (income: CollegeIncomeSummary) => {
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
          "college"
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

  // Handle Add Other Income
  const handleAddOtherIncome = useCallback(
    async (data: {
      name: string;
      description?: string;
      amount: number;
      payment_method: "CASH" | "UPI" | "CARD";
      income_date: string;
    }) => {
      await createCollegeOtherIncome(data);
      // Invalidate income queries to refresh the table
      queryClient.invalidateQueries({ queryKey: ["college-income-summary"] });
      queryClient.invalidateQueries({ queryKey: ["college-income"] });
      queryClient.invalidateQueries({ queryKey: ["college-other-income"] });
    },
    [queryClient]
  );

  // Action buttons for EnhancedDataTable (including print receipt)
  const actionButtons = useMemo(
    () => [
      {
        id: "print-receipt",
        label: (income: CollegeIncomeSummary) =>
          loadingReceiptId === income.income_id
            ? "Generating..."
            : "Print Receipt",
        icon: (income: CollegeIncomeSummary) =>
          loadingReceiptId === income.income_id ? LoadingIcon : Printer,
        variant: "outline" as const,
        onClick: (income: CollegeIncomeSummary) => handlePrintReceipt(income),
        show: (income: CollegeIncomeSummary) => true,
        disabled: (income: CollegeIncomeSummary) =>
          loadingReceiptId === income.income_id,
      },
    ],
    [handlePrintReceipt, loadingReceiptId]
  );

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
          <div className="text-red-500">
            Error loading income data. Please try again.
          </div>
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
      {/* Tab Switcher for Income Summary and Other Income */}
      <TabSwitcher
        tabs={[
          {
            value: "income-summary",
            label: "Income Summary",
            icon: IndianRupeeIcon,
            badge: incomeResponse?.total || 0,
            content: (
              <>
                {/* Empty State for Income Summary */}
                {!isLoading &&
                  !error &&
                  (!incomeData || incomeData.length === 0) && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        No income records found
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => refetch()}
                        className="mt-2"
                      >
                        Refresh
                      </Button>
                    </div>
                  )}

                {/* Income Summary Table */}
                {!isLoading && incomeData && incomeData.length > 0 && (
                  <EnhancedDataTable
                    data={incomeData}
                    columns={columns}
                    title="Income Records"
                    searchKey="receipt_no"
                    searchPlaceholder="Search by receipt no, student name, or identity no..."
                    exportable={true}
                    showActions={true}
                    actionButtonGroups={actionButtonGroups}
                    actionButtons={actionButtons}
                    actionColumnHeader="Actions"
                    showActionLabels={true}
                  />
                )}
              </>
            ),
          },
          {
            value: "other-income",
            label: "Other Income",
            icon: Receipt,
            badge: otherIncomeData?.total || 0,
            content: (
              <OtherIncomeTable
                fetchOtherIncome={() => getCollegeOtherIncome()}
                onAddOtherIncome={() => setShowAddOtherIncomeDialog(true)}
                enabled={enabled && activeTab === "other-income"}
                institutionType="college"
              />
            ),
          },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      {/* Receipt Preview Modal */}
      <ReceiptPreviewModal
        isOpen={showReceiptModal}
        onClose={handleCloseReceiptModal}
        blobUrl={receiptBlobUrl || null}
      />

      {/* Add Other Income Dialog */}
      {canAddOtherIncome && (
        <AddOtherIncomeDialog
          open={showAddOtherIncomeDialog}
          onOpenChange={setShowAddOtherIncomeDialog}
          onSubmit={handleAddOtherIncome}
          institutionType="college"
        />
      )}
    </motion.div>
  );
};
