import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye } from 'lucide-react';
import { useCollegeEnrollmentsList } from '@/lib/hooks/college/use-college-enrollments';
import { useCollegeClasses, useCollegeGroups, useCollegeCourses } from '@/lib/hooks/college/use-college-dropdowns';
import type { CollegeEnrollmentWithClassGroupCourseDetails, CollegeEnrollmentRead } from '@/lib/types/college/enrollments';

export const EnrollmentsTab = () => {
  const [query, setQuery] = useState<{ class_id: number | ''; group_id?: number | ''; course_id?: number | '' }>({ class_id: '', group_id: '', course_id: '' });
  
  // Fetch dropdown data
  const { data: classesData } = useCollegeClasses();
  const { data: groupsData } = useCollegeGroups(Number(query.class_id) || 0);
  const { data: coursesData } = useCollegeCourses(Number(query.group_id) || 0);
  
  const classes = classesData?.items || [];
  const groups = groupsData?.items || [];
  const courses = coursesData?.items || [];
  
  const apiParams = useMemo(() => {
    return query.class_id
      ? {
          class_id: Number(query.class_id),
          group_id: query.group_id ? Number(query.group_id) : undefined,
          course_id: query.course_id ? Number(query.course_id) : undefined,
        }
      : undefined;
  }, [query.class_id, query.group_id, query.course_id]);
  
  const result = useCollegeEnrollmentsList(apiParams);

  // Handle class change - reset group and course when class changes
  const handleClassChange = useCallback((value: string) => {
    setQuery(prev => ({ 
      ...prev, 
      class_id: value ? Number(value) : '', 
      group_id: '', // Reset group when class changes
      course_id: '' // Reset course when class changes
    }));
  }, []);

  // Handle group change - reset course when group changes
  const handleGroupChange = useCallback((value: string) => {
    setQuery(prev => ({ 
      ...prev, 
      group_id: value ? Number(value) : '', 
      course_id: '' // Reset course when group changes
    }));
  }, []);

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="border rounded-lg p-4 bg-gray-50">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Class</label>
              <Select
                value={query.class_id ? String(query.class_id) : ''}
                onValueChange={handleClassChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls: any) => (
                    <SelectItem key={cls.class_id} value={String(cls.class_id)}>
                      {cls.class_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Group</label>
              <Select
                value={query.group_id ? String(query.group_id) : ''}
                onValueChange={handleGroupChange}
                disabled={!query.class_id}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={query.class_id ? "Select group (optional)" : "Select class first"} />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((grp: any) => (
                    <SelectItem key={grp.group_id} value={String(grp.group_id)}>
                      {grp.group_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Course</label>
              <Select
                value={query.course_id ? String(query.course_id) : ''}
                onValueChange={(value) => setQuery(prev => ({ ...prev, course_id: value ? Number(value) : '' }))}
                disabled={!query.group_id}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={query.group_id ? "Select course (optional)" : "Select group first"} />
                </SelectTrigger>
                <SelectContent>
                  {courses.map((crs: any) => (
                    <SelectItem key={crs.course_id} value={String(crs.course_id)}>
                      {crs.course_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline"
              onClick={() => setQuery({ class_id: '', group_id: '', course_id: '' })}
              className="flex items-center gap-2"
            >
              <Eye className="w-4 h-4" />
              Clear
            </Button>
          </div>
        </div>
      </div>

      {query.class_id === '' ? (
        <div className="text-sm text-slate-600">Select a class to load enrollments.</div>
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
              result.data.enrollments.map((classGroup: CollegeEnrollmentWithClassGroupCourseDetails, idx: number) => (
                <div key={`${classGroup.class_id}-${classGroup.group_id}-${classGroup.course_id ?? 'nil'}-${idx}`} className="border rounded-md">
                  <div className="px-4 py-2 font-medium bg-slate-50">
                    {classGroup.class_name} • {classGroup.group_name}
                    {classGroup.course_name ? ` • ${classGroup.course_name}` : ''}
                    {` (${classGroup.students?.length || 0} students)`}
                  </div>
                  <div className="overflow-x-auto p-2">
                    <table className="min-w-full text-sm">
                      <thead>
                        <tr className="text-left text-slate-600">
                          <th className="py-2 pr-4">Enrollment ID</th>
                          <th className="py-2 pr-4">Admission No</th>
                          <th className="py-2 pr-4">Student</th>
                          <th className="py-2 pr-4">Roll No</th>
                          <th className="py-2 pr-4">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {classGroup.students && Array.isArray(classGroup.students) && classGroup.students.length > 0 ? (
                          classGroup.students.map((enrollment: CollegeEnrollmentRead, sIdx: number) => (
                            <tr key={`enr-${enrollment.enrollment_id}-${enrollment.admission_no}-${sIdx}`} className="border-t">
                              <td className="py-2 pr-4 font-mono">{enrollment.enrollment_id}</td>
                              <td className="py-2 pr-4">{enrollment.admission_no}</td>
                              <td className="py-2 pr-4">{enrollment.student_name}</td>
                              <td className="py-2 pr-4">{enrollment.roll_number}</td>
                              <td className="py-2 pr-4">{enrollment.enrollment_date || '-'}</td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={5} className="py-2 pr-4 text-center text-slate-500">
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


