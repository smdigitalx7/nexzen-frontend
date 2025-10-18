import { useState, useEffect } from "react";
import { FormDialog } from "@/components/shared";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RouteFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: RouteFormData) => void;
  isEditing: boolean;
  editingRoute?: {
    id: number;
    route_number: string;
    route_name: string;
    is_active: boolean;
  };
}

interface RouteFormData {
  vehicle_number: string;
  vehicle_capacity: string;
  registration_number: string;
  driver_employee_id: string;
  route_no: string;
  route_name: string;
  start_location: string;
  end_location: string;
  total_distance: string;
  estimated_duration: string;
  is_active: boolean;
}

const RouteFormDialog = ({ isOpen, onClose, onSubmit, isEditing, editingRoute }: RouteFormDialogProps) => {
  const [routeForm, setRouteForm] = useState<RouteFormData>({
    vehicle_number: "",
    vehicle_capacity: "",
    registration_number: "",
    driver_employee_id: "",
    route_no: "",
    route_name: "",
    start_location: "",
    end_location: "",
    total_distance: "",
    estimated_duration: "",
    is_active: true,
  });

  useEffect(() => {
    if (isEditing && editingRoute) {
      setRouteForm({
        ...routeForm,
        route_no: editingRoute.route_number || "",
        route_name: editingRoute.route_name || "",
        is_active: editingRoute.is_active,
      });
    } else {
      setRouteForm({
        vehicle_number: "",
        vehicle_capacity: "",
        registration_number: "",
        driver_employee_id: "",
        route_no: "",
        route_name: "",
        start_location: "",
        end_location: "",
        total_distance: "",
        estimated_duration: "",
        is_active: true,
      });
    }
  }, [isEditing, editingRoute]);

  const handleSubmit = () => {
    if (isEditing) {
      onSubmit({
        id: editingRoute!.id,
        route_no: routeForm.route_no,
        route_name: routeForm.route_name,
        is_active: routeForm.is_active,
      } as any);
    } else {
      const required = [
        routeForm.vehicle_number,
        routeForm.vehicle_capacity,
        routeForm.registration_number,
        routeForm.driver_employee_id,
        routeForm.route_no,
        routeForm.route_name,
        routeForm.start_location,
        routeForm.end_location,
        routeForm.total_distance,
        routeForm.estimated_duration,
      ];
      if (required.some((v) => !v)) return;
      
      onSubmit({
        vehicle_number: routeForm.vehicle_number,
        vehicle_capacity: parseInt(routeForm.vehicle_capacity),
        registration_number: routeForm.registration_number,
        driver_employee_id: parseInt(routeForm.driver_employee_id),
        route_no: routeForm.route_no,
        route_name: routeForm.route_name,
        start_location: routeForm.start_location,
        end_location: routeForm.end_location,
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
      description={isEditing ? "Update route details" : "Create a new transport route with vehicle and driver details"}
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
            <div>
              <Label htmlFor="driver_employee_id">Driver Employee ID</Label>
              <Input 
                id="driver_employee_id" 
                value={routeForm.driver_employee_id} 
                onChange={(e) => setRouteForm({ ...routeForm, driver_employee_id: e.target.value })} 
                placeholder="25" 
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="start_location">Start Location</Label>
              <Input 
                id="start_location" 
                value={routeForm.start_location} 
                onChange={(e) => setRouteForm({ ...routeForm, start_location: e.target.value })} 
              />
            </div>
            <div>
              <Label htmlFor="end_location">End Location</Label>
              <Input 
                id="end_location" 
                value={routeForm.end_location} 
                onChange={(e) => setRouteForm({ ...routeForm, end_location: e.target.value })} 
              />
            </div>
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
          </div>
        </div>
    </FormDialog>
  );
};

export default RouteFormDialog;
