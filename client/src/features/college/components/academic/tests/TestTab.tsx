import { useState, useMemo, useCallback } from "react";
import { FileText, Edit as EditIcon, Trash2, AlertTriangle } from "lucide-react";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { DatePicker } from "@/common/components/ui/date-picker";
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
import { useCreateCollegeTest, useDeleteCollegeTest, useUpdateCollegeTest } from "@/features/college/hooks";
import type { CollegeTestCreate, CollegeTestRead, CollegeTestUpdate } from "@/features/college/types";

export interface TestTabProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  tests: CollegeTestRead[];
  setTests?: (tests: CollegeTestRead[]) => void; // optional when using mutations
  isLoading?: boolean;
  hasError?: boolean;
  errorMessage?: string;
}

export const TestTab = ({
  searchTerm,
  setSearchTerm,
  tests,
  setTests,
  isLoading = false,
  hasError = false,
  errorMessage,
}: TestTabProps) => {
  const createTest = useCreateCollegeTest();
  const [selectedTest, setSelectedTest] = useState<CollegeTestRead | null>(null);
  const updateTest = useUpdateCollegeTest();
  const deleteTest = useDeleteCollegeTest();
  const [isAddTestOpen, setIsAddTestOpen] = useState(false);
  const [isEditTestOpen, setIsEditTestOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Using shared form state management for new test
  const {
    formData: newTest,
    setFormData: setNewTest,
    updateField: updateNewTestField,
    resetForm: resetNewTest,
  } = useFormState({
    initialData: {
      test_name: "",
      test_date: "",
      pass_marks: "",
      max_marks: ""
    }
  });

  // Using shared form state management for edit test
  const {
    formData: editTest,
    setFormData: setEditTest,
    updateField: updateEditTestField,
    resetForm: resetEditTest,
  } = useFormState({
    initialData: {
      test_name: "",
      test_date: "",
      pass_marks: "",
      max_marks: ""
    }
  });

  const { toast } = useToast();

  const handleCreateTest = async () => {
    if (!newTest.test_name?.trim()) {
      toast({
        title: "Error",
        description: "Test name is required",
        variant: "destructive",
      });
      return;
    }

    // Validate test date
    if (!newTest.test_date?.trim()) {
      toast({
        title: "Error",
        description: "Test date is required",
        variant: "destructive",
      });
      return;
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(newTest.test_date)) {
      toast({
        title: "Error",
        description: "Test date must be in YYYY-MM-DD format",
        variant: "destructive",
      });
      return;
    }

    // Validate max marks
    const maxMarksStr = newTest.max_marks?.trim() || "";
    if (!maxMarksStr) {
      toast({
        title: "Error",
        description: "Max marks is required",
        variant: "destructive",
      });
      return;
    }

    const maxMarks = parseInt(maxMarksStr, 10);
    if (isNaN(maxMarks) || maxMarks <= 0) {
      toast({
        title: "Error",
        description: "Max marks must be a positive number",
        variant: "destructive",
      });
      return;
    }

    // Validate pass marks
    const passMarksStr = newTest.pass_marks?.trim() || "";
    if (!passMarksStr) {
      toast({
        title: "Error",
        description: "Pass marks is required",
        variant: "destructive",
      });
      return;
    }

    const passMarks = parseInt(passMarksStr, 10);
    if (isNaN(passMarks) || passMarks < 0) {
      toast({
        title: "Error",
        description: "Pass marks must be a non-negative number",
        variant: "destructive",
      });
      return;
    }

    if (passMarks > maxMarks) {
      toast({
        title: "Error",
        description: "Pass marks cannot be greater than max marks",
        variant: "destructive",
      });
      return;
    }

    try {
      const payload: CollegeTestCreate = {
        test_name: newTest.test_name.trim(),
        test_date: newTest.test_date.trim(),
        pass_marks: passMarks,
        max_marks: maxMarks,
      };
      await createTest.mutateAsync(payload);

      resetNewTest();
      setIsAddTestOpen(false);
      // Toast handled by mutation hook
    } catch (error) {
      // Error toast is handled by mutation hook
      console.error("Error creating test:", error);
    }
  };

  const handleUpdateTest = async () => {
    console.log("DEBUG: handleUpdateTest called");
    console.log("DEBUG: selectedTest:", selectedTest);
    if (!selectedTest) {
      console.error("DEBUG: selectedTest is null/undefined");
      return;
    }
    console.log("DEBUG: selectedTest.test_id:", selectedTest.test_id);

    // Validate test name
    if (!editTest.test_name?.trim()) {
      toast({
        title: "Error",
        description: "Test name is required",
        variant: "destructive",
      });
      return;
    }

    // Validate test date
    if (!editTest.test_date?.trim()) {
      toast({
        title: "Error",
        description: "Test date is required",
        variant: "destructive",
      });
      return;
    }

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(editTest.test_date)) {
      toast({
        title: "Error",
        description: "Test date must be in YYYY-MM-DD format",
        variant: "destructive",
      });
      return;
    }

    // Validate max marks
    const maxMarksStr = editTest.max_marks?.toString().trim() || "";
    if (!maxMarksStr) {
      toast({
        title: "Error",
        description: "Max marks is required",
        variant: "destructive",
      });
      return;
    }

    const maxMarks = parseInt(maxMarksStr, 10);
    if (isNaN(maxMarks) || maxMarks <= 0) {
      toast({
        title: "Error",
        description: "Max marks must be a positive number",
        variant: "destructive",
      });
      return;
    }

    // Validate pass marks
    const passMarksStr = editTest.pass_marks?.toString().trim() || "";
    if (!passMarksStr) {
      toast({
        title: "Error",
        description: "Pass marks is required",
        variant: "destructive",
      });
      return;
    }

    const passMarks = parseInt(passMarksStr, 10);
    if (isNaN(passMarks) || passMarks < 0) {
      toast({
        title: "Error",
        description: "Pass marks must be a non-negative number",
        variant: "destructive",
      });
      return;
    }

    if (passMarks > maxMarks) {
      toast({
        title: "Error",
        description: "Pass marks cannot be greater than max marks",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatePayload: CollegeTestUpdate = {
        test_name: editTest.test_name?.trim() || undefined,
        test_date: editTest.test_date?.trim() || undefined,
        pass_marks: passMarks,
        max_marks: maxMarks,
      };

      await updateTest.mutateAsync({
        testId: selectedTest.test_id,
        payload: updatePayload
      });

      resetEditTest();
      setSelectedTest(null);
      setIsEditTestOpen(false);
      // Toast handled by mutation hook
    } catch (error) {
      // Error toast is handled by mutation hook
    }
  };

  const handleDeleteTest = async () => {
    if (!selectedTest) return;

    try {
      await deleteTest.mutateAsync(selectedTest.test_id);

      setSelectedTest(null);
      setIsDeleteDialogOpen(false);
      // Toast handled by mutation hook
    } catch (error) {
      // Error toast is handled by mutation hook
    }
  };

  const handleEditClick = useCallback((test: CollegeTestRead) => {
    setSelectedTest(test);
    setEditTest({
      test_name: test.test_name,
      test_date: test.test_date || "",
      pass_marks: test.pass_marks?.toString() || "50",
      max_marks: test.max_marks?.toString() || "50"
    });
    setIsEditTestOpen(true);
  }, [setEditTest]);

  const handleDeleteClick = useCallback((test: CollegeTestRead) => {
    setSelectedTest(test);
    setIsDeleteDialogOpen(true);
  }, []);

  // Define columns for the data table using column factories
  const columns: ColumnDef<CollegeTestRead>[] = useMemo(() => [
    createIconTextColumn<CollegeTestRead>("test_name", {
      icon: FileText,
      header: "Test Name"
    }),
    createDateColumn<CollegeTestRead>("test_date", { header: "Date", fallback: "Not set" }),
    createBadgeColumn<CollegeTestRead>("pass_marks", {
      header: "Pass Marks",
      variant: "outline",
      fallback: "50 marks"
    }),
    createBadgeColumn<CollegeTestRead>("max_marks", {
      header: "Max Marks",
      variant: "outline",
      fallback: "50 marks"
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
        <p className="text-red-700 font-bold">{errorMessage || "Failed to load tests"}</p>
        <p className="text-red-500 text-sm mt-1">Please refresh or contact administration</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DataTable
        data={tests}
        columns={columns}
        title="Diagnostic Evaluations (Tests)"
        searchKey="test_name"
        searchPlaceholder="Locate assessment record..."
        loading={isLoading}
        onAdd={() => setIsAddTestOpen(true)}
        addButtonText="Register New Test"
        actions={actions}
        export={{ enabled: true, filename: 'college_tests_list' }}
      />

      {/* Add Test Dialog */}
      <FormDialog
        open={isAddTestOpen}
        onOpenChange={setIsAddTestOpen}
        title="Add New Test"
        description="Create a new academic test"
        onSave={handleCreateTest}
        onCancel={() => {
          setIsAddTestOpen(false);
          resetNewTest();
        }}
        saveText="Create Test"
        cancelText="Cancel"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="test_name">Test Name</Label>
            <Input
              id="test_name"
              value={newTest.test_name}
              onChange={(e) => updateNewTestField('test_name', e.target.value)}
              placeholder="Enter test name"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="test_date">Test Date</Label>
            <DatePicker
              id="test_date"
              value={newTest.test_date}
              onChange={(value) => updateNewTestField('test_date', value)}
              placeholder="Select test date"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_marks">Max Marks</Label>
            <Input
              id="max_marks"
              type="number"
              min="1"
              value={newTest.max_marks}
              onChange={(e) => updateNewTestField('max_marks', e.target.value)}
              placeholder="Enter total marks"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pass_marks">Pass Marks</Label>
            <Input
              id="pass_marks"
              type="number"
              min="0"
              value={newTest.pass_marks}
              onChange={(e) => updateNewTestField('pass_marks', e.target.value)}
              placeholder="Enter pass marks"
              required
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
        onCancel={() => {
          setIsEditTestOpen(false);
          resetEditTest();
          setSelectedTest(null);
        }}
        saveText="Update Test"
        cancelText="Cancel"
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
            <DatePicker
              id="edit_test_date"
              value={editTest.test_date}
              onChange={(value) => updateEditTestField('test_date', value)}
              placeholder="Select test date"
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
              type="number"
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
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setSelectedTest(null);
        }}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
};