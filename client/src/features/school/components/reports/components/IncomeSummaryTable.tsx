import React, { useState, useMemo, useCallback, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Printer, Receipt, Eye, Clock, Search as SearchIcon } from "lucide-react";
import { IndianRupeeIcon } from "@/common/components/shared/IndianRupeeIcon";
import { Loader } from "@/common/components/ui/ProfessionalLoader";
import { SchoolIncomeService } from "@/features/school/services";
import { useSchoolIncomeList, useSchoolIncomeRecent } from "@/features/school/hooks";
import type {
  SchoolIncomeSummary,
  SchoolIncomeRead,
  SchoolRecentIncome,
} from "@/features/school/types/income";
import { Input } from "@/common/components/ui/input";
import { ViewIncomeDialog } from "./ViewIncomeDialog";
import { formatDate } from "@/common/utils";
import { DataTable } from "@/common/components/shared";
import type { ActionConfig } from "@/common/components/shared/DataTable/types";
import { createCurrencyColumn } from "@/common/utils/factory/columnFactories";
import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import { handleRegenerateReceipt } from "@/core/api";
import { ReceiptPreviewModal } from "@/common/components/shared";
import { toast } from "@/common/hooks/use-toast";
import { useAuthStore } from "@/core/auth/authStore";
import { ROLES } from "@/common/constants";
import { AddOtherIncomeDialog } from "@/common/components/shared/AddOtherIncomeDialog";
import { createSchoolOtherIncome, getSchoolOtherIncome } from "@/core/api/api-school-other-income";
import { TabSwitcher, OtherIncomeTable } from "@/common/components/shared";
import { useTabNavigation } from "@/common/hooks/use-tab-navigation";

// ✅ FIX: Create a proper component wrapper for Loader.Button that accepts className
// Moved outside component to prevent recreation on every render
const LoadingIcon = React.memo<{ className?: string }>(({ className }) => (
  <div className={className}>
    <Loader.Button size="xs" />
  </div>
));
LoadingIcon.displayName = "LoadingIcon";

const DEFAULT_PAGE_SIZE = 25;
const RECENT_LIMIT = 5;

