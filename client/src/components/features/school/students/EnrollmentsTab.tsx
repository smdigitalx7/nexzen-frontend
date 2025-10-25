import { useState, useMemo, memo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useSchoolEnrollmentsList } from '@/lib/hooks/school/use-school-enrollments';
import type { SchoolEnrollmentWithClassSectionDetails, SchoolEnrollmentRead } from '@/lib/types/school/enrollments';

// Memoized enrollment row component
const EnrollmentRow = memo(({ enrollment, index }: { enrollment: SchoolEnrollmentRead; index: number }) => (
  <tr key={`enr-${enrollment.enrollment_id}-${enrollment.admission_no}-${index}`} className="border-t">
    <td className="py-2 pr-4 font-mono">{enrollment.enrollment_id}</td>
    <td className="py-2 pr-4">{enrollment.admission_no}</td>
    <td className="py-2 pr-4">{enrollment.student_name}</td>
    <td className="py-2 pr-4">{enrollment.roll_number}</td>
    <td className="py-2 pr-4">{enrollment.section_name}</td>
    <td className="py-2 pr-4">{enrollment.enrollment_date || '-'}</td>
  </tr>
));

EnrollmentRow.displayName = "EnrollmentRow";

// Memoized class group component
const ClassGroup = memo(({ classGroup, index }: { classGroup: SchoolEnrollmentWithClassSectionDetails; index: number }) => (
  <div key={`${classGroup.class_id}-${classGroup.class_name}-${index}`} className="border rounded-md">
    <div className="px-4 py-2 font-medium bg-slate-50">
      {classGroup.class_name} ({classGroup.students?.length || 0} students)
    </div>
    <div className="overflow-x-auto p-2">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-slate-600">
            <th className="py-2 pr-4">Enrollment ID</th>
            <th className="py-2 pr-4">Admission No</th>
            <th className="py-2 pr-4">Student</th>
            <th className="py-2 pr-4">Roll No</th>
            <th className="py-2 pr-4">Section</th>
            <th className="py-2 pr-4">Date</th>
          </tr>
        </thead>
        <tbody>
          {classGroup.students && Array.isArray(classGroup.students) && classGroup.students.length > 0 ? (
            classGroup.students.map((enrollment: SchoolEnrollmentRead, sIdx: number) => (
              <EnrollmentRow key={`enr-${enrollment.enrollment_id}-${enrollment.admission_no}-${sIdx}`} enrollment={enrollment} index={sIdx} />
            ))
          ) : (
            <tr>
              <td colSpan={6} className="py-2 pr-4 text-center text-slate-500">
                No students enrolled in this class
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
));

ClassGroup.displayName = "ClassGroup";

// Memoized search form component
const SearchForm = memo(({ 
  query, 
  onQueryChange, 
  onSearch, 
  onClear 
}: { 
  query: { class_id: number | ''; section_id?: number | ''; admission_no?: string };
  onQueryChange: (field: string, value: any) => void;
  onSearch: () => void;
  onClear: () => void;
}) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      <div>
        <label className="text-sm font-medium text-slate-700">Class ID</label>
        <Input
          type="number"
          placeholder="Enter class ID"
          value={query.class_id}
          onChange={(e) => onQueryChange('class_id', e.target.value === '' ? '' : Number(e.target.value))}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Section ID (optional)</label>
        <Input
          type="number"
          placeholder="Enter section ID"
          value={query.section_id ?? ''}
          onChange={(e) => onQueryChange('section_id', e.target.value === '' ? '' : Number(e.target.value))}
        />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Admission No (optional)</label>
        <Input
          placeholder="Admission no"
          value={query.admission_no ?? ''}
          onChange={(e) => onQueryChange('admission_no', e.target.value)}
        />
      </div>
    </div>

    <div className="flex gap-2">
      <Button 
        onClick={onSearch} 
        disabled={!query.class_id}
        className="flex items-center gap-2"
      >
        <Eye className="w-4 h-4" />
        Search Enrollments
      </Button>
      <Button 
        variant="outline"
        onClick={onClear}
      >
        Clear
      </Button>
    </div>
  </div>
));

SearchForm.displayName = "SearchForm";

const EnrollmentsTabComponent = () => {
  // State management
  const [query, setQuery] = useState<{ class_id: number | ''; section_id?: number | ''; admission_no?: string }>({ 
    class_id: '', 
    section_id: '', 
    admission_no: '' 
  });

  // Memoized API parameters
  const apiParams = useMemo(() => {
    return query.class_id
      ? { class_id: Number(query.class_id), section_id: query.section_id ? Number(query.section_id) : undefined }
      : undefined;
  }, [query.class_id, query.section_id]);

  // API hook with memoized parameters
  const result = useSchoolEnrollmentsList(apiParams);

  // Memoized handlers
  const handleQueryChange = useCallback((field: string, value: any) => {
    setQuery(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleSearch = useCallback(() => {
    // Search is handled automatically by the API hook when query changes
  }, []);

  const handleClear = useCallback(() => {
    setQuery({ class_id: '', section_id: '', admission_no: '' });
  }, []);

  // Memoized enrollments data
  const enrollments = useMemo(() => {
    return result.data?.enrollments || [];
  }, [result.data?.enrollments]);

  // Memoized pagination info
  const paginationInfo = useMemo(() => {
    if (!result.data) return null;
    return {
      totalCount: result.data.total_count,
      currentPage: result.data.current_page,
      totalPages: result.data.total_pages
    };
  }, [result.data]);

  return (
    <div className="space-y-4">
      <SearchForm
        query={query}
        onQueryChange={handleQueryChange}
        onSearch={handleSearch}
        onClear={handleClear}
      />

      {query.class_id === '' ? (
        <div className="text-sm text-slate-600">Enter a class ID to load enrollments.</div>
      ) : result.isLoading ? (
        <div className="text-sm text-slate-600">Loading enrollments...</div>
      ) : result.isError ? (
        <div className="text-sm text-red-600">Failed to load enrollments</div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Enrollments</CardTitle>
            {paginationInfo && (
              <div className="text-sm text-slate-600">
                Total: {paginationInfo.totalCount} students
                {paginationInfo.totalPages > 1 && (
                  <span> • Page {paginationInfo.currentPage} of {paginationInfo.totalPages}</span>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {enrollments.length > 0 ? (
              enrollments.map((classGroup: SchoolEnrollmentWithClassSectionDetails, idx: number) => (
                <ClassGroup key={`${classGroup.class_id}-${classGroup.class_name}-${idx}`} classGroup={classGroup} index={idx} />
              ))
            ) : (
              <div className="text-sm text-slate-600">No enrollments found.</div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export const EnrollmentsTab = EnrollmentsTabComponent;
export default EnrollmentsTabComponent;
