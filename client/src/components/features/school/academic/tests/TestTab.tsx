import { useState, useMemo, memo, useCallback } from "react";
import { FileText, Edit, Trash2 } from "lucide-react";
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
import { useCreateSchoolTest, useDeleteSchoolTest, useUpdateSchoolTest } from "@/lib/hooks/school";
import type { SchoolTestCreate, SchoolTestRead, SchoolTestUpdate } from "@/lib/types/school";

export interface TestTabProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  tests: SchoolTestRead[];
  setTests?: (tests: SchoolTestRead[]) => void; // optional when using mutations
  isLoading?: boolean;
  hasError?: boolean;
  errorMessage?: string;
}

// Initial form data
const initialTestFormData = { 
  test_name: "", 
  test_date: "", 
  pass_marks: "",
  max_marks: ""
};

const TestTabComponent = ({
  searchTerm,
  setSearchTerm,
  tests,
  setTests,
  isLoading = false,
  hasError = false,
  errorMessage,
}: TestTabProps) => {
  // Dialog states
  const [isAddTestOpen, setIsAddTestOpen] = useState(false);
  const [isEditTestOpen, setIsEditTestOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Selected test state
  const [selectedTest, setSelectedTest] = useState<SchoolTestRead | null>(null);

  // Hooks
  const { toast } = useToast();
  const createTest = useCreateSchoolTest();
  const updateTest = useUpdateSchoolTest(selectedTest?.test_id || 0);
  const deleteTest = useDeleteSchoolTest();
  
  // Using shared form state management for new test
  const {
    formData: newTest,
    setFormData: setNewTest,
    updateField: updateNewTestField,
    resetForm: resetNewTest,
  } = useFormState({
    initialData: initialTestFormData
  });
  
  // Using shared form state management for edit test
  const {
    formData: editTest,
    setFormData: setEditTest,
    updateField: updateEditTestField,
    resetForm: resetEditTest,
  } = useFormState({
    initialData: initialTestFormData
  });

  // Memoized validation functions
  const validateTestForm = useCallback((form: Partial<typeof initialTestFormData>) => {
    if (!form.test_name?.trim()) {
      toast({
        title: "Error",
        description: "Test name is required",
        variant: "destructive",
      });
      return false;
    }

    const passMarks = parseInt(form.pass_marks || "50");
    const maxMarks = parseInt(form.max_marks || "50");

    if (passMarks < 0 || maxMarks < 0) {
      toast({
        title: "Error",
        description: "Marks cannot be negative",
        variant: "destructive",
      });
      return false;
    }

    if (passMarks > maxMarks) {
      toast({
        title: "Error",
        description: "Pass marks cannot be greater than max marks",
        variant: "destructive",
      });
      return false;
    }

    return true;
  }, [toast]);

  // Memoized mutation handlers
  const handleCreateTest = useCallback(async () => {
    if (!validateTestForm(newTest)) return;

    try {
      const payload: SchoolTestCreate = {
        test_name: newTest.test_name!.trim(),
        test_date: newTest.test_date || "",
        pass_marks: parseInt(newTest.pass_marks || "50") || 50,
        max_marks: parseInt(newTest.max_marks || "50") || 50,
      };
      await createTest.mutateAsync(payload);
      
      resetNewTest();
      setIsAddTestOpen(false);
      // Toast handled by mutation hook
    } catch (error) {
      // Error toast is handled by mutation hook
    }
  }, [newTest, validateTestForm, createTest, resetNewTest]);

  const handleUpdateTest = useCallback(async () => {
    if (!validateTestForm(editTest) || !selectedTest) return;

    try {
      const updatePayload: SchoolTestUpdate = {
        test_name: editTest.test_name?.trim() || undefined,
        test_date: editTest.test_date || undefined,
        pass_marks: editTest.pass_marks !== "" && editTest.pass_marks !== undefined ? Number(editTest.pass_marks) : undefined,
        max_marks: editTest.max_marks !== "" && editTest.max_marks !== undefined ? Number(editTest.max_marks) : undefined,
      };
      await updateTest.mutateAsync(updatePayload);
      
      resetEditTest();
      setSelectedTest(null);
      setIsEditTestOpen(false);
      // Toast handled by mutation hook
    } catch (error) {
      // Error toast is handled by mutation hook
    }
  }, [editTest, selectedTest, validateTestForm, updateTest, resetEditTest]);

  const handleDeleteTest = useCallback(async () => {
    if (!selectedTest) return;

    try {
      await deleteTest.mutateAsync(selectedTest.test_id);
      
      setSelectedTest(null);
      setIsDeleteDialogOpen(false);
      // Toast handled by mutation hook
    } catch (error) {
      // Error toast is handled by mutation hook
    }
  }, [selectedTest, deleteTest]);

  // Memoized action handlers
  const handleEditClick = useCallback((test: SchoolTestRead) => {
    setSelectedTest(test);
    setEditTest({ 
      test_name: test.test_name,
      test_date: test.test_date,
      pass_marks: test.pass_marks?.toString() || "50",
      max_marks: test.max_marks?.toString() || "50"
    });
    setIsEditTestOpen(true);
  }, [setEditTest]);

  const handleDeleteClick = useCallback((test: SchoolTestRead) => {
    setSelectedTest(test);
    setIsDeleteDialogOpen(true);
  }, []);

  // Memoized columns definition
  const columns: ColumnDef<SchoolTestRead>[] = useMemo(() => [
    createIconTextColumn<SchoolTestRead>("test_name", { 
      icon: FileText, 
      header: "Test Name" 
    }),
    createDateColumn<SchoolTestRead>("test_date", { header: "Date", fallback: "Not set" }),
    createBadgeColumn<SchoolTestRead>("pass_marks", { 
      header: "Pass Marks", 
      variant: "outline",
      fallback: "50 marks"
    }),
    createBadgeColumn<SchoolTestRead>("max_marks", { 
      header: "Max Marks", 
      variant: "outline",
      fallback: "50 marks" 
    })
  ], []);

  // Memoized action button groups
  const actionButtonGroups = useMemo(() => [
    {
      type: 'edit' as const,
      onClick: handleEditClick
    },
    {
      type: 'delete' as const,
      onClick: handleDeleteClick
    }
  ], [handleEditClick, handleDeleteClick]);

  // Memoized dialog close handlers
  const closeAddDialog = useCallback(() => {
    setIsAddTestOpen(false);
    resetNewTest();
  }, [resetNewTest]);

  const closeEditDialog = useCallback(() => {
    setIsEditTestOpen(false);
    resetEditTest();
    setSelectedTest(null);
  }, [resetEditTest]);

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setSelectedTest(null);
  }, []);

  // Memoized empty state handler
  const handleCreateFirstTest = useCallback(() => {
    setIsAddTestOpen(true);
  }, []);

  if (hasError) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>{errorMessage || "Failed to load tests"}</p>
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

  // Show empty state if no tests
  if (!tests || tests.length === 0) {
    return (
      <div className="text-center p-8">
        <div className="space-y-4">
          <div className="text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No Tests Found</h3>
            <p className="text-sm">Get started by creating your first test.</p>
          </div>
          <button
            onClick={handleCreateFirstTest}
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Create First Test
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <EnhancedDataTable
        data={tests}
        columns={columns}
        title="Tests"
        searchKey="test_name"
        exportable={true}
        onAdd={() => setIsAddTestOpen(true)}
        addButtonText="Add Test"
        showActions={true}
        actionButtonGroups={actionButtonGroups}
        actionColumnHeader="Actions"
        showActionLabels={true}
      />

      {/* Add Test Dialog */}
      <FormDialog
        open={isAddTestOpen}
        onOpenChange={setIsAddTestOpen}
        title="Add New Test"
        description="Create a new academic test"
        onSave={handleCreateTest}
        onCancel={closeAddDialog}
        saveText="Create Test"
        cancelText="Cancel"
        disabled={createTest.isPending}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test_name">Test Name</Label>
            <Input
              id="test_name"
              value={newTest.test_name}
              onChange={(e) => updateNewTestField('test_name', e.target.value)}
              placeholder="Enter test name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="test_date">Test Date</Label>
            <Input
              id="test_date"
              type="date"
              value={newTest.test_date}
              onChange={(e) => updateNewTestField('test_date', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_marks">Max Marks</Label>
            <Input
              id="max_marks"
              type="number"
              value={newTest.max_marks}
              onChange={(e) => updateNewTestField('max_marks', e.target.value)}
              placeholder="Enter total marks"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pass_marks">Pass Marks</Label>
            <Input
              id="pass_marks"
              value={newTest.pass_marks}
              onChange={(e) => updateNewTestField('pass_marks', e.target.value)}
              placeholder="Enter pass marks"
            />
          </div>
        </div>
      </FormDialog>

      {/* Edit Test Dialog */}
      <FormDialog
        open={isEditTestOpen}
        onOpenChange={setIsEditTestOpen}
        title="Edit Test"
        description="Update test information"
        onSave={handleUpdateTest}
        onCancel={closeEditDialog}
        saveText="Update Test"
        cancelText="Cancel"
        disabled={updateTest.isPending}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit_test_name">Test Name</Label>
            <Input
              id="edit_test_name"
              value={editTest.test_name}
              onChange={(e) => updateEditTestField('test_name', e.target.value)}
              placeholder="Enter test name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_test_date">Test Date</Label>
            <Input
              id="edit_test_date"
              type="date"
              value={editTest.test_date}
              onChange={(e) => updateEditTestField('test_date', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_max_marks">Max Marks</Label>
            <Input
              id="edit_max_marks"
              type="number"
              value={editTest.max_marks}
              onChange={(e) => updateEditTestField('max_marks', e.target.value)}
              placeholder="Enter total marks"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_pass_marks">Pass Marks</Label>
            <Input
              id="edit_pass_marks"
              value={editTest.pass_marks}
              onChange={(e) => updateEditTestField('pass_marks', e.target.value)}
              placeholder="Enter pass marks"
            />
          </div>
        </div>
      </FormDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Test"
        description={`Are you sure you want to delete the test "${selectedTest?.test_name}"? This action cannot be undone.`}
        onConfirm={handleDeleteTest}
        onCancel={closeDeleteDialog}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};

export const TestTab = TestTabComponent;