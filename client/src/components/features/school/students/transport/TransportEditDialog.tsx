import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { FormDialog } from '@/components/shared';
import { BusRouteDropdown, DistanceSlabDropdown } from '@/components/shared/Dropdowns';
import type { SchoolStudentTransportAssignmentUpdate } from '@/lib/types/school';

interface TransportEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading: boolean;
  formData: {
    bus_route_id: number;
    slab_id: number;
    pickup_point: string;
    start_date: string;
    end_date: string | null;
    is_active: boolean;
  };
  onFormDataChange: (data: {
    bus_route_id: number;
    slab_id: number;
    pickup_point: string;
    start_date: string;
    end_date: string | null;
    is_active: boolean;
  }) => void;
  onSave: () => void;
  onCancel: () => void;
  busRoutes: any[];
  slabs: any[];
}

export const TransportEditDialog = ({
  open,
  onOpenChange,
  isLoading,
  formData,
  onFormDataChange,
  onSave,
  onCancel,
  busRoutes,
  slabs,
}: TransportEditDialogProps) => {
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Transport Assignment"
      description="Update transport assignment details."
      size="MEDIUM"
      isLoading={isLoading}
      onSave={onSave}
      onCancel={onCancel}
      saveText="Update"
      cancelText="Cancel"
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="edit_bus_route_id">Bus Route</Label>
          <BusRouteDropdown
            value={formData.bus_route_id || null}
            onChange={(value) => onFormDataChange({ ...formData, bus_route_id: value || 0 })}
            placeholder="Select bus route"
          />
        </div>
        <div>
          <Label htmlFor="edit_slab_id">Distance Slab</Label>
          <DistanceSlabDropdown
            value={formData.slab_id || null}
            onChange={(value) => onFormDataChange({ ...formData, slab_id: value || 0 })}
            placeholder="Select distance slab"
          />
        </div>
        <div>
          <Label htmlFor="edit_pickup_point">Pickup Point</Label>
          <Input
            id="edit_pickup_point"
            value={formData.pickup_point || ''}
            onChange={(e) => onFormDataChange({ ...formData, pickup_point: e.target.value })}
            placeholder="Enter pickup point"
          />
        </div>
        <div>
          <Label htmlFor="edit_start_date">Start Date</Label>
          <DatePicker
            id="edit_start_date"
            value={formData.start_date}
            onChange={(value) => onFormDataChange({ ...formData, start_date: value })}
            placeholder="Select start date"
          />
        </div>
        <div>
          <Label htmlFor="edit_end_date">End Date (Optional)</Label>
          <DatePicker
            id="edit_end_date"
            value={formData.end_date || ''}
            onChange={(value) => onFormDataChange({ ...formData, end_date: value || null })}
            placeholder="Select end date"
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

