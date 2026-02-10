import { useState, memo, useMemo, useCallback } from "react";
import { BookOpen, Edit as EditIcon, AlertTriangle } from "lucide-react";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { FormDialog } from "@/common/components/shared";
import { DataTable } from "@/common/components/shared/DataTable";
import { useUpdateCollegeClass, useCreateCollegeClass } from "@/features/college/hooks";
import { useToast } from '@/common/hooks/use-toast';
import type { ColumnDef } from "@tanstack/react-table";
import {
  createIconTextColumn
} from "@/common/utils/factory/columnFactories";
import type { CollegeClassResponse } from "@/features/college/types";

interface ClassesTabProps {
  classesWithSubjects: CollegeClassResponse[];
  classesLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  hasError?: boolean;
  errorMessage?: string;
}

export const ClassesTab = memo(({
  classesWithSubjects,
  classesLoading,
  searchTerm,
  setSearchTerm,
  hasError = false,
  errorMessage,
}: ClassesTabProps) => {
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isEditClassOpen, setIsEditClassOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<import("@/features/college/types").CollegeClassResponse | null>(null);
  const [newClass, setNewClass] = useState({ class_name: "" });
  const [editClass, setEditClass] = useState({ class_name: "" });

  const { toast } = useToast();
  const createClassMutation = useCreateCollegeClass();
  const updateClassMutation = useUpdateCollegeClass(selectedClass?.class_id || 0);

  const handleCreateClass = async () => {
    if (!newClass.class_name.trim()) {
      toast({
        title: "Error",
        description: "Class name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await createClassMutation.mutateAsync({
        class_name: newClass.class_name.trim(),
      });
      
      setNewClass({ class_name: "" });
      setIsAddClassOpen(false);
      // Toast handled by mutation hook
    } catch (error) {
      // Error toast is handled by mutation hook
    }
  };

  const handleUpdateClass = async () => {
    if (!editClass.class_name.trim() || !selectedClass) {
      toast({
        title: "Error",
        description: "Class name is required",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateClassMutation.mutateAsync({ class_name: editClass.class_name.trim() });
      
      setEditClass({ class_name: "" });
      setSelectedClass(null);
      setIsEditClassOpen(false);
      // Toast handled by mutation hook
    } catch (error) {
      // Error toast is handled by mutation hook
    }
  };

  const handleEditClick = useCallback((classItem: import("@/features/college/types").CollegeClassResponse) => {
    setSelectedClass(classItem);
    setEditClass({ class_name: classItem.class_name });
    setIsEditClassOpen(true);
  }, []);

  // Define columns for the data table
  const columns: ColumnDef<any>[] = useMemo(() => [
    createIconTextColumn<any>("class_name", { header: "Class Name", icon: BookOpen })
  ], []);

  // Only edit action – backend does not support delete for college classes
  const actions: import("@/common/components/shared/DataTable/types").ActionConfig<any>[] = useMemo(
    () => [
      {
        id: "edit",
        label: "Edit",
        icon: (props) => <EditIcon className={props.className} />,
        onClick: (row) => handleEditClick(row),
      },
    ],
    [handleEditClick],
  );

  if (hasError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 bg-white rounded-3xl border border-red-100">
        <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center mb-4">
           <AlertTriangle className="h-6 w-6 text-red-600" />
        </div>
        <p className="text-red-700 font-bold">{errorMessage || "Failed to load classes"}</p>
        <p className="text-red-500 text-sm mt-1">Please refresh or contact administration</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DataTable
        data={classesWithSubjects}
        columns={columns}
        title="Institutional Classes"
        searchKey="class_name"
        searchPlaceholder="Locate class registry..."
        loading={classesLoading}
        onAdd={() => setIsAddClassOpen(true)}
        addButtonText="Create New Class"
        actions={actions}
        export={{ enabled: true, filename: 'college_classes_list' }}
      />

      {/* Add Class Dialog */}
      <FormDialog
        open={isAddClassOpen}
        onOpenChange={setIsAddClassOpen}
        title="Add New Class"
        description="Create a new academic class"
        onSave={handleCreateClass}
        onCancel={() => {
          setIsAddClassOpen(false);
          setNewClass({ class_name: "" });
        }}
        saveText="Create Class"
        cancelText="Cancel"
        disabled={createClassMutation.isPending}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="class_name">Class Name</Label>
            <Input
              id="class_name"
              value={newClass.class_name}
              onChange={(e) => setNewClass({ class_name: e.target.value })}
              placeholder="Enter class name"
            />
          </div>
        </div>
      </FormDialog>

      {/* Edit Class Dialog */}
      <FormDialog
        open={isEditClassOpen}
        onOpenChange={setIsEditClassOpen}
        title="Edit Class"
        description="Update class information"
        onSave={handleUpdateClass}
        onCancel={() => {
          setIsEditClassOpen(false);
          setEditClass({ class_name: "" });
          setSelectedClass(null);
        }}
        saveText="Update Class"
        cancelText="Cancel"
        disabled={updateClassMutation.isPending}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit_class_name">Class Name</Label>
            <Input
              id="edit_class_name"
              value={editClass.class_name}
              onChange={(e) => setEditClass({ class_name: e.target.value })}
              placeholder="Enter class name"
            />
          </div>
        </div>
      </FormDialog>

    </div>
  );
});