import { useState, useMemo, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { DataTable } from '@/common/components/shared';
import type { ActionConfig } from "@/common/components/shared/DataTable/types";
import { Eye, Edit } from "lucide-react";
import {
  EnrollmentSearchForm,
  EnrollmentViewDialog,
  EnrollmentEditDialog,
} from './enrollments';
import { 
  useSchoolEnrollmentsList,
  useSchoolEnrollment,
  useSchoolEnrollmentByAdmission,
} from '@/features/school/hooks';
// Note: useSchoolClasses, useSchoolSections from dropdowns (naming conflict)
import { useSchoolClasses, useSchoolSections } from '@/features/school/hooks/use-school-dropdowns';
import { schoolKeys } from '@/features/school/hooks/query-keys';
import { batchInvalidateAndRefetch } from '@/common/hooks/useGlobalRefetch';
import type { ColumnDef } from '@tanstack/react-table';
import type { SchoolEnrollmentRead } from '@/features/school/types';
import { formatDate } from '@/common/utils/formatting/date';
import { useTabEnabled } from '@/common/hooks/use-tab-navigation';

const EnrollmentsTabComponent = () => {
  const queryClient = useQueryClient();
  
  // ✅ OPTIMIZATION: Check if this tab is active before fetching
  const isTabActive = useTabEnabled("enrollments", "enrollments");
  
  // State management
  const [query, setQuery] = useState<{ class_id: number | ''; section_id?: number | ''; admission_no?: string }>({ 
    class_id: '', 
    section_id: '', 
    admission_no: '' 
  });
  // ✅ FIX: Add refreshKey to force table refresh after updates
  const [refreshKey, setRefreshKey] = useState(0);

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

  // Memoized API parameters - class_id is required
  const apiParams = useMemo(() => {
    if (!shouldFetchEnrollments) return undefined;
    const params: Record<string, number | string> = {};
    if (query.class_id) {
      params.class_id = Number(query.class_id);
      if (query.section_id) {
        params.section_id = Number(query.section_id);
      }
    }
    return params;
  }, [query.class_id, query.section_id, shouldFetchEnrollments]);

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
  const isError = shouldUseAdmissionNo ? admissionNoResult.isError : result.isError;

  // Dialog state
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewEnrollmentId, setViewEnrollmentId] = useState<number | null>(null);
  const [editStudentId, setEditStudentId] = useState<number | null>(null);

  // Fetch selected enrollment for viewing
  const { data: viewEnrollment, isLoading: isLoadingView } = useSchoolEnrollment(viewEnrollmentId);

  // Handle view
  const handleView = useCallback((enrollment: SchoolEnrollmentRead) => {
    setViewEnrollmentId(enrollment.enrollment_id);
    setIsViewDialogOpen(true);
  }, []);

  // Handle edit from table action
  const handleEdit = useCallback((enrollment: SchoolEnrollmentRead) => {
    if (enrollment?.student_id) {
      setEditStudentId(enrollment.student_id);
      setIsEditDialogOpen(true);
    }
  }, []);

  // ✅ FIX: Handle edit success - batch invalidate queries and force table refresh
  const handleEditSuccess = useCallback(async () => {
    // Batch invalidate all related queries
    batchInvalidateAndRefetch([
      schoolKeys.enrollments.root(),
      schoolKeys.students.root(),
    ]);

    // Small delay to ensure React Query cache is updated
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // ✅ FIX: Increment refreshKey to force table refresh
    setRefreshKey(prev => prev + 1);
  }, []);

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
    // If admission_no is provided, use the by-admission endpoint result
    if (shouldUseAdmissionNo && admissionNoResult.data) {
      // Transform single enrollment to match table format
      const enrollment = admissionNoResult.data;
      // Find class name from classes dropdown
      const classInfo = classes.find(c => c.class_id === enrollment.class_id);
      // Find section name from sections dropdown
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
    
    // Otherwise, use the list endpoint result
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
  }, [shouldUseAdmissionNo, admissionNoResult.data, result.data?.enrollments, classes, allSections]);

  // Action configurations for DataTable V2
  const actions: ActionConfig<SchoolEnrollmentRead>[] = useMemo(() => [
    {
      id: 'view',
      label: 'View',
      icon: Eye,
      onClick: (row) => handleView(row)
    },
    {
      id: 'edit',
      label: 'Edit',
      icon: Edit,
      onClick: (row) => handleEdit(row)
    }
  ], [handleView, handleEdit]);

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

      {/* Enhanced Data Table */}
      {/* Data Table V2 */}
      <DataTable
        data={flatData}
        columns={columns}
        title="Student Enrollments"
        searchKey="student_name"
        searchPlaceholder="Search by student name..."
        loading={isLoading}
        export={{ enabled: true, filename: "enrollments" }}
        actions={actions}
        actionsHeader="Actions"
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

      {/* Edit Student Dialog */}
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
