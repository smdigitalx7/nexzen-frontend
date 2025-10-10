import { useState } from "react";
import { motion } from "framer-motion";
import { Bus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthStore } from "@/store/authStore";
import { useBusRoutes, useDeleteBusRoute, useCreateBusRoute, useUpdateBusRoute, useCreateDistanceSlab, useUpdateDistanceSlab, useDistanceSlabs } from "@/lib/hooks/general/useTransport";
import type { BusRouteRead, DistanceSlabRead } from "@/lib/types/general/transport";
import TransportOverview from "./TransportOverview";
import BusRoutesTab from "./BusRoutesTab";
import DistanceSlabsTab from "./DistanceSlabsTab";

const TransportManagement = () => {
  const { user, currentBranch } = useAuthStore();
  const { data: routesData = [], isLoading: routesLoading, error: routesError } = useBusRoutes();
  const { data: slabsData = [], isLoading: feesLoading, error: feesError } = useDistanceSlabs();
  const deleteRouteMutation = useDeleteBusRoute();
  const createRouteMutation = useCreateBusRoute();
  const updateRouteMutation = useUpdateBusRoute();
  const updateFeeMutation = useUpdateDistanceSlab();
  const createFeeMutation = useCreateDistanceSlab();
  
  const busRoutes = routesData.map((r: BusRouteRead) => ({
    id: r.bus_route_id,
    route_number: r.route_no || "-",
    route_name: r.route_name || "-",
    vehicle_number: r.vehicle_number || "-",
    vehicle_capacity: r.vehicle_capacity ?? 0,
    driver_id: r.driver_employee_id ? String(r.driver_employee_id) : "-",
    driver_name: "-", // This would need to be fetched from employee service
    distance_km: r.total_distance ?? 0,
    estimated_duration: r.estimated_duration ?? 0,
    pickup_time: "-", // Not available in current schema
    drop_time: "-", // Not available in current schema
    active: r.is_active ?? true,
    students_count: 0, // This would need to be calculated from student transport assignments
    fuel_cost: 0, // Not available in current schema
    maintenance_cost: 0, // Not available in current schema
  }));

  const [activeTab, setActiveTab] = useState("routes");
  const [searchTerm, setSearchTerm] = useState("");

  // Calculate overview metrics
  const totalStudents = busRoutes.reduce((sum, route) => sum + route.students_count, 0);
  const totalCapacity = busRoutes.reduce((sum, route) => sum + route.vehicle_capacity, 0);
  const overallUtilization = totalCapacity > 0 ? (totalStudents / totalCapacity) * 100 : 0;
  const totalFuelCost = busRoutes.reduce((sum, route) => sum + (route.fuel_cost || 0), 0);
  const totalMaintenanceCost = busRoutes.reduce((sum, route) => sum + (route.maintenance_cost || 0), 0);
  const activeRoutes = busRoutes.filter((r) => r.active).length;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Transport Management
          </h1>
          <p className="text-muted-foreground">
            Advanced route optimization and transport operations management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Bus className="h-3 w-3" />
            {currentBranch?.branch_name}
          </Badge>
        </div>
      </motion.div>

      {/* Transport Overview Cards */}
      <TransportOverview
        activeRoutes={activeRoutes}
        totalStudents={totalStudents}
        overallUtilization={overallUtilization}
        totalCost={totalFuelCost + totalMaintenanceCost}
      />

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="routes">Bus Routes</TabsTrigger>
            <TabsTrigger value="fees">Distance Slabs</TabsTrigger>
          </TabsList>

          {/* Bus Routes Tab */}
          <TabsContent value="routes" className="space-y-4">
            <BusRoutesTab
              routesData={routesData}
              busRoutes={busRoutes}
              isLoading={routesLoading}
              error={routesError}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onCreateRoute={(data) => createRouteMutation.mutate(data)}
              onUpdateRoute={(data) => updateRouteMutation.mutate(data)}
              onDeleteRoute={(id) => deleteRouteMutation.mutate(id)}
              createRouteMutation={createRouteMutation}
              updateRouteMutation={updateRouteMutation}
              deleteRouteMutation={deleteRouteMutation}
            />
          </TabsContent>

          {/* Distance Slabs Tab */}
          <TabsContent value="fees" className="space-y-4">
            <DistanceSlabsTab
              slabsData={slabsData}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onCreateSlab={(data) => createFeeMutation.mutate(data)}
              onUpdateSlab={(data) => updateFeeMutation.mutate(data)}
              createFeeMutation={createFeeMutation}
              updateFeeMutation={updateFeeMutation}
            />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default TransportManagement;
