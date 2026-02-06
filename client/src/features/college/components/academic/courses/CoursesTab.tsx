import { useState, memo, useMemo, useCallback } from "react";
import { GraduationCap, Edit as EditIcon, Trash2, AlertTriangle } from "lucide-react";
import { Input } from "@/common/components/ui/input";
import { Label } from "@/common/components/ui/label";
import { FormDialog, ConfirmDialog } from "@/common/components/shared";
import { DataTable } from "@/common/components/shared/DataTable";
import { useCollegeCourses, useUpdateCollegeCourse, useCreateCollegeCourse, useDeleteCollegeCourse } from '@/features/college/hooks';
import { useToast } from '@/common/hooks/use-toast';
import type { ColumnDef } from "@tanstack/react-table";
import {
  createIconTextColumn
} from "@/common/utils/factory/columnFactories";
import { CollegeGroupDropdown } from "@/common/components/shared/Dropdowns/College/GroupDropdown";

interface CoursesTabProps {
  coursesWithSubjects: any[];
  coursesLoading: boolean;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  hasError?: boolean;
  errorMessage?: string;
}

export const CoursesTab = memo(({
  coursesWithSubjects,
  coursesLoading,
  searchTerm,
  setSearchTerm,
  hasError = false,
  errorMessage,
}: CoursesTabProps) => {
  const [isAddCourseOpen, setIsAddCourseOpen] = useState(false);
  const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<import("@/features/college/types").CollegeCourseResponse | null>(null);
  const [newCourse, setNewCourse] = useState({ course_name: "", course_fee: 0, group_id: 0 });
  const [editCourse, setEditCourse] = useState({ course_name: "", course_fee: 0, group_id: 0 });

  const { toast } = useToast();
  const createCourseMutation = useCreateCollegeCourse();
  const updateCourseMutation = useUpdateCollegeCourse(selectedCourse?.course_id || 0);
  const deleteCourseMutation = useDeleteCollegeCourse();
  

  const handleCreateCourse = async () => {
    if (!newCourse.course_name.trim()) {
      toast({
        title: "Error",
        description: "Course name is required",
        variant: "destructive",
      });
      return;
    }

    if (newCourse.course_fee < 0) {
      toast({
        title: "Error",
        description: "Course fee cannot be negative",
        variant: "destructive",
      });
      return;
    }

    if (newCourse.group_id <= 0) {
      toast({
        title: "Error",
        description: "Please select a valid group",
        variant: "destructive",
      });
      return;
    }

    try {
      await createCourseMutation.mutateAsync({
        course_name: newCourse.course_name.trim(),
        course_fee: newCourse.course_fee,
        group_id: newCourse.group_id,
      });
      
      setNewCourse({ course_name: "", course_fee: 0, group_id: 0 });
      setIsAddCourseOpen(false);
      // Toast handled by mutation hook
    } catch (error) {
      // Error toast is handled by mutation hook
    }
  };

  const handleUpdateCourse = async () => {
    if (!editCourse.course_name.trim() || !selectedCourse) {
      toast({
        title: "Error",
        description: "Course name is required",
        variant: "destructive",
      });
      return;
    }

    if (editCourse.course_fee < 0) {
      toast({
        title: "Error",
        description: "Course fee cannot be negative",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateCourseMutation.mutateAsync({ 
        course_name: editCourse.course_name.trim(),
        course_fee: editCourse.course_fee,
      });
      
      setEditCourse({ course_name: "", course_fee: 0, group_id: 0 });
      setSelectedCourse(null);
      setIsEditCourseOpen(false);
      // Toast handled by mutation hook
    } catch (error) {
      // Error toast is handled by mutation hook
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;

    try {
      await deleteCourseMutation.mutateAsync(selectedCourse.course_id);
      
      setSelectedCourse(null);
      setIsDeleteDialogOpen(false);
      // Toast handled by mutation hook
    } catch (error) {
      // Error toast is handled by mutation hook
    }
  };

  const handleEditClick = useCallback((courseItem: import("@/features/college/types").CollegeCourseResponse) => {
    setSelectedCourse(courseItem);
    setEditCourse({ 
      course_name: courseItem.course_name, 
      course_fee: courseItem.course_fee,
      group_id: 0 // Note: group_id is not in the response, would need to be fetched separately
    });
    setIsEditCourseOpen(true);
  }, []);

  const handleDeleteClick = useCallback((courseItem: any) => {
    setSelectedCourse(courseItem);
    setIsDeleteDialogOpen(true);
  }, []);

  // Define columns for the data table
  const columns: ColumnDef<any>[] = useMemo(() => [
    createIconTextColumn<any>("course_name", { header: "Course Name", icon: GraduationCap }),
    {
      accessorKey: "course_fee",
      header: "Course Fee",
      cell: ({ row }: any) => `₹${row.getValue("course_fee")}`,
    }
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
        <p className="text-red-700 font-bold">{errorMessage || "Failed to load courses"}</p>
        <p className="text-red-500 text-sm mt-1">Please refresh or contact administration</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DataTable
        data={coursesWithSubjects}
        columns={columns}
        title="Institutional Courses"
        searchKey="course_name"
        searchPlaceholder="Locate curriculum repository..."
        loading={coursesLoading}
        onAdd={() => setIsAddCourseOpen(true)}
        addButtonText="Create New Course"
        actions={actions}
        export={{ enabled: true, filename: 'college_courses_list' }}
      />

      {/* Add Course Dialog */}
      <FormDialog
        open={isAddCourseOpen}
        onOpenChange={setIsAddCourseOpen}
        title="Add New Course"
        description="Create a new academic course"
        onSave={handleCreateCourse}
        onCancel={() => {
          setIsAddCourseOpen(false);
          setNewCourse({ course_name: "", course_fee: 0, group_id: 0 });
        }}
        saveText="Create Course"
        cancelText="Cancel"
        disabled={createCourseMutation.isPending}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="course_name">Course Name</Label>
            <Input
              id="course_name"
              value={newCourse.course_name}
              onChange={(e) => setNewCourse({ ...newCourse, course_name: e.target.value })}
              placeholder="Enter course name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="course_fee">Course Fee</Label>
            <Input
              id="course_fee"
              type="number"
              min="0"
              step="0.01"
              value={newCourse.course_fee}
              onChange={(e) => setNewCourse({ ...newCourse, course_fee: parseFloat(e.target.value) || 0 })}
              placeholder="Enter course fee"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="group_id">Group ID</Label>
            <CollegeGroupDropdown
              value={newCourse.group_id > 0 ? newCourse.group_id : null}
              onChange={(value) => setNewCourse({ ...newCourse, group_id: value ?? 0 })}
              placeholder="Select group"
              required
            />
          </div>
        </div>
      </FormDialog>

      {/* Edit Course Dialog */}
      <FormDialog
        open={isEditCourseOpen}
        onOpenChange={setIsEditCourseOpen}
        title="Edit Course"
        description="Update course information"
        onSave={handleUpdateCourse}
        onCancel={() => {
          setIsEditCourseOpen(false);
          setEditCourse({ course_name: "", course_fee: 0, group_id: 0 });
          setSelectedCourse(null);
        }}
        saveText="Update Course"
        cancelText="Cancel"
        disabled={updateCourseMutation.isPending}
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit_course_name">Course Name</Label>
            <Input
              id="edit_course_name"
              value={editCourse.course_name}
              onChange={(e) => setEditCourse({ ...editCourse, course_name: e.target.value })}
              placeholder="Enter course name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_course_fee">Course Fee</Label>
            <Input
              id="edit_course_fee"
              type="number"
              min="0"
              step="0.01"
              value={editCourse.course_fee}
              onChange={(e) => setEditCourse({ ...editCourse, course_fee: parseFloat(e.target.value) || 0 })}
              placeholder="Enter course fee"
            />
          </div>
        </div>
      </FormDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Course"
        description={`Are you sure you want to delete the course "${selectedCourse?.course_name}"? This action cannot be undone.`}
        onConfirm={handleDeleteCourse}
        onCancel={() => {
          setIsDeleteDialogOpen(false);
          setSelectedCourse(null);
        }}
        confirmText="Delete"
        variant="destructive"
      />
    </div>
  );
});