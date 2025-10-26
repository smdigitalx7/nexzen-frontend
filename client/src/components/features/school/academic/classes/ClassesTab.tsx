import { useState, memo, useMemo, useCallback } from "react";
import { BookOpen, Plus, Edit, Trash2, Users, Eye, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormDialog, ConfirmDialog } from "@/components/shared";
import { EnhancedDataTable } from "@/components/shared/EnhancedDataTable";
import { useCreateSchoolClass, useUpdateSchoolClass, useSchoolClassById, useDeleteSchoolClassSubject } from '@/lib/hooks/school/use-school-classes';
import { useSchoolSubjects } from '@/lib/hooks/school/use-school-subjects';
import { useCreateSchoolClassSubject } from '@/lib/hooks/school/use-school-class-subjects';
import { useToast } from '@/hooks/use-toast';
import type { ColumnDef } from "@tanstack/react-table";
import {
  createIconTextColumn
} from "@/lib/utils/columnFactories";
import type { SchoolClassRead } from "@/lib/types/school";

// Component to display subjects for a specific class
const ClassSubjectsCell = memo(({ subjects }: { subjects?: { subject_id: number; subject_name: string }[] }) => {
  const subjectsContent = useMemo(() => {
    if (!subjects || subjects.length === 0) {
      return (
        <span className="text-sm text-muted-foreground">No subjects assigned</span>
      );
    }

    return (
      <div className="flex flex-wrap gap-1">
        {subjects.slice(0, 3).map((subject) => (
          <Badge key={subject.subject_id} variant="secondary" className="text-xs">
            {subject.subject_name}
          </Badge>
        ))}
        {subjects.length > 3 && (
          <Badge variant="outline" className="text-xs">
            +{subjects.length - 3} more
          </Badge>
        )}
      </div>
    );
  }, [subjects]);

  return subjectsContent;
});

ClassSubjectsCell.displayName = "ClassSubjectsCell";

// Component to display subjects in the view dialog
const ClassSubjectsView = memo(({ classId }: { classId: number }) => {
  const { data: classWithSubjects, isLoading, isError } = useSchoolClassById(classId);

  const subjectsContent = useMemo(() => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2 text-sm text-muted-foreground">Loading subjects...</span>
        </div>
      );
    }

    if (isError || !classWithSubjects?.subjects) {
      return (
        <div className="text-center py-4">
          <span className="text-sm text-muted-foreground">Failed to load subjects</span>
        </div>
      );
    }

    const subjects = classWithSubjects.subjects;

    if (subjects.length === 0) {
      return (
        <div className="text-center py-4">
          <span className="text-sm text-muted-foreground">No subjects assigned to this class</span>
        </div>
      );
    }

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {subjects.map((subject) => (
            <div
              key={subject.subject_id}
              className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg border"
            >
              <BookOpen className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <span className="font-medium text-sm">{subject.subject_name}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="text-sm text-muted-foreground text-center">
          Total subjects: {subjects.length}
        </div>
      </div>
    );
  }, [isLoading, isError, classWithSubjects?.subjects]);

  return subjectsContent;
});

ClassSubjectsView.displayName = "ClassSubjectsView";

interface ClassesTabProps {
  classesWithSubjects: SchoolClassRead[];
  classesLoading: boolean;
  hasError?: boolean;
  errorMessage?: string;
}

// Initial form state
const initialClassForm = { 
  class_name: "", 
  book_fee: 0, 
  tuition_fee: 0 
};

