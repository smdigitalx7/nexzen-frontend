import { useState, useMemo, useCallback, useEffect } from 'react';
import { DataTable } from '@/common/components/shared';
import type { ActionConfig } from "@/common/components/shared/DataTable/types";
import { Eye, Search as SearchIcon } from "lucide-react";
import { Input } from "@/common/components/ui/input";
import {
  EnrollmentSearchForm,
  EnrollmentViewDialog,
} from './enrollments';
import { 
  useSchoolEnrollmentsList,
  useSchoolEnrollment,
  useSchoolEnrollmentByAdmission,
} from '@/features/school/hooks';
// Note: useSchoolClasses, useSchoolSections from dropdowns (naming conflict)
import { useSchoolClasses, useSchoolSections } from '@/features/school/hooks/use-school-dropdowns';
import type { ColumnDef } from '@tanstack/react-table';
import type { SchoolEnrollmentRead } from '@/features/school/types';
import { formatDate } from '@/common/utils/formatting/date';
import { useTabEnabled } from '@/common/hooks/use-tab-navigation';

const EnrollmentsTabComponent = () => {
  // ✅ OPTIMIZATION: Check if this tab is active before fetching
  const isTabActive = useTabEnabled("enrollments", "enrollments");
  
  // State management
  const [query, setQuery] = useState<{ class_id: number | ''; section_id?: number | ''; admission_no?: string }>({ 
    class_id: '', 
    section_id: '', 
    admission_no: '' 
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState<string | undefined>(undefined);

  useEffect(() => {
    const trimmed = searchInput.trim();
    const t = setTimeout(() => setSearchQuery(trimmed === "" ? undefined : trimmed), 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // ✅ OPTIMIZATION: Only fetch dropdowns when tab is active
  // ✅ FIX: Get loading states from hooks, not just data existence
  // Note: Dropdowns are on-demand, so they won't fetch unless explicitly enabled
  const { data: classesData, isLoading: isLoadingClasses } = useSchoolClasses({ enabled: isTabActive });
  const { data: sectionsData, isLoading: isLoadingSections } = useSchoolSections(
    Number(query.class_id) || 0,
    { enabled: isTabActive && Boolean(query.class_id) }
  );
  
  // ✅ OPTIMIZATION: Only fetch enrollment data when tab is active AND class_id is provided
  const shouldFetchEnrollments = isTabActive && Boolean(query.class_id);
  const admissionNoResult = useSchoolEnrollmentByAdmission(
    shouldFetchEnrollments ? query.admission_no?.trim() : null
  );
  const enrollmentClassId = admissionNoResult.data?.class_id;
  const { data: enrollmentSectionsData, isLoading: isLoadingEnrollmentSections } = useSchoolSections(
    enrollmentClassId || 0,
    { enabled: isTabActive && Boolean(enrollmentClassId) }
  );
  
  const classes = classesData?.items || [];
  const sections = sectionsData?.items || [];
  // Use enrollment sections if available, otherwise use regular sections
  const allSections = enrollmentClassId ? (enrollmentSectionsData?.items || sections) : sections;

  // Memoized API parameters - class_id required; include pagination and server-side search
  const apiParams = useMemo(() => {
    if (!shouldFetchEnrollments) return undefined;
    const params: Record<string, number | string | undefined> = {
      class_id: Number(query.class_id),
      page: currentPage,
      page_size: pageSize,
      search: searchQuery ?? undefined,
    };
    if (query.section_id) params.section_id = Number(query.section_id);
    return params;
  }, [query.class_id, query.section_id, shouldFetchEnrollments, currentPage, pageSize, searchQuery]);

  // ✅ OPTIMIZATION: API hooks - only fetch when tab is active and params are valid
  const result = useSchoolEnrollmentsList({
    ...apiParams,
    enabled: shouldFetchEnrollments, // ✅ Gate by tab active state
  });
  
  // Determine which data source to use
  const shouldUseAdmissionNo = Boolean(query.admission_no?.trim());
  // ✅ FIX: Aggregate loading states from query hooks (not data existence checks)
  // Only show loading if queries are actually enabled and loading
  // For dropdowns: only show loading if they're enabled (tab is active) AND actually loading
  // For enrollments: only show loading if query is enabled AND loading
  const isLoading = 
    (isTabActive && isLoadingClasses) ||
    (isTabActive && query.class_id && isLoadingSections) ||
    (isTabActive && enrollmentClassId && isLoadingEnrollmentSections) ||
    (shouldUseAdmissionNo ? admissionNoResult.isLoading : (shouldFetchEnrollments && result.isLoading));

  // Dialog state
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [viewEnrollmentId, setViewEnrollmentId] = useState<number | null>(null);

  // Fetch selected enrollment for viewing
  const { data: viewEnrollment, isLoading: isLoadingView } = useSchoolEnrollment(viewEnrollmentId);

  // Handle view
  const handleView = useCallback((enrollment: SchoolEnrollmentRead) => {
    setViewEnrollmentId(enrollment.enrollment_id);
    setIsViewDialogOpen(true);
  }, []);


  // Memoized handlers
  const handleSectionChange = useCallback((value: string) => {
    setQuery(prev => ({ 
      ...prev, 
      section_id: value ? Number(value) : '' 
    }));
    setCurrentPage(1);
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

  // Handle class change - reset section and pagination when class changes
  const handleClassChange = useCallback((value: string) => {
    setQuery(prev => ({ 
      ...prev, 
      class_id: value ? Number(value) : '', 
      section_id: '',
    }));
    setCurrentPage(1);
  }, []);

  // Enrollments data for table (flat list from API + optional class_name from dropdown)
  const flatData = useMemo(() => {
    // If admission_no is provided, use the by-admission endpoint result
    if (shouldUseAdmissionNo && admissionNoResult.data) {
      const enrollment = admissionNoResult.data;
      const classInfo = classes.find(c => c.class_id === enrollment.class_id);
      const sectionInfo = allSections.find(s => s.section_id === enrollment.section_id);
      return [{
        enrollment_id: enrollment.enrollment_id,
        admission_no: enrollment.admission_no,
        student_name: enrollment.student_name,
        roll_number: enrollment.roll_number,
        class_id: enrollment.class_id,
        section_id: enrollment.section_id,
        section_name: sectionInfo?.section_name || '',
        class_name: classInfo?.class_name || '',
        enrollment_date: enrollment.enrollment_date || null,
        student_id: enrollment.student_id,
        is_active: enrollment.is_active,
      } as SchoolEnrollmentRead];
    }
    // List endpoint returns flat enrollments array
    const list = result.data?.enrollments ?? [];
    if (!Array.isArray(list) || list.length === 0) return [];
    return list.map((e) => ({
      ...e,
      class_name: classes.find((c) => c.class_id === e.class_id)?.class_name ?? '',
    }));
  }, [shouldUseAdmissionNo, admissionNoResult.data, result.data?.enrollments, classes, allSections]);

  // Action configurations for DataTable V2
  const actions: ActionConfig<SchoolEnrollmentRead>[] = useMemo(() => [
    {
      id: 'view',
      label: 'View',
      icon: Eye,
      onClick: (row) => handleView(row)
    }
  ], [handleView]);

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
      cell: ({ row }) => {
        const dateValue = row.original.enrollment_date;
        if (!dateValue) return '-';
        // Format date to show only date part (no time)
        return formatDate(dateValue, { year: 'numeric', month: 'short', day: 'numeric' });
      },
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

      {/* Data Table with server-side search (same pattern as Reservations) */}
      <DataTable
        data={flatData}
        columns={columns}
        title="Student Enrollments"
        searchKey="student_name"
        searchPlaceholder="Search by admission no or student name..."
        showSearch={!shouldFetchEnrollments}
        loading={isLoading}
        export={{ enabled: true, filename: "enrollments" }}
        actions={actions}
        actionsHeader="Actions"
        pagination="server"
        totalCount={result.data?.total_count ?? 0}
        currentPage={result.data?.current_page ?? currentPage}
        pageSize={result.data?.page_size ?? pageSize}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={(newSize) => {
          setPageSize(newSize);
          setCurrentPage(1);
        }}
        toolbarLeftContent={
          shouldFetchEnrollments ? (
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
    </div>
  );
};

export const EnrollmentsTab = EnrollmentsTabComponent;
export default EnrollmentsTabComponent;
