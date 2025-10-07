import { useState, useMemo } from "react";
import { Plus, FileText, Edit, Trash2 } from "lucide-react";
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
  createTextColumn, 
  createBadgeColumn, 
  createTruncatedTextColumn,
  createActionColumn,
  createEditAction,
  createDeleteAction
} from "@/lib/utils/columnFactories.tsx";

export interface TestTabProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  tests: any[];
  setTests: (tests: any[]) => void;
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
  const [isAddTestOpen, setIsAddTestOpen] = useState(false);
  const [isEditTestOpen, setIsEditTestOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<any>(null);
  
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
      description: "",
      total_marks: ""
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
      description: "",
      total_marks: ""
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
      const testData = {
        id: Date.now(),
        test_name: newTest.test_name.trim(),
        test_date: newTest.test_date || "",
        description: newTest.description?.trim() || "",
        total_marks: parseInt(newTest.total_marks || "50") || 50,
        created_at: new Date().toISOString(),
      };
      
      setTests([...tests, testData]);
      
      toast({
        title: "Success",
        description: "Test created successfully",
      });
      
      resetNewTest();
      setIsAddTestOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create test",
        variant: "destructive",
      });
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
      const updatedTests = tests.map(test => 
        test.id === selectedTest.id 
          ? {
              ...test,
              test_name: editTest.test_name?.trim() || "",
              test_date: editTest.test_date || "",
              description: editTest.description?.trim() || "",
              total_marks: parseInt(editTest.total_marks || "50") || 50,
            }
          : test
      );
      
      setTests(updatedTests);
      
      toast({
        title: "Success",
        description: "Test updated successfully",
      });
      
      resetEditTest();
      setSelectedTest(null);
      setIsEditTestOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update test",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTest = async () => {
    if (!selectedTest) return;

    try {
      const updatedTests = tests.filter(test => test.id !== selectedTest.id);
      setTests(updatedTests);
      
      toast({
        title: "Success",
        description: "Test deleted successfully",
      });
      
      setSelectedTest(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete test",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (test: any) => {
    setSelectedTest(test);
    setEditTest({ 
      test_name: test.test_name,
      test_date: test.test_date,
      description: test.description || "",
      total_marks: test.total_marks?.toString() || "50"
    });
    setIsEditTestOpen(true);
  };

  const handleDeleteClick = (test: any) => {
    setSelectedTest(test);
    setIsDeleteDialogOpen(true);
  };

  // Define columns for the data table using column factories
  const columns: ColumnDef<any>[] = useMemo(() => [
    createIconTextColumn<any>("test_name", { 
      icon: FileText, 
      header: "Test Name" 
    }),
    createTextColumn<any>("test_date", { 
      header: "Date", 
      fallback: "Not set" 
    }),
    createBadgeColumn<any>("total_marks", { 
      header: "Total Marks", 
      variant: "outline",
      fallback: "50 marks"
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

  return (
    <div className="space-y-4">
      <DataTableWithFilters
        data={tests}
        columns={columns}
        title="Tests"
        description="Manage academic tests and assessments"
        searchKey="test_name"
        exportable={true}
        onAdd={() => setIsAddTestOpen(true)}
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
            <Input
              id="test_date"
              type="date"
              value={newTest.test_date}
              onChange={(e) => updateNewTestField('test_date', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="total_marks">Total Marks</Label>
            <Input
              id="total_marks"
              type="number"
              value={newTest.total_marks}
              onChange={(e) => updateNewTestField('total_marks', e.target.value)}
              placeholder="Enter total marks"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={newTest.description}
              onChange={(e) => updateNewTestField('description', e.target.value)}
              placeholder="Enter description"
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
            <Input
              id="edit_test_date"
              type="date"
              value={editTest.test_date}
              onChange={(e) => updateEditTestField('test_date', e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_total_marks">Total Marks</Label>
            <Input
              id="edit_total_marks"
              type="number"
              value={editTest.total_marks}
              onChange={(e) => updateEditTestField('total_marks', e.target.value)}
              placeholder="Enter total marks"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_description">Description</Label>
            <Input
              id="edit_description"
              value={editTest.description}
              onChange={(e) => updateEditTestField('description', e.target.value)}
              placeholder="Enter description"
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