import { useState, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { EnhancedDataTable } from '@/components/shared';
import { useSchoolEnrollmentsList } from '@/lib/hooks/school/use-school-enrollments';
import type { SchoolEnrollmentRead } from '@/lib/types/school/enrollments';
import type { ColumnDef } from '@tanstack/react-table';

const EnrollmentsTabComponent = () => {
  // State management
  const [query, setQuery] = useState<{ class_id: number | ''; section_id?: number | ''; admission_no?: string }>({ 
    class_id: '', 
    section_id: '', 
    admission_no: '' 
  });

  // Memoized API parameters
  const apiParams = useMemo(() => {
    const params: any = {};
    if (query.class_id) {
      params.class_id = Number(query.class_id);
    }
    if (query.section_id) {
      params.section_id = Number(query.section_id);
    }
    // Return params object even if empty - backend supports fetching all enrollments
    return params;
  }, [query.class_id, query.section_id]);

  // API hook with memoized parameters
  const result = useSchoolEnrollmentsList(apiParams);

  // Memoized handlers
  const handleQueryChange = useCallback((field: string, value: any) => {
    setQuery(prev => ({ ...prev, [field]: value }));
  }, []);

  const handleClear = useCallback(() => {
    setQuery({ class_id: '', section_id: '', admission_no: '' });
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

  // Define columns
  const columns: ColumnDef<SchoolEnrollmentRead>[] = useMemo(() => [
    {
      accessorKey: 'enrollment_id',
      header: 'Enrollment ID',
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.enrollment_id}</span>,
    },
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
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700">Class ID (optional)</label>
              <Input
                type="number"
                placeholder="Enter class ID"
                value={query.class_id}
                onChange={(e) => handleQueryChange('class_id', e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Section ID (optional)</label>
              <Input
                type="number"
                placeholder="Enter section ID"
                value={query.section_id ?? ''}
                onChange={(e) => handleQueryChange('section_id', e.target.value === '' ? '' : Number(e.target.value))}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Admission No (optional)</label>
              <Input
                placeholder="Admission no"
                value={query.admission_no ?? ''}
                onChange={(e) => handleQueryChange('admission_no', e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleClear}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Clear
            </Button>
          </div>
        </div>
      </div>

      {/* Enhanced Data Table */}
      <EnhancedDataTable
        data={flatData}
        columns={columns}
        title="Enrollments"
        searchKey="student_name"
        searchPlaceholder="Search by student name..."
        loading={result.isLoading}
      />
    </div>
  );
};

export const EnrollmentsTab = EnrollmentsTabComponent;
export default EnrollmentsTabComponent;
