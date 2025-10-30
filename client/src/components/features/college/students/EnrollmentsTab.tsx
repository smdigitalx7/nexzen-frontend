import { useState, useMemo, useCallback, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ConfirmDialog, EnhancedDataTable } from '@/components/shared';
import {
  EnrollmentSearchForm,
  EnrollmentCreateDialog,
  EnrollmentEditDialog,
  EnrollmentViewDialog,
} from './enrollments';
import { 
  useCollegeEnrollmentsList,
  useCollegeEnrollment,
  useCreateCollegeEnrollment,
  useUpdateCollegeEnrollment,
  useDeleteCollegeEnrollment,
} from '@/lib/hooks/college/use-college-enrollments';
import { useCollegeClasses, useCollegeGroups, useCollegeCourses } from '@/lib/hooks/college/use-college-dropdowns';
import { useCollegeStudentsList } from '@/lib/hooks/college/use-college-students';
import type { ColumnDef } from '@tanstack/react-table';
import type { CollegeEnrollmentCreate, CollegeEnrollmentUpdate, CollegeEnrollmentRead, CollegeEnrollmentWithStudentDetails } from '@/lib/types/college';

const EnrollmentsTabComponent = () => {
  // State management
  const [query, setQuery] = useState<{ class_id: number | ''; group_id?: number | ''; course_id?: number | ''; admission_no?: string }>({ 
    class_id: '', 
    group_id: '', 
    course_id: '',
    admission_no: ''
  });

  // Fetch dropdown data
  const { data: classesData } = useCollegeClasses();
  const { data: groupsData } = useCollegeGroups(Number(query.class_id) || 0);
  const { data: coursesData } = useCollegeCourses(Number(query.group_id) || 0);
  const { data: studentsData } = useCollegeStudentsList({ page: 1, pageSize: 1000 });
  
  const classes = classesData?.items || [];
  const groups = groupsData?.items || [];
  const courses = coursesData?.items || [];
  const students = studentsData?.data || [];

  // Memoized API parameters
  const apiParams = useMemo(() => {
    const params: any = {};
    if (query.class_id) {
      params.class_id = Number(query.class_id);
      if (query.group_id) {
        params.group_id = Number(query.group_id);
      }
      if (query.course_id) {
        params.course_id = Number(query.course_id);
      }
    }
    return params;
  }, [query.class_id, query.group_id, query.course_id]);

  // API hooks
  const result = useCollegeEnrollmentsList(apiParams);
  const createMutation = useCreateCollegeEnrollment();
  const updateMutation = useUpdateCollegeEnrollment();
  const deleteMutation = useDeleteCollegeEnrollment();

  // Dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<number | null>(null);
  const [viewEnrollmentId, setViewEnrollmentId] = useState<number | null>(null);

  // Fetch selected enrollment for editing/viewing
  const { data: selectedEnrollment } = useCollegeEnrollment(selectedEnrollmentId);
  const { data: viewEnrollment, isLoading: isLoadingView } = useCollegeEnrollment(viewEnrollmentId);

  const [createFormData, setCreateFormData] = useState<CollegeEnrollmentCreate>({
    student_id: 0,
    class_id: 0,
    group_id: 0,
    course_id: null,
    roll_number: '',
    enrollment_date: null,
    is_active: true,
  });

  const [editFormData, setEditFormData] = useState<CollegeEnrollmentUpdate>({
    class_id: 0,
    group_id: 0,
    course_id: null,
    roll_number: '',
    enrollment_date: null,
    is_active: true,
  });

  // Reset form
  const resetForm = useCallback(() => {
    setCreateFormData({
      student_id: 0,
      class_id: 0,
      group_id: 0,
      course_id: null,
      roll_number: '',
      enrollment_date: null,
      is_active: true,
    });
  }, []);

  const resetEditForm = useCallback(() => {
    setEditFormData({
      class_id: 0,
      group_id: 0,
      course_id: null,
      roll_number: '',
      enrollment_date: null,
      is_active: true,
    });
  }, []);

  // Populate edit form when enrollment is selected
  useEffect(() => {
    if (selectedEnrollment && isEditDialogOpen) {
      setEditFormData({
        class_id: selectedEnrollment.class_id,
        group_id: selectedEnrollment.group_id,
        course_id: selectedEnrollment.course_id ?? null,
        roll_number: selectedEnrollment.roll_number,
        enrollment_date: selectedEnrollment.enrollment_date || null,
        is_active: selectedEnrollment.is_active ?? true,
      });
    }
  }, [selectedEnrollment, isEditDialogOpen]);

  // Handle create
  const handleCreate = useCallback(async () => {
    if (!createFormData.student_id || !createFormData.class_id || !createFormData.group_id || !createFormData.roll_number) {
      return;
    }
    try {
      await createMutation.mutateAsync(createFormData);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error handled by mutation hook
    }
  }, [createFormData, createMutation, resetForm]);

  // Handle view
  const handleView = useCallback((enrollment: any) => {
    setViewEnrollmentId(enrollment.enrollment_id);
    setIsViewDialogOpen(true);
  }, []);

  // Handle edit
  const handleEdit = useCallback((enrollment: any) => {
    setSelectedEnrollmentId(enrollment.enrollment_id);
    setIsEditDialogOpen(true);
  }, []);

  // Handle delete
  const handleDelete = useCallback((enrollment: any) => {
    setSelectedEnrollmentId(enrollment.enrollment_id);
    setIsDeleteDialogOpen(true);
  }, []);

  // Handle update
  const handleUpdate = useCallback(async () => {
    if (!selectedEnrollmentId || !selectedEnrollment) return;
    
    const updatePayload: CollegeEnrollmentUpdate = {
      class_id: editFormData.class_id || undefined,
      group_id: editFormData.group_id || undefined,
      course_id: editFormData.course_id ?? undefined,
      roll_number: editFormData.roll_number || undefined,
      enrollment_date: editFormData.enrollment_date || undefined,
      is_active: editFormData.is_active,
    };
    
    try {
      await updateMutation.mutateAsync({ id: selectedEnrollmentId, payload: updatePayload });
      setIsEditDialogOpen(false);
      setSelectedEnrollmentId(null);
      resetEditForm();
    } catch (error) {
      // Error handled by mutation hook
    }
  }, [selectedEnrollmentId, selectedEnrollment, editFormData, updateMutation, resetEditForm]);

  // Handle delete confirmation
  const handleDeleteConfirm = useCallback(async () => {
    if (!selectedEnrollmentId) return;
    try {
      await deleteMutation.mutateAsync(selectedEnrollmentId);
      setIsDeleteDialogOpen(false);
      setSelectedEnrollmentId(null);
    } catch (error) {
      // Error handled by mutation hook
    }
  }, [selectedEnrollmentId, deleteMutation]);

  // Flatten enrollments for table display
  const flattenedEnrollments = useMemo(() => {
    if (!result.data?.enrollments) return [];
    
    const flattened: (CollegeEnrollmentRead & { class_name?: string; group_name?: string; course_name?: string })[] = [];
    
    result.data.enrollments.forEach((classGroup) => {
      if (classGroup.students && Array.isArray(classGroup.students)) {
        classGroup.students.forEach((student) => {
          flattened.push({
            ...student,
            class_name: classGroup.class_name,
            group_name: classGroup.group_name,
            course_name: classGroup.course_name || undefined,
          });
        });
      }
    });
    
    return flattened;
  }, [result.data]);

  // Table columns
  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      id: 'enrollment_id',
      accessorKey: 'enrollment_id',
      header: 'Enrollment ID',
      cell: ({ row }) => (
        <div className="font-mono text-sm">{row.original.enrollment_id}</div>
      ),
    },
    {
      id: 'admission_no',
      accessorKey: 'admission_no',
      header: 'Admission No',
      cell: ({ row }) => (
        <div className="font-medium">{row.original.admission_no}</div>
      ),
    },
    {
      id: 'student_name',
      accessorKey: 'student_name',
      header: 'Student Name',
    },
    {
      id: 'roll_number',
      accessorKey: 'roll_number',
      header: 'Roll Number',
    },
    {
      id: 'class_name',
      accessorKey: 'class_name',
      header: 'Class',
    },
    {
      id: 'group_name',
      accessorKey: 'group_name',
      header: 'Group',
    },
    {
      id: 'course_name',
      accessorKey: 'course_name',
      header: 'Course',
      cell: ({ row }) => (
        <div>{row.original.course_name || '-'}</div>
      ),
    },
    {
      id: 'enrollment_date',
      accessorKey: 'enrollment_date',
      header: 'Enrollment Date',
      cell: ({ row }) => (
        <div>{row.original.enrollment_date ? new Date(row.original.enrollment_date).toLocaleDateString() : '-'}</div>
      ),
    },
    {
      id: 'is_active',
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
          {row.original.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ], []);

  // Action buttons
  const actionButtonGroups = useMemo(() => [
    {
      id: 'view',
      label: 'View',
      onClick: handleView,
      variant: 'ghost' as const,
    },
    {
      id: 'edit',
      label: 'Edit',
      onClick: handleEdit,
      variant: 'ghost' as const,
    },
    {
      id: 'delete',
      label: 'Delete',
      onClick: handleDelete,
      variant: 'ghost' as const,
      className: 'text-red-600 hover:text-red-700',
    },
  ], [handleView, handleEdit, handleDelete]);

  return (
    <div className="space-y-4">
      {/* Search Form */}
      <EnrollmentSearchForm
        query={query}
        classes={classes}
        groups={groups}
        courses={courses}
        onClassChange={(value) => setQuery(prev => ({ ...prev, class_id: value ? Number(value) : '', group_id: '', course_id: '' }))}
        onGroupChange={(value) => setQuery(prev => ({ ...prev, group_id: value ? Number(value) : '', course_id: '' }))}
        onCourseChange={(value) => setQuery(prev => ({ ...prev, course_id: value ? Number(value) : '' }))}
        onAdmissionNoChange={(value) => setQuery(prev => ({ ...prev, admission_no: value }))}
        onClear={() => setQuery({ class_id: '', group_id: '', course_id: '', admission_no: '' })}
      />

      {/* Create Button */}
      <div className="flex justify-between items-center">
        <div>
          {result.data && (
            <div className="text-sm text-slate-600">
              Total: {result.data.total_count} enrollments
              {result.data.total_pages > 1 && (
                <span> • Page {result.data.current_page} of {result.data.total_pages}</span>
              )}
            </div>
          )}
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Enrollment
        </Button>
      </div>

      {/* Data Table */}
      {query.class_id === '' ? (
        <div className="text-sm text-slate-600">Select a class to load enrollments.</div>
      ) : result.isLoading ? (
        <div className="text-sm text-slate-600">Loading enrollments...</div>
      ) : result.isError ? (
        <div className="text-sm text-red-600">Failed to load enrollments</div>
      ) : (
        <EnhancedDataTable
          data={flattenedEnrollments}
          columns={columns}
          searchKey="student_name"
          actionButtonGroups={actionButtonGroups}
        />
      )}

      {/* Dialogs */}
      <EnrollmentCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) resetForm();
        }}
        isLoading={createMutation.isPending}
        formData={createFormData}
        onFormDataChange={setCreateFormData}
        onSave={handleCreate}
        onCancel={() => {
          setIsCreateDialogOpen(false);
          resetForm();
        }}
        students={students}
        classes={classes}
        groups={groups}
        courses={courses}
      />

      <EnrollmentEditDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setSelectedEnrollmentId(null);
            resetEditForm();
          }
        }}
        isLoading={updateMutation.isPending}
        formData={editFormData}
        onFormDataChange={setEditFormData}
        onSave={handleUpdate}
        onCancel={() => {
          setIsEditDialogOpen(false);
          setSelectedEnrollmentId(null);
          resetEditForm();
        }}
        classes={classes}
        groups={groups}
        courses={courses}
        currentClassId={selectedEnrollment?.class_id || 0}
      />

      <EnrollmentViewDialog
        open={isViewDialogOpen}
        onOpenChange={(open) => {
          setIsViewDialogOpen(open);
          if (!open) {
            setViewEnrollmentId(null);
          }
        }}
        enrollment={viewEnrollment || null}
        isLoading={isLoadingView}
        classes={classes}
        groups={groups}
        courses={courses}
      />

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Enrollment"
        description="Are you sure you want to delete this enrollment? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        isLoading={deleteMutation.isPending}
        loadingText="Deleting..."
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default EnrollmentsTabComponent;
