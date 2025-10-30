import { useState, useMemo, useCallback, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { ConfirmDialog } from '@/components/shared';
import { EnhancedDataTable } from '@/components/shared';
import {
  EnrollmentSearchForm,
  EnrollmentCreateDialog,
  EnrollmentEditDialog,
  EnrollmentViewDialog,
} from './enrollments';
import { 
  useSchoolEnrollmentsList,
  useSchoolEnrollment,
  useCreateSchoolEnrollment,
  useUpdateSchoolEnrollment,
  useDeleteSchoolEnrollment,
} from '@/lib/hooks/school/use-school-enrollments';
import { useSchoolClasses } from '@/lib/hooks/school/use-school-dropdowns';
import { useSchoolSections } from '@/lib/hooks/school/use-school-dropdowns';
import { useSchoolStudentsList } from '@/lib/hooks/school/use-school-students';
import type { ColumnDef } from '@tanstack/react-table';
import type { SchoolEnrollmentCreate, SchoolEnrollmentUpdate, SchoolEnrollmentRead } from '@/lib/types/school';

const EnrollmentsTabComponent = () => {
  // State management
  const [query, setQuery] = useState<{ class_id: number | ''; section_id?: number | ''; admission_no?: string }>({ 
    class_id: '', 
    section_id: '', 
    admission_no: '' 
  });

  // Fetch dropdown data
  const { data: classesData } = useSchoolClasses();
  const { data: sectionsData } = useSchoolSections(Number(query.class_id) || 0);
  const { data: studentsData } = useSchoolStudentsList({ page: 1, page_size: 1000 });
  
  const classes = classesData?.items || [];
  const sections = sectionsData?.items || [];
  const students = studentsData?.data || [];

  // Memoized API parameters - class_id is required
  const apiParams = useMemo(() => {
    const params: any = {};
    if (query.class_id) {
      params.class_id = Number(query.class_id);
      if (query.section_id) {
        params.section_id = Number(query.section_id);
      }
    }
    return params;
  }, [query.class_id, query.section_id]);

  // API hooks
  const result = useSchoolEnrollmentsList(apiParams);
  const createMutation = useCreateSchoolEnrollment();
  const updateMutation = useUpdateSchoolEnrollment();
  const deleteMutation = useDeleteSchoolEnrollment();

  // Dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedEnrollmentId, setSelectedEnrollmentId] = useState<number | null>(null);
  const [viewEnrollmentId, setViewEnrollmentId] = useState<number | null>(null);

  // Fetch selected enrollment for editing/viewing
  const { data: selectedEnrollment } = useSchoolEnrollment(selectedEnrollmentId);
  const { data: viewEnrollment, isLoading: isLoadingView } = useSchoolEnrollment(viewEnrollmentId);

  const [formData, setFormData] = useState<SchoolEnrollmentCreate>({
    student_id: 0,
    class_id: 0,
    section_id: 0,
    roll_number: '',
    enrollment_date: new Date().toISOString().split('T')[0],
    is_active: true,
  });

  const [editFormData, setEditFormData] = useState({
    class_id: 0,
    section_id: 0,
    roll_number: '',
    enrollment_date: null as string | null,
    is_active: true,
  });

  // Reset form
  const resetForm = useCallback(() => {
    setFormData({
      student_id: 0,
      class_id: 0,
      section_id: 0,
      roll_number: '',
      enrollment_date: new Date().toISOString().split('T')[0],
      is_active: true,
    });
  }, []);

  const resetEditForm = useCallback(() => {
    setEditFormData({
      class_id: 0,
      section_id: 0,
      roll_number: '',
      enrollment_date: null,
      is_active: true,
    });
  }, []);

  // Handle create
  const handleCreate = useCallback(async () => {
    if (!formData.student_id || !formData.class_id || !formData.section_id || !formData.roll_number) {
      return;
    }
    try {
      await createMutation.mutateAsync(formData);
      setIsCreateDialogOpen(false);
      resetForm();
    } catch (error) {
      // Error handled by mutation hook
    }
  }, [formData, createMutation, resetForm]);

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
    
    const updatePayload: SchoolEnrollmentUpdate = {
      class_id: editFormData.class_id || undefined,
      section_id: editFormData.section_id || undefined,
      roll_number: editFormData.roll_number || undefined,
      enrollment_date: editFormData.enrollment_date || undefined,
      is_active: editFormData.is_active ?? undefined,
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

  // Handle delete confirm
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

  // Populate form when enrollment is loaded for editing
  useEffect(() => {
    if (isEditDialogOpen && selectedEnrollment) {
      setEditFormData({
        class_id: selectedEnrollment.class_id,
        section_id: selectedEnrollment.section_id,
        roll_number: selectedEnrollment.roll_number,
        enrollment_date: selectedEnrollment.enrollment_date || null,
        is_active: selectedEnrollment.is_active,
      });
    }
  }, [isEditDialogOpen, selectedEnrollment]);

  // Memoized handlers
  const handleSectionChange = useCallback((value: string) => {
    setQuery(prev => ({ 
      ...prev, 
      section_id: value ? Number(value) : '' 
    }));
  }, []);

  const handleAdmissionNoChange = useCallback((value: string) => {
    setQuery(prev => ({ 
      ...prev, 
      admission_no: value 
    }));
  }, []);

  const handleClear = useCallback(() => {
    setQuery({ class_id: '', section_id: '', admission_no: '' });
  }, []);

  // Handle class change - reset section when class changes
  const handleClassChange = useCallback((value: string) => {
    setQuery(prev => ({ 
      ...prev, 
      class_id: value ? Number(value) : '', 
      section_id: '' // Reset section when class changes
    }));
  }, []);

  // Flatten enrollments data for table
  const flatData = useMemo(() => {
    if (!result.data?.enrollments) return [];
    const flattened: SchoolEnrollmentRead[] = [];
    result.data.enrollments.forEach(classGroup => {
      if (classGroup.students && Array.isArray(classGroup.students)) {
        flattened.push(...classGroup.students.map(student => ({
          ...student,
          class_name: classGroup.class_name
        })));
      }
    });
    return flattened;
  }, [result.data?.enrollments]);

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(() => [
    {
      type: 'view' as const,
      onClick: (row: any) => handleView(row)
    },
    {
      type: 'edit' as const,
      onClick: (row: any) => handleEdit(row)
    },
    {
      type: 'delete' as const,
      onClick: (row: any) => handleDelete(row)
    }
  ], [handleView, handleEdit, handleDelete]);

  // Define columns
  const columns: ColumnDef<SchoolEnrollmentRead>[] = useMemo(() => [
    {
      accessorKey: 'admission_no',
      header: 'Admission No',
    },
    {
      accessorKey: 'student_name',
      header: 'Student Name',
    },
    {
      accessorKey: 'roll_number',
      header: 'Roll No',
    },
    {
      accessorKey: 'class_name',
      header: 'Class',
    },
    {
      accessorKey: 'section_name',
      header: 'Section',
    },
    {
      accessorKey: 'enrollment_date',
      header: 'Date',
      cell: ({ row }) => row.original.enrollment_date || '-',
    },
  ], []);

  return (
    <div className="space-y-4">
      {/* Search Form */}
      <EnrollmentSearchForm
        query={query}
        classes={classes}
        sections={sections}
        onClassChange={handleClassChange}
        onSectionChange={handleSectionChange}
        onAdmissionNoChange={handleAdmissionNoChange}
        onClear={handleClear}
      />

      {/* Enhanced Data Table */}
      <EnhancedDataTable
        data={flatData}
        columns={columns}
        title="Enrollments"
        searchKey="student_name"
        searchPlaceholder="Search by student name..."
        loading={result.isLoading}
        onAdd={() => setIsCreateDialogOpen(true)}
        addButtonText="Add Enrollment"
        addButtonVariant="default"
        showActions={true}
        actionButtonGroups={actionButtonGroups}
        actionColumnHeader="Actions"
        showActionLabels={false}
      />

      {/* Create Enrollment Dialog */}
      <EnrollmentCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={(open) => {
          setIsCreateDialogOpen(open);
          if (!open) resetForm();
        }}
        isLoading={createMutation.isPending}
        formData={formData}
        onFormDataChange={setFormData}
        onSave={handleCreate}
        onCancel={() => {
          setIsCreateDialogOpen(false);
          resetForm();
        }}
        students={students}
        classes={classes}
        sections={sections}
      />

      {/* Edit Enrollment Dialog */}
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
        sections={sections}
      />

      {/* View Enrollment Dialog */}
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
        sections={sections}
      />

      {/* Delete Confirmation Dialog */}
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

export const EnrollmentsTab = EnrollmentsTabComponent;
export default EnrollmentsTabComponent;
