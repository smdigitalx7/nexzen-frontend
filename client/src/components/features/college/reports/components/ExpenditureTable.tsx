import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useUpdateCollegeExpenditure, useDeleteCollegeExpenditure, useCollegeExpenditure } from "@/lib/hooks/college";
import type { CollegeExpenditureRead } from "@/lib/types/college";
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

interface ExpenditureTableProps {
  expenditureData: CollegeExpenditureRead[];
  onViewExpenditure?: (expenditure: CollegeExpenditureRead) => void;
  onExportCSV?: () => void;
  onAddExpenditure?: () => void;
}

export const ExpenditureTable = ({
  expenditureData,
  onViewExpenditure,
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
  
  const [editForm, setEditForm] = useState({
    expenditure_purpose: "",
    amount: "",
    bill_date: "",
    payment_method: "",
    remarks: "",
  });

  const deleteExpenditureMutation = useDeleteCollegeExpenditure();
  const [updateId, setUpdateId] = useState<number | null>(null);
  const updateExpenditureMutation = useUpdateCollegeExpenditure(updateId ?? 0);

  // View state
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedExpenditureId, setSelectedExpenditureId] = useState<number | null>(null);
  const { data: viewedExpenditure, isLoading: viewLoading, error: viewError } = useCollegeExpenditure(selectedExpenditureId);

  const handleEdit = (expenditure: CollegeExpenditureRead) => {
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
  };

  const handleDelete = (expenditure: CollegeExpenditureRead) => {
    if (!expenditure || !expenditure.expenditure_id) {
      console.error("Invalid expenditure object:", expenditure);
      return;
    }
    if (import.meta.env.DEV) {
      console.log("handleDelete called with expenditure:", expenditure);
    }
    setSelectedExpenditure(expenditure);
    openDeleteDialog(expenditure);
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

  // Define columns for EnhancedDataTable
  const columns: ColumnDef<CollegeExpenditureRead>[] = [
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
  ];

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(() => [
    {
      type: 'view' as const,
      onClick: (expenditure: CollegeExpenditureRead) => {
        if (import.meta.env.DEV) {
          console.log("College View clicked - expenditure:", expenditure);
        }
        if (!expenditure || !expenditure.expenditure_id) {
          console.error("Invalid expenditure object:", expenditure);
          return;
        }
        setSelectedExpenditureId(expenditure.expenditure_id);
        setShowViewDialog(true);
        onViewExpenditure?.(expenditure);
      }
    },
    {
      type: 'edit' as const,
      onClick: (expenditure: CollegeExpenditureRead) => {
        if (import.meta.env.DEV) {
          console.log("College Edit clicked - expenditure:", expenditure);
        }
        handleEdit(expenditure);
      }
    },
    {
      type: 'delete' as const,
      onClick: (expenditure: CollegeExpenditureRead) => {
        if (import.meta.env.DEV) {
          console.log("College Delete clicked - expenditure:", expenditure);
        }
        handleDelete(expenditure);
      }
    }
  ], [onViewExpenditure]);

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
