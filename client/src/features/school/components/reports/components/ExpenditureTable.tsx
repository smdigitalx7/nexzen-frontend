import { useState, useMemo, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Eye, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { useUpdateSchoolExpenditure, useDeleteSchoolExpenditure, useSchoolExpenditure, useUpdateSchoolExpenditureStatus, useSchoolExpenditureList } from "@/features/school/hooks";
import { useCanEdit, useCanDelete } from "@/core/permissions";
import type { SchoolExpenditureRead } from "@/features/school/types";
import { FormDialog, ConfirmDialog } from "@/common/components/shared";
import { ViewExpenditureDialog } from "./ViewExpenditureDialog";
import { formatDate } from "@/common/utils";
import { useTableState } from "@/common/hooks/useTableState";
import { Label } from "@/common/components/ui/label";
import { Textarea } from "@/common/components/ui/textarea";
import { Input } from "@/common/components/ui/input";
import { DatePicker } from "@/common/components/ui/date-picker";
import { DataTable } from "@/common/components/shared";
import type { ActionConfig } from "@/common/components/shared/DataTable/types";
import { createTextColumn, createCurrencyColumn } from "@/common/utils/factory/columnFactories";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import { useAuthStore } from "@/core/auth/authStore";
import { ROLES } from "@/common/constants";
import { toast } from "@/common/hooks/use-toast";
import { cleanupDialogState } from "@/common/utils/ui-cleanup";
import { startTransition } from "react";

interface ExpenditureTableProps {
  onExportCSV?: () => void;
  onAddExpenditure?: () => void;
  enabled?: boolean;
}

export const ExpenditureTable = ({
  onExportCSV,
  onAddExpenditure,
  enabled = true,
}: ExpenditureTableProps) => {
  // Using shared table state management
  const {
    showEditDialog,
    showDeleteDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
    selectedItem: selectedExpenditure,
    setSelectedItem: setSelectedExpenditure,
  } = useTableState();

  // View dialog state
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [viewExpenditureId, setViewExpenditureId] = useState<number | null>(null);

  // Pagination and filter state
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // Debounce search – 500ms
  useEffect(() => {
    const t = setTimeout(() => {
      const v = searchInput.trim();
      setSearchQuery(v === "" ? undefined : v);
    }, 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  const { data: listResponse, isLoading: isLoadingList, refetch } = useSchoolExpenditureList({
    page,
    page_size: pageSize,
    search: searchQuery,
  }, {
    enabled,
  });

  const expenditureList = useMemo(() => {
    const raw = listResponse as { data?: SchoolExpenditureRead[]; total_count?: number } | undefined;
    return Array.isArray(raw) ? raw : (raw?.data ?? []);
  }, [listResponse]);

  const totalCount = useMemo(() => {
    const raw = listResponse as { data?: unknown[]; total_count?: number } | undefined;
    if (Array.isArray(raw)) return raw.length;
    return raw?.total_count ?? 0;
  }, [listResponse]);
  
  // Fetch expenditure details for viewing
  const { data: viewExpenditure, isLoading: isViewLoading, error: viewError } = useSchoolExpenditure(viewExpenditureId);
  
  const [editForm, setEditForm] = useState({
    expenditure_purpose: "",
    amount: "",
    bill_date: "",
    payment_method: "",
    remarks: "",
  });

  const { user } = useAuthStore();
  const canApproveExpenditure = user?.role === ROLES.ADMIN || user?.role === ROLES.INSTITUTE_ADMIN;
  
  const deleteExpenditureMutation = useDeleteSchoolExpenditure();
  const [updateId, setUpdateId] = useState<number | null>(null);
  const updateExpenditureMutation = useUpdateSchoolExpenditure(updateId ?? 0);
  const [statusUpdateId, setStatusUpdateId] = useState<number | null>(null);
  const statusUpdateMutation = useUpdateSchoolExpenditureStatus(statusUpdateId ?? 0);

  const handleView = useCallback((expenditure: SchoolExpenditureRead) => {
    if (!expenditure || !expenditure.expenditure_id) {
      console.error("Invalid expenditure object:", expenditure);
      return;
    }
    setViewExpenditureId(expenditure.expenditure_id);
    setShowViewDialog(true);
  }, []);

  const handleEdit = useCallback((expenditure: SchoolExpenditureRead) => {
    if (!expenditure || !expenditure.expenditure_id) {
      console.error("Invalid expenditure object:", expenditure);
      return;
    }
    setSelectedExpenditure(expenditure);
    setUpdateId(expenditure.expenditure_id);
    setEditForm({
      expenditure_purpose: expenditure.expenditure_purpose,
      amount: expenditure.amount.toString(),
      bill_date: expenditure.bill_date,
      payment_method: expenditure.payment_method || "",
      remarks: expenditure.remarks || "",
    });
    openEditDialog(expenditure);
  }, [openEditDialog, setSelectedExpenditure]);

  const handleDelete = useCallback((expenditure: SchoolExpenditureRead) => {
    if (!expenditure || !expenditure.expenditure_id) {
      console.error("Invalid expenditure object:", expenditure);
      return;
    }
    setSelectedExpenditure(expenditure);
    openDeleteDialog(expenditure);
  }, [openDeleteDialog, setSelectedExpenditure]);

  const handleUpdateExpenditure = () => {
    if (!selectedExpenditure) return;
    
    // ✅ PHASE 2: Close immediately and cleanup state synchronously
    closeEditDialog();
    cleanupDialogState();

    try {
      updateExpenditureMutation.mutate({
        expenditure_purpose: editForm.expenditure_purpose,
        amount: parseFloat(editForm.amount),
        bill_date: editForm.bill_date,
        payment_method: editForm.payment_method && editForm.payment_method.trim() !== "" ? editForm.payment_method : null,
        remarks: editForm.remarks && editForm.remarks.trim() !== "" ? editForm.remarks : null,
      }, {
        onError: (error) => {
          console.error("Failed to update expenditure:", error);
        }
      });
    } catch (error) {
      console.error("Failed to update expenditure:", error);
    }
  };

  const handleDeleteExpenditure = () => {
    if (!selectedExpenditure) return;
    
    // ✅ PHASE 2: Close immediately and cleanup state synchronously
    closeDeleteDialog();
    cleanupDialogState();

    try {
      deleteExpenditureMutation.mutate(selectedExpenditure.expenditure_id, {
        onError: (error) => {
          console.error("Failed to delete expenditure:", error);
        }
      });
    } catch (error) {
      console.error("Failed to delete expenditure:", error);
    }
  };

  // Handle approve/reject
  const handleApprove = useCallback((expenditure: SchoolExpenditureRead) => {
    if (!expenditure?.expenditure_id) return;
    
    // ✅ CRITICAL FIX: Clean up state before mutation to prevent UI freeze
    cleanupDialogState();
    
    setStatusUpdateId(expenditure.expenditure_id);
    try {
      statusUpdateMutation.mutate("APPROVED", {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Expenditure approved successfully.",
            variant: "success",
          });
          setStatusUpdateId(null);
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message || "Failed to approve expenditure.",
            variant: "destructive",
          });
          setStatusUpdateId(null);
        }
      });
    } catch (error: any) {
      setStatusUpdateId(null);
    }
  }, [statusUpdateMutation]);

  const handleReject = useCallback((expenditure: SchoolExpenditureRead) => {
    if (!expenditure?.expenditure_id) return;
    
    // ✅ CRITICAL FIX: Clean up state before mutation
    cleanupDialogState();
    
    setStatusUpdateId(expenditure.expenditure_id);
    try {
      statusUpdateMutation.mutate("REJECTED", {
        onSuccess: () => {
          toast({
            title: "Success",
            description: "Expenditure rejected successfully.",
            variant: "success",
          });
          setStatusUpdateId(null);
        },
        onError: (error: any) => {
          toast({
            title: "Error",
            description: error.message || "Failed to reject expenditure.",
            variant: "destructive",
          });
          setStatusUpdateId(null);
        }
      });
    } catch (error: any) {
      setStatusUpdateId(null);
    }
  }, [statusUpdateMutation]);

  // ✅ CRITICAL FIX: Memoize columns to prevent infinite re-render loops in EnhancedDataTable
  const columns = useMemo<ColumnDef<SchoolExpenditureRead>[]>(() => [
    {
      id: 'bill_date',
      header: 'Bill Date',
      cell: ({ row }) => formatDate(row.original.bill_date),
    },
    createTextColumn<SchoolExpenditureRead>("expenditure_purpose", { header: "Purpose" }),
    createCurrencyColumn<SchoolExpenditureRead>("amount", { 
      header: "Amount",
      className: "text-red-600 font-bold",
    }),
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status || "PENDING";
        const statusColors: Record<string, string> = {
          PENDING: "bg-yellow-100 text-yellow-700",
          APPROVED: "bg-green-100 text-green-700",
          REJECTED: "bg-red-100 text-red-700",
        };
        return (
          <Badge className={statusColors[status] || "bg-gray-100 text-gray-700"}>
            {status}
          </Badge>
        );
      },
    },
    {
      id: 'payment_method',
      header: 'Payment Method',
      cell: ({ row }) => row.original.payment_method || "-",
    },
    {
      id: 'remarks',
      header: 'Remarks',
      cell: ({ row }) => row.original.remarks || "-",
    },
  ], []);

  // Check permissions for edit/delete
  const canEditExpenditure = useCanEdit("expenditure");
  const canDeleteExpenditure = useCanDelete("expenditure");

  // Merged action configurations for DataTable V2
  const actions: ActionConfig<SchoolExpenditureRead>[] = useMemo(() => {
    const baseActions: ActionConfig<SchoolExpenditureRead>[] = [
      {
        id: "view",
        label: "View",
        icon: Eye,
        onClick: handleView
      },
      {
        id: "edit",
        label: "Edit",
        icon: Edit,
        onClick: handleEdit,
        show: (expenditure) => 
          canEditExpenditure && expenditure.status !== "APPROVED" && expenditure.status !== "REJECTED"
      },
      {
        id: "delete",
        label: "Delete",
        icon: Trash2,
        onClick: handleDelete,
        show: (expenditure) => 
          canDeleteExpenditure && expenditure.status !== "APPROVED" && expenditure.status !== "REJECTED"
      }
    ];

    if (!canApproveExpenditure) return baseActions;

    const approvalActions: ActionConfig<SchoolExpenditureRead>[] = [
      {
        id: "approve-expenditure",
        label: "Approve", // Label is string in V2 type, for dynamic label we might need to rely on title or just keep it static "Approve"
        // Wait, ActionConfig label is string. If I need dynamic "Approving...", I might need a different approach or just use loading state in table.
        // For now, I'll use static "Approve" / "Reject" but rely on disabled state.
        icon: CheckCircle,
        variant: "default",
        onClick: (expenditure) => handleApprove(expenditure),
        show: (expenditure) => 
          expenditure.status === "PENDING" || !expenditure.status,
        disabled: (expenditure) =>
          statusUpdateId === expenditure.expenditure_id,
      },
      {
        id: "reject-expenditure",
        label: "Reject",
        icon: XCircle,
        variant: "destructive",
        onClick: (expenditure) => handleReject(expenditure),
        show: (expenditure) => 
          expenditure.status === "PENDING" || !expenditure.status,
        disabled: (expenditure) =>
          statusUpdateId === expenditure.expenditure_id,
      },
    ];

    return [...baseActions, ...approvalActions];
  }, [canEditExpenditure, canDeleteExpenditure, canApproveExpenditure, handleView, handleEdit, handleDelete, handleApprove, handleReject, statusUpdateId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >
      <DataTable
        data={expenditureList}
        columns={columns}
        title="Expenditure Records"
        showSearch={false}
        toolbarLeftContent={
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="Search by purpose or remarks..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-9"
            />
          </div>
        }
        loading={isLoadingList}
        export={{ enabled: !!onExportCSV, onExport: onExportCSV }}
        onAdd={onAddExpenditure}
        addButtonText="Add Expenditure"
        actions={actions}
        actionsHeader="Actions"
        pagination="server"
        totalCount={totalCount}
        currentPage={page}
        pageSize={pageSize}
        pageSizeOptions={[10, 25, 50, 100]}
        onPageChange={setPage}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setPage(1);
        }}
        emptyMessage="No expenditure records found"
      />

      {/* Edit Dialog */}
      <FormDialog
        open={showEditDialog}
        onOpenChange={(open) => !open && closeEditDialog()}
        title="Edit Expenditure Record"
        description="Update the expenditure record details below."
        size="MEDIUM"
        isLoading={updateExpenditureMutation.isPending}
        onSave={handleUpdateExpenditure}
        onCancel={closeEditDialog}
        saveText="Update"
      >
          <div className="space-y-4">
            <div>
              <Label htmlFor="expenditure_purpose">Purpose</Label>
              <Input
                id="expenditure_purpose"
                value={editForm.expenditure_purpose}
                onChange={(e) => setEditForm(prev => ({ ...prev, expenditure_purpose: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                value={editForm.amount}
                onChange={(e) => setEditForm(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="bill_date">Bill Date</Label>
              <DatePicker
                id="bill_date"
                value={editForm.bill_date}
                onChange={(value) => setEditForm(prev => ({ ...prev, bill_date: value }))}
                placeholder="Select bill date"
              />
            </div>
            <div>
              <Label htmlFor="payment_method">Payment Method</Label>
              <Input
                id="payment_method"
                value={editForm.payment_method}
                onChange={(e) => setEditForm(prev => ({ ...prev, payment_method: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="remarks">Remarks</Label>
              <Textarea
                id="remarks"
                value={editForm.remarks}
                onChange={(e) => setEditForm(prev => ({ ...prev, remarks: e.target.value }))}
              />
            </div>
          </div>
      </FormDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={(open) => !open && closeDeleteDialog()}
        title="Delete Expenditure Record"
        description="Are you sure you want to delete this expenditure record? This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        isLoading={deleteExpenditureMutation.isPending}
        onConfirm={handleDeleteExpenditure}
        onCancel={closeDeleteDialog}
      />

      {/* View Expenditure Dialog */}
      <ViewExpenditureDialog
        open={showViewDialog}
        onOpenChange={setShowViewDialog}
        expenditure={viewExpenditure || null}
        isLoading={isViewLoading}
        error={viewError}
      />
    </motion.div>
  );
};
