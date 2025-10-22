import { useState, memo, useMemo } from "react";
import { GraduationCap, Edit, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormDialog, ConfirmDialog } from "@/components/shared";
import { EnhancedDataTable } from "@/components/shared/EnhancedDataTable";
import { useCollegeCourses, useUpdateCollegeCourse, useCreateCollegeCourse, useDeleteCollegeCourse } from '@/lib/hooks/college/use-college-courses';
import { useToast } from '@/hooks/use-toast';
import type { ColumnDef } from "@tanstack/react-table";
import {
  createIconTextColumn
} from "@/lib/utils/columnFactories";

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
  const [selectedCourse, setSelectedCourse] = useState<import("@/lib/types/college").CollegeCourseResponse | null>(null);
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
      
      toast({
        title: "Success",
        description: "Course created successfully",
      });
      
      setNewCourse({ course_name: "", course_fee: 0, group_id: 0 });
      setIsAddCourseOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create course",
        variant: "destructive",
      });
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
      
      toast({
        title: "Success",
        description: "Course updated successfully",
      });
      
      setEditCourse({ course_name: "", course_fee: 0, group_id: 0 });
      setSelectedCourse(null);
      setIsEditCourseOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update course",
        variant: "destructive",
      });
    }
  };

  const handleDeleteCourse = async () => {
    if (!selectedCourse) return;

    try {
      await deleteCourseMutation.mutateAsync(selectedCourse.course_id);
      
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
      
      setSelectedCourse(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive",
      });
    }
  };

  const handleEditClick = (courseItem: import("@/lib/types/college").CollegeCourseResponse) => {
    setSelectedCourse(courseItem);
    setEditCourse({ 
      course_name: courseItem.course_name, 
      course_fee: courseItem.course_fee,
      group_id: 0 // Note: group_id is not in the response, would need to be fetched separately
    });
    setIsEditCourseOpen(true);
  };

  const handleDeleteClick = (courseItem: any) => {
    setSelectedCourse(courseItem);
    setIsDeleteDialogOpen(true);
  };

  // Define columns for the data table
  const columns: ColumnDef<any>[] = useMemo(() => [
    createIconTextColumn<any>("course_name", { header: "Course Name", icon: GraduationCap }),
    {
      accessorKey: "course_fee",
      header: "Course Fee",
      cell: ({ row }) => `$${row.getValue("course_fee")}`,
    }
  ], []);

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(() => [
    {
      type: 'edit' as const,
      onClick: (courseItem: any) => handleEditClick(courseItem)
    },
    {
      type: 'delete' as const,
      onClick: (courseItem: any) => handleDeleteClick(courseItem)
    }
  ], [handleEditClick, handleDeleteClick]);

  if (hasError) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>{errorMessage || "Failed to load courses"}</p>
      </div>
    );
  }

  if (coursesLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <EnhancedDataTable
        data={coursesWithSubjects}
        columns={columns}
        title="Courses"
        searchKey="course_name"
        exportable={true}
        onAdd={() => setIsAddCourseOpen(true)}
        addButtonText="Add Course"
        showActions={true}
        actionButtonGroups={actionButtonGroups}
        actionColumnHeader="Actions"
        showActionLabels={false}
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
            <Input
              id="group_id"
              type="number"
              min="1"
              value={newCourse.group_id}
              onChange={(e) => setNewCourse({ ...newCourse, group_id: parseInt(e.target.value) || 0 })}
              placeholder="Enter group ID"
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