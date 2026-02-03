import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Bus, MapPin, Clock, Users, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/common/components/ui/button";
import { Badge } from "@/common/components/ui/badge";
import { Dialog, DialogTrigger } from "@/common/components/ui/dialog";
import { ConfirmDialog } from "@/common/components/shared";
import { ColumnDef } from "@tanstack/react-table";
import { EnhancedDataTable } from "@/common/components/shared";
import {
  createTextColumn,
  createBadgeColumn
} from "@/common/utils/factory/columnFactories";
import RouteFormDialog from "./RouteFormDialog";
import RouteDetailsDialog from "./RouteDetailsDialog";
import AssignDriverDialog from "./AssignDriverDialog";
import { useAssignDriverToRoute, useRemoveDriverFromRoute, useBusRoute } from "@/features/general/hooks/useTransport";
import type { BusRouteRead, BusRouteCreate, BusRouteUpdate } from "@/features/general/types/transport";
import type { UseMutationResult } from "@tanstack/react-query";

interface BusRoutesTabProps {
  routesData: BusRouteRead[];
  // Some screens pass a normalized UI shape; keep this flexible.
  busRoutes: any[];
  isLoading: boolean;
  error: unknown;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onCreateRoute: (data: BusRouteCreate) => void;
  onUpdateRoute: (data: { id: number; payload: BusRouteUpdate }) => void;
  onDeleteRoute: (id: number) => void;
  createRouteMutation: UseMutationResult<BusRouteRead, unknown, BusRouteCreate, unknown>;
  updateRouteMutation: UseMutationResult<BusRouteRead, unknown, { id: number; payload: BusRouteUpdate }, unknown>;
  deleteRouteMutation: UseMutationResult<void, unknown, number, unknown>;
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
  const [viewRouteDataFallback, setViewRouteDataFallback] = useState<BusRouteRead | null>(null);
  const [confirmRouteDeleteId, setConfirmRouteDeleteId] = useState<number | null>(null);
  const [isAssignDriverOpen, setIsAssignDriverOpen] = useState(false);
  const [assignDriverRouteId, setAssignDriverRouteId] = useState<number | null>(null);
  
  // Driver management mutations
  const assignDriverMutation = useAssignDriverToRoute();
  const removeDriverMutation = useRemoveDriverFromRoute();

  // Fetch route details when viewing
  const { data: viewRouteData, isLoading: isViewRouteLoading, error: viewRouteError } = useBusRoute(viewRouteId ?? 0);
  
  // Helper function to find route by ID (checks both id and bus_route_id)
  const findRouteById = (id: number | null) => {
    if (!id) return null;
    return routesData.find(route => route.bus_route_id === id) || 
           busRoutes.find((route: any) => (route.bus_route_id === id || route.id === id)) ||
           null;
  };
  
  // Use fallback route data (from clicked route) or route from list while loading detailed data
  // Ensure we always have a route with bus_route_id
  const finalRouteData = viewRouteData || viewRouteDataFallback || findRouteById(viewRouteId);
  
  // Ensure finalRouteData has bus_route_id, if not try to get it from viewRouteId or id field
  const finalRouteDataWithId = finalRouteData && finalRouteData.bus_route_id 
    ? finalRouteData 
    : (viewRouteId && finalRouteData 
        ? { ...finalRouteData, bus_route_id: viewRouteId } 
        : (finalRouteData && (finalRouteData as any).id
            ? { ...finalRouteData, bus_route_id: (finalRouteData as any).id }
            : finalRouteData));
  
  // Ensure we have data or show loading state
  const isActuallyLoading = isViewRouteLoading && !viewRouteDataFallback && !finalRouteData;

  // Helper function to get route ID from either id or bus_route_id field
  const getRouteId = (route: BusRouteRead | any): number | null => {
    return route.bus_route_id ?? route.id ?? null;
  };

  const handleViewRoute = (route: BusRouteRead | any) => {
    // Get route ID from either id or bus_route_id field
    const routeId = getRouteId(route);
    if (!routeId) {
      console.error("Cannot view route: route ID is missing", route);
      return;
    }
    setViewRouteId(routeId);
    // Ensure the route object has bus_route_id for consistency
    const routeWithId = route.bus_route_id ? route : { ...route, bus_route_id: routeId };
    setViewRouteDataFallback(routeWithId as BusRouteRead);
    setIsViewRouteOpen(true);
  };

  const handleEditRoute = (route: BusRouteRead | any) => {
    const routeId = getRouteId(route);
    if (!routeId) {
      console.error("Cannot edit route: route ID is missing", route);
      return;
    }
    setIsEditingRoute(true);
    setRouteEditingId(routeId);
    setIsAddRouteOpen(true);
  };

