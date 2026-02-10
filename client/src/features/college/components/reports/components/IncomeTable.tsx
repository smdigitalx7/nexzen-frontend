import React, { useState, useMemo, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Printer, Eye, Clock, Search as SearchIcon } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Input } from "@/common/components/ui/input";
import type {
  CollegeIncomeSummary,
  CollegeIncomeRead,
  CollegeRecentIncome,
} from "@/features/college/types";
import { useCollegeIncomeList, useCollegeIncomeRecent } from "@/features/college/hooks";
import { useQuery } from "@tanstack/react-query";
import { formatDate } from "@/common/utils";
import { DataTable } from "@/common/components/shared/DataTable";
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

import type { ActionConfig } from "@/common/components/shared/DataTable/types";

/** Map list API row to table row shape */
function listRowToSummary(r: CollegeIncomeRead): CollegeIncomeSummary {
  return {
    income_id: r.income_id,
    branch_id: 0,
    receipt_no: r.receipt_no ?? "-",
    student_name: r.student_name ?? "-",
    identity_no: r.admission_no ?? "-",
    total_amount: r.total_amount,
    purpose: r.purpose ?? "-",
    created_at: r.created_at,
  };
}

/** Map recent API row to table row shape */
function recentRowToSummary(r: CollegeRecentIncome): CollegeIncomeSummary {
  return {
    income_id: r.income_id,
    branch_id: 0,
    receipt_no: "-",
    student_name: r.student_name ?? "-",
    identity_no: r.admission_no ?? "-",
    total_amount: r.amount,
    purpose: r.purpose ?? "-",
    created_at: r.income_date,
  };
}

interface IncomeTableProps {
  onViewIncome?: (income: CollegeIncomeSummary) => void;
  enabled?: boolean;
}

const DEFAULT_PAGE_SIZE = 10;
const RECENT_LIMIT = 5;

