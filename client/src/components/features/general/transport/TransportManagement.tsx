import { useState } from "react";
import { motion } from "framer-motion";
import { Bus, Route } from "lucide-react";
import { IndianRupeeIcon } from "@/components/shared/IndianRupeeIcon";
import { Badge } from "@/components/ui/badge";
import { TabSwitcher } from "@/components/shared";
import { useAuthStore } from "@/store/authStore";
import { useTabNavigation } from "@/lib/hooks/use-tab-navigation";
import {
  useBusRoutes,
  useDeleteBusRoute,
  useCreateBusRoute,
  useUpdateBusRoute,
} from "@/lib/hooks/general/useTransport";
import { useDistanceSlabs } from "@/lib/hooks/general/useDistanceSlabs";
import type { BusRouteRead } from "@/lib/types/general/transport";
import TransportOverview from "./TransportOverview";
import BusRoutesTab from "./BusRoutesTab";
import DistanceSlabsTab from "./DistanceSlabsTab";

const TransportManagement = () => {
  const { user, currentBranch } = useAuthStore();
  const { activeTab, setActiveTab } = useTabNavigation("routes");
  const {
    data: routesData = [],
    isLoading: routesLoading,
    error: routesError,
  } = useBusRoutes();
  const {
    distanceSlabs: slabsData = [],
    isLoadingDistanceSlabs: feesLoading,
    distanceSlabsError: feesError,
    createDistanceSlab: createFeeMutation,
    updateDistanceSlab: updateFeeMutation,
  } = useDistanceSlabs();
  const deleteRouteMutation = useDeleteBusRoute();
  const createRouteMutation = useCreateBusRoute();
  const updateRouteMutation = useUpdateBusRoute();

  const busRoutes = routesData.map((r: BusRouteRead) => ({
    id: r.bus_route_id,
    route_number: r.route_no || "-",
    route_name: r.route_name || "-",
    route_no: r.route_no || "-",
    via: r.via || "",
    vehicle_number: r.vehicle_number || "-",
    vehicle_capacity: r.vehicle_capacity ?? 0,
    registration_number: r.registration_number || "-",
    driver_id: r.driver_employee_id ? String(r.driver_employee_id) : "-",
    driver_name: r.driver_details?.employee_name || "-",
    driver_employee_id: r.driver_employee_id,
    driver_details: r.driver_details,
    distance_km: r.total_distance ?? 0,
    total_distance: r.total_distance ?? 0,
    estimated_duration: r.estimated_duration ?? 0,
    start_location: r.start_location || "-",
    pickup_time: "-", // Not available in current schema
    drop_time: "-", // Not available in current schema
    active: r.is_active ?? true,
    is_active: r.is_active ?? true,
    students_count: 0, // This would need to be calculated from student transport assignments
    fuel_cost: 0, // Not available in current schema
    maintenance_cost: 0, // Not available in current schema
  }));

  const [searchTerm, setSearchTerm] = useState("");
  const [isTabSwitching, setIsTabSwitching] = useState(false);

  const handleTabChange = (value: string) => {
    setIsTabSwitching(true);
    setActiveTab(value);
    // Reset switching state after animation
    setTimeout(() => setIsTabSwitching(false), 300);
  };

  // Calculate overview metrics
  const totalStudents = busRoutes.reduce(
    (sum, route) => sum + route.students_count,
    0
  );
  const totalCapacity = busRoutes.reduce(
    (sum, route) => sum + route.vehicle_capacity,
    0
  );
  const overallUtilization =
    totalCapacity > 0 ? (totalStudents / totalCapacity) * 100 : 0;
  const totalFuelCost = busRoutes.reduce(
    (sum, route) => sum + (route.fuel_cost || 0),
    0
  );
  const totalMaintenanceCost = busRoutes.reduce(
    (sum, route) => sum + (route.maintenance_cost || 0),
    0
  );
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
      <TabSwitcher
        tabs={[
          {
            value: "routes",
            label: "Bus Routes",
            icon: Route,
            badge: busRoutes.length,
            content: (
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
            ),
          },
          {
            value: "fees",
            label: "Distance Slabs",
            icon: IndianRupeeIcon,
            badge: slabsData.length,
            content: (
              <DistanceSlabsTab
                slabsData={slabsData}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onCreateSlab={(data) => createFeeMutation(data)}
                onUpdateSlab={(data) => updateFeeMutation(data)}
                createFeeMutation={createFeeMutation}
                updateFeeMutation={updateFeeMutation}
              />
            ),
          },
        ]}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
};

export default TransportManagement;
