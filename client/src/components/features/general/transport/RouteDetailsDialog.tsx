import { Bus, Route, UserPlus, UserMinus, User } from "lucide-react";
import { FormDialog } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RouteDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  routeData: any;
  isLoading: boolean;
  error: any;
  onAssignDriver?: () => void;
  onRemoveDriver?: () => void;
  isAssigning?: boolean;
  isRemoving?: boolean;
}

const RouteDetailsDialog = ({ isOpen, onClose, routeData, isLoading, error, onAssignDriver, onRemoveDriver, isAssigning, isRemoving }: RouteDetailsDialogProps) => {
  return (
    <FormDialog
      open={isOpen}
      onOpenChange={onClose}
      title="Route Details"
      description={`Complete information for ${routeData?.route_name || 'this route'}`}
      size="LARGE"
      showFooter={false}
    >
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
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Driver:</span>
                    <div className="flex items-center gap-2">
                      {routeData.driver_employee_id ? (
                        <Badge variant="default" className="gap-1">
                          <User className="h-3 w-3" />
                          {routeData.driver_details?.employee_name || `Driver #${routeData.driver_employee_id}`}
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Not Assigned</Badge>
                      )}
                    </div>
                  </div>
                  {routeData.driver_employee_id && routeData.driver_details && (
                    <div className="flex flex-col gap-2 p-3 bg-muted/50 rounded-lg mt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Mobile:</span>
                        <span className="font-medium">{routeData.driver_details.mobile_no || "N/A"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={routeData.driver_details.status === "ACTIVE" ? "default" : "secondary"}>
                          {routeData.driver_details.status}
                        </Badge>
                      </div>
                    </div>
                  )}
                  {/* Driver Actions */}
                  <div className="flex gap-2 mt-4">
                    {!routeData.driver_employee_id ? (
                      <Button
                        onClick={onAssignDriver}
                        className="w-full"
                        variant="outline"
                        disabled={isAssigning}
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        {isAssigning ? "Assigning..." : "Assign Driver"}
                      </Button>
                    ) : (
                      <Button
                        onClick={onRemoveDriver}
                        className="w-full"
                        variant="destructive"
                        disabled={isRemoving}
                      >
                        <UserMinus className="h-4 w-4 mr-2" />
                        {isRemoving ? "Removing..." : "Remove Driver"}
                      </Button>
                    )}
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
    </FormDialog>
  );
};

export default RouteDetailsDialog;
