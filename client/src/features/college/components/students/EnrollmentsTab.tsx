import { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/common/components/ui/badge';
import { 
  EnrollmentSearchForm,
  EnrollmentViewDialog,
  EnrollmentEditDialog,
} from './enrollments';
import { 
  useCollegeEnrollmentsList,
  useCollegeEnrollment,
  useCollegeEnrollmentByAdmission,
} from '@/features/college/hooks';
import { useCollegeClasses, useCollegeGroups, useCollegeCourses } from '@/features/college/hooks/use-college-dropdowns';
import { collegeKeys } from '@/features/college/hooks/query-keys';
import { batchInvalidateAndRefetch } from '@/common/hooks/useGlobalRefetch';
import type { ColumnDef } from '@tanstack/react-table';
import type { CollegeEnrollmentRead, CollegeEnrollmentFilterParams } from '@/features/college/types';
import { formatDate } from '@/common/utils/formatting/date';
import { ActionConfig } from '@/common/components/shared/DataTable/types';
import { DataTable } from '@/common/components/shared/DataTable';
import { Eye, Edit as EditIcon } from 'lucide-react';

export const EnrollmentsTabComponent = () => {
  const queryClient = useQueryClient();
  
  // State management
  const [query, setQuery] = useState<{ class_id: number | ''; group_id?: number | ''; course_id?: number | ''; admission_no?: string }>({ 
    class_id: '', 
    group_id: '', 
    course_id: '',
    admission_no: ''
  });
  const [refreshKey, setRefreshKey] = useState(0);

  // Fetch dropdown data
  const { data: classesData } = useCollegeClasses({ enabled: true });
  const { data: groupsData } = useCollegeGroups(Number(query.class_id) || 0, { enabled: !!query.class_id });
  const { data: coursesData } = useCollegeCourses(Number(query.group_id) || 0, { enabled: !!query.group_id });
  
  const classes = classesData?.items || [];
  const groups = groupsData?.items || [];
  const courses = coursesData?.items || [];

  // Fetch enrollment by admission number when admission_no is provided
  const admissionNoResult = useCollegeEnrollmentByAdmission(query.admission_no?.trim());
  const enrollmentClassId = admissionNoResult.data?.class_id;
  const enrollmentGroupId = admissionNoResult.data?.group_id;
  const { data: enrollmentGroupsData } = useCollegeGroups(enrollmentClassId || 0);
  const { data: enrollmentCoursesData } = useCollegeCourses(enrollmentGroupId || 0);
  
  const allGroups = enrollmentClassId ? (enrollmentGroupsData?.items || groups) : groups;
  const allCourses = enrollmentGroupId ? (enrollmentCoursesData?.items || courses) : courses;

  const apiParams = useMemo(() => {
    if (!query.class_id || !query.group_id) return undefined;
    const params: CollegeEnrollmentFilterParams = {
      class_id: Number(query.class_id),
      group_id: Number(query.group_id),
    };
    if (query.course_id) params.course_id = Number(query.course_id);
    return params;
  }, [query.class_id, query.group_id, query.course_id]);

  const result = useCollegeEnrollmentsList(apiParams);
  const shouldUseAdmissionNo = Boolean(query.admission_no?.trim());
  const isLoading = classesData === undefined || 
    (query.class_id ? groupsData === undefined : false) ||
    (query.group_id ? coursesData === undefined : false) ||
    (shouldUseAdmissionNo ? admissionNoResult.isLoading : result.isLoading);

  // Dialog state
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewEnrollmentId, setViewEnrollmentId] = useState<number | null>(null);
  const [editStudentId, setEditStudentId] = useState<number | null>(null);

  const { data: viewEnrollment, isLoading: isLoadingView } = useCollegeEnrollment(viewEnrollmentId);

  const handleView = useCallback((enrollment: CollegeEnrollmentRead) => {
    setViewEnrollmentId(enrollment.enrollment_id);
    setIsViewDialogOpen(true);
  }, []);

  const handleEdit = useCallback((enrollment: CollegeEnrollmentRead) => {
    if (enrollment?.student_id) {
      setEditStudentId(enrollment.student_id);
      setIsEditDialogOpen(true);
    }
  }, []);

  const handleEditSuccess = useCallback(async () => {
    batchInvalidateAndRefetch([
      collegeKeys.enrollments.root(),
      collegeKeys.students.root(),
    ]);
    await new Promise(resolve => setTimeout(resolve, 200));
    setRefreshKey(prev => prev + 1);
  }, []);

  const handleGroupChange = useCallback((value: string) => {
    setQuery(prev => ({ 
      ...prev, 
      group_id: value ? Number(value) : '',
      course_id: '' 
    }));
  }, []);

  const handleCourseChange = useCallback((value: string) => {
    setQuery(prev => ({ ...prev, course_id: value ? Number(value) : '' }));
  }, []);

  const handleAdmissionNoChange = useCallback((value: string) => {
    setQuery(prev => ({ ...prev, admission_no: value }));
  }, []);

  const handleClear = useCallback(() => {
    setQuery({ class_id: '', group_id: '', course_id: '', admission_no: '' });
  }, []);

  const handleClassChange = useCallback((value: string) => {
    setQuery(prev => ({ 
      ...prev, 
      class_id: value ? Number(value) : '', 
      group_id: '', 
      course_id: '' 
    }));
  }, []);

  const flattenedEnrollments = useMemo(() => {
    if (shouldUseAdmissionNo && admissionNoResult.data) {
      const enrollment = admissionNoResult.data;
      const classInfo = classes.find(c => c.class_id === enrollment.class_id);
      const groupInfo = allGroups.find(g => g.group_id === enrollment.group_id);
      const courseInfo = allCourses.find(c => c.course_id === enrollment.course_id);
      return [{
        ...enrollment,
        group_name: groupInfo?.group_name || '',
        course_name: courseInfo?.course_name || enrollment.course_name || undefined,
        class_name: classInfo?.class_name || '',
      }];
    }
    
    if (!result.data?.enrollments) return [];
    const flattened: any[] = [];
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

  const actions: ActionConfig<any>[] = useMemo(() => [
    {
      id: 'view',
      label: 'View',
      icon: Eye,
      onClick: (row) => handleView(row),
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: EditIcon,
      onClick: (row) => handleEdit(row),
    }
  ], [handleView, handleEdit]);

  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      accessorKey: 'admission_no',
      header: 'Admission No',
      cell: ({ row }) => <span className="font-semibold text-blue-600">{row.getValue('admission_no')}</span>
    },
    {
      accessorKey: 'student_name',
      header: 'Student Name',
      cell: ({ row }) => <span className="font-medium">{row.getValue('student_name')}</span>
    },
    {
      accessorKey: 'roll_number',
      header: 'Roll No',
      cell: ({ row }) => row.getValue('roll_number') || '-'
    },
    {
      accessorKey: 'class_name',
      header: 'Class',
      cell: ({ row }) => (
        <Badge variant="outline" className="bg-slate-50">{row.getValue('class_name')}</Badge>
      )
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
        return formatDate(dateValue, { year: 'numeric', month: 'short', day: 'numeric' });
      },
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'secondary' : 'outline'} className={row.original.is_active ? 'bg-green-100 text-green-700' : ''}>
          {row.original.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ], []);

  return (
    <div className="space-y-4">
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

      <DataTable
        key={`enrollments-table-${refreshKey}`}
        data={flattenedEnrollments}
        columns={columns}
        actions={actions}
        title="Student Enrollments"
        searchKey="student_name"
        searchPlaceholder="Search by student name..."
        loading={isLoading}
        export={{ enabled: true, filename: 'enrollments_list' }}
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

      <EnrollmentEditDialog
        open={isEditDialogOpen}
        onOpenChange={(open) => {
          setIsEditDialogOpen(open);
          if (!open) {
            setEditStudentId(null);
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
