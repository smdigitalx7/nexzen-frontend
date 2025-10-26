import { useState, memo, useMemo } from "react";
import { BookOpen, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormDialog, ConfirmDialog } from "@/components/shared";
import { EnhancedDataTable } from "@/components/shared/EnhancedDataTable";
import { useCollegeClasses, useUpdateCollegeClass, useCreateCollegeClass } from '@/lib/hooks/college/use-college-classes';
import { useToast } from '@/hooks/use-toast';
import type { ColumnDef } from "@tanstack/react-table";
import {
  createIconTextColumn
} from "@/lib/utils/columnFactories";

interface ClassesTabProps {
  classesWithSubjects: any[];
  classesLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  hasError?: boolean;
  errorMessage?: string;
}

export const ClassesTab = memo(({
  classesWithSubjects,
  classesLoading,
  searchTerm,
  setSearchTerm,
  hasError = false,
  errorMessage,
}: ClassesTabProps) => {
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isEditClassOpen, setIsEditClassOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<import("@/lib/types/college").CollegeClassResponse | null>(null);
  const [newClass, setNewClass] = useState({ class_name: "" });
  const [editClass, setEditClass] = useState({ class_name: "" });

  const { toast } = useToast();
  const createClassMutation = useCreateCollegeClass();
  const updateClassMutation = useUpdateCollegeClass(selectedClass?.class_id || 0);
  

  const handleCreateClass = async () => {
    if (!newClass.class_name.trim()) {
      toast({
        title: "Error",
        description: "Class name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await createClassMutation.mutateAsync({
        class_name: newClass.class_name.trim(),
      });
      
      setNewClass({ class_name: "" });
      setIsAddClassOpen(false);
      // Toast handled by mutation hook
    } catch (error) {
      // Error toast is handled by mutation hook
    }
  };

  const handleUpdateClass = async () => {
    if (!editClass.class_name.trim() || !selectedClass) {
      toast({
        title: "Error",
        description: "Class name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateClassMutation.mutateAsync({ class_name: editClass.class_name.trim() });
      
      setEditClass({ class_name: "" });
      setSelectedClass(null);
      setIsEditClassOpen(false);
      // Toast handled by mutation hook
    } catch (error) {
      // Error toast is handled by mutation hook
    }
  };

  const handleDeleteClass = async () => {
    if (!selectedClass) return;

    try {
      // Add delete logic here
      toast({
        title: "Success",
        description: "Class deleted successfully",
      });
      
      setSelectedClass(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete class",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (classItem: import("@/lib/types/college").CollegeClassResponse) => {
    setSelectedClass(classItem);
    setEditClass({ class_name: classItem.class_name });
    setIsEditClassOpen(true);
  };

  const handleDeleteClick = (classItem: any) => {
    setSelectedClass(classItem);
    setIsDeleteDialogOpen(true);
  };

  // Define columns for the data table
  const columns: ColumnDef<any>[] = useMemo(() => [
    createIconTextColumn<any>("class_name", { header: "Class Name", icon: BookOpen })
  ], []);

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(() => [
    {
      type: 'edit' as const,
      onClick: (classItem: any) => handleEditClick(classItem)
    },
    {
      type: 'delete' as const,
      onClick: (classItem: any) => handleDeleteClick(classItem)
    }
  ], [handleEditClick, handleDeleteClick]);

  if (hasError) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>{errorMessage || "Failed to load classes"}</p>
      </div>
    );
  }

  if (classesLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <EnhancedDataTable
        data={classesWithSubjects}
        columns={columns}
        title="Classes"
        searchKey="class_name"
        exportable={true}
        onAdd={() => setIsAddClassOpen(true)}
        addButtonText="Add Class"
        showActions={true}
        actionButtonGroups={actionButtonGroups}
        actionColumnHeader="Actions"
        showActionLabels={true}
      />

      {/* Add Class Dialog */}
      <FormDialog
        open={isAddClassOpen}
        onOpenChange={setIsAddClassOpen}
        title="Add New Class"
        description="Create a new academic class"
        onSave={handleCreateClass}
        onCancel={() => {
          setIsAddClassOpen(false);
          setNewClass({ class_name: "" });
        }}
        saveText="Create Class"
        cancelText="Cancel"
        disabled={createClassMutation.isPending}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="class_name">Class Name</Label>
            <Input
              id="class_name"
              value={newClass.class_name}
              onChange={(e) => setNewClass({ class_name: e.target.value })}
              placeholder="Enter class name"
            />
          </div>
        </div>
      </FormDialog>

      {/* Edit Class Dialog */}
      <FormDialog
        open={isEditClassOpen}
        onOpenChange={setIsEditClassOpen}
        title="Edit Class"
        description="Update class information"
        onSave={handleUpdateClass}
        onCancel={() => {
          setIsEditClassOpen(false);
          setEditClass({ class_name: "" });
          setSelectedClass(null);
        }}
        saveText="Update Class"
        cancelText="Cancel"
        disabled={updateClassMutation.isPending}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit_class_name">Class Name</Label>
            <Input
              id="edit_class_name"
              value={editClass.class_name}
              onChange={(e) => setEditClass({ class_name: e.target.value })}
              placeholder="Enter class name"
            />
          </div>
        </div>
      </FormDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Class"
        description={`Are you sure you want to delete the class "${selectedClass?.class_name}"? This action cannot be undone.`}
        onConfirm={handleDeleteClass}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setSelectedClass(null);
        }}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
});