import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Plus, Edit, Trash2, Eye, Users, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { CombinationRead } from "@/lib/types/college";

interface CombinationsTableProps {
  combinations: CombinationRead[];
  isLoading: boolean;
  onAddCombination: () => void;
  onEditCombination: (combination: CombinationRead) => void;
  onDeleteCombination: (id: number) => void;
  onViewCombination: (combination: CombinationRead) => void;
  formatCurrency: (amount: number) => string;
}

export const CombinationsTable = ({
  combinations,
  isLoading,
  onAddCombination,
  onEditCombination,
  onDeleteCombination,
  onViewCombination,
  formatCurrency,
}: CombinationsTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [combinationToDelete, setCombinationToDelete] = useState<CombinationRead | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const getStatusColor = (active: boolean) => {
    return active 
      ? "bg-green-100 text-green-800 border-green-200"
      : "bg-red-100 text-red-800 border-red-200";
  };

  const filteredCombinations = combinations.filter((combination) => {
    const searchMatch = searchTerm === "" || 
      combination.group_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      combination.course_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return searchMatch;
  });

  const handleDeleteClick = (combination: CombinationRead) => {
    setCombinationToDelete(combination);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = () => {
    if (combinationToDelete) {
      onDeleteCombination(combinationToDelete.id);
      setShowDeleteDialog(false);
      setCombinationToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading combinations...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters and Actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search combinations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-full sm:w-64"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={onAddCombination} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Combination
          </Button>
        </div>
      </div>

      {/* Combinations Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Group-Course Combinations ({filteredCombinations.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Group</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Combination Fee</TableHead>
                  <TableHead>Students</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCombinations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No combinations found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCombinations.map((combination) => (
                    <TableRow key={combination.id}>
                      <TableCell className="font-medium">
                        {combination.group_name}
                      </TableCell>
                      <TableCell className="font-medium">
                        {combination.course_name}
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(combination.combination_fee)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {combination.students_count}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(combination.active)}>
                          {combination.active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onViewCombination(combination)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onEditCombination(combination)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteClick(combination)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Combination</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the combination "{combinationToDelete?.group_name} - {combinationToDelete?.course_name}"? 
              This action cannot be undone and will affect all related sections.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
