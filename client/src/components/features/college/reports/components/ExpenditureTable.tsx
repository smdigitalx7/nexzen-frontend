import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Eye, Download, Search, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateCollegeExpenditure, useDeleteCollegeExpenditure, useCollegeExpenditure } from "@/lib/hooks/college/use-college-expenditure";
import type { CollegeExpenditureRead } from "@/lib/types/college";
import { FormDialog, ConfirmDialog } from "@/components/shared";
import { ViewExpenditureDialog } from "./ViewExpenditureDialog";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTableState } from "@/lib/hooks/common/useTableState";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ExpenditureTableProps {
  expenditureData: CollegeExpenditureRead[];
  onViewExpenditure?: (expenditure: CollegeExpenditureRead) => void;
  onExportCSV?: () => void;
  onAddExpenditure?: () => void;
  title?: string;
  description?: string;
  showHeader?: boolean;
}


export const ExpenditureTable = ({
  expenditureData,
  onViewExpenditure,
  onExportCSV,
  onAddExpenditure,
  title = "Expenditure Records",
  description = "Track all expenditure transactions and payments",
  showHeader = true,
}: ExpenditureTableProps) => {
  // Using shared table state management
  const {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    showEditDialog,
    showDeleteDialog,
    openEditDialog,
    closeEditDialog,
    openDeleteDialog,
    closeDeleteDialog,
    selectedItem: selectedExpenditure,
    setSelectedItem: setSelectedExpenditure,
  } = useTableState({
    initialFilters: { purpose: "all" }
  });
  
  const selectedPurpose = filters.purpose || "all";
  const [editForm, setEditForm] = useState({
    expenditure_purpose: "",
    amount: "",
    bill_date: "",
    payment_method: "",
    payment_date: "",
    remarks: "",
  });

  const deleteExpenditureMutation = useDeleteCollegeExpenditure();
  const [updateId, setUpdateId] = useState<number | null>(null);
  const updateExpenditureMutation = useUpdateCollegeExpenditure(updateId ?? 0);

  // View state
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [selectedExpenditureId, setSelectedExpenditureId] = useState<number | null>(null);
  const { data: viewedExpenditure, isLoading: viewLoading, error: viewError } = useCollegeExpenditure(selectedExpenditureId);

  const filteredExpenditure = useMemo(() => {
    return expenditureData.filter((expenditure) => {
      const searchMatch = searchTerm === "" || 
        expenditure.expenditure_purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expenditure.remarks?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const purposeMatch = selectedPurpose === "all" || expenditure.expenditure_purpose === selectedPurpose;
      
      return searchMatch && purposeMatch;
    });
  }, [expenditureData, searchTerm, selectedPurpose]);

  const uniquePurposes = Array.from(new Set(expenditureData.map(e => e.expenditure_purpose)));

  const totalAmount = filteredExpenditure.reduce((sum, expenditure) => sum + expenditure.amount, 0);

  const handleEdit = (expenditure: CollegeExpenditureRead) => {
    setSelectedExpenditure(expenditure);
    setUpdateId(expenditure.expenditure_id);
    setEditForm({
      expenditure_purpose: expenditure.expenditure_purpose,
      amount: expenditure.amount.toString(),
      bill_date: expenditure.bill_date,
      payment_method: expenditure.payment_method || "",
      payment_date: expenditure.payment_date || "",
      remarks: expenditure.remarks || "",
    });
    openEditDialog(expenditure);
  };

  const handleDelete = (expenditure: CollegeExpenditureRead) => {
    setSelectedExpenditure(expenditure);
    openDeleteDialog(expenditure);
  };

  const handlePurposeFilterChange = (value: string) => {
    setFilters(prev => ({ ...prev, purpose: value }));
  };

  const handleUpdateExpenditure = async () => {
    if (!selectedExpenditure) return;
    
    try {
      await updateExpenditureMutation.mutateAsync({
        expenditure_purpose: editForm.expenditure_purpose,
        amount: parseFloat(editForm.amount),
        bill_date: editForm.bill_date,
        payment_method: editForm.payment_method && editForm.payment_method.trim() !== "" ? editForm.payment_method : null,
        payment_date: editForm.payment_date && editForm.payment_date.trim() !== "" ? editForm.payment_date : null,
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="space-y-4"
    >
      {/* Header and Actions */}
      {showHeader && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{title}</h2>
            <p className="text-muted-foreground">
              {description}
            </p>
          </div>
          <div className="flex gap-2">
            {onAddExpenditure && (
              <Button onClick={onAddExpenditure} variant="default">
                <Plus className="h-4 w-4 mr-2" />
                Add Expenditure
              </Button>
            )}
            {onExportCSV && (
              <Button onClick={onExportCSV} variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by purpose or remarks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 max-w-sm"
            />
          </div>
        </div>
        <Select value={selectedPurpose} onValueChange={handlePurposeFilterChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by purpose" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Purposes</SelectItem>
            {uniquePurposes.map((purpose) => (
              <SelectItem key={purpose} value={purpose}>
                {purpose}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Bill Date</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Payment Date</TableHead>
              <TableHead>Remarks</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenditure.map((expenditure) => (
              <TableRow key={expenditure.expenditure_id}>
                <TableCell className="text-sm">
                  {formatDate(expenditure.bill_date)}
                </TableCell>
                <TableCell className="font-medium">
                  {expenditure.expenditure_purpose}
                </TableCell>
                <TableCell className="text-red-600 font-bold">
                  {formatCurrency(expenditure.amount)}
                </TableCell>
                <TableCell>
                  {expenditure.payment_method || "-"}
                </TableCell>
                <TableCell className="text-sm">
                  {expenditure.payment_date ? formatDate(expenditure.payment_date) : "-"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {expenditure.remarks || "-"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedExpenditureId(expenditure.expenditure_id);
                        setShowViewDialog(true);
                        onViewExpenditure?.(expenditure);
                      }}
                      title="View Expenditure"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(expenditure)}
                      title="Edit Expenditure"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(expenditure)}
                      title="Delete Expenditure"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(totalAmount)}
          </div>
          <div className="text-sm text-muted-foreground">Total Expenditure</div>
        </div>
      </div>

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
              <Label htmlFor="payment_date">Payment Date</Label>
              <Input
                id="payment_date"
                type="date"
                value={editForm.payment_date}
                onChange={(e) => setEditForm(prev => ({ ...prev, payment_date: e.target.value }))}
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
        error={viewError as Error | null}
      />
    </motion.div>
  );
};
