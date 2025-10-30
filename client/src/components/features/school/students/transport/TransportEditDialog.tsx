import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormDialog } from '@/components/shared';
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
          <Label htmlFor="edit_slab_id">Distance Slab</Label>
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
          <Input
            id="edit_start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => onFormDataChange({ ...formData, start_date: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="edit_end_date">End Date (Optional)</Label>
          <Input
            id="edit_end_date"
            type="date"
            value={formData.end_date || ''}
            onChange={(e) => onFormDataChange({ ...formData, end_date: e.target.value || null })}
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

