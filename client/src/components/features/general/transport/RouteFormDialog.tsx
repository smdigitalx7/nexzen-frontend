import { useState, useEffect } from "react";
import { FormDialog } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface RouteFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RouteFormData) => void;
  isEditing: boolean;
  editingRoute?: {
    id: number;
    route_number?: string;
    route_no?: string;
    route_name?: string;
    via?: string;
    vehicle_number?: string;
    vehicle_capacity?: number;
    registration_number?: string;
    start_location?: string;
    total_distance?: number;
    estimated_duration?: number;
    is_active?: boolean;
  };
}

interface RouteFormData {
  vehicle_number: string;
  vehicle_capacity: string;
  registration_number: string;
  route_no: string;
  route_name: string;
  via: string;
  start_location: string;
  total_distance: string;
  estimated_duration: string;
  is_active: boolean;
}

const RouteFormDialog = ({ isOpen, onClose, onSubmit, isEditing, editingRoute }: RouteFormDialogProps) => {
  const [routeForm, setRouteForm] = useState<RouteFormData>({
    vehicle_number: "",
    vehicle_capacity: "",
    registration_number: "",
    route_no: "",
    route_name: "",
    via: "",
    start_location: "",
    total_distance: "",
    estimated_duration: "",
    is_active: true,
  });

  useEffect(() => {
    if (isEditing && editingRoute) {
      setRouteForm({
        vehicle_number: editingRoute.vehicle_number || "",
        vehicle_capacity: editingRoute.vehicle_capacity?.toString() || "",
        registration_number: editingRoute.registration_number || "",
        route_no: editingRoute.route_no || editingRoute.route_number || "",
        route_name: editingRoute.route_name || "",
        via: editingRoute.via || "",
        start_location: editingRoute.start_location || "",
        total_distance: editingRoute.total_distance?.toString() || "",
        estimated_duration: editingRoute.estimated_duration?.toString() || "",
        is_active: editingRoute.is_active ?? true,
      });
    } else {
      setRouteForm({
        vehicle_number: "",
        vehicle_capacity: "",
        registration_number: "",
        route_no: "",
        route_name: "",
        via: "",
        start_location: "",
        total_distance: "",
        estimated_duration: "",
        is_active: true,
      });
    }
  }, [isEditing, editingRoute]);

  const handleSubmit = () => {
    if (isEditing) {
      // For updates, only include fields that have been changed/have values
      const updateData: any = {
        id: editingRoute!.id,
      };
      
      // Only include fields that have values (not empty strings)
      if (routeForm.vehicle_number) updateData.vehicle_number = routeForm.vehicle_number;
      if (routeForm.vehicle_capacity) {
        const capacity = parseInt(routeForm.vehicle_capacity);
        if (!isNaN(capacity)) updateData.vehicle_capacity = capacity;
      }
      if (routeForm.registration_number) updateData.registration_number = routeForm.registration_number;
      if (routeForm.route_no) updateData.route_no = routeForm.route_no;
      if (routeForm.route_name) updateData.route_name = routeForm.route_name;
      if (routeForm.via) updateData.via = routeForm.via;
      if (routeForm.start_location) updateData.start_location = routeForm.start_location;
      if (routeForm.total_distance) {
        const distance = parseFloat(routeForm.total_distance);
        if (!isNaN(distance)) updateData.total_distance = distance;
      }
      if (routeForm.estimated_duration) {
        const duration = parseInt(routeForm.estimated_duration);
        if (!isNaN(duration)) updateData.estimated_duration = duration;
      }
      // Always include is_active since it's a boolean
      updateData.is_active = routeForm.is_active;
      
      onSubmit(updateData);
    } else {
      const required = [
        routeForm.vehicle_number,
        routeForm.vehicle_capacity,
        routeForm.registration_number,
        routeForm.route_no,
        routeForm.route_name,
        routeForm.start_location,
        routeForm.total_distance,
        routeForm.estimated_duration,
      ];
      if (required.some((v) => !v)) return;
      
      onSubmit({
        vehicle_number: routeForm.vehicle_number,
        vehicle_capacity: parseInt(routeForm.vehicle_capacity),
        registration_number: routeForm.registration_number,
        route_no: routeForm.route_no,
        route_name: routeForm.route_name,
        via: routeForm.via || undefined,
        start_location: routeForm.start_location,
        total_distance: parseFloat(routeForm.total_distance),
        estimated_duration: parseInt(routeForm.estimated_duration),
        is_active: routeForm.is_active,
      } as any);
    }
    onClose();
  };

  const handleSave = () => {
    handleSubmit();
  };

  return (
    <FormDialog
      open={isOpen}
      onOpenChange={onClose}
      title={isEditing ? "Edit Bus Route" : "Add New Bus Route"}
      description={isEditing ? "Update route details" : "Create a new transport route with vehicle details. Drivers can be assigned separately after creation."}
      size="LARGE"
      onSave={handleSave}
      saveText={isEditing ? "Update Route" : "Add Route"}
      cancelText="Cancel"
    >
      <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="route_no">Route Number</Label>
              <Input
                id="route_no"
                value={routeForm.route_no}
                onChange={(e) => setRouteForm({ ...routeForm, route_no: e.target.value })}
                placeholder="R001"
              />
            </div>
            <div>
              <Label htmlFor="route_name">Route Name</Label>
              <Input
                id="route_name"
                value={routeForm.route_name}
                onChange={(e) => setRouteForm({ ...routeForm, route_name: e.target.value })}
                placeholder="City Center"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vehicle_number">Vehicle Number</Label>
              <Input 
                id="vehicle_number" 
                value={routeForm.vehicle_number} 
                onChange={(e) => setRouteForm({ ...routeForm, vehicle_number: e.target.value })} 
                placeholder="TN01AB1234" 
              />
            </div>
            <div>
              <Label htmlFor="vehicle_capacity">Vehicle Capacity</Label>
              <Input 
                id="vehicle_capacity" 
                type="number" 
                value={routeForm.vehicle_capacity} 
                onChange={(e) => setRouteForm({ ...routeForm, vehicle_capacity: e.target.value })} 
                placeholder="40" 
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="total_distance">Distance (km)</Label>
              <Input 
                id="total_distance" 
                type="number" 
                step="0.1" 
                value={routeForm.total_distance} 
                onChange={(e) => setRouteForm({ ...routeForm, total_distance: e.target.value })} 
                placeholder="15.5" 
              />
            </div>
            <div>
              <Label htmlFor="estimated_duration">Duration (min)</Label>
              <Input 
                id="estimated_duration" 
                type="number" 
                value={routeForm.estimated_duration} 
                onChange={(e) => setRouteForm({ ...routeForm, estimated_duration: e.target.value })} 
                placeholder="45" 
              />
            </div>
          </div>
          <div>
            <Label htmlFor="start_location">Start Location</Label>
            <Input 
              id="start_location" 
              value={routeForm.start_location} 
              onChange={(e) => setRouteForm({ ...routeForm, start_location: e.target.value })} 
              placeholder="Starting point"
            />
          </div>
          <div>
            <Label htmlFor="via">Via (Optional)</Label>
            <Input 
              id="via" 
              value={routeForm.via} 
              onChange={(e) => setRouteForm({ ...routeForm, via: e.target.value })} 
              placeholder="Intermediate stops/locations"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="registration_number">Registration Number</Label>
              <Input 
                id="registration_number" 
                value={routeForm.registration_number} 
                onChange={(e) => setRouteForm({ ...routeForm, registration_number: e.target.value })} 
                placeholder="REG123" 
              />
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Switch
                id="is_active"
                checked={routeForm.is_active}
                onCheckedChange={(checked) => setRouteForm({ ...routeForm, is_active: checked === true })}
              />
              <Label htmlFor="is_active" className="cursor-pointer">Active</Label>
            </div>
          </div>
        </div>
    </FormDialog>
  );
};

export default RouteFormDialog;
