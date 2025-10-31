import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormDialog } from '@/components/shared';
import type { CollegeEnrollmentCreate } from '@/lib/types/college';

interface EnrollmentCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  formData: CollegeEnrollmentCreate;
  onFormDataChange: (data: CollegeEnrollmentCreate) => void;
  onSave: () => void;
  onCancel: () => void;
  students: any[];
  classes: any[];
  groups: any[];
  courses: any[];
}

export const EnrollmentCreateDialog = ({
  open,
  onOpenChange,
  isLoading,
  formData,
  onFormDataChange,
  onSave,
  onCancel,
  students,
  classes,
  groups,
  courses,
}: EnrollmentCreateDialogProps) => {
  const isDisabled = !formData.student_id || !formData.class_id || !formData.group_id || !formData.roll_number;

  // Filter groups based on selected class
  const availableGroups = formData.class_id 
    ? groups.filter((grp: any) => grp.class_id === formData.class_id)
    : [];
  
  // Filter courses based on selected group
  const availableCourses = formData.group_id 
    ? courses.filter((crs: any) => crs.group_id === formData.group_id)
    : [];

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create Enrollment"
      description="Enroll a student into a class and group."
      size="MEDIUM"
      isLoading={isLoading}
      onSave={onSave}
      onCancel={onCancel}
      saveText="Create"
      cancelText="Cancel"
      disabled={isDisabled}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="student_id">Student *</Label>
          <Select
            value={formData.student_id ? String(formData.student_id) : ''}
            onValueChange={(value) => onFormDataChange({ ...formData, student_id: Number(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select student" />
            </SelectTrigger>
            <SelectContent>
              {students.map((student: any) => (
                <SelectItem key={student.student_id} value={String(student.student_id)}>
                  {student.admission_no} - {student.student_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="class_id">Class *</Label>
          <Select
            value={formData.class_id ? String(formData.class_id) : ''}
            onValueChange={(value) => {
              onFormDataChange({ 
                ...formData, 
                class_id: Number(value),
                group_id: 0,
                course_id: null
              });
            }}
          >
            <SelectTrigger>
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
          <Label htmlFor="group_id">Group *</Label>
          <Select
            value={formData.group_id ? String(formData.group_id) : ''}
            onValueChange={(value) => {
              onFormDataChange({ 
                ...formData, 
                group_id: Number(value),
                course_id: null
              });
            }}
            disabled={!formData.class_id}
          >
            <SelectTrigger>
              <SelectValue placeholder={formData.class_id ? "Select group" : "Select class first"} />
            </SelectTrigger>
            <SelectContent>
              {availableGroups.map((grp: any) => (
                <SelectItem key={grp.group_id} value={String(grp.group_id)}>
                  {grp.group_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="course_id">Course (Optional)</Label>
          <Select
            value={formData.course_id ? String(formData.course_id) : ''}
            onValueChange={(value) => onFormDataChange({ ...formData, course_id: value ? Number(value) : null })}
            disabled={!formData.group_id}
          >
            <SelectTrigger>
              <SelectValue placeholder={formData.group_id ? "Select course (optional)" : "Select group first"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {availableCourses.map((crs: any) => (
                <SelectItem key={crs.course_id} value={String(crs.course_id)}>
                  {crs.course_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="roll_number">Roll Number *</Label>
          <Input
            id="roll_number"
            value={formData.roll_number}
            onChange={(e) => onFormDataChange({ ...formData, roll_number: e.target.value })}
            placeholder="Enter roll number"
            required
          />
        </div>
        <div>
          <Label htmlFor="enrollment_date">Enrollment Date</Label>
          <Input
            id="enrollment_date"
            type="datetime-local"
            value={formData.enrollment_date || ''}
            onChange={(e) => onFormDataChange({ ...formData, enrollment_date: e.target.value || null })}
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="is_active"
            checked={formData.is_active ?? true}
            onChange={(e) => onFormDataChange({ ...formData, is_active: e.target.checked })}
            className="h-4 w-4"
          />
          <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
        </div>
      </div>
    </FormDialog>
  );
};

