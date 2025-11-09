import { useState, useMemo } from "react";
import { Award, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormDialog, ConfirmDialog } from "@/components/shared";
import { EnhancedDataTable } from "@/components/shared/EnhancedDataTable";
import { useToast } from '@/hooks/use-toast';
import { useFormState } from "@/lib/hooks/common";
import type { ColumnDef } from "@tanstack/react-table";
import { 
  createIconTextColumn, 
  createDateColumn, 
  createBadgeColumn
} from "@/lib/utils/factory/columnFactories";
import { useCreateCollegeExam, useDeleteCollegeExam, useUpdateCollegeExam } from "@/lib/hooks/college";
import type { CollegeExamCreate, CollegeExamRead, CollegeExamUpdate } from "@/lib/types/college";

interface ExamsTabProps {
  exams: CollegeExamRead[];
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isLoading?: boolean;
  hasError?: boolean;
  errorMessage?: string;
}

export const ExamsTab = ({
  exams,
  searchTerm,
  setSearchTerm,
  isLoading = false,
  hasError = false,
  errorMessage,
}: ExamsTabProps) => {
  const createExam = useCreateCollegeExam();
  const deleteExam = useDeleteCollegeExam();
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [isEditExamOpen, setIsEditExamOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const updateExam = useUpdateCollegeExam(selectedExam?.exam_id || 0);
  
  // Using shared form state management for new exam
  const {
    formData: newExam,
    setFormData: setNewExam,
    updateField: updateNewExamField,
    resetForm: resetNewExam,
  } = useFormState({
    initialData: { 
      exam_name: "", 
      pass_marks: "",
      max_marks: ""
    }
  });
  
  // Using shared form state management for edit exam
  const {
    formData: editExam,
    setFormData: setEditExam,
    updateField: updateEditExamField,
    resetForm: resetEditExam,
  } = useFormState({
    initialData: { 
      exam_name: "", 
      pass_marks: "",
      max_marks: ""
    }
  });

  const { toast } = useToast();

  const handleCreateExam = async () => {
    if (!newExam.exam_name?.trim()) {
      toast({
        title: "Error",
        description: "Exam name is required",
        variant: "destructive",
      });
      return;
    }

    const maxMarks = parseInt(newExam.max_marks || "100") || 100;
    const passMarks = parseInt(newExam.pass_marks || "35") || 35;

    if (passMarks >= maxMarks) {
      toast({
        title: "Error",
        description: "Pass marks must be less than max marks",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload: CollegeExamCreate = {
        exam_name: newExam.exam_name.trim(),
        exam_date: new Date().toISOString().split('T')[0],
        pass_marks: passMarks,
        max_marks: maxMarks,
      };
      await createExam.mutateAsync(payload);
      
      resetNewExam();
      setIsAddExamOpen(false);
      // Toast handled by mutation hook
    } catch (error) {
      // Error toast is handled by mutation hook
    }
  };

  const handleUpdateExam = async () => {
    if (!editExam.exam_name?.trim() || !selectedExam) {
      toast({
        title: "Error",
        description: "Exam name is required",
        variant: "destructive",
      });
      return;
    }

    const maxMarks = parseInt(editExam.max_marks || "100") || 100;
    const passMarks = parseInt(editExam.pass_marks || "35") || 35;

    if (passMarks >= maxMarks) {
      toast({
        title: "Error",
        description: "Pass marks must be less than max marks",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatePayload: CollegeExamUpdate = {
        exam_name: editExam.exam_name?.trim() || undefined,
        pass_marks: passMarks,
        max_marks: maxMarks,
      };
      await updateExam.mutateAsync(updatePayload);
      
      resetEditExam();
      setSelectedExam(null);
      setIsEditExamOpen(false);
      // Toast handled by mutation hook
    } catch (error) {
      // Error toast is handled by mutation hook
    }
  };

  const handleDeleteExam = async () => {
    if (!selectedExam) return;

    try {
      await deleteExam.mutateAsync(selectedExam.exam_id);
      
      setSelectedExam(null);
      setIsDeleteDialogOpen(false);
      // Toast handled by mutation hook
    } catch (error) {
      // Error toast is handled by mutation hook
    }
  };

  const handleEditClick = (exam: CollegeExamRead) => {
    setSelectedExam(exam);
    setEditExam({ 
      exam_name: exam.exam_name,
      pass_marks: exam.pass_marks?.toString() || "35",
      max_marks: exam.max_marks?.toString() || "100"
    });
    setIsEditExamOpen(true);
  };

  const handleDeleteClick = (exam: any) => {
    setSelectedExam(exam);
    setIsDeleteDialogOpen(true);
  };

  // Define columns for the data table using column factories
  const columns: ColumnDef<CollegeExamRead>[] = useMemo(() => [
    createIconTextColumn<CollegeExamRead>("exam_name", { 
      icon: Award, 
      header: "Exam Name" 
    }),
    createDateColumn<CollegeExamRead>("exam_date", { 
      header: "Date", 
      fallback: "Not set" 
    }),
    createBadgeColumn<CollegeExamRead>("pass_marks", { 
      header: "Pass Marks", 
      variant: "outline",
      fallback: "35 marks"
    }),
    createBadgeColumn<CollegeExamRead>("max_marks", { 
      header: "Max Marks", 
      variant: "outline",
      fallback: "100 marks"
    })
  ], []);

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(() => [
    {
      type: 'edit' as const,
      onClick: (row: CollegeExamRead) => handleEditClick(row)
    },
    {
      type: 'delete' as const,
      onClick: (row: CollegeExamRead) => handleDeleteClick(row)
    }
  ], []);

  if (hasError) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>{errorMessage || "Failed to load exams"}</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <EnhancedDataTable
        data={exams}
        columns={columns}
        title="Exams"
        searchKey="exam_name"
        exportable={true}
        onAdd={() => setIsAddExamOpen(true)}
        addButtonText="Add Exam"
        showActions={true}
        actionButtonGroups={actionButtonGroups}
        actionColumnHeader="Actions"
        showActionLabels={true}
      />

      {/* Add Exam Dialog */}
      <FormDialog
        open={isAddExamOpen}
        onOpenChange={setIsAddExamOpen}
        title="Add New Exam"
        description="Create a new academic exam"
        onSave={handleCreateExam}
        onCancel={() => {
          setIsAddExamOpen(false);
          resetNewExam();
        }}
        saveText="Create Exam"
        cancelText="Cancel"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="exam_name">Exam Name</Label>
            <Input
              id="exam_name"
              value={newExam.exam_name}
              onChange={(e) => updateNewExamField('exam_name', e.target.value)}
              placeholder="Enter exam name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_marks">Max Marks</Label>
            <Input
              id="max_marks"
              type="number"
              value={newExam.max_marks}
              onChange={(e) => updateNewExamField('max_marks', e.target.value)}
              placeholder="Enter max marks"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pass_marks">Pass Marks</Label>
            <Input
              id="pass_marks"
              type="number"
              value={newExam.pass_marks}
              onChange={(e) => updateNewExamField('pass_marks', e.target.value)}
              placeholder="Enter pass marks"
            />
          </div>
        </div>
      </FormDialog>

      {/* Edit Exam Dialog */}
      <FormDialog
        open={isEditExamOpen}
        onOpenChange={setIsEditExamOpen}
        title="Edit Exam"
        description="Update exam information"
        onSave={handleUpdateExam}
        onCancel={() => {
          setIsEditExamOpen(false);
          resetEditExam();
          setSelectedExam(null);
        }}
        saveText="Update Exam"
        cancelText="Cancel"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit_exam_name">Exam Name</Label>
            <Input
              id="edit_exam_name"
              value={editExam.exam_name}
              onChange={(e) => updateEditExamField('exam_name', e.target.value)}
              placeholder="Enter exam name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_max_marks">Max Marks</Label>
            <Input
              id="edit_max_marks"
              type="number"
              value={editExam.max_marks}
              onChange={(e) => updateEditExamField('max_marks', e.target.value)}
              placeholder="Enter max marks"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_pass_marks">Pass Marks</Label>
            <Input
              id="edit_pass_marks"
              type="number"
              value={editExam.pass_marks}
              onChange={(e) => updateEditExamField('pass_marks', e.target.value)}
              placeholder="Enter pass marks"
            />
          </div>
        </div>
      </FormDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Exam"
        description={`Are you sure you want to delete the exam "${selectedExam?.exam_name}"? This action cannot be undone.`}
        onConfirm={handleDeleteExam}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setSelectedExam(null);
        }}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};