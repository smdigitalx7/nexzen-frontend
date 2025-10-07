import { useState, useMemo } from "react";
import { Plus, Edit, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTableWithFilters, FormDialog, ConfirmDialog } from "@/components/shared";
import { useCreateSubject, useUpdateSubject } from '@/lib/hooks/useSchool';
import { useToast } from '@/hooks/use-toast';
import type { ColumnDef } from "@tanstack/react-table";
import { 
  createIconTextColumn, 
  createBadgeColumn, 
  createTruncatedTextColumn,
  createCountBadgeColumn,
  createActionColumn,
  createEditAction,
  createDeleteAction
} from "@/lib/utils/columnFactories.tsx";

interface SubjectsTabProps {
  backendSubjects: any[];
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
  const [selectedSubject, setSelectedSubject] = useState<any>(null);
  const [newSubject, setNewSubject] = useState({ 
    subject_name: "", 
    subject_code: "", 
    description: "" 
  });
  const [editSubject, setEditSubject] = useState({ 
    subject_name: "", 
    subject_code: "", 
    description: "" 
  });

  const { toast } = useToast();
  const createSubjectMutation = useCreateSubject();
  const updateSubjectMutation = useUpdateSubject();

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
      
      setNewSubject({ subject_name: "", subject_code: "", description: "" });
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
        id: selectedSubject.id,
        payload: {
          subject_name: editSubject.subject_name.trim(),
        }
      });
      
      toast({
        title: "Success",
        description: "Subject updated successfully",
      });
      
      setEditSubject({ subject_name: "", subject_code: "", description: "" });
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

  const handleEditClick = (subject: any) => {
    setSelectedSubject(subject);
    setEditSubject({ 
      subject_name: subject.subject_name,
      subject_code: subject.subject_code || "",
      description: subject.description || ""
    });
    setIsEditSubjectOpen(true);
  };

  const handleDeleteClick = (subject: any) => {
    setSelectedSubject(subject);
    setIsDeleteDialogOpen(true);
  };

  // Define columns for the data table using column factories
  const columns: ColumnDef<any>[] = useMemo(() => [
    createIconTextColumn<any>("subject_name", { 
      icon: BookOpen, 
      header: "Subject Name" 
    }),
    createBadgeColumn<any>("subject_code", { 
      header: "Code", 
      variant: "outline",
      fallback: "N/A"
    }),
    createTruncatedTextColumn<any>("description", { 
      header: "Description", 
      fallback: "No description" 
    }),
    createCountBadgeColumn<any>("classes_count", { 
      header: "Classes", 
      variant: "secondary",
      fallback: "classes"
    }),
    createActionColumn<any>([
      createEditAction(handleEditClick),
      createDeleteAction(handleDeleteClick)
    ])
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
      <DataTableWithFilters
        data={backendSubjects}
        columns={columns}
        title="Subjects"
        description="Manage academic subjects and their details"
        searchKey="subject_name"
        exportable={true}
        onAdd={() => setIsAddSubjectOpen(true)}
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
          setNewSubject({ subject_name: "", subject_code: "", description: "" });
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
          <div className="space-y-2">
            <Label htmlFor="subject_code">Subject Code</Label>
            <Input
              id="subject_code"
              value={newSubject.subject_code}
              onChange={(e) => setNewSubject({ ...newSubject, subject_code: e.target.value })}
              placeholder="Enter subject code"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={newSubject.description}
              onChange={(e) => setNewSubject({ ...newSubject, description: e.target.value })}
              placeholder="Enter description"
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
          setEditSubject({ subject_name: "", subject_code: "", description: "" });
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
          <div className="space-y-2">
            <Label htmlFor="edit_subject_code">Subject Code</Label>
            <Input
              id="edit_subject_code"
              value={editSubject.subject_code}
              onChange={(e) => setEditSubject({ ...editSubject, subject_code: e.target.value })}
              placeholder="Enter subject code"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_description">Description</Label>
            <Input
              id="edit_description"
              value={editSubject.description}
              onChange={(e) => setEditSubject({ ...editSubject, description: e.target.value })}
              placeholder="Enter description"
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