export const IncomeTable = ({
  onViewIncome,
  enabled = true,
}: IncomeTableProps) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const canAddOtherIncome =
    user?.role === ROLES.ADMIN || user?.role === ROLES.INSTITUTE_ADMIN;

  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptBlobUrl, setReceiptBlobUrl] = useState<string | null>(null);
  const [loadingReceiptId, setLoadingReceiptId] = useState<number | null>(null);
  const [showAddOtherIncomeDialog, setShowAddOtherIncomeDialog] =
    useState(false);

  // List filters (GET /college/income) – server-side search only
  const [admissionInput, setAdmissionInput] = useState("");
  const [admissionQuery, setAdmissionQuery] = useState<string | undefined>(undefined);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [showRecent, setShowRecent] = useState(false);

  // Debounce search (receipt no, student name) – 500ms like All Reservations
  useEffect(() => {
    const t = setTimeout(() => {
      const v = searchInput.trim();
      setSearchQuery(v === "" ? undefined : v);
    }, 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  // Debounce admission no – 300ms
  useEffect(() => {
    const t = setTimeout(() => {
      const v = admissionInput.trim();
      setAdmissionQuery(v === "" ? undefined : v);
    }, 300);
    return () => clearTimeout(t);
  }, [admissionInput]);

  const { getQueryParam, setQueryParam } = useTabNavigation("income-summary");
  const activeTab = getQueryParam("incomeTab") || "income-summary";
  const setActiveTab = useCallback(
    (tab: string) => {
      setQueryParam("incomeTab", tab);
    },
    [setQueryParam]
  );

  useEffect(() => {
    setPage(1);
  }, [searchQuery, admissionQuery]);

  const listParams = useMemo(
    () => ({
      admission_no: admissionQuery ?? undefined,
      search: searchQuery ?? undefined,
      page,
      page_size: DEFAULT_PAGE_SIZE,
    }),
    [admissionQuery, searchQuery, page]
  );

  const listEnabled = enabled && activeTab === "income-summary" && !showRecent;
  const recentEnabled = enabled && activeTab === "income-summary" && showRecent;

  const { data: listResponse, isLoading: isLoadingList, error: listError } = useCollegeIncomeList(listParams, {
    enabled: listEnabled,
  });

  const { data: recentData, isLoading: isLoadingRecent } = useCollegeIncomeRecent(RECENT_LIMIT, {
    enabled: recentEnabled,
  });

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

  const incomeData = useMemo<CollegeIncomeSummary[]>(() => {
    if (showRecent) {
      const arr = Array.isArray(recentData) ? recentData : [];
      return arr.map(recentRowToSummary);
    }
    const raw = listResponse as { data?: CollegeIncomeRead[]; total_count?: number } | undefined;
    const arr = Array.isArray(raw) ? raw : (raw?.data ?? []);
    return arr.map(listRowToSummary);
  }, [showRecent, listResponse, recentData]);

  const totalCount = useMemo(() => {
    if (showRecent) return (Array.isArray(recentData) ? recentData : []).length;
    const raw = listResponse as { data?: unknown[]; total_count?: number } | undefined;
    if (Array.isArray(raw)) return raw.length;
    return raw?.total_count ?? 0;
  }, [showRecent, listResponse, recentData]);

  const isLoading = showRecent ? isLoadingRecent : isLoadingList;
  const error = listError;

  // Memoize columns to prevent re-render loops (DataTable V2)
  const columns = useMemo<ColumnDef<CollegeIncomeSummary>[]>(() => [
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
  ], []);

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

  // Actions for DataTable V2 (View + Print Receipt)
  const actions = useMemo<ActionConfig<CollegeIncomeSummary>[]>(() => {
    const list: ActionConfig<CollegeIncomeSummary>[] = [];
    if (onViewIncome) {
      list.push({
        id: "view",
        label: "View",
        icon: Eye,
        onClick: (income) => {
          if (income?.income_id) onViewIncome(income);
        },
        variant: "ghost",
      });
    }
    list.push({
      id: "print-receipt",
      label: "Print Receipt",
      icon: Printer,
      onClick: handlePrintReceipt,
      variant: "outline",
      disabled: (income) => loadingReceiptId === income.income_id,
    });
    return list;
  }, [onViewIncome, handlePrintReceipt, loadingReceiptId]);

  // Error state only; loading is handled inside DataTable (skeleton in table)
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
            badge: totalCount,
            content: (
              <>
                <DataTable<CollegeIncomeSummary>
                  data={incomeData || []}
                  columns={columns}
                  title="Income Records"
                  showSearch={false}
                  toolbarLeftContent={
                    <div className="flex flex-1 flex-wrap items-center gap-2 min-w-0">
                      <div className="w-full sm:flex-1 min-w-0">
                        <Input
                          placeholder="Search by receipt no or student name..."
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                          className="h-9 w-full"
                          leftIcon={<SearchIcon className="h-4 w-4 text-muted-foreground" />}
                        />
                      </div>
                      <div className="w-[160px] shrink-0">
                        <Input
                          placeholder="Admission no"
                          value={admissionInput}
                          onChange={(e) => setAdmissionInput(e.target.value)}
                          className="h-9"
                        />
                      </div>
                      <Button
                        type="button"
                        variant={showRecent ? "default" : "outline"}
                        size="sm"
                        onClick={() => setShowRecent((v) => !v)}
                        className="shrink-0 h-9"
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Recent ({RECENT_LIMIT})
                      </Button>
                      {showRecent && (
                        <Button type="button" variant="ghost" size="sm" className="h-9 shrink-0" onClick={() => setShowRecent(false)}>
                          Show all
                        </Button>
                      )}
                    </div>
                  }
                  loading={isLoading}
                  export={{ enabled: true, filename: "income-records" }}
                  actions={actions}
                  actionsHeader="Actions"
                  emptyMessage="No income records found"
                />
              </>
            ),
          },
          {
            value: "other-income",
            label: "Other Income",
            icon: Receipt,
            badge: otherIncomeData?.total_count || 0,
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
