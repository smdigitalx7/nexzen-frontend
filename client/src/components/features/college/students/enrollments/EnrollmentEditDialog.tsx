import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormDialog } from '@/components/shared';
import type { CollegeEnrollmentUpdate } from '@/lib/types/college';

interface EnrollmentEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  formData: CollegeEnrollmentUpdate;
  onFormDataChange: (data: CollegeEnrollmentUpdate) => void;
  onSave: () => void;
  onCancel: () => void;
  classes: any[];
  groups: any[];
  courses: any[];
  currentClassId: number;
}

export const EnrollmentEditDialog = ({
  open,
  onOpenChange,
  isLoading,
  formData,
  onFormDataChange,
  onSave,
  onCancel,
  classes,
  groups,
  courses,
  currentClassId,
}: EnrollmentEditDialogProps) => {
  const isDisabled = !formData.class_id || !formData.group_id || !formData.roll_number;

  // Filter groups based on selected class
  const availableGroups = formData.class_id 
    ? groups.filter((grp: any) => grp.class_id === formData.class_id)
    : groups.filter((grp: any) => grp.class_id === currentClassId);
  
  // Filter courses based on selected group
  const availableCourses = formData.group_id 
    ? courses.filter((crs: any) => crs.group_id === formData.group_id)
    : [];

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Enrollment"
      description="Update enrollment details."
      size="MEDIUM"
      isLoading={isLoading}
      onSave={onSave}
      onCancel={onCancel}
      saveText="Update"
      cancelText="Cancel"
      disabled={isDisabled}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="edit_class_id">Class *</Label>
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
          <Label htmlFor="edit_group_id">Group *</Label>
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
          <Label htmlFor="edit_course_id">Course (Optional)</Label>
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
          <Label htmlFor="edit_roll_number">Roll Number *</Label>
          <Input
            id="edit_roll_number"
            value={formData.roll_number || ''}
            onChange={(e) => onFormDataChange({ ...formData, roll_number: e.target.value })}
            placeholder="Enter roll number"
            required
          />
        </div>
        <div>
          <Label htmlFor="edit_enrollment_date">Enrollment Date</Label>
          <Input
            id="edit_enrollment_date"
            type="datetime-local"
            value={formData.enrollment_date || ''}
            onChange={(e) => onFormDataChange({ ...formData, enrollment_date: e.target.value || null })}
          />
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="edit_is_active"
            checked={formData.is_active ?? true}
            onChange={(e) => onFormDataChange({ ...formData, is_active: e.target.checked })}
            className="h-4 w-4"
          />
          <Label htmlFor="edit_is_active" className="cursor-pointer">Active</Label>
        </div>
      </div>
    </FormDialog>
  );
};

