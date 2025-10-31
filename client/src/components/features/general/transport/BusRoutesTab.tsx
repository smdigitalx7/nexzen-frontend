import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Plus, Bus, MapPin, Clock, Users, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ConfirmDialog } from "@/components/shared";
import { ColumnDef } from "@tanstack/react-table";
import { EnhancedDataTable } from "@/components/shared";
import {
  createTextColumn,
  createBadgeColumn
} from "@/lib/utils/columnFactories";
import RouteFormDialog from "./RouteFormDialog";
import RouteDetailsDialog from "./RouteDetailsDialog";
import AssignDriverDialog from "./AssignDriverDialog";
import { useAssignDriverToRoute, useRemoveDriverFromRoute } from "@/lib/hooks/general/useTransport";

interface BusRoutesTabProps {
  routesData: any[];
  busRoutes: any[];
  isLoading: boolean;
  error: unknown;
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
  const [isAssignDriverOpen, setIsAssignDriverOpen] = useState(false);
  const [assignDriverRouteId, setAssignDriverRouteId] = useState<number | null>(null);
  
  // Driver management mutations
  const assignDriverMutation = useAssignDriverToRoute();
  const removeDriverMutation = useRemoveDriverFromRoute();

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
      id: 'route_name',
      accessorKey: 'route_name',
      header: 'Route Name',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bus className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <div className="font-medium">{row.original.route_name}</div>
            <div className="text-sm text-muted-foreground">{row.original.route_number || row.original.route_no || '-'}</div>
          </div>
        </div>
      ),
    },
    {
      id: 'route_number',
      accessorKey: 'route_number',
      header: 'Route Number',
      cell: ({ row }) => row.original.route_number || row.original.route_no || '-',
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
      id: 'vehicle_capacity',
      accessorKey: 'vehicle_capacity',
      header: 'Vehicle Capacity',
      cell: ({ row }) => row.original.vehicle_capacity,
    },
    {
      id: 'distance_km',
      accessorKey: 'distance_km',
      header: 'Distance (km)',
      cell: ({ row }) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <MapPin className="h-3 w-3 text-muted-foreground" />
            <span>{row.original.distance_km ?? row.original.total_distance ?? 0} km</span>
          </div>
          <div className="flex items-center gap-1 text-sm">
            <Clock className="h-3 w-3 text-muted-foreground" />
            <span>{row.original.estimated_duration ?? 0} min</span>
          </div>
        </div>
      ),
    },
    {
      id: 'estimated_duration',
      accessorKey: 'estimated_duration',
      header: 'Duration (min)',
      cell: ({ row }) => row.original.estimated_duration,
    },
    {
      id: 'students_count',
      accessorKey: 'students_count',
      header: 'Students Count',
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span>{row.original.students_count}</span>
        </div>
      ),
    },
    {
      id: 'active',
      accessorKey: 'active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.active ? "default" : "secondary"}>
          {row.original.active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ], []);

  // Action button groups for EnhancedDataTable
  const actionButtonGroups = useMemo(() => [
    {
      type: 'view' as const,
      onClick: (row: any) => handleViewRoute(row)
    },
    {
      type: 'edit' as const,
      onClick: (row: any) => handleEditRoute(row)
    },
    {
      type: 'delete' as const,
      onClick: (row: any) => handleDeleteRoute(row)
    }
  ], []);

  const viewRouteData = viewRouteId ? routesData.find(route => route.bus_route_id === viewRouteId) : null;

  const handleAddRoute = (data: any) => {
    createRouteMutation.mutate(data);
    setIsAddRouteOpen(false);
  };

  const handleUpdateRoute = (data: any) => {
    if (!data.id) {
      console.error("Route ID is missing for update");
      return;
    }
    const { id, ...rest } = data;
    
    // Filter out undefined, null, NaN, and empty string values
    // Note: false and 0 are valid values and will be included
    const payload: any = {};
    Object.keys(rest).forEach((key) => {
      const value = rest[key];
      if (value !== undefined && value !== null && value !== '' && !Number.isNaN(value)) {
        payload[key] = value;
      }
    });
    
    // Ensure payload is not empty
    if (Object.keys(payload).length === 0) {
      console.error("Update payload is empty");
      return;
    }
    
    updateRouteMutation.mutate({ id, payload });
    setIsAddRouteOpen(false);
    setIsEditingRoute(false);
    setRouteEditingId(null);
  };

  const handleDeleteRouteConfirm = (id: number) => {
    deleteRouteMutation.mutate(id);
    setConfirmRouteDeleteId(null);
  };
  
  const handleAssignDriver = () => {
    setIsAssignDriverOpen(true);
    setAssignDriverRouteId(viewRouteId);
  };
  
  const handleRemoveDriver = () => {
    if (!viewRouteId) return;
    
    removeDriverMutation.mutate(viewRouteId);
    // Toast handled by mutation hook
  };
  
  const handleAssignDriverConfirm = (driverEmployeeId: number) => {
    if (!assignDriverRouteId) return;
    
    assignDriverMutation.mutate(
      { id: assignDriverRouteId, driverEmployeeId },
      {
        onSuccess: () => {
          setIsAssignDriverOpen(false);
          setAssignDriverRouteId(null);
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
              const route = routesData.find(r => r.bus_route_id === routeEditingId) || busRoutes.find(r => r.id === routeEditingId);
              return route ? { ...route, id: route.id || route.bus_route_id } : undefined;
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
        }}
        routeData={viewRouteData}
        isLoading={isLoading}
        error={error}
        onAssignDriver={handleAssignDriver}
        onRemoveDriver={handleRemoveDriver}
        isAssigning={assignDriverMutation.isPending}
        isRemoving={removeDriverMutation.isPending}
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
