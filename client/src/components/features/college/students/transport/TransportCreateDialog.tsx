import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { FormDialog } from '@/components/shared';
import { BusRouteDropdown } from '@/components/shared/Dropdowns';
import type { CollegeTransportAssignmentCreate } from '@/lib/types/college';

interface TransportCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  formData: CollegeTransportAssignmentCreate;
  onFormDataChange: (data: CollegeTransportAssignmentCreate) => void;
  onSave: () => void;
  onCancel: () => void;
  enrollments: any[];
  busRoutes: any[];
}

export const TransportCreateDialog = ({
  open,
  onOpenChange,
  isLoading,
  formData,
  onFormDataChange,
  onSave,
  onCancel,
  enrollments,
  busRoutes,
}: TransportCreateDialogProps) => {
  const isDisabled = !formData.enrollment_id || !formData.bus_route_id || !formData.start_date || !formData.pickup_point?.trim();

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Create Transport Assignment"
      description="Add a new transport assignment for a student."
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
          <Label htmlFor="enrollment_id">Enrollment *</Label>
          <Select
            value={formData.enrollment_id ? String(formData.enrollment_id) : ''}
            onValueChange={(value) => onFormDataChange({ ...formData, enrollment_id: Number(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select enrollment" />
            </SelectTrigger>
            <SelectContent>
              {enrollments.length === 0 ? (
                <div className="px-2 py-2 text-center text-xs text-muted-foreground">
                  No students
                </div>
              ) : (
                enrollments.map((enrollment: any) => {
                  const displayParts = [
                    enrollment.student_name,
                    enrollment.class_name || '',
                    enrollment.group_name || '',
                  ].filter(Boolean);
                  const displayText = displayParts.join(' - ');
                  const rollNumber = enrollment.roll_number ? ` (Roll: ${enrollment.roll_number})` : '';
                  return (
                    <SelectItem key={enrollment.enrollment_id} value={String(enrollment.enrollment_id)}>
                      {displayText}{rollNumber}
                    </SelectItem>
                  );
                })
              )}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="bus_route_id">Bus Route *</Label>
          <BusRouteDropdown
            value={formData.bus_route_id || null}
            onChange={(value) => onFormDataChange({ ...formData, bus_route_id: value || 0 })}
            placeholder="Select bus route"
            required
          />
        </div>
        <div>
          <Label htmlFor="pickup_point">Pickup Point *</Label>
          <Input
            id="pickup_point"
            value={formData.pickup_point || ''}
            onChange={(e) => onFormDataChange({ ...formData, pickup_point: e.target.value })}
            placeholder="Enter pickup point"
            required
          />
        </div>
        <div>
          <Label htmlFor="start_date">Start Date *</Label>
          <DatePicker
            id="start_date"
            value={formData.start_date}
            onChange={(value) => onFormDataChange({ ...formData, start_date: value })}
            placeholder="Select start date"
            required
          />
        </div>
      </div>
    </FormDialog>
  );
};

