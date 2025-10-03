import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Eye, Download, Search, Filter, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { IncomeItem, useUpdateIncome } from "@/lib/hooks/useIncomeExpenditure";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface IncomeTableProps {
  incomeData: IncomeItem[];
  onViewIncome?: (income: IncomeItem) => void;
  onExportCSV?: () => void;
  onAddIncome?: () => void;
  title?: string;
  description?: string;
  showHeader?: boolean;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-IN");
};

export const IncomeTable = ({
  incomeData,
  onViewIncome,
  onExportCSV,
  onAddIncome,
  title = "Income Records",
  description = "Track all income transactions and payments",
  showHeader = true,
}: IncomeTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPurpose, setSelectedPurpose] = useState("all");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<IncomeItem | null>(null);
  const [editForm, setEditForm] = useState({
    purpose: "",
    amount: "",
    income_date: "",
    term_number: "",
    description: "",
  });

  const updateIncomeMutation = useUpdateIncome();

  const filteredIncome = useMemo(() => {
    return incomeData.filter((income) => {
      const searchMatch = searchTerm === "" || 
        income.purpose.toLowerCase().includes(searchTerm.toLowerCase()) ||
        income.student_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        income.admission_no?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const purposeMatch = selectedPurpose === "all" || income.purpose === selectedPurpose;
      
      return searchMatch && purposeMatch;
    });
  }, [incomeData, searchTerm, selectedPurpose]);

  const uniquePurposes = Array.from(new Set(incomeData.map(i => i.purpose)));

  const totalAmount = filteredIncome.reduce((sum, income) => sum + income.amount, 0);

  const handleEdit = (income: IncomeItem) => {
    setSelectedIncome(income);
    setEditForm({
      purpose: income.purpose,
      amount: income.amount.toString(),
      income_date: income.income_date,
      term_number: income.term_number?.toString() || "",
      description: income.description || "",
    });
    setShowEditDialog(true);
  };

  const handleDelete = (income: IncomeItem) => {
    setSelectedIncome(income);
    setShowDeleteDialog(true);
  };

  const handleUpdateIncome = async () => {
    if (!selectedIncome) return;
    
    try {
      await updateIncomeMutation.mutateAsync({
        id: selectedIncome.income_id,
        data: {
          purpose: editForm.purpose,
          amount: parseFloat(editForm.amount),
          income_date: editForm.income_date,
          term_number: editForm.term_number ? parseInt(editForm.term_number) : undefined,
          description: editForm.description,
        },
      });
      setShowEditDialog(false);
      setSelectedIncome(null);
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
        <Select value={selectedPurpose} onValueChange={setSelectedPurpose}>
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
            {filteredIncome.map((income) => (
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
                  {income.admission_no || "-"}
                </TableCell>
                <TableCell className="text-green-600 font-bold">
                  {formatCurrency(income.amount)}
                </TableCell>
                <TableCell>
                  {income.term_number ? `Term ${income.term_number}` : "-"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {income.description || "-"}
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
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(income)}
                      title="Delete Income"
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
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalAmount)}
          </div>
          <div className="text-sm text-muted-foreground">Total Income</div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Income Record</DialogTitle>
            <DialogDescription>
              Update the income record details below.
            </DialogDescription>
          </DialogHeader>
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
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateIncome}
              disabled={updateIncomeMutation.isPending}
            >
              {updateIncomeMutation.isPending ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Income Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this income record? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                // Note: Income deletion not implemented in backend
                console.log("Delete income:", selectedIncome?.income_id);
                setShowDeleteDialog(false);
                setSelectedIncome(null);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};
