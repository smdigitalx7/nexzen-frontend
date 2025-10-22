import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Edit, Trash2, Eye, Plus, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { EnhancedDataTable } from "@/components/shared";
import {
  createCurrencyColumn
} from "@/lib/utils/columnFactories";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface FeeStructure {
  id: number;
  class_name: string;
  academic_year: string;
  admission_fee: number;
  book_fee: number;
  tuition_fee: number;
  total_fee: number;
  term_1_fee: number;
  term_2_fee: number;
  term_3_fee: number;
  active: boolean;
  students_count: number;
}

interface FeeStructureTableProps {
  feeStructures: FeeStructure[];
  onAddFeeStructure: () => void;
  onEditFeeStructure: (id: number) => void;
  onDeleteFeeStructure: (id: number) => void;
  onViewFeeStructure: (id: number) => void;
  loading?: boolean;
}

export const FeeStructureTable = ({
  feeStructures,
  onAddFeeStructure,
  onEditFeeStructure,
  onDeleteFeeStructure,
  onViewFeeStructure,
  loading = false,
}: FeeStructureTableProps) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Get unique classes for filter options
  const uniqueClasses = Array.from(new Set(feeStructures.map(s => s.class_name)));

  // Define columns for EnhancedDataTable
  const columns: ColumnDef<FeeStructure>[] = useMemo(() => [
    {
      id: 'class_info',
      header: 'Class',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <GraduationCap className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium">{row.original.class_name}</div>
            <div className="text-sm text-muted-foreground">{row.original.academic_year}</div>
          </div>
        </div>
      ),
    },
    createCurrencyColumn<FeeStructure>("admission_fee", { header: "Admission Fee" }),
    createCurrencyColumn<FeeStructure>("book_fee", { header: "Book Fee" }),
    createCurrencyColumn<FeeStructure>("tuition_fee", { header: "Tuition Fee" }),
    {
      id: 'total_fee',
      header: 'Total Fee',
      cell: ({ row }) => (
        <span className="font-bold text-green-600">
          {formatCurrency(row.original.total_fee)}
        </span>
      ),
    },
    {
      id: 'students_count',
      header: 'Students',
      cell: ({ row }) => (
        <span className="font-medium">{row.original.students_count}</span>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.active ? "default" : "secondary"}>
          {row.original.active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ], []);

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(() => [
    {
      type: 'view' as const,
      onClick: (row: FeeStructure) => onViewFeeStructure(row.id)
    },
    {
      type: 'edit' as const,
      onClick: (row: FeeStructure) => onEditFeeStructure(row.id)
    },
    {
      type: 'delete' as const,
      onClick: (row: FeeStructure) => onDeleteFeeStructure(row.id)
    }
  ], [onViewFeeStructure, onEditFeeStructure, onDeleteFeeStructure]);

  // Calculate summary statistics
  const totalStructures = feeStructures.length;
  const activeStructures = feeStructures.filter(s => s.active).length;
  const totalStudents = feeStructures.reduce((sum, s) => sum + s.students_count, 0);

  // Prepare filter options for EnhancedDataTable
  const filterOptions = [
    {
      key: 'class_name',
      label: 'Class',
      options: [
        { value: 'all', label: 'All Classes' },
        ...uniqueClasses.map(className => ({ value: className, label: className }))
      ],
      value: 'all',
      onChange: (value: string) => {
        // This will be handled by EnhancedDataTable's built-in filtering
      }
    },
    {
      key: 'active',
      label: 'Status',
      options: [
        { value: 'all', label: 'All Status' },
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' }
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
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      {/* Enhanced Data Table */}
      <EnhancedDataTable
        data={feeStructures}
        columns={columns}
        title="Fee Structures"
        searchKey="class_name"
        searchPlaceholder="Search fee structures..."
        exportable={true}
        loading={loading}
        filters={filterOptions}
        onAdd={onAddFeeStructure}
        showActions={true}
        actionButtonGroups={actionButtonGroups}
        actionColumnHeader="Actions"
        showActionLabels={false}
        addButtonText="Add Fee Structure"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {totalStructures}
          </div>
          <div className="text-sm text-muted-foreground">Total Structures</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {activeStructures}
          </div>
          <div className="text-sm text-muted-foreground">Active Structures</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {totalStudents}
          </div>
          <div className="text-sm text-muted-foreground">Total Students</div>
        </div>
      </div>

      {/* Add Fee Structure Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Fee Structure</DialogTitle>
            <DialogDescription>
              Create a new fee structure for a class and academic year
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="class_name">Class Name</Label>
              <Input id="class_name" placeholder="e.g., Class 8" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="academic_year">Academic Year</Label>
              <Input id="academic_year" placeholder="e.g., 2024-25" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admission_fee">Admission Fee</Label>
              <Input id="admission_fee" type="number" placeholder="2000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="book_fee">Book Fee</Label>
              <Input id="book_fee" type="number" placeholder="3500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tuition_fee">Tuition Fee</Label>
              <Input id="tuition_fee" type="number" placeholder="18000" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="students_count">Students Count</Label>
              <Input id="students_count" type="number" placeholder="45" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsAddDialogOpen(false)}>
              Create Fee Structure
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
};