function listRowToSummary(r: SchoolIncomeRead): SchoolIncomeSummary {
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

function recentRowToSummary(r: SchoolRecentIncome): SchoolIncomeSummary {
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
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  
  // Check if user is ADMIN or INSTITUTE_ADMIN
  const canAddOtherIncome =
    user?.role === ROLES.ADMIN || user?.role === ROLES.INSTITUTE_ADMIN;

  // View dialog state
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewIncomeId, setViewIncomeId] = useState<number | null>(null);

  // Receipt modal state
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [receiptBlobUrl, setReceiptBlobUrl] = useState<string | null>(null);
  const [loadingReceiptId, setLoadingReceiptId] = useState<number | null>(null);

  // Add Other Income dialog state
  const [showAddOtherIncomeDialog, setShowAddOtherIncomeDialog] = useState(false);

  // List filters (GET /school/income) – server-side search only
  const [admissionInput, setAdmissionInput] = useState("");
  const [admissionQuery, setAdmissionQuery] = useState<string | undefined>(undefined);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
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
  const setActiveTab = useCallback((tab: string) => {
    setQueryParam("incomeTab", tab);
  }, [setQueryParam]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, admissionQuery]);

  const listParams = useMemo(
    () => ({
      admission_no: admissionQuery ?? undefined,
      search: searchQuery ?? undefined,
      page,
      page_size: pageSize,
    }),
    [admissionQuery, searchQuery, page, pageSize]
  );

  const listEnabled = enabled && activeTab === "income-summary" && !showRecent;
  const recentEnabled = enabled && activeTab === "income-summary" && showRecent;

  const { data: listResponse, isLoading: isLoadingList, error: listError, refetch } = useSchoolIncomeList(listParams, {
    enabled: listEnabled,
  });

  const { data: recentData, isLoading: isLoadingRecent } = useSchoolIncomeRecent(RECENT_LIMIT, {
    enabled: recentEnabled,
  });

  const incomeList = useMemo<SchoolIncomeSummary[]>(() => {
    if (showRecent) {
      const arr = Array.isArray(recentData) ? recentData : [];
      return arr.map(recentRowToSummary);
    }
    const raw = listResponse as { data?: SchoolIncomeRead[]; total_count?: number } | undefined;
    const arr = Array.isArray(raw) ? raw : (raw?.data ?? []);
    return arr.map(listRowToSummary);
  }, [showRecent, listResponse, recentData]);

  const totalCount = useMemo(() => {
    if (showRecent) return (Array.isArray(recentData) ? recentData : []).length;
    const raw = listResponse as { data?: unknown[]; total_count?: number } | undefined;
    if (Array.isArray(raw)) return raw.length;
    return raw?.total_count ?? 0;
  }, [showRecent, listResponse, recentData]);

  const isLoadingIncome = showRecent ? isLoadingRecent : isLoadingList;
  const incomeError = listError;

  // Fetch other income records (only when other-income tab is active)
  const otherIncomeQueryKey = useMemo(
    () => ["school-other-income"],
    []
  );

  const {
    data: otherIncomeData,
    isLoading: isLoadingOtherIncome,
    error: otherIncomeError,
  } = useQuery({
    queryKey: otherIncomeQueryKey,
    queryFn: () => getSchoolOtherIncome(),
    enabled: enabled && activeTab === "other-income", // ✅ Only fetch when other-income tab is active
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: true,
  });

  const isLoading = isLoadingIncome;
  const error = incomeError;

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
  const handleView = useCallback((income: SchoolIncomeSummary) => {
    if (!income || !income.income_id) {
      console.error("Invalid income object:", income);
      return;
    }
    setViewIncomeId(income.income_id);
    setShowViewDialog(true);
  }, []);

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

  // Handle Add Other Income
  const handleAddOtherIncome = useCallback(
    async (data: {
      name: string;
      description?: string;
      amount: number;
      payment_method: "CASH" | "UPI" | "CARD";
      income_date: string;
    }) => {
      await createSchoolOtherIncome(data);
      // Invalidate income queries to refresh the table
      queryClient.invalidateQueries({ queryKey: ["school-income-summary"] });
      queryClient.invalidateQueries({ queryKey: ["school-income"] });
      queryClient.invalidateQueries({ queryKey: ["school-other-income"] });
    },
    [queryClient]
  );

  // ✅ CRITICAL FIX: Memoize columns to prevent infinite re-render loops in EnhancedDataTable
  const columns = useMemo<ColumnDef<SchoolIncomeSummary>[]>(() => [
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
  ], []);

  // Merged action configurations for DataTable V2
  const actions: ActionConfig<SchoolIncomeSummary>[] = useMemo(() => [
    {
      id: "view",
      label: "View",
      icon: Eye, // Ensure Eye is imported, it wasn't in original imports. I need to add it.
      onClick: (income) => {
        if (income) handleView(income);
      },
    },
    {
      id: "print-receipt",
      label: "Print Receipt", // Dynamic label support depends on DataTable implementation. Keeping static for now or using standard text.
      // ActionConfig usually expects static string for label? 
      // types.ts: label: string.
      // If I need dynamic label "Generating...", I can't easily do it with standard ActionConfig unless I force it.
      // But disabled state handles visual feedback.
      icon: (props: any) => { // Wrapper to handle dynamic icon
        const income = props as unknown as SchoolIncomeSummary; // Wait, icon prop in ActionConfig receives className? 
        // No, typically DataTable renders <Icon className... />.
        // It doesn't pass 'row' data to the Icon component.
        // So dynamic icon based on row state is tricky in standard V2 actions.
        // I will use Printer icon and rely on disabled state.
        return <Printer {...props} />;
      }, 
      // Actually, let's just use Printer icon. The Disabled state will show it's processing (dimmed).
      // If I want a spinner, I might need a custom action rendering.
      // For now, I'll stick to standard Printer icon.
      variant: "outline",
      onClick: (income) => handlePrintReceipt(income),
      disabled: (income) => loadingReceiptId === income.income_id,
    }
  ], [handleView, handlePrintReceipt, loadingReceiptId]);

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
              ❌ Error loading income data: {error?.message || "Unknown error"}
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
                <DataTable
                  data={incomeList}
                  columns={columns}
                  title="Income Summary"
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
                  export={{ enabled: true }}
                  actions={actions}
                  actionsHeader="Actions"
                  emptyMessage="No income records found"
                  pagination="server"
                  totalCount={totalCount}
                  currentPage={page}
                  pageSize={pageSize}
                  pageSizeOptions={[10, 25, 50, 100]}
                  onPageChange={(p) => setPage(p)}
                  onPageSizeChange={(s) => {
                    setPageSize(s);
                    setPage(1);
                  }}
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
                fetchOtherIncome={() => getSchoolOtherIncome()}
                onAddOtherIncome={() => setShowAddOtherIncomeDialog(true)}
                enabled={enabled && activeTab === "other-income"}
                institutionType="school"
              />
            ),
          },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        forceMount={true}
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

      {/* Add Other Income Dialog */}
      {canAddOtherIncome && (
        <AddOtherIncomeDialog
          open={showAddOtherIncomeDialog}
          onOpenChange={setShowAddOtherIncomeDialog}
          onSubmit={handleAddOtherIncome}
          institutionType="school"
        />
      )}
    </motion.div>
  );
};
