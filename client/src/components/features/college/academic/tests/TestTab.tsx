import { useState, useMemo } from "react";
import { FileText, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
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
import { useCreateCollegeTest, useDeleteCollegeTest, useUpdateCollegeTest } from "@/lib/hooks/college";
import type { CollegeTestCreate, CollegeTestRead, CollegeTestUpdate } from "@/lib/types/college";

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
  // Debug: Log test data
  // removed debug log
  const createTest = useCreateCollegeTest();
  const [selectedTest, setSelectedTest] = useState<CollegeTestRead | null>(null);
  const updateTest = useUpdateCollegeTest(selectedTest?.test_id || 0);
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

    try {
      const payload: CollegeTestCreate = {
        test_name: newTest.test_name.trim(),
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
  };

  const handleUpdateTest = async () => {
    if (!editTest.test_name?.trim() || !selectedTest) {
      toast({
        title: "Error",
        description: "Test name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      const updatePayload: CollegeTestUpdate = {
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

  const handleEditClick = (test: CollegeTestRead) => {
    setSelectedTest(test);
    setEditTest({ 
      test_name: test.test_name,
      test_date: test.test_date,
      pass_marks: test.pass_marks?.toString() || "50",
      max_marks: test.max_marks?.toString() || "50"
    });
    setIsEditTestOpen(true);
  };

  const handleDeleteClick = (test: CollegeTestRead) => {
    setSelectedTest(test);
    setIsDeleteDialogOpen(true);
  };

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

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(() => [
    {
      type: 'edit' as const,
      onClick: (row: CollegeTestRead) => handleEditClick(row)
    },
    {
      type: 'delete' as const,
      onClick: (row: CollegeTestRead) => handleDeleteClick(row)
    }
  ], []);

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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="test_date">Test Date</Label>
            <DatePicker
              id="test_date"
              value={newTest.test_date}
              onChange={(value) => updateNewTestField('test_date', value)}
              placeholder="Select test date"
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
              type="number"
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