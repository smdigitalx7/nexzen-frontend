import { useState, useMemo, useCallback, useEffect } from 'react';
import { Badge } from '@/common/components/ui/badge';
import { Input } from '@/common/components/ui/input';
import { 
  EnrollmentSearchForm,
  EnrollmentViewDialog,
} from './enrollments';
import { 
  useCollegeEnrollmentsList,
  useCollegeEnrollment,
  useCollegeEnrollmentByAdmission,
} from '@/features/college/hooks';
import { useCollegeClasses, useCollegeGroups, useCollegeCourses } from '@/features/college/hooks/use-college-dropdowns';
import type { ColumnDef } from '@tanstack/react-table';
import type { CollegeEnrollmentRead, CollegeEnrollmentFilterParams } from '@/features/college/types';
import { formatDate } from '@/common/utils/formatting/date';
import { ActionConfig } from '@/common/components/shared/DataTable/types';
import { DataTable } from '@/common/components/shared/DataTable';
import { Eye, Search as SearchIcon } from 'lucide-react';

export const EnrollmentsTabComponent = () => {
  // State management
  const [query, setQuery] = useState<{ class_id: number | ''; group_id?: number | ''; course_id?: number | ''; admission_no?: string }>({ 
    class_id: '', 
    group_id: '', 
    course_id: '',
    admission_no: ''
  });
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    const trimmed = searchInput.trim();
    const t = setTimeout(() => setSearchQuery(trimmed === "" ? undefined : trimmed), 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, query.class_id, query.group_id, query.course_id]);

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
      page: currentPage,
      page_size: pageSize,
      search: searchQuery ?? undefined,
    };
    if (query.course_id) params.course_id = Number(query.course_id);
    return params;
  }, [query.class_id, query.group_id, query.course_id, searchQuery, currentPage, pageSize]);

  const result = useCollegeEnrollmentsList(apiParams);
  const shouldUseAdmissionNo = Boolean(query.admission_no?.trim());
  const isLoading = classesData === undefined || 
    (query.class_id ? groupsData === undefined : false) ||
    (query.group_id ? coursesData === undefined : false) ||
    (shouldUseAdmissionNo ? admissionNoResult.isLoading : result.isLoading);

  // Dialog state
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewEnrollmentId, setViewEnrollmentId] = useState<number | null>(null);

  const { data: viewEnrollment, isLoading: isLoadingView } = useCollegeEnrollment(viewEnrollmentId);

  const handleView = useCallback((enrollment: CollegeEnrollmentRead) => {
    setViewEnrollmentId(enrollment.enrollment_id);
    setIsViewDialogOpen(true);
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
    // List endpoint returns enrollments as array of { class_id, class_name, group_id, group_name, course_id?, course_name?, students: [...] }
    const list = result.data?.enrollments ?? [];
    if (!Array.isArray(list) || list.length === 0) return [];
    const raw = list as Array<{
      class_id?: number;
      class_name?: string;
      group_id?: number;
      group_name?: string;
      course_id?: number | null;
      course_name?: string | null;
      students?: Array<{
        enrollment_id: number;
        student_id: number;
        admission_no: string;
        student_name: string;
        roll_number: string;
        enrollment_date?: string | null;
        is_active?: boolean | null;
        promoted?: boolean | null;
      }>;
    }>;
    const hasNestedStudents = raw.some((e) => Array.isArray(e.students) && e.students.length > 0);
    if (hasNestedStudents) {
      return raw.flatMap((e) => {
        const students = e.students ?? [];
        const class_name = e.class_name ?? classes.find((c) => c.class_id === e.class_id)?.class_name ?? '';
        const group_name = e.group_name ?? allGroups.find((g) => g.group_id === e.group_id)?.group_name ?? '';
        const course_name = e.course_name ?? allCourses.find((c) => c.course_id === e.course_id)?.course_name ?? '-';
        return students.map((s) => ({
          ...s,
          class_id: e.class_id,
          group_id: e.group_id,
          course_id: e.course_id ?? null,
          class_name,
          group_name,
          course_name,
        }));
      });
    }
    // Fallback: treat as flat list (each item is a row)
    return list.map((e: any) => ({
      ...e,
      class_name: (e.class_name as string) ?? classes.find((c) => c.class_id === e.class_id)?.class_name ?? '',
      group_name: (e.group_name as string) ?? allGroups.find((g) => g.group_id === e.group_id)?.group_name ?? '',
      course_name: (e.course_name as string) ?? allCourses.find((c) => c.course_id === e.course_id)?.course_name ?? '-',
    }));
  }, [shouldUseAdmissionNo, admissionNoResult.data, result.data?.enrollments, classes, allGroups, allCourses]);

  const actions: ActionConfig<any>[] = useMemo(() => [
    {
      id: 'view',
      label: 'View',
      icon: Eye,
      onClick: (row) => handleView(row),
    }
  ], [handleView]);

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
        data={flattenedEnrollments}
        columns={columns}
        actions={actions}
        title="Student Enrollments"
        searchKey="student_name"
        searchPlaceholder="Search by admission no or student name..."
        showSearch={!apiParams}
        loading={isLoading}
        export={{ enabled: true, filename: 'enrollments_list' }}
        pagination="server"
        totalCount={result.data?.total_count ?? 0}
        currentPage={result.data?.current_page ?? currentPage}
        pageSize={result.data?.page_size ?? pageSize}
        pageSizeOptions={[10, 25, 50, 100]}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
        toolbarLeftContent={
          apiParams ? (
            <div className="w-full sm:flex-1 min-w-0">
              <Input
                placeholder="Search by admission no or student name..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="h-9 w-full"
                leftIcon={<SearchIcon className="h-4 w-4 text-muted-foreground" />}
              />
            </div>
          ) : undefined
        }
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
        classes={classes as any}
        groups={allGroups as any}
        courses={allCourses as any}
      />
    </div>
  );
};

export const EnrollmentsTab = EnrollmentsTabComponent;
export default EnrollmentsTabComponent;
