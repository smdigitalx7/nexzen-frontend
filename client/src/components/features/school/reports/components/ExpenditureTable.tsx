import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Eye, Edit, Trash2, CheckCircle, XCircle } from "lucide-react";
import { useUpdateSchoolExpenditure, useDeleteSchoolExpenditure, useSchoolExpenditure, useUpdateSchoolExpenditureStatus } from "@/lib/hooks/school";
import { useCanEdit, useCanDelete } from "@/lib/permissions";
import type { SchoolExpenditureRead } from "@/lib/types/school";
import { FormDialog, ConfirmDialog } from "@/components/shared";
import { ViewExpenditureDialog } from "./ViewExpenditureDialog";
import { formatDate } from "@/lib/utils";
import { useTableState } from "@/lib/hooks/common/useTableState";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { EnhancedDataTable } from "@/components/shared/EnhancedDataTable";
import { createTextColumn, createCurrencyColumn } from "@/lib/utils/factory/columnFactories";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { ROLES } from "@/lib/constants";
import { toast } from "@/hooks/use-toast";

interface ExpenditureTableProps {
  expenditureData: SchoolExpenditureRead[];
  onExportCSV?: () => void;
  onAddExpenditure?: () => void;
}

export const ExpenditureTable = ({
  expenditureData,
  onExportCSV,
  onAddExpenditure,
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

  const handleEdit = (expenditure: SchoolExpenditureRead) => {
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
  };

  const handleDelete = (expenditure: SchoolExpenditureRead) => {
    if (!expenditure || !expenditure.expenditure_id) {
      console.error("Invalid expenditure object:", expenditure);
      return;
    }
    setSelectedExpenditure(expenditure);
    openDeleteDialog(expenditure);
  };

  const handleView = (expenditure: SchoolExpenditureRead) => {
    if (!expenditure || !expenditure.expenditure_id) {
      console.error("Invalid expenditure object:", expenditure);
      return;
    }
    setViewExpenditureId(expenditure.expenditure_id);
    setShowViewDialog(true);
  };

  const handleUpdateExpenditure = async () => {
    if (!selectedExpenditure) return;
    
    try {
      await updateExpenditureMutation.mutateAsync({
        expenditure_purpose: editForm.expenditure_purpose,
        amount: parseFloat(editForm.amount),
        bill_date: editForm.bill_date,
        payment_method: editForm.payment_method && editForm.payment_method.trim() !== "" ? editForm.payment_method : null,
        remarks: editForm.remarks && editForm.remarks.trim() !== "" ? editForm.remarks : null,
      });
      closeEditDialog();
    } catch (error) {
      console.error("Failed to update expenditure:", error);
    }
  };

  const handleDeleteExpenditure = async () => {
    if (!selectedExpenditure) return;
    
    try {
      await deleteExpenditureMutation.mutateAsync(selectedExpenditure.expenditure_id);
      closeDeleteDialog();
    } catch (error) {
      console.error("Failed to delete expenditure:", error);
    }
  };

  // Handle approve/reject
  const handleApprove = useCallback(async (expenditure: SchoolExpenditureRead) => {
    if (!expenditure?.expenditure_id) return;
    setStatusUpdateId(expenditure.expenditure_id);
    try {
      await statusUpdateMutation.mutateAsync("APPROVED");
      toast({
        title: "Success",
        description: "Expenditure approved successfully.",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to approve expenditure.",
        variant: "destructive",
      });
    } finally {
      setStatusUpdateId(null);
    }
  }, [statusUpdateMutation]);

  const handleReject = useCallback(async (expenditure: SchoolExpenditureRead) => {
    if (!expenditure?.expenditure_id) return;
    setStatusUpdateId(expenditure.expenditure_id);
    try {
      await statusUpdateMutation.mutateAsync("REJECTED");
      toast({
        title: "Success",
        description: "Expenditure rejected successfully.",
        variant: "success",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to reject expenditure.",
        variant: "destructive",
      });
    } finally {
      setStatusUpdateId(null);
    }
  }, [statusUpdateMutation]);

  // Define columns for EnhancedDataTable
  const columns: ColumnDef<SchoolExpenditureRead>[] = [
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
  ];

  // Check permissions for edit/delete
  const canEditExpenditure = useCanEdit("expenditure");
  const canDeleteExpenditure = useCanDelete("expenditure");

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(() => [
    {
      type: 'view' as const,
      onClick: (expenditure: SchoolExpenditureRead) => {
        handleView(expenditure);
      }
    },
    {
      type: 'edit' as const,
      onClick: (expenditure: SchoolExpenditureRead) => {
        handleEdit(expenditure);
      },
      show: (expenditure: SchoolExpenditureRead) => 
        canEditExpenditure && expenditure.status !== "APPROVED" && expenditure.status !== "REJECTED"
    },
    {
      type: 'delete' as const,
      onClick: (expenditure: SchoolExpenditureRead) => {
        handleDelete(expenditure);
      },
      show: (expenditure: SchoolExpenditureRead) => 
        canDeleteExpenditure && expenditure.status !== "APPROVED" && expenditure.status !== "REJECTED"
    }
  ], [canEditExpenditure, canDeleteExpenditure]);

  // Action buttons for approve/reject (Admin and Institute Admin only)
  const actionButtons = useMemo(() => {
    if (!canApproveExpenditure) return [];
    
    return [
      {
        id: "approve-expenditure",
        label: (expenditure: SchoolExpenditureRead) => 
          statusUpdateId === expenditure.expenditure_id ? "Approving..." : "Approve",
        icon: CheckCircle,
        variant: "default" as const,
        onClick: (expenditure: SchoolExpenditureRead) => handleApprove(expenditure),
        show: (expenditure: SchoolExpenditureRead) => 
          expenditure.status === "PENDING" || !expenditure.status,
        disabled: (expenditure: SchoolExpenditureRead) =>
          statusUpdateId === expenditure.expenditure_id,
        className: "text-green-600 hover:text-green-700",
      },
      {
        id: "reject-expenditure",
        label: (expenditure: SchoolExpenditureRead) => 
          statusUpdateId === expenditure.expenditure_id ? "Rejecting..." : "Reject",
        icon: XCircle,
        variant: "destructive" as const,
        onClick: (expenditure: SchoolExpenditureRead) => handleReject(expenditure),
        show: (expenditure: SchoolExpenditureRead) => 
          expenditure.status === "PENDING" || !expenditure.status,
        disabled: (expenditure: SchoolExpenditureRead) =>
          statusUpdateId === expenditure.expenditure_id,
      },
    ];
  }, [canApproveExpenditure, statusUpdateId, handleApprove, handleReject]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >
      <EnhancedDataTable
        data={expenditureData}
        columns={columns}
        title="Expenditure Records"
        searchKey="expenditure_purpose"
        searchPlaceholder="Search by purpose or remarks..."
        exportable={!!onExportCSV}
        onExport={onExportCSV}
        onAdd={onAddExpenditure}
        addButtonText="Add Expenditure"
        showActions={true}
        actionButtonGroups={actionButtonGroups}
        actionButtons={actionButtons}
        actionColumnHeader="Actions"
        showActionLabels={true}
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
