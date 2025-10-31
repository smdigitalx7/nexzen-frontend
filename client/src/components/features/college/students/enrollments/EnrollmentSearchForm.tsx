import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye } from 'lucide-react';

interface EnrollmentSearchFormProps {
  query: { class_id: number | ''; group_id?: number | ''; course_id?: number | ''; admission_no?: string };
  classes: any[];
  groups: any[];
  courses: any[];
  onClassChange: (value: string) => void;
  onGroupChange: (value: string) => void;
  onCourseChange: (value: string) => void;
  onAdmissionNoChange: (value: string) => void;
  onClear: () => void;
}

export const EnrollmentSearchForm = ({
  query,
  classes,
  groups,
  courses,
  onClassChange,
  onGroupChange,
  onCourseChange,
  onAdmissionNoChange,
  onClear,
}: EnrollmentSearchFormProps) => {
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Class</label>
            <Select
              value={query.class_id ? String(query.class_id) : ''}
              onValueChange={onClassChange}
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
              onValueChange={onGroupChange}
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
              onValueChange={onCourseChange}
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
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Admission No (optional)</label>
            <Input
              placeholder="Enter admission number"
              value={query.admission_no ?? ''}
              onChange={(e) => onAdmissionNoChange(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={onClear}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Eye className="w-4 h-4" />
            Clear
          </Button>
        </div>
      </div>
    </div>
  );
};

