import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { FormDialog } from '@/components/shared';
import type { SchoolEnrollmentCreate } from '@/lib/types/school';

interface EnrollmentCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  formData: SchoolEnrollmentCreate;
  onFormDataChange: (data: SchoolEnrollmentCreate) => void;
  onSave: () => void;
  onCancel: () => void;
  students: any[];
  classes: any[];
  sections: any[];
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
  sections,
}: EnrollmentCreateDialogProps) => {
  const isDisabled = !formData.student_id || !formData.class_id || !formData.section_id || !formData.roll_number;

  // Filter sections based on selected class
  const availableSections = formData.class_id 
    ? sections.filter((sec: any) => sec.class_id === formData.class_id)
    : [];

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create Enrollment"
      description="Add a new enrollment for a student."
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
              const newClassId = Number(value);
              onFormDataChange({ 
                ...formData, 
                class_id: newClassId,
                section_id: 0 // Reset section when class changes
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
          <Label htmlFor="section_id">Section *</Label>
          <Select
            value={formData.section_id ? String(formData.section_id) : ''}
            onValueChange={(value) => onFormDataChange({ ...formData, section_id: Number(value) })}
            disabled={!formData.class_id}
          >
            <SelectTrigger>
              <SelectValue placeholder={formData.class_id ? "Select section" : "Select class first"} />
            </SelectTrigger>
            <SelectContent>
              {availableSections.map((sec: any) => (
                <SelectItem key={sec.section_id} value={String(sec.section_id)}>
                  {sec.section_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="roll_number">Roll Number *</Label>
          <Input
            id="roll_number"
            value={formData.roll_number || ''}
            onChange={(e) => onFormDataChange({ ...formData, roll_number: e.target.value })}
            placeholder="Enter roll number"
            required
          />
        </div>
        <div>
          <Label htmlFor="enrollment_date">Enrollment Date</Label>
          <DatePicker
            id="enrollment_date"
            value={formData.enrollment_date || ''}
            onChange={(value) => onFormDataChange({ ...formData, enrollment_date: value || null })}
            placeholder="Select enrollment date"
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

