import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table";
import { EnhancedDataTable, ConfirmDialog } from "@/components/shared";
import GradeFormDialog from "./GradeFormDialog";
import type { GradeRead, GradeCreate, GradeUpdate } from "@/lib/types/general/grades";
import type { UseMutationResult } from "@tanstack/react-query";
import { useCanViewUIComponent } from "@/lib/permissions";

interface GradesTabProps {
  gradesData: GradeRead[];
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCreateGrade: (data: GradeCreate) => void;
  onUpdateGrade: (data: { gradeCode: string; data: GradeUpdate }) => void;
  onDeleteGrade: (gradeCode: string) => void;
  createGradeMutation: UseMutationResult<GradeRead, unknown, GradeCreate, unknown>;
  updateGradeMutation: UseMutationResult<GradeRead, unknown, { gradeCode: string; data: GradeUpdate }, unknown>;
  deleteGradeMutation: UseMutationResult<void, unknown, string, unknown>;
}

const GradesTab = ({
  gradesData,
  searchTerm,
  onSearchChange,
  onCreateGrade,
  onUpdateGrade,
  onDeleteGrade,
  createGradeMutation,
  updateGradeMutation,
  deleteGradeMutation,
}: GradesTabProps) => {
  const [isAddGradeOpen, setIsAddGradeOpen] = useState(false);
  const [isEditGradeOpen, setIsEditGradeOpen] = useState(false);
  const [editGradeCode, setEditGradeCode] = useState<string | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedGradeCode, setSelectedGradeCode] = useState<string | null>(null);

  const handleDeleteClick = (gradeCode: string) => {
    setSelectedGradeCode(gradeCode);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteGrade = () => {
    if (selectedGradeCode) {
      deleteGradeMutation.mutate(selectedGradeCode, {
        onSuccess: () => {
          setIsDeleteDialogOpen(false);
          setSelectedGradeCode(null);
        },
        onError: () => {
          // Keep dialog open on error so user can see the error message
          // Dialog will be closed when user clicks cancel or outside
        }
      });
    }
  };

  const columns: ColumnDef<GradeRead>[] = useMemo(() => [
    {
      id: 'grade',
      accessorKey: 'grade',
      header: 'Grade',
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-bold text-lg">
            {row.original.grade}
          </Badge>
        </div>
      ),
    },
    {
      id: 'min_percentage',
      accessorKey: 'min_percentage',
      header: 'Min Percentage',
      cell: ({ row }) => `${row.original.min_percentage}%`,
    },
    {
      id: 'max_percentage',
      accessorKey: 'max_percentage',
      header: 'Max Percentage',
      cell: ({ row }) => `${row.original.max_percentage}%`,
    },
    {
      id: 'range',
      header: 'Percentage Range',
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.original.min_percentage}% - {row.original.max_percentage}%
        </span>
      ),
    },
  ], []);

  // Permission checks
  const canDeleteGrade = useCanViewUIComponent("grades", "button", "grade-delete");

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(() => {
    const buttons = [
      {
        type: 'edit' as const,
        onClick: (row: GradeRead) => handleEditGrade(row)
      }
    ];
    
    if (canDeleteGrade) {
      buttons.push({
        type: 'delete' as const,
        onClick: (row: GradeRead) => handleDeleteClick(row.grade)
      });
    }
    
    return buttons;
  }, [canDeleteGrade]);

  const handleAddGrade = (data: GradeCreate | { gradeCode: string; data: GradeUpdate }) => {
    // When adding (not editing), the dialog will only pass GradeCreate
    if ('grade' in data) {
      createGradeMutation.mutate(data);
      setIsAddGradeOpen(false);
    }
  };

  const handleUpdateGrade = (data: { gradeCode: string; data: GradeUpdate } | GradeCreate) => {
    // Check if it's an update (has gradeCode) or create
    if ('gradeCode' in data) {
      const { gradeCode, data: updateData } = data;
      
      // Filter out undefined, null, and NaN values
      const payload: GradeUpdate = {};
      Object.keys(updateData).forEach((key) => {
        const value = updateData[key as keyof GradeUpdate];
        if (value !== undefined && value !== null && !Number.isNaN(value)) {
          (payload as Record<string, unknown>)[key] = value;
        }
      });
      
      // Ensure payload is not empty
      if (Object.keys(payload).length === 0) {
        console.error("Update payload is empty");
        return;
      }
      
      updateGradeMutation.mutate({ gradeCode, data: payload });
      setIsEditGradeOpen(false);
      setEditGradeCode(null);
    }
  };

  const handleEditGrade = (grade: GradeRead) => {
    setEditGradeCode(grade.grade);
    setIsEditGradeOpen(true);
  };

  return (
    <div className="space-y-4">
      <GradeFormDialog
        isOpen={isAddGradeOpen}
        onClose={() => setIsAddGradeOpen(false)}
        onSubmit={handleAddGrade}
        isEditing={false}
      />

      <EnhancedDataTable
        data={gradesData}
        columns={columns}
        title="Grades"
        searchKey="grade"
        searchPlaceholder="Search grades..."
        showActions={true}
        actionButtonGroups={actionButtonGroups}
        actionColumnHeader="Actions"
        showActionLabels={true}
        exportable={true}
        onAdd={() => setIsAddGradeOpen(true)}
        addButtonText="Add Grade"
        addButtonVariant="default"
      />

      {/* Edit Grade Dialog */}
      <GradeFormDialog
        isOpen={isEditGradeOpen}
        onClose={() => {
          setIsEditGradeOpen(false);
          setEditGradeCode(null);
        }}
        onSubmit={handleUpdateGrade}
        isEditing={true}
        editingGrade={editGradeCode ? (() => {
          const grade = gradesData.find(g => g.grade === editGradeCode);
          return grade ? { 
            grade: grade.grade,
            min_percentage: grade.min_percentage,
            max_percentage: grade.max_percentage
          } : undefined;
        })() : undefined}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Grade"
        description={`Are you sure you want to delete grade "${selectedGradeCode}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteGradeMutation.isPending}
        loadingText="Deleting..."
        onConfirm={handleDeleteGrade}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setSelectedGradeCode(null);
        }}
      />
    </div>
  );
};

export default GradesTab;

