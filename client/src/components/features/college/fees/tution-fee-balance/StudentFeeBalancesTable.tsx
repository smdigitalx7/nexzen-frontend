import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Eye, Download, Edit, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useUpdateCollegeTuitionBalance, useDeleteCollegeTuitionBalance } from "@/lib/hooks/college/use-college-tuition-balances";
import { ColumnDef } from "@tanstack/react-table";
import { EnhancedDataTable } from "@/components/shared";
import {
  createTextColumn,
  createCurrencyColumn,
  createDateColumn,
} from "@/lib/utils/columnFactories";
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

interface StudentFeeBalance {
  id: number;
  student_id: string;
  student_name: string;
  class_name: string;
  academic_year: string;
  total_fee: number;
  paid_amount: number;
  outstanding_amount: number;
  admission_paid: boolean;
  books_paid: boolean;
  term_1_paid: boolean;
  term_2_paid: boolean;
  term_3_paid: boolean;
  transport_paid: boolean;
  last_payment_date: string;
  status: 'PAID' | 'PARTIAL' | 'OUTSTANDING';
}

interface StudentFeeBalancesTableProps {
  studentBalances: StudentFeeBalance[];
  onViewStudent: (student: StudentFeeBalance) => void;
  onExportCSV: () => void;
  onBulkCreate?: () => void;
  title?: string;
  description?: string;
  showHeader?: boolean;
  loading?: boolean;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'PAID':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'PARTIAL':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    case 'OUTSTANDING':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  }
};

