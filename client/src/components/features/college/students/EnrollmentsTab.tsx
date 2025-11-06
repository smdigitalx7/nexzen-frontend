import { useState, useMemo, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
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
// Note: useCollegeClasses, useCollegeGroups, useCollegeCourses from dropdowns (naming conflict)
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
      id: 'class_group',
      header: 'Class / Group',
      accessorFn: (row) => {
        if (row.class_name && row.group_name) {
          return `${row.class_name} / ${row.group_name}`;
        }
        if (row.class_name) return row.class_name;
        if (row.group_name) return row.group_name;
        return '-';
      },
      cell: ({ row }) => {
        const className = row.original.class_name;
        const groupName = row.original.group_name;
        return (
          <div>
            {className && groupName
              ? `${className} / ${groupName}`
              : className || groupName || '-'}
          </div>
        );
      },
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
