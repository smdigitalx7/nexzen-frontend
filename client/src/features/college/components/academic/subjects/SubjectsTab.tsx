import { useState, useMemo, useCallback } from "react";
import { BookOpen, Edit as EditIcon, Trash2 } from "lucide-react";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { FormDialog, ConfirmDialog } from "@/common/components/shared";
import { DataTable } from "@/common/components/shared/DataTable";
import { useCreateCollegeSubject, useUpdateCollegeSubject, useDeleteCollegeSubject } from '@/features/college/hooks';
import { useToast } from '@/common/hooks/use-toast';
import type { ColumnDef } from "@tanstack/react-table";
import { 
  createIconTextColumn
} from "@/common/utils/factory/columnFactories";

interface SubjectsTabProps {
  backendSubjects: import("@/features/school/types").SchoolSubjectRead[];
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
  const [selectedSubject, setSelectedSubject] = useState<import("@/features/school/types").SchoolSubjectRead | null>(null);
  const [newSubject, setNewSubject] = useState({ 
    subject_name: "", 
  });
  const [editSubject, setEditSubject] = useState({ 
    subject_name: "", 
  });

  const { toast } = useToast();
  const createSubjectMutation = useCreateCollegeSubject();
  const updateSubjectMutation = useUpdateCollegeSubject(selectedSubject?.subject_id || 0);
  const deleteSubjectMutation = useDeleteCollegeSubject();

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
      
      setNewSubject({ subject_name: "" });
      setIsAddSubjectOpen(false);
      // Toast handled by mutation hook
    } catch (error) {
      // Error toast is handled by mutation hook
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
      
      setEditSubject({ subject_name: "" });
      setSelectedSubject(null);
      setIsEditSubjectOpen(false);
      // Toast handled by mutation hook
    } catch (error) {
      // Error toast is handled by mutation hook
    }
  };

  const handleDeleteSubject = async () => {
    if (!selectedSubject) return;

    try {
      await deleteSubjectMutation.mutateAsync(selectedSubject.subject_id);
      setSelectedSubject(null);
      setIsDeleteDialogOpen(false);
      // Success toast is handled by mutation hook
    } catch (error) {
      // Error toast is handled by mutation hook
    }
  };

  const handleEditClick = useCallback((subject: import("@/features/school/types").SchoolSubjectRead) => {
    setSelectedSubject(subject);
    setEditSubject({ 
      subject_name: subject.subject_name,
    });
    setIsEditSubjectOpen(true);
  }, []);

  const handleDeleteClick = useCallback((subject: any) => {
    setSelectedSubject(subject);
    setIsDeleteDialogOpen(true);
  }, []);

  // Define columns for the data table using column factories
  const columns = useMemo<ColumnDef<import("@/features/school/types").SchoolSubjectRead>[]>(() => [
    createIconTextColumn<import("@/features/school/types").SchoolSubjectRead>("subject_name", { 
      icon: BookOpen, 
      header: "Subject Name" 
    })
  ], []);

  // Action config for DataTable V2
  const actions: import("@/common/components/shared/DataTable/types").ActionConfig<any>[] = useMemo(() => [
    {
      id: 'edit',
      label: 'Edit',
      icon: (props) => <EditIcon className={props.className} />,
      onClick: (row) => handleEditClick(row),
    },
    {
      id: 'delete',
      label: 'Delete',
      icon: (props) => <Trash2 className={props.className} />,
      onClick: (row) => handleDeleteClick(row),
      variant: 'destructive',
    }
  ], [handleEditClick, handleDeleteClick]);

  return (
    <div className="space-y-4">
      <DataTable
        data={backendSubjects}
        columns={columns}
        title="Knowledge Base (Subjects)"
        searchKey="subject_name"
        searchPlaceholder="Locate disciplinary domain..."
        loading={subjectsLoading}
        onAdd={() => setIsAddSubjectOpen(true)}
        addButtonText="Register New Subject"
        actions={actions}
        export={{ enabled: true, filename: 'college_subjects_list' }}
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