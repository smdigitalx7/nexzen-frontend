import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Download, Search, Filter, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import { useTableState } from "@/lib/hooks/common/useTableState";
import { useToast } from "@/hooks/use-toast";
import { useUpdateCollegeTransportBalance, useDeleteCollegeTransportBalance } from "@/lib/hooks/college/use-college-transport-balances";
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

interface TransportFeeBalance {
  id: number;
  student_id: string;
  student_name: string;
  class_name: string;
  academic_year: string;
  total_fee: number;
  paid_amount: number;
  outstanding_amount: number;
  term_1_paid: boolean;
  term_2_paid: boolean;
  last_payment_date: string;
  status: 'PAID' | 'PARTIAL' | 'OUTSTANDING';
}

interface TransportFeeBalancesTableProps {
  studentBalances: TransportFeeBalance[];
  onViewStudent: (student: TransportFeeBalance) => void;
  onExportCSV: () => void;
  title?: string;
  description?: string;
  showHeader?: boolean;
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

export const TransportFeeBalancesTable = ({
  studentBalances,
  onViewStudent,
  onExportCSV,
  title = "Transport Fee Balances",
  description = "Track individual student transport fee payments and outstanding amounts",
  showHeader = true,
}: TransportFeeBalancesTableProps) => {
  const { toast } = useToast();
  const deleteMutation = useDeleteCollegeTransportBalance();
  
  // State for edit and delete dialogs
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<TransportFeeBalance | null>(null);
  const [editForm, setEditForm] = useState({
    actual_fee: 0,
    concession_amount: 0,
    total_fee: 0,
    term1_amount: 0,
    term1_paid: 0,
    term1_balance: 0,
    term2_amount: 0,
    term2_paid: 0,
    term2_balance: 0,
    overall_balance_fee: 0,
    overpayment_balance: 0,
    term1_status: "PENDING",
    term2_status: "PENDING",
  });

  // Using shared table state management
  const {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
  } = useTableState({
    initialFilters: { class: "all", status: "all" }
  });
  
  const selectedClass = filters.class || "all";
  const selectedStatus = filters.status || "all";

  const handleClassFilterChange = (value: string) => {
    setFilters(prev => ({ ...prev, class: value }));
  };

  const handleStatusFilterChange = (value: string) => {
    setFilters(prev => ({ ...prev, status: value }));
  };

  const handleEdit = (student: TransportFeeBalance) => {
    setSelectedStudent(student);
    setEditForm({
      actual_fee: student.total_fee,
      concession_amount: 0,
      total_fee: student.total_fee,
      term1_amount: 0, // These would need to be fetched from the actual balance data
      term1_paid: 0,
      term1_balance: 0,
      term2_amount: 0,
      term2_paid: 0,
      term2_balance: 0,
      overall_balance_fee: student.outstanding_amount,
      overpayment_balance: 0,
      term1_status: "PENDING",
      term2_status: "PENDING",
    });
    setEditOpen(true);
  };

  const handleDelete = (student: TransportFeeBalance) => {
    setSelectedStudent(student);
    setDeleteOpen(true);
  };

  const updateMutation = useUpdateCollegeTransportBalance(selectedStudent?.id || 0);

  const handleUpdate = async () => {
    if (!selectedStudent) return;
    
    try {
      await updateMutation.mutateAsync(editForm);
      toast({
        title: "Success",
        description: "Transport fee balance updated successfully.",
      });
      setEditOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update transport fee balance.",
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
        description: "Transport fee balance deleted successfully.",
      });
      setDeleteOpen(false);
      setSelectedStudent(null);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete transport fee balance.",
        variant: "destructive",
      });
    }
  };

  const filteredBalances = studentBalances.filter((student) => {
    const searchMatch = searchTerm === "" || 
      student.student_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const classMatch = selectedClass === "all" || student.class_name === selectedClass;
    const statusMatch = selectedStatus === "all" || student.status === selectedStatus;
    
    return searchMatch && classMatch && statusMatch;
  });

  const uniqueClasses = Array.from(new Set(studentBalances.map(s => s.class_name)));

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
          <Button onClick={onExportCSV} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 max-w-sm"
            />
          </div>
        </div>
        <Select value={selectedClass} onValueChange={handleClassFilterChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by class" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {uniqueClasses.map((className) => (
              <SelectItem key={className} value={className}>
                {className}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={handleStatusFilterChange}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="PARTIAL">Partial</SelectItem>
            <SelectItem value="OUTSTANDING">Outstanding</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student ID</TableHead>
              <TableHead>Student Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Total Fee</TableHead>
              <TableHead>Paid Amount</TableHead>
              <TableHead>Outstanding</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Payment</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBalances.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="font-mono text-sm">
                  {student.student_id}
                </TableCell>
                <TableCell className="font-medium">
                  {student.student_name}
                </TableCell>
                <TableCell>{student.class_name}</TableCell>
                <TableCell>{formatCurrency(student.total_fee)}</TableCell>
                <TableCell className="text-green-600">
                  {formatCurrency(student.paid_amount)}
                </TableCell>
                <TableCell className="text-red-600 font-bold">
                  {formatCurrency(student.outstanding_amount)}
                </TableCell>
                <TableCell>
                  <Badge className={getStatusColor(student.status)}>
                    {student.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {new Date(student.last_payment_date).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewStudent(student)}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(student)}
                      title="Edit Balance"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(student)}
                      title="Delete Balance"
                      className="text-red-600 hover:text-red-700"
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
      <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(
              filteredBalances.reduce((sum, s) => sum + s.paid_amount, 0)
            )}
          </div>
          <div className="text-sm text-muted-foreground">Total Collected</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(
              filteredBalances.reduce((sum, s) => sum + s.outstanding_amount, 0)
            )}
          </div>
          <div className="text-sm text-muted-foreground">Total Outstanding</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {filteredBalances.length}
          </div>
          <div className="text-sm text-muted-foreground">Students</div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Transport Fee Balance</DialogTitle>
            <DialogDescription>
              Update the transport fee balance for {selectedStudent?.student_name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="actual_fee">Actual Fee</Label>
                <Input
                  id="actual_fee"
                  type="number"
                  value={editForm.actual_fee}
                  onChange={(e) => setEditForm({ ...editForm, actual_fee: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="concession_amount">Concession Amount</Label>
                <Input
                  id="concession_amount"
                  type="number"
                  value={editForm.concession_amount}
                  onChange={(e) => setEditForm({ ...editForm, concession_amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="total_fee">Total Fee</Label>
              <Input
                id="total_fee"
                type="number"
                value={editForm.total_fee}
                onChange={(e) => setEditForm({ ...editForm, total_fee: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Term 1 Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="term1_amount">Term 1 Amount</Label>
                  <Input
                    id="term1_amount"
                    type="number"
                    value={editForm.term1_amount}
                    onChange={(e) => setEditForm({ ...editForm, term1_amount: parseFloat(e.target.value) || 0 })}
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
                  <Label htmlFor="term1_balance">Term 1 Balance</Label>
                  <Input
                    id="term1_balance"
                    type="number"
                    value={editForm.term1_balance}
                    onChange={(e) => setEditForm({ ...editForm, term1_balance: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="term1_status">Term 1 Status</Label>
                  <Select value={editForm.term1_status} onValueChange={(value) => setEditForm({ ...editForm, term1_status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="PARTIAL">Partial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-3">Term 2 Details</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="term2_amount">Term 2 Amount</Label>
                  <Input
                    id="term2_amount"
                    type="number"
                    value={editForm.term2_amount}
                    onChange={(e) => setEditForm({ ...editForm, term2_amount: parseFloat(e.target.value) || 0 })}
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
                  <Label htmlFor="term2_balance">Term 2 Balance</Label>
                  <Input
                    id="term2_balance"
                    type="number"
                    value={editForm.term2_balance}
                    onChange={(e) => setEditForm({ ...editForm, term2_balance: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="term2_status">Term 2 Status</Label>
                  <Select value={editForm.term2_status} onValueChange={(value) => setEditForm({ ...editForm, term2_status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="PAID">Paid</SelectItem>
                      <SelectItem value="PARTIAL">Partial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="overall_balance_fee">Overall Balance Fee</Label>
                <Input
                  id="overall_balance_fee"
                  type="number"
                  value={editForm.overall_balance_fee}
                  onChange={(e) => setEditForm({ ...editForm, overall_balance_fee: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="overpayment_balance">Overpayment Balance</Label>
                <Input
                  id="overpayment_balance"
                  type="number"
                  value={editForm.overpayment_balance}
                  onChange={(e) => setEditForm({ ...editForm, overpayment_balance: parseFloat(e.target.value) || 0 })}
                />
              </div>
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
            <AlertDialogTitle>Delete Transport Fee Balance</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this transport fee balance? This action cannot be undone.
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

export default TransportFeeBalancesTable;