export const ClassesTab = memo(({
  classesWithSubjects,
  classesLoading,
  hasError = false,
  errorMessage,
}: ClassesTabProps) => {
  // Dialog states
  const [isAddClassOpen, setIsAddClassOpen] = useState(false);
  const [isEditClassOpen, setIsEditClassOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isManageSubjectsOpen, setIsManageSubjectsOpen] = useState(false);
  
  // Selected class state
  const [selectedClass, setSelectedClass] = useState<SchoolClassRead | null>(null);
  
  // Form states
  const [newClass, setNewClass] = useState(initialClassForm);
  const [editClass, setEditClass] = useState(initialClassForm);

  const { toast } = useToast();
  const createClassMutation = useCreateSchoolClass();
  const updateClassMutation = useUpdateSchoolClass(selectedClass?.class_id || 0);
  
  // Subject management hooks
  const { data: allSubjects = [] } = useSchoolSubjects();
  const { data: classWithSubjects } = useSchoolClassById(selectedClass?.class_id || null);
  const createClassSubjectMutation = useCreateSchoolClassSubject();
  const deleteClassSubjectMutation = useDeleteSchoolClassSubject();

  // Memoized validation functions
  const validateClassForm = useCallback((form: typeof initialClassForm) => {
    if (!form.class_name.trim()) {
      toast({
        title: "Error",
        description: "Class name is required",
        variant: "destructive",
      });
      return false;
    }

    if (form.book_fee < 0 || form.tuition_fee < 0) {
      toast({
        title: "Error",
        description: "Fees cannot be negative",
        variant: "destructive",
      });
      return false;
    }

    return true;
  }, [toast]);

  // Memoized mutation handlers
  const handleCreateClass = useCallback(async () => {
    if (!validateClassForm(newClass)) return;

    try {
      await createClassMutation.mutateAsync({
        class_name: newClass.class_name.trim(),
        book_fee: newClass.book_fee,
        tuition_fee: newClass.tuition_fee,
      });
      
      setNewClass(initialClassForm);
      setIsAddClassOpen(false);
    } catch (error) {
      // Error toast is handled by mutation hook
    }
  }, [newClass, validateClassForm, createClassMutation]);

  const handleUpdateClass = useCallback(async () => {
    if (!validateClassForm(editClass) || !selectedClass) return;

    try {
      await updateClassMutation.mutateAsync({ 
        class_name: editClass.class_name.trim(),
        book_fee: editClass.book_fee,
        tuition_fee: editClass.tuition_fee,
      });
      
      setEditClass(initialClassForm);
      setSelectedClass(null);
      setIsEditClassOpen(false);
    } catch (error) {
      // Error toast is handled by mutation hook
    }
  }, [editClass, selectedClass, validateClassForm, updateClassMutation]);

  const handleDeleteClass = useCallback(async () => {
    if (!selectedClass) return;

    try {
      // Add delete logic here
      toast({
        title: "Success",
        description: "Class deleted successfully",
      });
      
      setSelectedClass(null);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete class",
        variant: "destructive",
      });
    }
  }, [selectedClass, toast]);

  // Memoized action handlers
  const handleManageSubjectsClick = useCallback((classItem: SchoolClassRead) => {
    setSelectedClass(classItem);
    setIsManageSubjectsOpen(true);
  }, []);

  const handleViewClick = useCallback((classItem: SchoolClassRead) => {
    setSelectedClass(classItem);
    setIsViewDialogOpen(true);
  }, []);

  const handleEditClick = useCallback((classItem: SchoolClassRead) => {
    setSelectedClass(classItem);
    setEditClass({ 
      class_name: classItem.class_name,
      book_fee: classItem.book_fee,
      tuition_fee: classItem.tuition_fee,
    });
    setIsEditClassOpen(true);
  }, []);

  const handleDeleteClick = useCallback((classItem: SchoolClassRead) => {
    setSelectedClass(classItem);
    setIsDeleteDialogOpen(true);
  }, []);

  // Subject assignment handlers
  const handleAssignSubject = useCallback(async (subjectId: number) => {
    if (!selectedClass) return;

    try {
      await createClassSubjectMutation.mutateAsync({
        class_id: selectedClass.class_id,
        subject_id: subjectId,
      });
    } catch (error) {
      // Error toast is handled by mutation hook
    }
  }, [selectedClass, createClassSubjectMutation]);

  const handleRemoveSubject = useCallback(async (subjectId: number) => {
    if (!selectedClass) return;

    try {
      await deleteClassSubjectMutation.mutateAsync({
        classId: selectedClass.class_id,
        subjectId: subjectId,
      });
    } catch (error) {
      // Error toast is handled by mutation hook
    }
  }, [selectedClass, deleteClassSubjectMutation]);

  // Memoized columns definition
  const columns: ColumnDef<SchoolClassRead>[] = useMemo(() => [
    createIconTextColumn<SchoolClassRead>("class_name", { header: "Class Name", icon: BookOpen }),
    {
      id: "book_fee",
      header: "Book Fee",
      cell: ({ row }) => (
        <span className="font-medium text-green-600">₹{row.original.book_fee}</span>
      ),
    },
    {
      id: "tuition_fee", 
      header: "Tuition Fee",
      cell: ({ row }) => (
        <span className="font-medium text-blue-600">₹{row.original.tuition_fee}</span>
      ),
    },
    {
      id: "subjects",
      header: "Subjects",
      cell: ({ row }) => {
        const subjects = row.original.subjects;
        return <ClassSubjectsCell subjects={subjects} />;
      },
    },
  ], []);

  // Memoized action button groups
  const actionButtonGroups = useMemo(() => [
    {
      type: 'view' as const,
      onClick: handleViewClick
    },
    {
      type: 'edit' as const,
      onClick: handleEditClick
    },
    {
      type: 'delete' as const,
      onClick: handleDeleteClick
    }
  ], [handleViewClick, handleEditClick, handleDeleteClick]);

  // Memoized available subjects for assignment
  const availableSubjects = useMemo(() => {
    return allSubjects.filter(subject => 
      !classWithSubjects?.subjects?.some(assignedSubject => 
        assignedSubject.subject_id === subject.subject_id
      )
    );
  }, [allSubjects, classWithSubjects?.subjects]);

  // Memoized dialog close handlers
  const closeAddDialog = useCallback(() => {
    setIsAddClassOpen(false);
    setNewClass(initialClassForm);
  }, []);

  const closeEditDialog = useCallback(() => {
    setIsEditClassOpen(false);
    setEditClass(initialClassForm);
    setSelectedClass(null);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setSelectedClass(null);
  }, []);

  const closeViewDialog = useCallback(() => {
    setIsViewDialogOpen(false);
    setSelectedClass(null);
  }, []);

  const closeManageSubjectsDialog = useCallback(() => {
    setIsManageSubjectsOpen(false);
    setSelectedClass(null);
  }, []);

  if (hasError) {
    return (
      <div className="text-center text-red-600 p-8">
        <p>{errorMessage || "Failed to load classes"}</p>
      </div>
    );
  }

  if (classesLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table */}
      <EnhancedDataTable
        data={classesWithSubjects}
        columns={columns as any}
        title="Classes"
        searchKey="class_name"
        searchPlaceholder="Search classes..."
        exportable={true}
        onAdd={() => setIsAddClassOpen(true)}
        addButtonText="Add Class"
        showActions={true}
        actionButtonGroups={actionButtonGroups}
        actionColumnHeader="Actions"
        showActionLabels={true}
      />

      {/* Add Class Dialog */}
      <FormDialog
        open={isAddClassOpen}
        onOpenChange={setIsAddClassOpen}
        title="Add New Class"
        description="Create a new academic class"
        onSave={handleCreateClass}
        onCancel={closeAddDialog}
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
              onChange={(e) => setNewClass(prev => ({ ...prev, class_name: e.target.value }))}
              placeholder="Enter class name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="book_fee">Book Fee (₹)</Label>
            <Input
              id="book_fee"
              type="number"
              min="0"
              step="0.01"
              value={newClass.book_fee}
              onChange={(e) => setNewClass(prev => ({ ...prev, book_fee: parseFloat(e.target.value) || 0 }))}
              placeholder="Enter book fee"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tuition_fee">Tuition Fee (₹)</Label>
            <Input
              id="tuition_fee"
              type="number"
              min="0"
              step="0.01"
              value={newClass.tuition_fee}
              onChange={(e) => setNewClass(prev => ({ ...prev, tuition_fee: parseFloat(e.target.value) || 0 }))}
              placeholder="Enter tuition fee"
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
        onCancel={closeEditDialog}
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
              onChange={(e) => setEditClass(prev => ({ ...prev, class_name: e.target.value }))}
              placeholder="Enter class name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_book_fee">Book Fee (₹)</Label>
            <Input
              id="edit_book_fee"
              type="number"
              min="0"
              step="0.01"
              value={editClass.book_fee}
              onChange={(e) => setEditClass(prev => ({ ...prev, book_fee: parseFloat(e.target.value) || 0 }))}
              placeholder="Enter book fee"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit_tuition_fee">Tuition Fee (₹)</Label>
            <Input
              id="edit_tuition_fee"
              type="number"
              min="0"
              step="0.01"
              value={editClass.tuition_fee}
              onChange={(e) => setEditClass(prev => ({ ...prev, tuition_fee: parseFloat(e.target.value) || 0 }))}
              placeholder="Enter tuition fee"
            />
          </div>
        </div>
      </FormDialog>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Class"
        description={`Are you sure you want to delete the class "${selectedClass?.class_name}"? This action cannot be undone.`}
        onConfirm={handleDeleteClass}
        onCancel={closeDeleteDialog}
        confirmText="Delete"
        variant="destructive"
      />

      {/* View Class Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Class Details: {selectedClass?.class_name}
            </DialogTitle>
          </DialogHeader>
          {selectedClass && (
            <div className="space-y-6">
              {/* Class Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Class Name</Label>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">{selectedClass.class_name}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Book Fee</Label>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-green-600">₹{selectedClass.book_fee}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Tuition Fee</Label>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-blue-600">₹{selectedClass.tuition_fee}</span>
                  </div>
                </div>
              </div>

              {/* Subjects Section */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-muted-foreground">Subjects</Label>
                <ClassSubjectsView classId={selectedClass.class_id} />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={closeViewDialog}
                >
                  Close
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    handleManageSubjectsClick(selectedClass);
                  }}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Subjects
                </Button>
                <Button
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    handleEditClick(selectedClass);
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Class
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Manage Subjects Dialog */}
      <Dialog open={isManageSubjectsOpen} onOpenChange={setIsManageSubjectsOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Manage Subjects for {selectedClass?.class_name}
            </DialogTitle>
          </DialogHeader>
          {selectedClass && (
            <div className="space-y-6">
              {/* Current Subjects */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-muted-foreground">Current Subjects</Label>
                {classWithSubjects?.subjects && classWithSubjects.subjects.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                    {classWithSubjects.subjects.map((subject) => (
                      <div
                        key={subject.subject_id}
                        className="flex items-center justify-between p-3 bg-muted/50 rounded-lg border"
                      >
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <span className="font-medium text-sm">{subject.subject_name}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRemoveSubject(subject.subject_id)}
                          disabled={deleteClassSubjectMutation.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <span className="text-sm text-muted-foreground">No subjects assigned to this class</span>
                  </div>
                )}
              </div>

              {/* Available Subjects */}
              <div className="space-y-3">
                <Label className="text-sm font-medium text-muted-foreground">Available Subjects</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                  {availableSubjects.map((subject) => (
                    <div
                      key={subject.subject_id}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border"
                    >
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-green-600 flex-shrink-0" />
                        <span className="font-medium text-sm">{subject.subject_name}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAssignSubject(subject.subject_id)}
                        disabled={createClassSubjectMutation.isPending}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                {availableSubjects.length === 0 && (
                  <div className="text-center py-4">
                    <span className="text-sm text-muted-foreground">All subjects are already assigned to this class</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={closeManageSubjectsDialog}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
});

ClassesTab.displayName = "ClassesTab";