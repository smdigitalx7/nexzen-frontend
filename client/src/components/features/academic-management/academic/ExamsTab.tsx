import { useState, useMemo } from "react";
import { Plus, Award, Edit, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  createTruncatedTextColumn,
  createActionColumn,
  createEditAction,
  createDeleteAction
} from "@/lib/utils/columnFactories.tsx";

interface ExamsTabProps {
  exams: any[];
  setExams: (exams: any[]) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isLoading?: boolean;
  hasError?: boolean;
  errorMessage?: string;
}

export const ExamsTab = ({
  exams,
  setExams,
  searchTerm,
  setSearchTerm,
  isLoading = false,
  hasError = false,
  errorMessage,
}: ExamsTabProps) => {
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [isEditExamOpen, setIsEditExamOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  
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
      description: "",
      total_marks: ""
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
      description: "",
      total_marks: ""
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

    try {
      const examData = {
        id: Date.now(),
        exam_name: newExam.exam_name.trim(),
        exam_date: newExam.exam_date || "",
        description: newExam.description?.trim() || "",
        total_marks: parseInt(newExam.total_marks || "100") || 100,
        created_at: new Date().toISOString(),
      };
      
      setExams([...exams, examData]);
      
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

    try {
      const updatedExams = exams.map(exam => 
        exam.id === selectedExam.id 
          ? {
              ...exam,
              exam_name: editExam.exam_name?.trim() || "",
              exam_date: editExam.exam_date || "",
              description: editExam.description?.trim() || "",
              total_marks: parseInt(editExam.total_marks || "100") || 100,
            }
          : exam
      );
      
      setExams(updatedExams);
      
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
      const updatedExams = exams.filter(exam => exam.id !== selectedExam.id);
      setExams(updatedExams);
      
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

  const handleEditClick = (exam: any) => {
    setSelectedExam(exam);
    setEditExam({ 
      exam_name: exam.exam_name,
      exam_date: exam.exam_date,
      description: exam.description || "",
      total_marks: exam.total_marks?.toString() || "100"
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
    createBadgeColumn<any>("total_marks", { 
      header: "Total Marks", 
      variant: "outline",
      fallback: "100 marks"
    }),
    createTruncatedTextColumn<any>("description", { 
      header: "Description", 
      fallback: "No description" 
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
            <Label htmlFor="total_marks">Total Marks</Label>
            <Input
              id="total_marks"
              type="number"
              value={newExam.total_marks}
              onChange={(e) => updateNewExamField('total_marks', e.target.value)}
              placeholder="Enter total marks"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={newExam.description}
              onChange={(e) => updateNewExamField('description', e.target.value)}
              placeholder="Enter description"
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
            <Label htmlFor="edit_total_marks">Total Marks</Label>
            <Input
              id="edit_total_marks"
              type="number"
              value={editExam.total_marks}
              onChange={(e) => updateEditExamField('total_marks', e.target.value)}
              placeholder="Enter total marks"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_description">Description</Label>
            <Input
              id="edit_description"
              value={editExam.description}
              onChange={(e) => updateEditExamField('description', e.target.value)}
              placeholder="Enter description"
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