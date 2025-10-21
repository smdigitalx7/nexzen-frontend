import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Eye, Edit, Trash2 } from "lucide-react";
import { useUpdateSchoolExpenditure, useDeleteSchoolExpenditure, useSchoolExpenditure } from "@/lib/hooks/school/use-school-income-expenditure";
import type { SchoolExpenditureRead } from "@/lib/types/school";
import { FormDialog, ConfirmDialog } from "@/components/shared";
import { ViewExpenditureDialog } from "./ViewExpenditureDialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTableState } from "@/lib/hooks/common/useTableState";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { EnhancedDataTable } from "@/components/shared/EnhancedDataTable";
import { createTextColumn, createCurrencyColumn, createActionColumn } from "@/lib/utils/columnFactories";
import type { ColumnDef } from "@tanstack/react-table";

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

  const deleteExpenditureMutation = useDeleteSchoolExpenditure();
  const [updateId, setUpdateId] = useState<number | null>(null);
  const updateExpenditureMutation = useUpdateSchoolExpenditure(updateId ?? 0);

  const uniquePurposes = Array.from(new Set(expenditureData.map(e => e.expenditure_purpose)));

  const handleEdit = (expenditure: SchoolExpenditureRead) => {
    if (!expenditure || !expenditure.expenditure_id) {
      console.error("Invalid expenditure object:", expenditure);
      return;
    }
    console.log("handleEdit called with expenditure:", expenditure);
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
    console.log("handleDelete called with expenditure:", expenditure);
    setSelectedExpenditure(expenditure);
    openDeleteDialog(expenditure);
  };

  const handleView = (expenditure: SchoolExpenditureRead) => {
    if (!expenditure || !expenditure.expenditure_id) {
      console.error("Invalid expenditure object:", expenditure);
      return;
    }
    console.log("handleView called with expenditure:", expenditure);
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

  // Define columns for EnhancedDataTable
  const columns: ColumnDef<SchoolExpenditureRead>[] = [
    {
      id: 'bill_date',
      header: 'Bill Date',
      cell: ({ row }) => {
        const value = row.original.bill_date;
        console.log("Bill date cell - value:", value);
        return formatDate(value);
      },
    },
    createTextColumn<SchoolExpenditureRead>("expenditure_purpose", { header: "Purpose" }),
    createCurrencyColumn<SchoolExpenditureRead>("amount", { 
      header: "Amount",
      className: "text-red-600 font-bold",
    }),
    {
      id: 'payment_method',
      header: 'Payment Method',
      cell: ({ row }) => {
        const value = row.original.payment_method;
        console.log("Payment method cell - value:", value);
        return value || "-";
      },
    },
    {
      id: 'remarks',
      header: 'Remarks',
      cell: ({ row }) => {
        const value = row.original.remarks;
        console.log("Remarks cell - value:", value);
        return value || "-";
      },
    },
    createActionColumn<SchoolExpenditureRead>([
      {
        icon: Eye,
        label: "View Expenditure",
        onClick: (expenditure: SchoolExpenditureRead) => {
          console.log("View clicked - expenditure:", expenditure);
          handleView(expenditure);
        },
      },
      {
        icon: Edit,
        label: "Edit Expenditure",
        onClick: (expenditure: SchoolExpenditureRead) => {
          console.log("Edit clicked - expenditure:", expenditure);
          handleEdit(expenditure);
        },
      },
      {
        icon: Trash2,
        label: "Delete Expenditure",
        onClick: (expenditure: SchoolExpenditureRead) => {
          console.log("Delete clicked - expenditure:", expenditure);
          handleDelete(expenditure);
        },
      },
    ]),
  ];

  // Prepare filter options for EnhancedDataTable
  const filterOptions = [
    {
      key: 'expenditure_purpose',
      label: 'Purpose',
      options: uniquePurposes.map(purpose => ({ value: purpose, label: purpose })),
      value: 'all',
      onChange: (value: string) => {
        // This will be handled by EnhancedDataTable's built-in filtering
      }
    }
  ];

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
        description="Track all expenditure transactions and payments"
        searchKey="expenditure_purpose"
        searchPlaceholder="Search by purpose or remarks..."
        exportable={!!onExportCSV}
        onExport={onExportCSV}
        onAdd={onAddExpenditure}
        addButtonText="Add Expenditure"
        filters={filterOptions}
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
              <Input
                id="bill_date"
                type="date"
                value={editForm.bill_date}
                onChange={(e) => setEditForm(prev => ({ ...prev, bill_date: e.target.value }))}
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
