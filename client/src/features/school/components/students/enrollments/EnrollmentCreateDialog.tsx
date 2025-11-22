import { Input } from '@/common/components/ui/input';
import { Label } from '@/common/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/common/components/ui/select';
import { DatePicker } from '@/common/components/ui/date-picker';
import { FormDialog } from '@/common/components/shared';
import { SchoolClassDropdown, SchoolSectionDropdown } from '@/common/components/shared/Dropdowns';
import type { SchoolEnrollmentCreate } from '@/features/school/types';

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
          <SchoolClassDropdown
            value={formData.class_id || null}
            onChange={(value) => {
              onFormDataChange({ 
                ...formData, 
                class_id: value || 0,
                section_id: 0 // Reset section when class changes
              });
            }}
            placeholder="Select class"
            required
          />
        </div>
        <div>
          <Label htmlFor="section_id">Section *</Label>
          <SchoolSectionDropdown
            classId={formData.class_id || 0}
            value={formData.section_id || null}
            onChange={(value) => onFormDataChange({ ...formData, section_id: value || 0 })}
            disabled={!formData.class_id}
            placeholder={formData.class_id ? "Select section" : "Select class first"}
            required
          />
        </div>
        <Input
          label="Roll Number"
          value={formData.roll_number || ''}
          onChange={(e) => onFormDataChange({ ...formData, roll_number: e.target.value })}
          placeholder="Enter roll number"
          required
        />
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

