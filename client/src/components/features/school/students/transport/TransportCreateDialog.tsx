import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormDialog } from '@/components/shared';
import type { SchoolStudentTransportAssignmentCreate } from '@/lib/types/school';

interface TransportCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  formData: SchoolStudentTransportAssignmentCreate;
  onFormDataChange: (data: SchoolStudentTransportAssignmentCreate) => void;
  onSave: () => void;
  onCancel: () => void;
  enrollments: any[];
  busRoutes: any[];
  slabs: any[];
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
  slabs,
}: TransportCreateDialogProps) => {
  const isDisabled = !formData.enrollment_id || !formData.bus_route_id || !formData.slab_id || !formData.start_date;

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
              {enrollments.map((enrollment: any) => (
                <SelectItem key={enrollment.enrollment_id} value={String(enrollment.enrollment_id)}>
                  {enrollment.admission_no} - {enrollment.student_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="bus_route_id">Bus Route *</Label>
          <Select
            value={formData.bus_route_id ? String(formData.bus_route_id) : ''}
            onValueChange={(value) => onFormDataChange({ ...formData, bus_route_id: Number(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select bus route" />
            </SelectTrigger>
            <SelectContent>
              {busRoutes.map((route: any) => (
                <SelectItem key={route.bus_route_id} value={String(route.bus_route_id)}>
                  {route.route_name} {route.route_no ? `(${route.route_no})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="slab_id">Distance Slab *</Label>
          <Select
            value={formData.slab_id ? String(formData.slab_id) : ''}
            onValueChange={(value) => onFormDataChange({ ...formData, slab_id: Number(value) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select distance slab" />
            </SelectTrigger>
            <SelectContent>
              {slabs.map((slab: any) => (
                <SelectItem key={slab.slab_id} value={String(slab.slab_id)}>
                  {slab.slab_name} ({slab.min_distance}-{slab.max_distance ?? '∞'} km) - ₹{slab.fee_amount}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="pickup_point">Pickup Point</Label>
          <Input
            id="pickup_point"
            value={formData.pickup_point || ''}
            onChange={(e) => onFormDataChange({ ...formData, pickup_point: e.target.value })}
            placeholder="Enter pickup point"
          />
        </div>
        <div>
          <Label htmlFor="start_date">Start Date *</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => onFormDataChange({ ...formData, start_date: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="end_date">End Date (Optional)</Label>
          <Input
            id="end_date"
            type="date"
            value={formData.end_date || ''}
            onChange={(e) => onFormDataChange({ ...formData, end_date: e.target.value || null })}
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

