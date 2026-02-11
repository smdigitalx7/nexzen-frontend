import { Bus, Route, UserPlus, UserMinus, User, MapPin, Clock, Calendar } from "lucide-react";
import { Badge } from "@/common/components/ui/badge";
import { Button } from "@/common/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/common/components/ui/sheet";
import type { BusRouteRead } from "@/features/general/types/transport";
import { ScrollArea } from "@/common/components/ui/scroll-area";

interface RouteDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  routeData: BusRouteRead | null;
  isLoading: boolean;
  error: any;
  onAssignDriver?: () => void;
  onRemoveDriver?: (routeId: number) => void;
  isAssigning?: boolean;
  isRemoving?: boolean;
  routeId?: number | null;
}

const RouteDetailsDialog = ({ 
  isOpen, 
  onClose, 
  routeData, 
  isLoading, 
  error, 
  onAssignDriver, 
  onRemoveDriver, 
  isAssigning, 
  isRemoving, 
  routeId 
}: RouteDetailsDialogProps) => {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="!w-full sm:!max-w-[600px] flex flex-col p-0">
        <SheetHeader className="px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <Bus className="h-5 w-5 text-blue-600" />
            <SheetTitle>Route Details</SheetTitle>
          </div>
          <SheetDescription>
            {routeData ? `Full Information for ${routeData.route_name}` : 'View bus route and driver information'}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1 px-6 py-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-sm text-muted-foreground">Loading details...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-destructive">
              <p className="font-medium">Failed to load route details</p>
              <p className="text-sm opacity-80 mt-1">{error?.message || "An error occurred"}</p>
            </div>
          ) : !routeData ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No data available</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Route Summary Section */}
              <div className="border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                  <Route className="h-4 w-4 text-blue-600" />
                  <h4 className="font-semibold text-sm text-foreground">Route Summary</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Route Name</p>
                    <p className="text-sm font-semibold">{routeData.route_name || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Route No</p>
                    <p className="text-sm font-semibold">{routeData.route_no || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Status</p>
                    <Badge variant={routeData.is_active ? "default" : "secondary"} className="h-5">
                      {routeData.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Vehicle Section */}
              <div className="border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                  <Bus className="h-4 w-4 text-purple-600" />
                  <h4 className="font-semibold text-sm text-foreground">Vehicle Information</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Vehicle Number</p>
                    <p className="text-sm font-semibold">{routeData.vehicle_number || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Reg. Number</p>
                    <p className="text-sm font-semibold">{routeData.registration_number || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Capacity</p>
                    <p className="text-sm font-semibold">{routeData.vehicle_capacity} Students</p>
                  </div>
                </div>
              </div>

              {/* Driver Section */}
              <div className="border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                  <User className="h-4 w-4 text-orange-600" />
                  <h4 className="font-semibold text-sm text-foreground">Driver Assignment</h4>
                </div>
                
                {routeData.driver_employee_id ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                          <User className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold truncate">
                            {routeData.driver_details?.employee_name || `Driver #${routeData.driver_employee_id}`}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {routeData.driver_details?.mobile_no || "Phone not available"}
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-destructive hover:text-destructive hover:bg-destructive/10 h-8 gap-1.5"
                        onClick={() => {
                          const rid = routeData.bus_route_id || routeId || (routeData as any).id;
                          if (rid) onRemoveDriver?.(rid);
                        }}
                        disabled={isRemoving}
                      >
                        <UserMinus className="h-3.5 w-3.5" />
                        Remove
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={onAssignDriver}
                    className="w-full h-12 border-dashed border-2 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all font-medium gap-2"
                    variant="outline"
                    disabled={isAssigning}
                  >
                    <UserPlus className="h-4 w-4" />
                    {isAssigning ? "Please Wait..." : "Assign a Driver"}
                  </Button>
                )}
              </div>

              {/* Timeline Section */}
              <div className="border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <h4 className="font-semibold text-sm text-foreground">Route Path</h4>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Start Location</p>
                    <p className="text-sm font-semibold">{routeData.start_location || '-'}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Via / Landmark</p>
                    <p className="text-sm font-semibold">{routeData.via || '-'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1.5">
                        <MapPin className="h-3 w-3" /> Distance
                      </p>
                      <p className="text-sm font-semibold">{routeData.total_distance ?? 0} km</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-1 flex items-center gap-1.5">
                        <Clock className="h-3 w-3" /> Duration
                      </p>
                      <p className="text-sm font-semibold">{routeData.estimated_duration ?? 0} min</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timestamps */}
              <div className="border rounded-lg p-4 bg-muted/20">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <h4 className="font-semibold text-sm text-foreground">Timestamps</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground font-medium mb-1">Created At</p>
                    <p className="text-sm font-medium">
                      {new Date(routeData.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {routeData.updated_at && (
                    <div>
                      <p className="text-xs text-muted-foreground font-medium mb-1">Last Updated</p>
                      <p className="text-sm font-medium">
                        {new Date(routeData.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default RouteDetailsDialog;
