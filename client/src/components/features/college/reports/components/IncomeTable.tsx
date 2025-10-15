import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Eye, Download, Search, Filter, Plus, Edit } from "lucide-react";
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
import { useUpdateCollegeIncome } from "@/lib/hooks/college/use-college-income";
import type { CollegeIncomeRead } from "@/lib/types/college";
import { FormDialog } from "@/components/shared";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useTableState } from "@/lib/hooks/common/useTableState";
import { useSearchFilters, useTableFilters } from "@/lib/hooks/common";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface IncomeTableProps {
  incomeData: CollegeIncomeRead[];
  onViewIncome?: (income: CollegeIncomeRead) => void;
  onExportCSV?: () => void;
  onAddIncome?: () => void;
  title?: string;
  description?: string;
  showHeader?: boolean;
}

export const IncomeTable = ({
  incomeData,
  onViewIncome,
  onExportCSV,
  onAddIncome,
  title = "Income Records",
  description = "Track all income transactions and payments",
  showHeader = true,
}: IncomeTableProps) => {
  // Using shared table state management
  const {
    // keep dialog and selection state from shared table state
    showEditDialog,
    openEditDialog,
    closeEditDialog,
    selectedItem: selectedIncome,
    setSelectedItem: setSelectedIncome,
  } = useTableState();
  
  const [editForm, setEditForm] = useState({
    purpose: "",
    amount: "",
    income_date: "",
    term_number: "",
    note: "",
  });

  const [updateId, setUpdateId] = useState<number | null>(null);
  const updateIncomeMutation = useUpdateCollegeIncome(updateId ?? 0);

  // Apply shared search + select filters
  const { searchTerm, setSearchTerm, filteredItems: searchFiltered } = useSearchFilters<CollegeIncomeRead>(
    incomeData,
    { keys: ["purpose", "student_name", "admission_no"] as any }
  );

  const { filters, setFilter, filteredItems: filteredIncome } = useTableFilters<CollegeIncomeRead>(
    searchFiltered,
    [
      { key: "purpose" as keyof CollegeIncomeRead, value: "all" },
    ]
  );

  const uniquePurposes = Array.from(new Set(incomeData.map(i => i.purpose)));

  const totalAmount = filteredIncome.reduce((sum, income) => sum + income.amount, 0);

  const handleEdit = (income: CollegeIncomeRead) => {
    setSelectedIncome(income);
    setUpdateId(income.income_id);
    setEditForm({
      purpose: income.purpose,
      amount: income.amount.toString(),
      income_date: income.income_date,
      term_number: income.term_number?.toString() || "",
      note: income.note || "",
    });
    openEditDialog(income);
  };


  const handlePurposeFilterChange = (value: string) => {
    setFilter("purpose", value);
  };

  const handleUpdateIncome = async () => {
    if (!selectedIncome) return;
    
    try {
      await updateIncomeMutation.mutateAsync({
        purpose: editForm.purpose,
        amount: parseFloat(editForm.amount),
        income_date: editForm.income_date,
        term_number: editForm.term_number ? parseInt(editForm.term_number) : null,
        note: editForm.note && editForm.note.trim() !== "" ? editForm.note : null,
      });
      closeEditDialog();
    } catch (error) {
      console.error("Failed to update income:", error);
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
            {onAddIncome && (
              <Button onClick={onAddIncome} variant="default">
                <Plus className="h-4 w-4 mr-2" />
                Add Income
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
              placeholder="Search by purpose, student name, or admission no..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 max-w-sm"
            />
          </div>
        </div>
        <Select value={(filters.purpose as string) || 'all'} onValueChange={handlePurposeFilterChange}>
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
              <TableHead>Date</TableHead>
              <TableHead>Purpose</TableHead>
              <TableHead>Student</TableHead>
              <TableHead>Admission No</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Term</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIncome.map((income) => {
              // Debug logging for each income record
              console.log("Income record:", {
                income_id: income.income_id,
                admission_no: income.admission_no,
                term_number: income.term_number,
                student_name: income.student_name,
                enrollment_id: income.enrollment_id,
                reservation_id: income.reservation_id
              });
              
              return (
                <TableRow key={income.income_id}>
                  <TableCell className="text-sm">
                    {formatDate(income.income_date)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {income.purpose}
                  </TableCell>
                  <TableCell>
                    {income.student_name || "-"}
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {income.admission_no || "No Enrollment"}
                  </TableCell>
                  <TableCell className="text-green-600 font-bold">
                    {formatCurrency(income.amount)}
                  </TableCell>
                  <TableCell>
                    {income.term_number ? `Term ${income.term_number}` : 
                     (income.purpose === "TUITION_FEE" ? "Not Set" : 
                      (income.purpose === "ADMISSION_FEE" || income.purpose === "APPLICATION_FEE" ? "-" : "-"))}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {income.note || "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {onViewIncome && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewIncome(income)}
                          title="View Income"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(income)}
                        title="Edit Income"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalAmount)}
          </div>
          <div className="text-sm text-muted-foreground">Total Income</div>
        </div>
      </div>

      {/* Edit Dialog */}
      <FormDialog
        open={showEditDialog}
        onOpenChange={(open) => !open && closeEditDialog()}
        title="Edit Income Record"
        description="Update the income record details below."
        size="MEDIUM"
        isLoading={updateIncomeMutation.isPending}
        onSave={handleUpdateIncome}
        onCancel={closeEditDialog}
        saveText="Update"
      >
          <div className="space-y-4">
            <div>
              <Label htmlFor="purpose">Purpose</Label>
              <Input
                id="purpose"
                value={editForm.purpose}
                onChange={(e) => setEditForm(prev => ({ ...prev, purpose: e.target.value }))}
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
              <Label htmlFor="income_date">Date</Label>
              <Input
                id="income_date"
                type="date"
                value={editForm.income_date}
                onChange={(e) => setEditForm(prev => ({ ...prev, income_date: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="term_number">Term Number</Label>
              <Input
                id="term_number"
                type="number"
                value={editForm.term_number}
                onChange={(e) => setEditForm(prev => ({ ...prev, term_number: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="note">Note</Label>
              <Textarea
                id="note"
                value={editForm.note}
                onChange={(e) => setEditForm(prev => ({ ...prev, note: e.target.value }))}
              />
            </div>
          </div>
      </FormDialog>
    </motion.div>
  );
};
