import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CollegeClassDropdown, CollegeGroupDropdown, CollegeCourseDropdown } from '@/components/shared/Dropdowns';
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
            <CollegeClassDropdown
              value={typeof query.class_id === 'number' ? query.class_id : null}
              onChange={(value) => onClassChange(value !== null ? value.toString() : '')}
              placeholder="Select class"
              className="w-full"
              emptyValue
              emptyValueLabel="Select class"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Group</label>
            <CollegeGroupDropdown
              classId={typeof query.class_id === 'number' ? query.class_id : undefined}
              value={typeof query.group_id === 'number' ? query.group_id : null}
              onChange={(value) => onGroupChange(value !== null ? value.toString() : '')}
              disabled={typeof query.class_id !== 'number'}
              placeholder={typeof query.class_id === 'number' ? "All Groups" : "Select class first"}
              className="w-full"
              emptyValue
              emptyValueLabel="Select group"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">Course</label>
            <CollegeCourseDropdown
              groupId={typeof query.group_id === 'number' ? query.group_id : 0}
              value={typeof query.course_id === 'number' ? query.course_id : null}
              onChange={(value) => onCourseChange(value !== null ? value.toString() : '')}
              disabled={typeof query.group_id !== 'number'}
              placeholder={typeof query.group_id === 'number' ? "All Courses" : "Select group first"}
              className="w-full"
              emptyValue
              emptyValueLabel="Select course"
            />
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

