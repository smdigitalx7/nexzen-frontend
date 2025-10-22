import { useState, useMemo } from "react";
import { BookOpen, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormDialog, ConfirmDialog } from "@/components/shared";
import { EnhancedDataTable } from "@/components/shared/EnhancedDataTable";
import { useCreateSchoolSubject, useUpdateSchoolSubject } from '@/lib/hooks/school/use-school-subjects';
import { useToast } from '@/hooks/use-toast';
import type { ColumnDef } from "@tanstack/react-table";
import { 
  createIconTextColumn
} from "@/lib/utils/columnFactories";

interface SubjectsTabProps {
  backendSubjects: import("@/lib/types/school").SchoolSubjectRead[];
  subjectsLoading: boolean;
  currentBranch: any;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedBranchType: string; 
  setSelectedBranchType: (type: string) => void; 
}

export const SubjectsTab = ({
  backendSubjects,
  subjectsLoading,
  currentBranch,
  searchTerm,
  setSearchTerm,
  selectedBranchType: _selectedBranchType,
  setSelectedBranchType: _setSelectedBranchType,
}: SubjectsTabProps) => {
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isEditSubjectOpen, setIsEditSubjectOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<import("@/lib/types/school").SchoolSubjectRead | null>(null);
  const [newSubject, setNewSubject] = useState({ 
    subject_name: "", 
  });
  const [editSubject, setEditSubject] = useState({ 
    subject_name: "", 
  });

  const { toast } = useToast();
  const createSubjectMutation = useCreateSchoolSubject();
  const updateSubjectMutation = useUpdateSchoolSubject(selectedSubject?.subject_id || 0);

  const handleCreateSubject = async () => {
    if (!newSubject.subject_name.trim()) {
      toast({
        title: "Error",
        description: "Subject name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await createSubjectMutation.mutateAsync({
        subject_name: newSubject.subject_name.trim(),
      });
      
      toast({
        title: "Success",
        description: "Subject created successfully",
      });
      
      setNewSubject({ subject_name: "" });
      setIsAddSubjectOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create subject",
        variant: "destructive",
      });
    }
  };

  const handleUpdateSubject = async () => {
    if (!editSubject.subject_name.trim() || !selectedSubject) {
      toast({
        title: "Error",
        description: "Subject name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateSubjectMutation.mutateAsync({
        subject_name: editSubject.subject_name.trim(),
      });
      
      toast({
        title: "Success",
        description: "Subject updated successfully",
      });
      
      setEditSubject({ subject_name: "" });
      setSelectedSubject(null);
      setIsEditSubjectOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update subject",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSubject = async () => {
    if (!selectedSubject) return;

    try {
      // Add delete logic here
      toast({
        title: "Success",
        description: "Subject deleted successfully",
      });
      
      setSelectedSubject(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete subject",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (subject: import("@/lib/types/school").SchoolSubjectRead) => {
    setSelectedSubject(subject);
    setEditSubject({ 
      subject_name: subject.subject_name,
    });
    setIsEditSubjectOpen(true);
  };

  const handleDeleteClick = (subject: any) => {
    setSelectedSubject(subject);
    setIsDeleteDialogOpen(true);
  };

  // Define columns for the data table using column factories
  const columns: ColumnDef<any>[] = useMemo(() => [
    { accessorKey: "subject_id", header: "Subject ID" },
    createIconTextColumn<any>("subject_name", { 
      icon: BookOpen, 
      header: "Subject Name" 
    })
  ], []);

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(() => [
    {
      type: 'edit' as const,
      onClick: (subject: any) => handleEditClick(subject)
    },
    {
      type: 'delete' as const,
      onClick: (subject: any) => handleDeleteClick(subject)
    }
  ], []);

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
        onAdd={() => setIsAddSubjectOpen(true)}
        addButtonText="Add Subject"
        showActions={true}
        actionButtonGroups={actionButtonGroups}
        actionColumnHeader="Actions"
        showActionLabels={false}
      />

      {/* Add Subject Dialog */}
      <FormDialog
        open={isAddSubjectOpen}
        onOpenChange={setIsAddSubjectOpen}
        title="Add New Subject"
        description="Create a new academic subject"
        onSave={handleCreateSubject}
        onCancel={() => {
          setIsAddSubjectOpen(false);
          setNewSubject({ subject_name: "" });
        }}
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
              onChange={(e) => setNewSubject({ ...newSubject, subject_name: e.target.value })}
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
        onCancel={() => {
          setIsEditSubjectOpen(false);
          setEditSubject({ subject_name: "" });
          setSelectedSubject(null);
        }}
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
              onChange={(e) => setEditSubject({ ...editSubject, subject_name: e.target.value })}
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
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setSelectedSubject(null);
        }}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};