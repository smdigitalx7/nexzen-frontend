import { useState } from "react";
import { motion } from "framer-motion";
import { Edit, Trash2, Eye, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { useTableState } from "@/lib/hooks/common/useTableState";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
}

export const FeeStructureTable = ({
  feeStructures,
  onAddFeeStructure,
  onEditFeeStructure,
  onDeleteFeeStructure,
  onViewFeeStructure,
}: FeeStructureTableProps) => {
  // Using shared table state management
  const {
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    showAddDialog,
    openAddDialog,
    closeAddDialog,
  } = useTableState({
    initialFilters: { class: "all" }
  });
  
  const selectedClass = filters.class || "all";
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const handleClassFilterChange = (value: string) => {
    setFilters(prev => ({ ...prev, class: value }));
  };

  const filteredStructures = feeStructures.filter((structure) => {
    const searchMatch = searchTerm === "" || 
      structure.class_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      structure.academic_year.toLowerCase().includes(searchTerm.toLowerCase());

    const classMatch = selectedClass === "all" || structure.class_name === selectedClass;

    return searchMatch && classMatch;
  });

  const uniqueClasses = Array.from(new Set(feeStructures.map(s => s.class_name)));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-4"
    >
      {/* Header and Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Fee Structures</h2>
          <p className="text-muted-foreground">
            Manage fee structures for different classes and academic years
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={onAddFeeStructure}>
              <Plus className="h-4 w-4 mr-2" />
              Add Fee Structure
            </Button>
          </DialogTrigger>
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
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search fee structures..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
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
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Class</TableHead>
              <TableHead>Academic Year</TableHead>
              <TableHead>Admission Fee</TableHead>
              <TableHead>Book Fee</TableHead>
              <TableHead>Tuition Fee</TableHead>
              <TableHead>Total Fee</TableHead>
              <TableHead>Students</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredStructures.map((structure) => (
              <TableRow key={structure.id}>
                <TableCell className="font-medium">
                  {structure.class_name}
                </TableCell>
                <TableCell>{structure.academic_year}</TableCell>
                <TableCell>{formatCurrency(structure.admission_fee)}</TableCell>
                <TableCell>{formatCurrency(structure.book_fee)}</TableCell>
                <TableCell>{formatCurrency(structure.tuition_fee)}</TableCell>
                <TableCell className="font-bold">
                  {formatCurrency(structure.total_fee)}
                </TableCell>
                <TableCell>{structure.students_count}</TableCell>
                <TableCell>
                  <Badge variant={structure.active ? "default" : "secondary"}>
                    {structure.active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewFeeStructure(structure.id)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditFeeStructure(structure.id)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteFeeStructure(structure.id)}
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
    </motion.div>
  );
};
