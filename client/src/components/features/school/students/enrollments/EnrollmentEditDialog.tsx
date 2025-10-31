import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormDialog } from '@/components/shared';
import type { SchoolEnrollmentUpdate } from '@/lib/types/school';

interface EnrollmentEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  formData: {
    class_id: number;
    section_id: number;
    roll_number: string;
    enrollment_date: string | null;
    is_active: boolean;
  };
  onFormDataChange: (data: {
    class_id: number;
    section_id: number;
    roll_number: string;
    enrollment_date: string | null;
    is_active: boolean;
  }) => void;
  onSave: () => void;
  onCancel: () => void;
  classes: any[];
  sections: any[];
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
  sections,
}: EnrollmentEditDialogProps) => {
  // Filter sections based on selected class
  const availableSections = formData.class_id 
    ? sections.filter((sec: any) => sec.class_id === formData.class_id)
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
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="edit_class_id">Class</Label>
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
          <Label htmlFor="edit_section_id">Section</Label>
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
          <Label htmlFor="edit_roll_number">Roll Number</Label>
          <Input
            id="edit_roll_number"
            value={formData.roll_number || ''}
            onChange={(e) => onFormDataChange({ ...formData, roll_number: e.target.value })}
            placeholder="Enter roll number"
          />
        </div>
        <div>
          <Label htmlFor="edit_enrollment_date">Enrollment Date</Label>
          <Input
            id="edit_enrollment_date"
            type="date"
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

