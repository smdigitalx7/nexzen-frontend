import { useState, useMemo, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { EnhancedDataTable } from '@/components/shared';
import {
  EnrollmentSearchForm,
  EnrollmentCreateDialog,
  EnrollmentViewDialog,
} from './enrollments';
import { 
  useCollegeEnrollmentsList,
  useCollegeEnrollment,
  useCreateCollegeEnrollment,
  useCollegeStudentsList,
} from '@/lib/hooks/college';
import { useCollegeClasses, useCollegeGroups, useCollegeCourses } from '@/lib/hooks/college/use-college-dropdowns';
import type { ColumnDef } from '@tanstack/react-table';
import type { CollegeEnrollmentCreate, CollegeEnrollmentRead } from '@/lib/types/college';

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

  // Memoized API parameters - both class_id and group_id are required
  const apiParams = useMemo(() => {
    // Both class_id and group_id are required
    if (!query.class_id || !query.group_id) {
      return undefined;
    }
    
    const params: any = {
      class_id: Number(query.class_id),
      group_id: Number(query.group_id),
    };
    
    if (query.course_id) {
      params.course_id = Number(query.course_id);
    }
    
    return params;
  }, [query.class_id, query.group_id, query.course_id]);

  // API hooks
  const result = useCollegeEnrollmentsList(apiParams);
  const createMutation = useCreateCollegeEnrollment();

  // Dialog state
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewEnrollmentId, setViewEnrollmentId] = useState<number | null>(null);

  // Fetch selected enrollment for viewing
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

  // Memoized handlers
  const handleGroupChange = useCallback((value: string) => {
    setQuery(prev => ({ 
      ...prev, 
      group_id: value ? Number(value) : '',
      course_id: '' // Reset course when group changes
    }));
  }, []);

  const handleCourseChange = useCallback((value: string) => {
    setQuery(prev => ({ 
      ...prev, 
      course_id: value ? Number(value) : '' 
    }));
  }, []);

  const handleAdmissionNoChange = useCallback((value: string) => {
    setQuery(prev => ({ 
      ...prev, 
      admission_no: value 
    }));
  }, []);

  const handleClear = useCallback(() => {
    setQuery({ class_id: '', group_id: '', course_id: '', admission_no: '' });
  }, []);

  // Handle class change - reset group and course when class changes
  const handleClassChange = useCallback((value: string) => {
    setQuery(prev => ({ 
      ...prev, 
      class_id: value ? Number(value) : '', 
      group_id: '', // Reset group when class changes
      course_id: '' // Reset course when class changes
    }));
  }, []);

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

  // Define columns
  const columns: ColumnDef<CollegeEnrollmentRead & { class_name?: string; group_name?: string; course_name?: string }>[] = useMemo(() => [
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
      accessorKey: 'group_name',
      header: 'Group',
    },
    {
      accessorKey: 'course_name',
      header: 'Course',
      cell: ({ row }) => row.original.course_name || '-',
    },
    {
      accessorKey: 'enrollment_date',
      header: 'Date',
      cell: ({ row }) => row.original.enrollment_date || '-',
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
          {row.original.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ], []);

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(() => [
    {
      type: 'view' as const,
      onClick: (row: any) => handleView(row)
    }
  ], [handleView]);

  return (
    <div className="space-y-4">
      {/* Search Form */}
      <EnrollmentSearchForm
        query={query}
        classes={classes}
        groups={groups}
        courses={courses}
        onClassChange={handleClassChange}
        onGroupChange={handleGroupChange}
        onCourseChange={handleCourseChange}
        onAdmissionNoChange={handleAdmissionNoChange}
        onClear={handleClear}
      />

      {/* Enhanced Data Table */}
      {!query.class_id || !query.group_id ? (
        <div className="text-sm text-slate-600 p-4 text-center">
          {!query.class_id 
            ? 'Please select a class and group to view enrollments.'
            : 'Please select a group to view enrollments.'}
        </div>
      ) : (
        <EnhancedDataTable
          data={flattenedEnrollments}
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
          showActionLabels={true}
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
    </div>
  );
};

export const EnrollmentsTab = EnrollmentsTabComponent;
export default EnrollmentsTabComponent;
