import { useState, useMemo, memo, useCallback } from "react";
import { BookOpen } from "lucide-react";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { FormDialog, ConfirmDialog } from "@/common/components/shared";
import { EnhancedDataTable } from "@/common/components/shared/EnhancedDataTable";
import { useCreateSchoolSubject, useUpdateSchoolSubject, useDeleteSchoolSubject } from '@/features/school/hooks';
import { useToast } from '@/common/hooks/use-toast';
import type { ColumnDef } from "@tanstack/react-table";
import { 
  createIconTextColumn
} from "@/common/utils/factory/columnFactories";
import type { SchoolSubjectRead } from "@/features/school/types";
import { useCanViewUIComponent } from "@/core/permissions";

interface SubjectsTabProps {
  backendSubjects: SchoolSubjectRead[];
  subjectsLoading: boolean;
  currentBranch: any;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedBranchType: string; 
  setSelectedBranchType: (type: string) => void; 
}

// Initial form state
const initialSubjectForm = { 
  subject_name: "", 
};

const SubjectsTabComponent = ({
  backendSubjects,
  subjectsLoading,
  currentBranch,
  searchTerm,
  setSearchTerm,
  selectedBranchType: _selectedBranchType,
  setSelectedBranchType: _setSelectedBranchType,
}: SubjectsTabProps) => {
  // Dialog states
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isEditSubjectOpen, setIsEditSubjectOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Selected subject state
  const [selectedSubject, setSelectedSubject] = useState<SchoolSubjectRead | null>(null);
  
  // Form states
  const [newSubject, setNewSubject] = useState(initialSubjectForm);
  const [editSubject, setEditSubject] = useState(initialSubjectForm);

  // Hooks
  const { toast } = useToast();
  const createSubjectMutation = useCreateSchoolSubject();
  const updateSubjectMutation = useUpdateSchoolSubject(selectedSubject?.subject_id || 0);
  const deleteSubjectMutation = useDeleteSchoolSubject();

  // Memoized validation functions
  const validateSubjectForm = useCallback((form: typeof initialSubjectForm) => {
    if (!form.subject_name.trim()) {
      toast({
        title: "Error",
        description: "Subject name is required",
        variant: "destructive",
      });
      return false;
    }
    return true;
  }, [toast]);

  // Memoized mutation handlers
  const handleCreateSubject = useCallback(async () => {
    if (!validateSubjectForm(newSubject)) return;

    try {
      await createSubjectMutation.mutateAsync({
        subject_name: newSubject.subject_name.trim(),
      });
      
      setNewSubject(initialSubjectForm);
      setIsAddSubjectOpen(false);
    } catch (error) {
      // Error toast is handled by mutation hook
    }
  }, [newSubject, validateSubjectForm, createSubjectMutation]);

  const handleUpdateSubject = useCallback(async () => {
    if (!validateSubjectForm(editSubject) || !selectedSubject) return;

    try {
      await updateSubjectMutation.mutateAsync({
        subject_name: editSubject.subject_name.trim(),
      });
      
      setEditSubject(initialSubjectForm);
      setSelectedSubject(null);
      setIsEditSubjectOpen(false);
    } catch (error) {
      // Error toast is handled by mutation hook
    }
  }, [editSubject, selectedSubject, validateSubjectForm, updateSubjectMutation]);

  const handleDeleteSubject = useCallback(async () => {
    if (!selectedSubject) return;

    try {
      await deleteSubjectMutation.mutateAsync(selectedSubject.subject_id);
      setSelectedSubject(null);
      setIsDeleteDialogOpen(false);
      // Success toast is handled by mutation hook
    } catch (error) {
      // Error toast is handled by mutation hook
    }
  }, [selectedSubject, deleteSubjectMutation]);

  // Memoized action handlers
  const handleEditClick = useCallback((subject: SchoolSubjectRead) => {
    setSelectedSubject(subject);
    setEditSubject({ 
      subject_name: subject.subject_name,
    });
    setIsEditSubjectOpen(true);
  }, []);

  const handleDeleteClick = useCallback((subject: SchoolSubjectRead) => {
    setSelectedSubject(subject);
    setIsDeleteDialogOpen(true);
  }, []);

  // Memoized columns definition
  const columns: ColumnDef<SchoolSubjectRead>[] = useMemo(() => [
    createIconTextColumn<SchoolSubjectRead>("subject_name", { 
      icon: BookOpen, 
      header: "Subject Name" 
    }),
  ], []);

  // Permission checks
  const canAddSubject = useCanViewUIComponent("subjects", "button", "subject-add");
  const canEditSubject = useCanViewUIComponent("subjects", "button", "subject-edit");
  const canDeleteSubject = useCanViewUIComponent("subjects", "button", "subject-delete");

  // Memoized action button groups
  const actionButtonGroups = useMemo(() => {
    const buttons = [];
    
    if (canEditSubject) {
      buttons.push({
        type: 'edit' as const,
        onClick: handleEditClick
      });
    }
    
    if (canDeleteSubject) {
      buttons.push({
        type: 'delete' as const,
        onClick: handleDeleteClick
      });
    }
    
    return buttons;
  }, [handleEditClick, handleDeleteClick, canEditSubject, canDeleteSubject]);

  // Memoized dialog close handlers
  const closeAddDialog = useCallback(() => {
    setIsAddSubjectOpen(false);
    setNewSubject(initialSubjectForm);
  }, []);

  const closeEditDialog = useCallback(() => {
    setIsEditSubjectOpen(false);
    setEditSubject(initialSubjectForm);
    setSelectedSubject(null);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setSelectedSubject(null);
  }, []);

  // Memoized form update handlers
  const updateNewSubject = useCallback((value: string) => {
    setNewSubject(prev => ({ ...prev, subject_name: value }));
  }, []);

  const updateEditSubject = useCallback((value: string) => {
    setEditSubject(prev => ({ ...prev, subject_name: value }));
  }, []);

  if (subjectsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <EnhancedDataTable
        data={backendSubjects}
        columns={columns}
        title="Subjects"
        searchKey="subject_name"
        exportable={true}
        onAdd={canAddSubject ? () => setIsAddSubjectOpen(true) : undefined}
        addButtonText="Add Subject"
        showActions={true}
        actionButtonGroups={actionButtonGroups}
        actionColumnHeader="Actions"
        showActionLabels={true}
      />

      {/* Add Subject Dialog */}
      <FormDialog
        open={isAddSubjectOpen}
        onOpenChange={setIsAddSubjectOpen}
        title="Add New Subject"
        description="Create a new academic subject"
        onSave={handleCreateSubject}
        onCancel={closeAddDialog}
        saveText="Create Subject"
        cancelText="Cancel"
        disabled={createSubjectMutation.isPending}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject_name">Subject Name</Label>
            <Input
              id="subject_name"
              value={newSubject.subject_name}
              onChange={(e) => updateNewSubject(e.target.value)}
              placeholder="Enter subject name"
            />
          </div>
        </div>
      </FormDialog>

      {/* Edit Subject Dialog */}
      <FormDialog
        open={isEditSubjectOpen}
        onOpenChange={setIsEditSubjectOpen}
        title="Edit Subject"
        description="Update subject information"
        onSave={handleUpdateSubject}
        onCancel={closeEditDialog}
        saveText="Update Subject"
        cancelText="Cancel"
        disabled={updateSubjectMutation.isPending}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit_subject_name">Subject Name</Label>
            <Input
              id="edit_subject_name"
              value={editSubject.subject_name}
              onChange={(e) => updateEditSubject(e.target.value)}
              placeholder="Enter subject name"
            />
          </div>
        </div>
      </FormDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Subject"
        description={`Are you sure you want to delete the subject "${selectedSubject?.subject_name}"? This action cannot be undone.`}
        onConfirm={handleDeleteSubject}
        onCancel={closeDeleteDialog}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};

export const SubjectsTab = SubjectsTabComponent;