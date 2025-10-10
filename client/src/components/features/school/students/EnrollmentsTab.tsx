import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Eye } from 'lucide-react';
import { useSchoolEnrollmentsList } from '@/lib/hooks/school/use-school-enrollments';
import type { SchoolEnrollmentWithClassSectionDetails, SchoolEnrollmentRead } from '@/lib/types/school/enrollments';

export const EnrollmentsTab = () => {
  const [query, setQuery] = useState<{ class_id: number | ''; section_id?: number | ''; admission_no?: string }>({ class_id: '', section_id: '', admission_no: '' });
  const result = useSchoolEnrollmentsList(
    query.class_id
      ? { class_id: Number(query.class_id), section_id: query.section_id ? Number(query.section_id) : undefined }
      : undefined
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="text-sm font-medium text-slate-700">Class ID</label>
          <Input
            type="number"
            placeholder="Enter class ID"
            value={query.class_id}
            onChange={(e) => setQuery((q) => ({ ...q, class_id: e.target.value === '' ? '' : Number(e.target.value) }))}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Section ID (optional)</label>
          <Input
            type="number"
            placeholder="Enter section ID"
            value={query.section_id ?? ''}
            onChange={(e) => setQuery((q) => ({ ...q, section_id: e.target.value === '' ? '' : Number(e.target.value) }))}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-slate-700">Admission No (optional)</label>
          <Input
            placeholder="Admission no"
            value={query.admission_no ?? ''}
            onChange={(e) => setQuery((q) => ({ ...q, admission_no: e.target.value }))}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          onClick={() => {}} 
          disabled={!query.class_id}
          className="flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Search Enrollments
        </Button>
        <Button 
          variant="outline"
          onClick={() => setQuery({ class_id: '', section_id: '', admission_no: '' })}
        >
          Clear
        </Button>
      </div>

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
            {result.data && (
              <div className="text-sm text-slate-600">
                Total: {result.data.total_count} students
                {result.data.total_pages > 1 && (
                  <span> • Page {result.data.current_page} of {result.data.total_pages}</span>
                )}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {result.data && Array.isArray(result.data.enrollments) && result.data.enrollments.length > 0 ? (
              result.data.enrollments.map((classGroup: SchoolEnrollmentWithClassSectionDetails, idx: number) => (
                <div key={`${classGroup.class_id}-${classGroup.class_name}-${idx}`} className="border rounded-md">
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
                            <tr key={`enr-${enrollment.enrollment_id}-${enrollment.admission_no}-${sIdx}`} className="border-t">
                              <td className="py-2 pr-4 font-mono">{enrollment.enrollment_id}</td>
                              <td className="py-2 pr-4">{enrollment.admission_no}</td>
                              <td className="py-2 pr-4">{enrollment.student_name}</td>
                              <td className="py-2 pr-4">{enrollment.roll_number}</td>
                              <td className="py-2 pr-4">{enrollment.section_name}</td>
                              <td className="py-2 pr-4">{enrollment.enrollment_date || '-'}</td>
                            </tr>
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

export default EnrollmentsTab;


