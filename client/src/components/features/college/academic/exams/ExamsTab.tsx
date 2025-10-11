import { useState, useMemo } from "react";
import { Award } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataTableWithFilters, FormDialog, ConfirmDialog } from "@/components/shared";
import { useToast } from '@/hooks/use-toast';
import { useFormState } from "@/lib/hooks/common";
import type { ColumnDef } from "@tanstack/react-table";
import { 
  createIconTextColumn, 
  createDateColumn, 
  createBadgeColumn, 
  createActionColumn,
  createEditAction,
  createDeleteAction
} from "@/lib/utils/columnFactories.tsx";
import { useCreateCollegeExam, useDeleteCollegeExam, useUpdateCollegeExam } from "@/lib/hooks/college/use-college-exams";
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
      exam_date: "", 
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
      exam_date: "", 
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
        exam_date: newExam.exam_date || "",
        pass_marks: passMarks,
        max_marks: maxMarks,
      };
      await createExam.mutateAsync(payload);
      
      toast({
        title: "Success",
        description: "Exam created successfully",
      });
      
      resetNewExam();
      setIsAddExamOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create exam",
        variant: "destructive",
      });
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
        exam_date: editExam.exam_date || undefined,
        pass_marks: passMarks,
        max_marks: maxMarks,
      };
      await updateExam.mutateAsync(updatePayload);
      
      toast({
        title: "Success",
        description: "Exam updated successfully",
      });
      
      resetEditExam();
      setSelectedExam(null);
      setIsEditExamOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update exam",
        variant: "destructive",
      });
    }
  };

  const handleDeleteExam = async () => {
    if (!selectedExam) return;

    try {
      await deleteExam.mutateAsync(selectedExam.exam_id);
      
      toast({
        title: "Success",
        description: "Exam deleted successfully",
      });
      
      setSelectedExam(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete exam",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (exam: CollegeExamRead) => {
    setSelectedExam(exam);
    setEditExam({ 
      exam_name: exam.exam_name,
      exam_date: exam.exam_date,
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
  const columns: ColumnDef<any>[] = useMemo(() => [
    createIconTextColumn<any>("exam_name", { 
      icon: Award, 
      header: "Exam Name" 
    }),
    createDateColumn<any>("exam_date", { 
      header: "Date", 
      fallback: "Not set" 
    }),
    createBadgeColumn<any>("pass_marks", { 
      header: "Pass Marks", 
      variant: "outline",
      fallback: "35 marks"
    }),
    createBadgeColumn<any>("max_marks", { 
      header: "Max Marks", 
      variant: "outline",
      fallback: "100 marks"
    }),
    createActionColumn<any>([
      createEditAction(handleEditClick),
      createDeleteAction(handleDeleteClick)
    ])
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
      <DataTableWithFilters
        data={exams}
        columns={columns}
        title="Exams"
        description="Manage academic exams and assessments"
        searchKey="exam_name"
        exportable={true}
        onAdd={() => setIsAddExamOpen(true)}
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
            <Label htmlFor="exam_date">Exam Date</Label>
            <Input
              id="exam_date"
              type="date"
              value={newExam.exam_date}
              onChange={(e) => updateNewExamField('exam_date', e.target.value)}
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
            <Label htmlFor="edit_exam_date">Exam Date</Label>
            <Input
              id="edit_exam_date"
              type="date"
              value={editExam.exam_date}
              onChange={(e) => updateEditExamField('exam_date', e.target.value)}
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