import { useState } from "react";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import RouteCard from "./RouteCard";
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

  const filteredRoutes = busRoutes.filter(
    (route) =>
      route.route_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.route_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.vehicle_number.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleDeleteRoute = (id: number) => {
    deleteRouteMutation.mutate(id);
    setConfirmRouteDeleteId(null);
  };

  const handleEditRoute = (id: number) => {
    const route = busRoutes.find(r => r.id === id);
    if (route) {
      setIsEditingRoute(true);
      setRouteEditingId(id);
      setIsAddRouteOpen(true);
    }
  };

  const handleViewRoute = (id: number) => {
    setViewRouteId(id);
    setIsViewRouteOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Input
            placeholder="Search routes..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="max-w-sm"
          />
          <Badge variant="outline">{filteredRoutes.length} Routes</Badge>
        </div>
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
              Add Route
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

      {isLoading ? (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-muted-foreground">Loading routes...</span>
            </div>
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="p-6 text-center text-red-600">
            <div className="flex flex-col items-center gap-2">
              <span>Error loading routes</span>
              <span className="text-sm text-muted-foreground">{error.message}</span>
            </div>
          </CardContent>
        </Card>
      ) : filteredRoutes.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            {searchTerm ? "No routes match your search." : "No routes found. Click 'Add Route' to create the first route."}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredRoutes.map((route, index) => (
            <RouteCard
              key={route.id}
              route={route}
              routesData={routesData}
              index={index}
              onView={handleViewRoute}
              onEdit={handleEditRoute}
              onDelete={(id) => setConfirmRouteDeleteId(id)}
            />
          ))}
        </div>
      )}

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
      <AlertDialog open={confirmRouteDeleteId !== null} onOpenChange={(open) => { 
        if (!open) setConfirmRouteDeleteId(null); 
      }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Route</AlertDialogTitle>
            <AlertDialogDescription>This action will permanently delete this route.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => { 
                if (confirmRouteDeleteId) handleDeleteRoute(confirmRouteDeleteId); 
              }} 
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BusRoutesTab;
