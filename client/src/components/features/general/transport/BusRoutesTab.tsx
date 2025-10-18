import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Bus, MapPin, Clock, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared";
import { ColumnDef } from "@tanstack/react-table";
import { EnhancedDataTable } from "@/components/shared";
import {
  createTextColumn,
  createBadgeColumn,
  createActionColumn,
  createViewAction,
  createEditAction,
  createDeleteAction
} from "@/lib/utils/columnFactories";
import RouteFormDialog from "./RouteFormDialog";
import RouteDetailsDialog from "./RouteDetailsDialog";

interface BusRoutesTabProps {
  routesData: any[];
  busRoutes: any[];
  isLoading: boolean;
  error: any;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCreateRoute: (data: any) => void;
  onUpdateRoute: (data: any) => void;
  onDeleteRoute: (id: number) => void;
  createRouteMutation: any;
  updateRouteMutation: any;
  deleteRouteMutation: any;
}

const BusRoutesTab = ({
  routesData,
  busRoutes,
  isLoading,
  error,
  searchTerm,
  onSearchChange,
  onCreateRoute,
  onUpdateRoute,
  onDeleteRoute,
  createRouteMutation,
  updateRouteMutation,
  deleteRouteMutation,
}: BusRoutesTabProps) => {
  const [isAddRouteOpen, setIsAddRouteOpen] = useState(false);
  const [isViewRouteOpen, setIsViewRouteOpen] = useState(false);
  const [isEditingRoute, setIsEditingRoute] = useState(false);
  const [routeEditingId, setRouteEditingId] = useState<number | null>(null);
  const [viewRouteId, setViewRouteId] = useState<number | null>(null);
  const [confirmRouteDeleteId, setConfirmRouteDeleteId] = useState<number | null>(null);

  const handleViewRoute = (route: any) => {
    setViewRouteId(route.id);
    setIsViewRouteOpen(true);
  };

  const handleEditRoute = (route: any) => {
    setIsEditingRoute(true);
    setRouteEditingId(route.id);
    setIsAddRouteOpen(true);
  };

  const handleDeleteRoute = (route: any) => {
    setConfirmRouteDeleteId(route.id);
  };

  const columns: ColumnDef<any>[] = useMemo(() => [
    {
      id: 'route_info',
      header: 'Route',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bus className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium">{row.original.route_name}</div>
            <div className="text-sm text-muted-foreground">{row.original.route_number}</div>
          </div>
        </div>
      ),
    },
    {
      id: 'vehicle_info',
      header: 'Vehicle',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.vehicle_number}</div>
          <div className="text-sm text-muted-foreground">Capacity: {row.original.vehicle_capacity}</div>
        </div>
      ),
    },
    {
      id: 'route_details',
      header: 'Route Details',
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span>{row.original.distance_km} km</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span>{row.original.estimated_duration} min</span>
          </div>
        </div>
      ),
    },
    {
      id: 'students',
      header: 'Students',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.students_count}</span>
        </div>
      ),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.active ? "default" : "secondary"}>
          {row.original.active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    createActionColumn([
      createViewAction((row) => handleViewRoute(row)),
      createEditAction((row) => handleEditRoute(row)),
      createDeleteAction((row) => handleDeleteRoute(row))
    ])
  ], []);

  const viewRouteData = viewRouteId ? routesData.find(route => route.bus_route_id === viewRouteId) : null;

  const handleAddRoute = (data: any) => {
    createRouteMutation.mutate(data);
    setIsAddRouteOpen(false);
  };

  const handleUpdateRoute = (data: any) => {
    updateRouteMutation.mutate(data);
    setIsAddRouteOpen(false);
    setIsEditingRoute(false);
    setRouteEditingId(null);
  };

  const handleDeleteRouteConfirm = (id: number) => {
    deleteRouteMutation.mutate(id);
    setConfirmRouteDeleteId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isAddRouteOpen} onOpenChange={(open) => { 
          if (!open) { 
            setIsEditingRoute(false); 
            setRouteEditingId(null);
          } 
          setIsAddRouteOpen(open); 
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2" onClick={() => { 
              setIsEditingRoute(false); 
              setRouteEditingId(null); 
            }}>
              <Plus className="h-4 w-4" />
              Add Bus Route
            </Button>
          </DialogTrigger>
          <RouteFormDialog
            isOpen={isAddRouteOpen}
            onClose={() => setIsAddRouteOpen(false)}
            onSubmit={isEditingRoute ? handleUpdateRoute : handleAddRoute}
            isEditing={isEditingRoute}
            editingRoute={isEditingRoute && routeEditingId ? 
              busRoutes.find(r => r.id === routeEditingId) : undefined
            }
          />
        </Dialog>
      </div>

      <EnhancedDataTable
        data={busRoutes}
        columns={columns}
        title="Bus Routes"
        searchKey="route_name"
        searchPlaceholder="Search routes..."
        loading={isLoading}
      />

      {/* View Route Details Dialog */}
      <RouteDetailsDialog
        isOpen={isViewRouteOpen}
        onClose={() => {
          setIsViewRouteOpen(false);
          setViewRouteId(null);
        }}
        routeData={viewRouteData}
        isLoading={isLoading}
        error={error}
      />

      {/* Confirm Route Delete */}
      <ConfirmDialog
        open={confirmRouteDeleteId !== null}
        onOpenChange={(open) => { 
          if (!open) setConfirmRouteDeleteId(null); 
        }}
        title="Delete Route"
        description="This action will permanently delete this route."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={() => { 
          if (confirmRouteDeleteId) handleDeleteRouteConfirm(confirmRouteDeleteId); 
        }}
      />
    </div>
  );
};

export default BusRoutesTab;
