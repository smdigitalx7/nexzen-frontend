import { Bus, Route } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface RouteDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  routeData: any;
  isLoading: boolean;
  error: any;
}

const RouteDetailsDialog = ({ isOpen, onClose, routeData, isLoading, error }: RouteDetailsDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bus className="h-5 w-5" />
            Route Details
          </DialogTitle>
          <DialogDescription>
            Complete information for {routeData?.route_name || 'this route'}
          </DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-sm text-slate-600">Loading route details...</p>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-600">
            <p>Failed to load route details.</p>
            <p className="text-sm text-muted-foreground mt-1">{error.message}</p>
          </div>
        ) : routeData ? (
          <div className="space-y-6">
            {/* Route Header */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                <Bus className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold">{routeData.route_no} - {routeData.route_name}</h3>
                <p className="text-sm text-muted-foreground">Route ID: #{routeData.bus_route_id}</p>
              </div>
              <Badge variant={routeData.is_active ? "default" : "secondary"} className="ml-auto">
                {routeData.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>

            {/* Route Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vehicle Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bus className="h-4 w-4" />
                    Vehicle Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Vehicle Number:</span>
                    <span className="font-medium">{routeData.vehicle_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Registration:</span>
                    <span className="font-medium">{routeData.registration_number}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Capacity:</span>
                    <span className="font-medium">{routeData.vehicle_capacity} students</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Driver ID:</span>
                    <span className="font-medium">{routeData.driver_employee_id ? `#${routeData.driver_employee_id}` : "Not Assigned"}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Route Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Route className="h-4 w-4" />
                    Route Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Start Location:</span>
                    <span className="font-medium">{routeData.start_location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">End Location:</span>
                    <span className="font-medium">{routeData.end_location || "Not Set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Distance:</span>
                    <span className="font-medium">{routeData.total_distance ? `${routeData.total_distance} km` : "Not Set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Duration:</span>
                    <span className="font-medium">{routeData.estimated_duration ? `${routeData.estimated_duration} min` : "Not Set"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Route Number:</span>
                    <span className="font-medium">{routeData.route_no}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Timestamps */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Timestamps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Created:</span>
                  <span className="font-medium">{new Date(routeData.created_at).toLocaleString()}</span>
                </div>
                {routeData.updated_at && (
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Last Updated:</span>
                    <span className="font-medium">{new Date(routeData.updated_at).toLocaleString()}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RouteDetailsDialog;
