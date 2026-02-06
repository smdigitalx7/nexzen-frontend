import { useState, useMemo, useCallback } from "react";
import { Award, Edit as EditIcon, Trash2, AlertTriangle } from "lucide-react";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { FormDialog, ConfirmDialog } from "@/common/components/shared";
import { DataTable } from "@/common/components/shared/DataTable";
import { useToast } from '@/common/hooks/use-toast';
import { useFormState } from "@/common/hooks";
import type { ColumnDef } from "@tanstack/react-table";
import { 
  createIconTextColumn, 
  createDateColumn, 
  createBadgeColumn
} from "@/common/utils/factory/columnFactories";
import { useCreateCollegeExam, useDeleteCollegeExam, useUpdateCollegeExam } from "@/features/college/hooks";
import type { CollegeExamCreate, CollegeExamRead, CollegeExamUpdate } from "@/features/college/types";

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

  const handleEditClick = useCallback((exam: CollegeExamRead) => {
    setSelectedExam(exam);
    setEditExam({ 
      exam_name: exam.exam_name,
      pass_marks: exam.pass_marks?.toString() || "35",
      max_marks: exam.max_marks?.toString() || "100"
    });
    setIsEditExamOpen(true);
  }, []);

  const handleDeleteClick = useCallback((exam: any) => {
    setSelectedExam(exam);
    setIsDeleteDialogOpen(true);
  }, []);

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

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white rounded-3xl border border-red-100">
        <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
           <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <p className="text-red-700 font-bold">{errorMessage || "Failed to load exams"}</p>
        <p className="text-red-500 text-sm mt-1">Please refresh or contact administration</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DataTable
        data={exams}
        columns={columns}
        title="Summative Assessments (Exams)"
        searchKey="exam_name"
        searchPlaceholder="Locate examination record..."
        loading={isLoading}
        onAdd={() => setIsAddExamOpen(true)}
        addButtonText="Schedule New Exam"
        actions={actions}
        export={{ enabled: true, filename: 'college_exams_list' }}
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