  const handleDeleteRoute = (route: BusRouteRead | any) => {
    const routeId = getRouteId(route);
    if (!routeId) {
      console.error("Cannot delete route: route ID is missing", route);
      return;
    }
    setConfirmRouteDeleteId(routeId);
  };

  const columns: ColumnDef<BusRouteRead>[] = useMemo(() => [
    {
      id: 'route_name',
      accessorKey: 'route_name',
      header: 'Route Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bus className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium">{row.original.route_name || '-'}</div>
            <div className="text-sm text-muted-foreground">{row.original.route_no || '-'}</div>
          </div>
        </div>
      ),
    },
    {
      id: 'via',
      accessorKey: 'via',
      header: 'Via',
      cell: ({ row }) => (
        <div className="max-w-[200px]">
          <span className="text-sm">{row.original.via || '-'}</span>
        </div>
      ),
    },
    {
      id: 'vehicle_number',
      accessorKey: 'vehicle_number',
      header: 'Vehicle Number',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.vehicle_number}</div>
          <div className="text-sm text-muted-foreground">Capacity: {row.original.vehicle_capacity}</div>
        </div>
      ),
    },
    {
      id: 'distance_km',
      accessorKey: 'distance_km',
      header: 'Distance (km)',
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span>{row.original.total_distance ?? 0} km</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span>{row.original.estimated_duration ?? 0} min</span>
          </div>
        </div>
      ),
    },
    {
      id: 'students_count',
      accessorKey: 'students_count',
      header: 'Students Count',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{(row.original as any).students_count ?? '-'}</span>
        </div>
      ),
    },
    {
      id: 'is_active',
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? "default" : "secondary"}>
          {row.original.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ], []);

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(() => [
    {
      type: 'view' as const,
      onClick: (row: BusRouteRead) => handleViewRoute(row)
    },
    {
      type: 'edit' as const,
      onClick: (row: BusRouteRead) => handleEditRoute(row)
    },
    {
      type: 'delete' as const,
      onClick: (row: BusRouteRead) => handleDeleteRoute(row)
    }
  ], []);

  const handleAddRoute = (data: { vehicle_number: string; vehicle_capacity: string; registration_number: string; route_no: string; route_name: string; via: string; start_location: string; total_distance: string; estimated_duration: string; is_active: boolean }) => {
    const payload: BusRouteCreate = {
      vehicle_number: data.vehicle_number,
      vehicle_capacity: Number(data.vehicle_capacity),
      registration_number: data.registration_number || undefined,
      route_no: data.route_no,
      route_name: data.route_name,
      via: data.via || undefined,
      start_location: data.start_location || undefined,
      total_distance: data.total_distance ? Number(data.total_distance) : undefined,
      estimated_duration: data.estimated_duration ? Number(data.estimated_duration) : undefined,
      is_active: data.is_active
    };
    createRouteMutation.mutate(payload);
    setIsAddRouteOpen(false);
  };

  const handleUpdateRoute = (data: { vehicle_number: string; vehicle_capacity: string; registration_number: string; route_no: string; route_name: string; via: string; start_location: string; total_distance: string; estimated_duration: string; is_active: boolean }) => {
    if (!routeEditingId) {
      console.error("Route ID is missing for update");
      return;
    }
    const { vehicle_number, vehicle_capacity, registration_number, route_no, route_name, via, start_location, total_distance, estimated_duration, is_active } = data;
    
    // Filter out undefined, null, NaN, and empty string values
    // Note: false and 0 are valid values and will be included
    const payload: BusRouteUpdate = {};
    if (vehicle_number !== undefined && vehicle_number !== '') payload.vehicle_number = vehicle_number;
    if (vehicle_capacity !== undefined && vehicle_capacity !== '') payload.vehicle_capacity = Number(vehicle_capacity);
    if (registration_number !== undefined && registration_number !== '') payload.registration_number = registration_number;
    if (route_no !== undefined && route_no !== '') payload.route_no = route_no;
    if (route_name !== undefined && route_name !== '') payload.route_name = route_name;
    if (data.via !== undefined && data.via !== '') payload.via = data.via;
    if (start_location !== undefined && start_location !== '') payload.start_location = start_location;
    if (total_distance !== undefined && total_distance !== '') payload.total_distance = Number(total_distance);
    if (estimated_duration !== undefined && estimated_duration !== '') payload.estimated_duration = Number(estimated_duration);
    if (is_active !== undefined) payload.is_active = is_active;
    
    // Ensure payload is not empty
    if (Object.keys(payload).length === 0) {
      console.error("Update payload is empty");
      return;
    }
    
    updateRouteMutation.mutate({ id: routeEditingId, payload });
    setIsAddRouteOpen(false);
    setIsEditingRoute(false);
    setRouteEditingId(null);
  };

  const handleDeleteRouteConfirm = (id: number) => {
    deleteRouteMutation.mutate(id);
    setConfirmRouteDeleteId(null);
  };
  
  const handleAssignDriver = () => {
    // Use viewRouteId or fallback to finalRouteData route ID
    const routeId = viewRouteId || finalRouteDataWithId?.bus_route_id;
    if (!routeId) {
      console.error("Cannot assign driver: route ID is missing", {
        viewRouteId,
        finalRouteDataWithId,
        hasBusRouteId: !!finalRouteDataWithId?.bus_route_id
      });
      return;
    }
    setIsAssignDriverOpen(true);
    setAssignDriverRouteId(routeId);
  };
  
  const handleRemoveDriver = (routeId: number) => {
    if (!routeId) {
      console.error("Cannot remove driver: routeId is null or invalid");
      return;
    }
    
    // Ensure viewRouteId is set before removing
    if (!viewRouteId) {
      setViewRouteId(routeId);
    }
    
    removeDriverMutation.mutate(routeId, {
      onSuccess: (updatedRoute) => {
        // Update the fallback data with the response from API
        if (updatedRoute) {
          setViewRouteDataFallback(updatedRoute);
        }
      },
      onError: (error) => {
        console.error("Error removing driver:", error);
      },
    });
  };
  
  const handleAssignDriverConfirm = (driverEmployeeId: number) => {
    if (!assignDriverRouteId) return;
    
    assignDriverMutation.mutate(
      { id: assignDriverRouteId, driverEmployeeId },
      {
        onSuccess: (updatedRoute) => {
          setIsAssignDriverOpen(false);
          setAssignDriverRouteId(null);
          // Update the fallback data with the response from API
          if (updatedRoute) {
            setViewRouteDataFallback(updatedRoute);
          }
          // Ensure viewRouteId is set if it wasn't
          if (!viewRouteId && assignDriverRouteId) {
            setViewRouteId(assignDriverRouteId);
          }
          // Toast handled by mutation hook
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <Dialog open={isAddRouteOpen} onOpenChange={(open) => { 
        if (!open) { 
          setIsEditingRoute(false); 
          setRouteEditingId(null);
        } 
        setIsAddRouteOpen(open); 
      }}>
        <RouteFormDialog
          isOpen={isAddRouteOpen}
          onClose={() => setIsAddRouteOpen(false)}
          onSubmit={isEditingRoute ? handleUpdateRoute : handleAddRoute}
          isEditing={isEditingRoute}
          editingRoute={isEditingRoute && routeEditingId ? 
            (() => {
              const route = routesData.find(r => r.bus_route_id === routeEditingId) || 
                           busRoutes.find((r: any) => (r.bus_route_id === routeEditingId || r.id === routeEditingId));
              return route ? { 
                id: route.bus_route_id ?? (route as any).id,
                route_number: route.route_no ?? undefined,
                route_no: route.route_no ?? undefined,
                route_name: route.route_name ?? undefined,
                via: route.via ?? undefined,
                vehicle_number: route.vehicle_number ?? undefined,
                vehicle_capacity: route.vehicle_capacity,
                registration_number: route.registration_number ?? undefined,
                start_location: route.start_location ?? undefined,
                total_distance: route.total_distance ?? undefined,
                estimated_duration: route.estimated_duration ?? undefined,
                is_active: route.is_active ?? undefined
              } : undefined;
            })() : undefined
          }
        />
      </Dialog>

      <EnhancedDataTable
        data={busRoutes}
        columns={columns}
        title="Bus Routes"
        searchKey="route_name"
        searchPlaceholder="Search routes..."
        loading={isLoading}
        showActions={true}
        actionButtonGroups={actionButtonGroups}
        actionColumnHeader="Actions"
        showActionLabels={false}
        exportable={true}
        onAdd={() => setIsAddRouteOpen(true)}
        addButtonText="Add Bus Route"
        addButtonVariant="default"
      />

      {/* View Route Details Dialog */}
      <RouteDetailsDialog
        isOpen={isViewRouteOpen}
        onClose={() => {
          setIsViewRouteOpen(false);
          setViewRouteId(null);
          setViewRouteDataFallback(null);
        }}
        routeData={finalRouteDataWithId ?? null}
        isLoading={isActuallyLoading}
        error={viewRouteError}
        onAssignDriver={handleAssignDriver}
        onRemoveDriver={handleRemoveDriver}
        isAssigning={assignDriverMutation.isPending}
        isRemoving={removeDriverMutation.isPending}
        routeId={viewRouteId ?? finalRouteDataWithId?.bus_route_id ?? null}
      />
      
      {/* Assign Driver Dialog */}
      <AssignDriverDialog
        isOpen={isAssignDriverOpen}
        onClose={() => {
          setIsAssignDriverOpen(false);
          setAssignDriverRouteId(null);
        }}
        onAssign={handleAssignDriverConfirm}
        isAssigning={assignDriverMutation.isPending}
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
