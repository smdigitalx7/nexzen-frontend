import { useState, useMemo, useCallback } from 'react';
import { EnhancedDataTable } from '@/components/shared';
import {
  EnrollmentSearchForm,
  EnrollmentViewDialog,
  EnrollmentEditDialog,
} from './enrollments';
import { 
  useSchoolEnrollmentsList,
  useSchoolEnrollment,
  useSchoolEnrollmentByAdmission,
} from '@/lib/hooks/school';
// Note: useSchoolClasses, useSchoolSections from dropdowns (naming conflict)
import { useSchoolClasses, useSchoolSections } from '@/lib/hooks/school/use-school-dropdowns';
import type { ColumnDef } from '@tanstack/react-table';
import type { SchoolEnrollmentRead } from '@/lib/types/school';
import { formatDate } from '@/lib/utils/formatting/date';

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
  
  // Fetch sections for enrollment class when searching by admission_no
  const admissionNoResult = useSchoolEnrollmentByAdmission(query.admission_no?.trim());
  const enrollmentClassId = admissionNoResult.data?.class_id;
  const { data: enrollmentSectionsData } = useSchoolSections(enrollmentClassId || 0);
  
  const classes = classesData?.items || [];
  const sections = sectionsData?.items || [];
  // Use enrollment sections if available, otherwise use regular sections
  const allSections = enrollmentClassId ? (enrollmentSectionsData?.items || sections) : sections;

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

  // API hooks - use by-admission endpoint when admission_no is provided, otherwise use list
  const result = useSchoolEnrollmentsList(apiParams);
  
  // Determine which data source to use
  const shouldUseAdmissionNo = Boolean(query.admission_no?.trim());
  const isLoading = shouldUseAdmissionNo ? admissionNoResult.isLoading : result.isLoading;
  const isError = shouldUseAdmissionNo ? admissionNoResult.isError : result.isError;

  // Dialog state
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewEnrollmentId, setViewEnrollmentId] = useState<number | null>(null);
  const [editStudentId, setEditStudentId] = useState<number | null>(null);

  // Fetch selected enrollment for viewing
  const { data: viewEnrollment, isLoading: isLoadingView } = useSchoolEnrollment(viewEnrollmentId);

  // Handle view
  const handleView = useCallback((enrollment: any) => {
    setViewEnrollmentId(enrollment.enrollment_id);
    setIsViewDialogOpen(true);
  }, []);

  // Handle edit from table action
  const handleEdit = useCallback((enrollment: any) => {
    if (enrollment?.student_id) {
      setEditStudentId(enrollment.student_id);
      setIsEditDialogOpen(true);
    }
  }, []);

  // Handle edit success - refresh data and reopen view
  const handleEditSuccess = useCallback(() => {
    if (viewEnrollmentId) {
      // Refetch enrollment data
      // The query will automatically refetch due to cache invalidation
    }
  }, [viewEnrollmentId]);

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

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(() => [
    {
      type: 'view' as const,
      onClick: (row: any) => handleView(row)
    },
    {
      type: 'edit' as const,
      onClick: (row: any) => handleEdit(row)
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
      <EnhancedDataTable
        data={flatData}
        columns={columns}
        title="Enrollments"
        searchKey="student_name"
        searchPlaceholder="Search by student name..."
        loading={isLoading}
        showActions={true}
        actionButtonGroups={actionButtonGroups}
        actionColumnHeader="Actions"
        showActionLabels={true}
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
