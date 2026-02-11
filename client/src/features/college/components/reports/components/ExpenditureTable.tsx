import { useState, useMemo, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/common/components/ui/button";
import { CheckCircle, XCircle, Eye, Pencil, Trash2 } from "lucide-react";
import { useUpdateCollegeExpenditure, useDeleteCollegeExpenditure, useCollegeExpenditure, useUpdateCollegeExpenditureStatus, useCollegeExpenditureList } from "@/features/college/hooks";
import { useCanEdit, useCanDelete } from "@/core/permissions";
import type { CollegeExpenditureRead } from "@/features/college/types";
import { FormDialog, ConfirmDialog } from "@/common/components/shared";
import { ViewExpenditureDialog } from "./ViewExpenditureDialog";
import { formatDate } from "@/common/utils";
import { useTableState } from "@/common/hooks/useTableState";
import { Label } from "@/common/components/ui/label";
import { Textarea } from "@/common/components/ui/textarea";
import { Input } from "@/common/components/ui/input";
import { DatePicker } from "@/common/components/ui/date-picker";
import { DataTable } from "@/common/components/shared/DataTable";
import type { ActionConfig } from "@/common/components/shared/DataTable/types";
import { createTextColumn, createCurrencyColumn } from "@/common/utils/factory/columnFactories";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/common/components/ui/badge";
import { useAuthStore } from "@/core/auth/authStore";
import { ROLES } from "@/common/constants";
import { toast } from "@/common/hooks/use-toast";
import { cleanupDialogState } from "@/common/utils/ui-cleanup";

interface ExpenditureTableProps {
  onViewExpenditure?: (expenditure: CollegeExpenditureRead) => void;
  onExportCSV?: () => void;
  onAddExpenditure?: () => void;
  enabled?: boolean;
}

export const ExpenditureTable = ({
  onViewExpenditure,
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
  
  const [editForm, setEditForm] = useState({
    expenditure_purpose: "",
    amount: "",
    bill_date: "",
    payment_method: "",
    remarks: "",
  });

  const { user } = useAuthStore();
  const canApproveExpenditure = user?.role === ROLES.ADMIN || user?.role === ROLES.INSTITUTE_ADMIN;
  
  const deleteExpenditureMutation = useDeleteCollegeExpenditure();
  const [updateId, setUpdateId] = useState<number | null>(null);
  const updateExpenditureMutation = useUpdateCollegeExpenditure(updateId ?? 0);
  const [statusUpdateId, setStatusUpdateId] = useState<number | null>(null);
  const statusUpdateMutation = useUpdateCollegeExpenditureStatus(statusUpdateId ?? 0);

  // View state
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedExpenditureId, setSelectedExpenditureId] = useState<number | null>(null);
  const { data: viewedExpenditure, isLoading: viewLoading, error: viewError } = useCollegeExpenditure(selectedExpenditureId);

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

  const { data: listResponse, isLoading: isLoadingList, refetch } = useCollegeExpenditureList({
    page,
    page_size: pageSize,
    search: searchQuery,
  }, {
    enabled,
  });

  const expenditureList = useMemo(() => {
    const raw = listResponse as { data?: CollegeExpenditureRead[]; total_count?: number } | undefined;
    return Array.isArray(raw) ? raw : (raw?.data ?? []);
  }, [listResponse]);

  const totalCount = useMemo(() => {
    const raw = listResponse as { data?: unknown[]; total_count?: number } | undefined;
    if (Array.isArray(raw)) return raw.length;
    return raw?.total_count ?? 0;
  }, [listResponse]);

  const handleEdit = useCallback((expenditure: CollegeExpenditureRead) => {
    if (!expenditure || !expenditure.expenditure_id) {
      console.error("Invalid expenditure object:", expenditure);
      return;
    }
    if (import.meta.env.DEV) {
      console.log("handleEdit called with expenditure:", expenditure);
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

  const handleDelete = useCallback((expenditure: CollegeExpenditureRead) => {
    if (!expenditure || !expenditure.expenditure_id) {
      console.error("Invalid expenditure object:", expenditure);
      return;
    }
    if (import.meta.env.DEV) {
      console.log("handleDelete called with expenditure:", expenditure);
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
  const handleApprove = useCallback((expenditure: CollegeExpenditureRead) => {
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

  const handleReject = useCallback((expenditure: CollegeExpenditureRead) => {
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

  // Memoize columns to prevent re-render loops (DataTable V2)
  const columns = useMemo<ColumnDef<CollegeExpenditureRead>[]>(() => [
    {
      id: 'bill_date',
      header: 'Bill Date',
      cell: ({ row }) => {
        const value = row.original.bill_date;
        if (import.meta.env.DEV) {
          console.log("College Bill date cell - value:", value);
        }
        return formatDate(value);
      },
    },
    createTextColumn<CollegeExpenditureRead>("expenditure_purpose", { header: "Purpose" }),
    createCurrencyColumn<CollegeExpenditureRead>("amount", { 
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
      cell: ({ row }) => {
        const value = row.original.payment_method;
        if (import.meta.env.DEV) {
          console.log("College Payment method cell - value:", value);
        }
        return value || "-";
      },
    },
    {
      id: 'remarks',
      header: 'Remarks',
      cell: ({ row }) => {
        const value = row.original.remarks;
        if (import.meta.env.DEV) {
          console.log("College Remarks cell - value:", value);
        }
        return value || "-";
      },
    },
  ], []);

  // Check permissions for edit/delete
  const canEditExpenditure = useCanEdit("expenditure");
  const canDeleteExpenditure = useCanDelete("expenditure");

  // Actions for DataTable V2 (View, Edit, Delete, Approve, Reject)
  const actions = useMemo<ActionConfig<CollegeExpenditureRead>[]>(() => {
    const list: ActionConfig<CollegeExpenditureRead>[] = [
      {
        id: "view",
        label: "View",
        icon: Eye,
        onClick: (expenditure) => {
          if (expenditure?.expenditure_id) {
            setSelectedExpenditureId(expenditure.expenditure_id);
            setShowViewDialog(true);
            onViewExpenditure?.(expenditure);
          }
        },
        variant: "ghost",
      },
      {
        id: "edit",
        label: "Edit",
        icon: Pencil,
        onClick: handleEdit,
        variant: "outline",
        show: (exp) =>
          canEditExpenditure && exp.status !== "APPROVED" && exp.status !== "REJECTED",
      },
      {
        id: "delete",
        label: "Delete",
        icon: Trash2,
        onClick: handleDelete,
        variant: "destructive",
        show: (exp) =>
          canDeleteExpenditure && exp.status !== "APPROVED" && exp.status !== "REJECTED",
      },
    ];
    if (canApproveExpenditure) {
      list.push(
        {
          id: "approve",
          label: "Approve",
          icon: CheckCircle,
          variant: "default",
          onClick: handleApprove,
          show: (exp) => exp.status === "PENDING" || !exp.status,
          disabled: (exp) => statusUpdateId === exp.expenditure_id,
        },
        {
          id: "reject",
          label: "Reject",
          icon: XCircle,
          variant: "destructive",
          onClick: handleReject,
          show: (exp) => exp.status === "PENDING" || !exp.status,
          disabled: (exp) => statusUpdateId === exp.expenditure_id,
        }
      );
    }
    return list;
  }, [canEditExpenditure, canDeleteExpenditure, canApproveExpenditure, onViewExpenditure, handleEdit, handleDelete, handleApprove, handleReject, statusUpdateId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >
      <DataTable<CollegeExpenditureRead>
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
        export={
          onExportCSV
            ? { enabled: true, filename: "expenditure-records", onExport: onExportCSV }
            : undefined
        }
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
        onOpenChange={(open) => {
          if (!open) {
            setShowViewDialog(false);
            setSelectedExpenditureId(null);
          } else {
            setShowViewDialog(true);
          }
        }}
        expenditure={viewedExpenditure ?? null}
        isLoading={viewLoading}
        error={viewError}
      />
    </motion.div>
  );
};
