import { useState, useMemo } from "react";
import { Award, Edit, Trash2, Calendar } from "lucide-react";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { Switch } from "@/common/components/ui/switch";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import { FormDialog, ConfirmDialog, DataTable } from "@/common/components/shared";
import type { ActionConfig } from "@/common/components/shared/DataTable/types";
import { useToast } from '@/common/hooks/use-toast';
import { useFormState } from "@/common/hooks";
import type { ColumnDef } from "@tanstack/react-table";
import { 
  createIconTextColumn, 
  createDateColumn, 
  createBadgeColumn
} from "@/common/utils/factory/columnFactories";
import { useCreateSchoolExam, useDeleteSchoolExam, useUpdateSchoolExam } from "@/features/school/hooks";
import type { SchoolExamCreate, SchoolExamRead, SchoolExamUpdate } from "@/features/school/types";
import { useCanViewUIComponent } from "@/core/permissions";
import { ExamScheduleDialog } from "./ExamScheduleDialog";

interface ExamsTabProps {
  exams: SchoolExamRead[];
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
  const createExam = useCreateSchoolExam();
  const deleteExam = useDeleteSchoolExam();
  const [isAddExamOpen, setIsAddExamOpen] = useState(false);
  const [isEditExamOpen, setIsEditExamOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const updateExam = useUpdateSchoolExam(selectedExam?.exam_id || 0);
  
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
      max_marks: "",
      weight_percentage: "",
      weightage_divider: "1",
      is_active: true
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
      max_marks: "",
      weight_percentage: "",
      weightage_divider: "1",
      is_active: true
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

    const weightPercentage = parseFloat(newExam.weight_percentage || "0");
    if (!weightPercentage || weightPercentage < 0.01 || weightPercentage > 100) {
      toast({
        title: "Error",
        description: "Weight percentage must be between 0.01 and 100",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload: SchoolExamCreate = {
        exam_name: newExam.exam_name.trim(),
        weight_percentage: weightPercentage,
        pass_marks: parseInt(newExam.pass_marks || "35") || 35,
        max_marks: parseInt(newExam.max_marks || "100") || 100,
        weightage_divider: parseInt(newExam.weightage_divider || "1") || 1,
        is_active: newExam.is_active ?? true,
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

    const weightPercentage = editExam.weight_percentage 
      ? parseFloat(editExam.weight_percentage) 
      : undefined;
    
    if (weightPercentage !== undefined && (weightPercentage < 0.01 || weightPercentage > 100)) {
      toast({
        title: "Error",
        description: "Weight percentage must be between 0.01 and 100",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatePayload: SchoolExamUpdate = {
        exam_name: editExam.exam_name?.trim() || undefined,
        weight_percentage: weightPercentage,
        pass_marks: passMarks,
        max_marks: maxMarks,
        weightage_divider: parseInt(editExam.weightage_divider || "1") || 1,
        is_active: editExam.is_active !== undefined ? editExam.is_active : undefined,
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

  const handleEditClick = (exam: SchoolExamRead) => {
    setSelectedExam(exam);
    setEditExam({ 
      exam_name: exam.exam_name,
      pass_marks: exam.pass_marks?.toString() || "35",
      max_marks: exam.max_marks?.toString() || "100",
      weight_percentage: exam.weight_percentage?.toString() || "",
      weightage_divider: exam.weightage_divider?.toString() || "1",
      is_active: exam.is_active ?? true
    });
    setIsEditExamOpen(true);
  };

  const handleDeleteClick = (exam: any) => {
    setSelectedExam(exam);
    setIsDeleteDialogOpen(true);
  };

  // Define columns for the data table using column factories
  const columns: ColumnDef<SchoolExamRead>[] = useMemo(() => [
    createIconTextColumn<SchoolExamRead>("exam_name", { 
      icon: Award, 
      header: "Exam Name" 
    }),
    {
      accessorKey: "weight_percentage",
      header: "Weight %",
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.original.weight_percentage}%</span>
      ),
    },
    {
      accessorKey: "weightage_divider",
      header: "Divider",
      cell: ({ row }) => (
        <span className="text-sm">{row.original.weightage_divider}</span>
      ),
    },
    createBadgeColumn<SchoolExamRead>("pass_marks", { 
      header: "Pass Marks", 
      variant: "outline",
      fallback: "35"
    }),
    createBadgeColumn<SchoolExamRead>("max_marks", { 
      header: "Max Marks", 
      variant: "outline",
      fallback: "100"
    }),
    {
      accessorKey: "is_active",
      header: "Status",
      cell: ({ row }: { row: { original: SchoolExamRead } }) => (
        <Badge variant={row.original.is_active ? "default" : "secondary"}>
          {row.original.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
  ], []);

  // Permission checks
  const canAddExam = useCanViewUIComponent("exams", "button", "exam-add");
  const canDeleteExam = useCanViewUIComponent("exams", "button", "exam-delete");
  const canManageSchedules = useCanViewUIComponent("exams", "button", "exam-schedule");

  const handleScheduleClick = (exam: SchoolExamRead) => {
    setSelectedExam(exam);
    setIsScheduleDialogOpen(true);
  };

  // Action configurations for DataTable V2
  const actions: ActionConfig<SchoolExamRead>[] = useMemo(() => {
    const acts: ActionConfig<SchoolExamRead>[] = [
      {
        id: "edit",
        label: "Edit",
        icon: Edit,
        onClick: (row) => handleEditClick(row)
      }
    ];
    
    if (canManageSchedules) {
      acts.push({
        id: "schedule",
        label: "Manage Schedules",
        icon: Calendar,
        // variant: 'outline', // Removed as it might conflict if not standard, default ghost is fine for actions usually, or specific if supported
        onClick: (row) => handleScheduleClick(row),
      });
    }
    
    if (canDeleteExam) {
      acts.push({
        id: "delete",
        label: "Delete",
        icon: Trash2,
        variant: "destructive",
        onClick: (row) => handleDeleteClick(row)
      });
    }
    
    return acts;
  }, [canDeleteExam, canManageSchedules]);

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
      <DataTable
        data={exams}
        columns={columns}
        title="Exams"
        searchKey="exam_name"
        searchPlaceholder="Search exams..."
        export={{ enabled: true, filename: "exams" }}
        onAdd={canAddExam ? () => setIsAddExamOpen(true) : undefined}
        addButtonText="Add Exam"
        actions={actions}
        actionsHeader="Actions"
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
            <Label htmlFor="pass_marks">Pass Marks</Label>
            <Input
              id="total_marks"
              type="number"
              value={newExam.pass_marks}
              onChange={(e) => updateNewExamField('pass_marks', e.target.value)}
              placeholder="Enter total marks"
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weight_percentage">Weight Percentage *</Label>
              <Input
                id="weight_percentage"
                type="number"
                step="0.01"
                min="0.01"
                max="100"
                value={newExam.weight_percentage}
                onChange={(e) => updateNewExamField('weight_percentage', e.target.value)}
                placeholder="e.g., 30.00"
              />
              <p className="text-xs text-muted-foreground">Must be between 0.01 and 100</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="weightage_divider">Weightage Divider *</Label>
              <Input
                id="weightage_divider"
                type="number"
                min="1"
                value={newExam.weightage_divider}
                onChange={(e) => updateNewExamField('weightage_divider', e.target.value)}
                placeholder="e.g., 1"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={newExam.is_active ?? true}
              onCheckedChange={(checked) => updateNewExamField('is_active', checked)}
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              Active
            </Label>
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
        disabled={updateExam.isPending}
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
            <Label htmlFor="edit_pass_marks">Pass Marks</Label>
            <Input
              id="edit_pass_marks"
              type="number"
              value={editExam.pass_marks}
              onChange={(e) => updateEditExamField('pass_marks', e.target.value)}
              placeholder="Enter pass marks"
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
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="edit_weight_percentage">Weight Percentage</Label>
              <Input
                id="edit_weight_percentage"
                type="number"
                step="0.01"
                min="0.01"
                max="100"
                value={editExam.weight_percentage}
                onChange={(e) => updateEditExamField('weight_percentage', e.target.value)}
                placeholder="e.g., 30.00"
              />
              <p className="text-xs text-muted-foreground">Must be between 0.01 and 100</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit_weightage_divider">Weightage Divider</Label>
              <Input
                id="edit_weightage_divider"
                type="number"
                min="1"
                value={editExam.weightage_divider}
                onChange={(e) => updateEditExamField('weightage_divider', e.target.value)}
                placeholder="e.g., 1"
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="edit_is_active"
              checked={editExam.is_active ?? true}
              onCheckedChange={(checked) => updateEditExamField('is_active', checked)}
            />
            <Label htmlFor="edit_is_active" className="cursor-pointer">
              Active
            </Label>
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

      {/* Exam Schedule Dialog */}
      {selectedExam && (
        <ExamScheduleDialog
          open={isScheduleDialogOpen}
          onOpenChange={setIsScheduleDialogOpen}
          examId={selectedExam.exam_id}
          examName={selectedExam.exam_name}
        />
      )}
    </div>
  );
};