export const StudentFeeBalancesTable = ({
  studentBalances,
  onViewStudent,
  onExportCSV,
  onBulkCreate,
  title = "Student Fee Balances",
  description = "Track individual student fee payments and outstanding amounts",
  showHeader = true,
  loading = false,
}: StudentFeeBalancesTableProps) => {
  const { toast } = useToast();
  const deleteMutation = useDeleteCollegeTuitionBalance();
  
  // State for edit and delete dialogs
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentFeeBalance | null>(null);
  const [editForm, setEditForm] = useState({
    total_fee: 0,
    term1_paid: 0,
    term2_paid: 0,
    term3_paid: 0,
    book_paid: 0,
  });

  // Get unique classes for filter options
  const uniqueClasses = Array.from(new Set(studentBalances.map(s => s.class_name)));

  // Define columns for EnhancedDataTable
  const columns: ColumnDef<StudentFeeBalance>[] = useMemo(() => [
    {
      id: 'student_info',
      header: 'Student',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium">{row.original.student_name}</div>
            <div className="text-sm text-muted-foreground font-mono">{row.original.student_id}</div>
          </div>
        </div>
      ),
    },
    createTextColumn<StudentFeeBalance>("class_name", { header: "Class" }),
    createCurrencyColumn<StudentFeeBalance>("total_fee", { header: "Total Fee" }),
    {
      id: 'paid_amount',
      header: 'Paid Amount',
      cell: ({ row }) => (
        <span className="text-green-600 font-medium">
          {formatCurrency(row.original.paid_amount)}
        </span>
      ),
    },
    {
      id: 'outstanding_amount',
      header: 'Outstanding',
      cell: ({ row }) => (
        <span className="text-red-600 font-bold">
          {formatCurrency(row.original.outstanding_amount)}
        </span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge className={getStatusColor(row.original.status)}>
          {row.original.status}
        </Badge>
      ),
    },
    createDateColumn<StudentFeeBalance>("last_payment_date", { 
      header: "Last Payment",
      className: "text-sm text-muted-foreground"
    }),
  ], []);

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(() => [
    {
      type: 'view' as const,
      onClick: (row: StudentFeeBalance) => onViewStudent(row)
    },
    {
      type: 'edit' as const,
      onClick: (row: StudentFeeBalance) => handleEdit(row)
    },
    {
      type: 'delete' as const,
      onClick: (row: StudentFeeBalance) => handleDelete(row)
    }
  ], [onViewStudent]);

  const handleEdit = (student: StudentFeeBalance) => {
    setSelectedStudent(student);
    setEditForm({
      total_fee: student.total_fee,
      term1_paid: 0, // These would need to be fetched from the actual balance data
      term2_paid: 0,
      term3_paid: 0,
      book_paid: 0,
    });
    setEditOpen(true);
  };

  const handleDelete = (student: StudentFeeBalance) => {
    setSelectedStudent(student);
    setDeleteOpen(true);
  };

  const updateMutation = useUpdateCollegeTuitionBalance(selectedStudent?.id || 0);

  const handleUpdate = async () => {
    if (!selectedStudent) return;
    
    try {
      await updateMutation.mutateAsync(editForm);
      toast({
        title: "Success",
        description: "Tuition fee balance updated successfully.",
      });
      setEditOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update tuition fee balance.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedStudent) return;
    
    try {
      await deleteMutation.mutateAsync(selectedStudent.id);
      toast({
        title: "Success",
        description: "Tuition fee balance deleted successfully.",
      });
      setDeleteOpen(false);
      setSelectedStudent(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete tuition fee balance.",
        variant: "destructive",
      });
    }
  };

  // Calculate summary statistics
  const totalCollected = studentBalances.reduce((sum, s) => sum + s.paid_amount, 0);
  const totalOutstanding = studentBalances.reduce((sum, s) => sum + s.outstanding_amount, 0);
  const totalStudents = studentBalances.length;

  // Prepare filter options for EnhancedDataTable
  const filterOptions = [
    {
      key: 'class_name',
      label: 'Class',
      options: uniqueClasses.map(className => ({ value: className, label: className })),
      value: 'all',
      onChange: (value: string) => {
        // This will be handled by EnhancedDataTable's built-in filtering
      }
    },
    {
      key: 'status',
      label: 'Status',
      options: [
        { value: 'PAID', label: 'Paid' },
        { value: 'PARTIAL', label: 'Partial' },
        { value: 'OUTSTANDING', label: 'Outstanding' }
      ],
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
      {/* Enhanced Data Table */}
      <EnhancedDataTable
        data={studentBalances}
        columns={columns}
        title={title}
        searchKey="student_name"
        searchPlaceholder="Search students..."
        exportable={true}
        onExport={onExportCSV}
        onAdd={onBulkCreate}
        addButtonText="Bulk Create"
        showActions={true}
        actionButtonGroups={actionButtonGroups}
        actionColumnHeader="Actions"
        showActionLabels={false}
        loading={loading}
        filters={filterOptions}
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalCollected)}
          </div>
          <div className="text-sm text-muted-foreground">Total Collected</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(totalOutstanding)}
          </div>
          <div className="text-sm text-muted-foreground">Total Outstanding</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {totalStudents}
          </div>
          <div className="text-sm text-muted-foreground">Students</div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Tuition Fee Balance</DialogTitle>
            <DialogDescription>
              Update the tuition fee balance for {selectedStudent?.student_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="total_fee">Total Fee</Label>
              <Input
                id="total_fee"
                type="number"
                value={editForm.total_fee}
                onChange={(e) => setEditForm({ ...editForm, total_fee: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="term1_paid">Term 1 Paid</Label>
              <Input
                id="term1_paid"
                type="number"
                value={editForm.term1_paid}
                onChange={(e) => setEditForm({ ...editForm, term1_paid: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="term2_paid">Term 2 Paid</Label>
              <Input
                id="term2_paid"
                type="number"
                value={editForm.term2_paid}
                onChange={(e) => setEditForm({ ...editForm, term2_paid: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="term3_paid">Term 3 Paid</Label>
              <Input
                id="term3_paid"
                type="number"
                value={editForm.term3_paid}
                onChange={(e) => setEditForm({ ...editForm, term3_paid: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="book_paid">Book Fee Paid</Label>
              <Input
                id="book_paid"
                type="number"
                value={editForm.book_paid}
                onChange={(e) => setEditForm({ ...editForm, book_paid: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>
              Update Balance
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tuition Fee Balance</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this tuition fee balance? This action cannot be undone.
              {selectedStudent && (
                <span className="block mt-2 p-2 bg-red-50 rounded">
                  <strong>Student:</strong> {selectedStudent.student_name} ({selectedStudent.student_id})
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default StudentFeeBalancesTable;