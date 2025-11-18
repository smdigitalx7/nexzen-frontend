import { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { EnhancedDataTable } from '@/components/shared';
import {
  EnrollmentSearchForm,
  EnrollmentViewDialog,
  EnrollmentEditDialog,
} from './enrollments';
import { 
  useCollegeEnrollmentsList,
  useCollegeEnrollment,
  useCollegeEnrollmentByAdmission,
} from '@/lib/hooks/college';
import { useCollegeClasses, useCollegeGroups, useCollegeCourses } from '@/lib/hooks/college/use-college-dropdowns';
import { collegeKeys } from '@/lib/hooks/college/query-keys';
import { batchInvalidateAndRefetch } from '@/lib/hooks/common/useGlobalRefetch';
import type { ColumnDef } from '@tanstack/react-table';
import type { CollegeEnrollmentRead, CollegeEnrollmentFilterParams } from '@/lib/types/college';
import { formatDate } from '@/lib/utils/formatting/date';

const EnrollmentsTabComponent = () => {
  const queryClient = useQueryClient();
  
  // State management
  const [query, setQuery] = useState<{ class_id: number | ''; group_id?: number | ''; course_id?: number | ''; admission_no?: string }>({ 
    class_id: '', 
    group_id: '', 
    course_id: '',
    admission_no: ''
  });
  // ✅ FIX: Add refreshKey to force table refresh after updates
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch dropdown data
  const { data: classesData } = useCollegeClasses();
  const { data: groupsData } = useCollegeGroups(Number(query.class_id) || 0);
  const { data: coursesData } = useCollegeCourses(Number(query.group_id) || 0);
  
  const classes = classesData?.items || [];
  const groups = groupsData?.items || [];
  const courses = coursesData?.items || [];

  // Fetch enrollment by admission number when admission_no is provided
  const admissionNoResult = useCollegeEnrollmentByAdmission(query.admission_no?.trim());
  const enrollmentClassId = admissionNoResult.data?.class_id;
  const enrollmentGroupId = admissionNoResult.data?.group_id;
  const { data: enrollmentGroupsData } = useCollegeGroups(enrollmentClassId || 0);
  const { data: enrollmentCoursesData } = useCollegeCourses(enrollmentGroupId || 0);
  
  // Use enrollment groups/courses if available, otherwise use regular ones
  const allGroups = enrollmentClassId ? (enrollmentGroupsData?.items || groups) : groups;
  const allCourses = enrollmentGroupId ? (enrollmentCoursesData?.items || courses) : courses;

  // Memoized API parameters - both class_id and group_id are required
  const apiParams = useMemo(() => {
    // Both class_id and group_id are required
    if (!query.class_id || !query.group_id) {
      return undefined;
    }
    
    const params: CollegeEnrollmentFilterParams = {
      class_id: Number(query.class_id),
      group_id: Number(query.group_id),
    };
    
        if (query.course_id) {
          params.course_id = Number(query.course_id);
        }
    
    return params;
  }, [query.class_id, query.group_id, query.course_id]);

  // API hooks - use by-admission endpoint when admission_no is provided, otherwise use list
  const result = useCollegeEnrollmentsList(apiParams);
  
  // Determine which data source to use
  const shouldUseAdmissionNo = Boolean(query.admission_no?.trim());
  // ✅ FIX: Aggregate loading states from all parallel queries
  const isLoading = classesData === undefined || 
    (query.class_id ? groupsData === undefined : false) ||
    (query.group_id ? coursesData === undefined : false) ||
    (shouldUseAdmissionNo ? admissionNoResult.isLoading : result.isLoading);
  const isError = shouldUseAdmissionNo ? admissionNoResult.isError : result.isError;

  // Dialog state
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewEnrollmentId, setViewEnrollmentId] = useState<number | null>(null);
  const [editStudentId, setEditStudentId] = useState<number | null>(null);

  // Fetch selected enrollment for viewing
  const { data: viewEnrollment, isLoading: isLoadingView } = useCollegeEnrollment(viewEnrollmentId);

  // Handle view
  const handleView = useCallback((enrollment: CollegeEnrollmentRead) => {
    setViewEnrollmentId(enrollment.enrollment_id);
    setIsViewDialogOpen(true);
  }, []);

  // Handle edit from table action
  const handleEdit = useCallback((enrollment: CollegeEnrollmentRead) => {
    if (enrollment?.student_id) {
      setEditStudentId(enrollment.student_id);
      setIsEditDialogOpen(true);
    }
  }, []);

  // ✅ FIX: Handle edit success - batch invalidate queries and force table refresh
  const handleEditSuccess = useCallback(async () => {
    // Batch invalidate all related queries
    batchInvalidateAndRefetch([
      collegeKeys.enrollments.root(),
      collegeKeys.students.root(),
    ]);

    // Small delay to ensure React Query cache is updated
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // ✅ FIX: Increment refreshKey to force table refresh
    setRefreshKey(prev => prev + 1);
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
    // If admission_no is provided, use the by-admission endpoint result
    if (shouldUseAdmissionNo && admissionNoResult.data) {
      // Transform single enrollment to match table format
      const enrollment = admissionNoResult.data;
      // Find class name from classes dropdown
      const classInfo = classes.find(c => c.class_id === enrollment.class_id);
      // Find group name from groups dropdown
      const groupInfo = allGroups.find(g => g.group_id === enrollment.group_id);
      // Find course name from courses dropdown
      const courseInfo = allCourses.find(c => c.course_id === enrollment.course_id);
      return [{
        enrollment_id: enrollment.enrollment_id,
        admission_no: enrollment.admission_no,
        student_name: enrollment.student_name,
        roll_number: enrollment.roll_number,
        class_id: enrollment.class_id,
        group_id: enrollment.group_id,
        course_id: enrollment.course_id || null,
        group_name: groupInfo?.group_name || '',
        course_name: courseInfo?.course_name || enrollment.course_name || undefined,
        class_name: classInfo?.class_name || '',
        enrollment_date: enrollment.enrollment_date || null,
        student_id: enrollment.student_id,
        is_active: enrollment.is_active,
      } as CollegeEnrollmentRead & { class_name?: string; group_name?: string; course_name?: string }];
    }
    
    // Otherwise, use the list endpoint result
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
  }, [shouldUseAdmissionNo, admissionNoResult.data, result.data?.enrollments, classes, allGroups, allCourses]);

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
      cell: ({ row }) => {
        const dateValue = row.original.enrollment_date;
        if (!dateValue) return '-';
        // Format date to show only date part (no time)
        return formatDate(dateValue, { year: 'numeric', month: 'short', day: 'numeric' });
      },
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
      onClick: (row: CollegeEnrollmentRead) => handleView(row)
    },
    {
      type: 'edit' as const,
      onClick: (row: CollegeEnrollmentRead) => handleEdit(row)
    }
  ], [handleView, handleEdit]);

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
      {shouldUseAdmissionNo ? (
        // Show table when searching by admission number
        <EnhancedDataTable
          data={flattenedEnrollments}
          columns={columns}
          title="Student Enrollments"
          searchKey="student_name"
          searchPlaceholder="Search by student name..."
          loading={isLoading}
          exportable={true}
          showActions={true}
          actionButtonGroups={actionButtonGroups}
          actionColumnHeader="Actions"
          showActionLabels={true}
          refreshKey={refreshKey}
        />
      ) : !query.class_id || !query.group_id ? (
        <div className="text-sm text-slate-600 p-4 text-center">
          {!query.class_id 
            ? 'Please select a class and group to view enrollments, or search by admission number.'
            : 'Please select a group to view enrollments, or search by admission number.'}
        </div>
      ) : (
        <EnhancedDataTable
          data={flattenedEnrollments}
          columns={columns}
          title="Student Enrollments"
          searchKey="student_name"
          searchPlaceholder="Search by student name..."
          loading={isLoading}
          exportable={true}
          showActions={true}
          actionButtonGroups={actionButtonGroups}
          actionColumnHeader="Actions"
          showActionLabels={true}
          refreshKey={refreshKey}
        />
      )}

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

      <EnrollmentEditDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setEditStudentId(null);
            // Reopen view dialog after edit closes
            if (viewEnrollmentId) {
              setIsViewDialogOpen(true);
            }
          }
        }}
        studentId={editStudentId}
        onSuccess={handleEditSuccess}
      />
    </div>
  );
};

export const EnrollmentsTab = EnrollmentsTabComponent;
export default EnrollmentsTabComponent;
