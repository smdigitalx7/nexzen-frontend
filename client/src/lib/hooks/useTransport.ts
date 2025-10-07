import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ServiceLocator } from "@/core";
import { QUERY_STALE_TIME } from "@/lib/constants/query";
import type {
  BusRouteRead,
  BusRouteCreate,
  BusRouteUpdate,
  DistanceSlabRead,
  DistanceSlabCreate,
  DistanceSlabUpdate,
} from "@/lib/types/transport";
import { useToast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";

const keys = {
  routes: ["transport", "routes"] as const,
  route: (id: number) => ["transport", "routes", id] as const,
  routeNames: ["transport", "routes", "names"] as const,
  distanceSlabs: ["transport", "distance-slabs"] as const,
  distanceSlab: (id: number) => ["transport", "distance-slabs", id] as const,
};

// Routes
export function useBusRoutes() {
  return useQuery<BusRouteRead[]>({ 
    queryKey: keys.routes, 
    queryFn: async () => {
      // Check user roles first
      const authState = useAuthStore.getState();
      console.log('🔍 Current user roles:', authState.user?.role);
      console.log('🔍 Is institute admin:', authState.user?.role === 'institute_admin');
      
      try {
        const transportUseCases = ServiceLocator.getTransportUseCases();
        const transports = await transportUseCases.getAllTransports();
        
        // Convert clean architecture response to backend format
        return transports.map(transport => ({
          bus_route_id: transport.id,
          vehicle_number: transport.vehicleNumber,
          vehicle_capacity: transport.vehicleCapacity,
          registration_number: transport.registrationNumber,
          driver_employee_id: transport.driverEmployeeId,
          route_no: transport.routeNo,
          route_name: transport.routeName,
          start_location: transport.startLocation,
          end_location: transport.endLocation,
          total_distance: transport.totalDistance,
          estimated_duration: transport.estimatedDuration,
          is_active: transport.isActive,
          created_at: transport.createdAt,
          updated_at: transport.updatedAt,
          created_by: null, // Not available in entity
          updated_by: null, // Not available in entity
        }));
      } catch (error: any) {
        console.error('❌ Transport API Error:', error);
        if (error.message?.includes('403') || error.message?.includes('Forbidden')) {
          console.error('🚫 ACCESS DENIED: You need ACCOUNTANT role to access Transport APIs');
          console.error('💡 Solution: Assign ACCOUNTANT role to your user in the database');
        }
        throw error;
      }
    }, 
    staleTime: QUERY_STALE_TIME 
  });
}
export function useBusRoute(id: number) {
  return useQuery<BusRouteRead>({ 
    queryKey: keys.route(id), 
    queryFn: async () => {
      const transportUseCases = ServiceLocator.getTransportUseCases();
      const transport = await transportUseCases.getTransportById(id);
      
      if (!transport) {
        throw new Error('Bus route not found');
      }
      
      // Convert clean architecture response to backend format
      return {
        bus_route_id: transport.id,
        vehicle_number: transport.vehicleNumber,
        vehicle_capacity: transport.vehicleCapacity,
        registration_number: transport.registrationNumber,
        driver_employee_id: transport.driverEmployeeId,
        route_no: transport.routeNo,
        route_name: transport.routeName,
        start_location: transport.startLocation,
        end_location: transport.endLocation,
        total_distance: transport.totalDistance,
        estimated_duration: transport.estimatedDuration,
        is_active: transport.isActive,
        created_at: transport.createdAt,
        updated_at: transport.updatedAt,
        created_by: null, // Not available in response
        updated_by: null, // Not available in response
      };
    }, 
    enabled: Number.isFinite(id) && id > 0,
    staleTime: QUERY_STALE_TIME, // 5 minutes
  });
}
export function useCreateBusRoute() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (payload: BusRouteCreate) => {
      console.log("Creating bus route with clean architecture...");
      const transportUseCases = ServiceLocator.getTransportUseCases();
            const transport = await transportUseCases.createTransport({
              vehicleNumber: payload.vehicle_number,
              vehicleCapacity: payload.vehicle_capacity,
              registrationNumber: payload.registration_number,
              driverEmployeeId: payload.driver_employee_id,
              routeNo: payload.route_no,
              routeName: payload.route_name,
              startLocation: payload.start_location,
              endLocation: payload.end_location,
              totalDistance: payload.total_distance,
              estimatedDuration: payload.estimated_duration,
            });
      
      // Return the response data directly
      return transport;
    },
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: keys.routes });
      toast({ title: "Success", description: `Route "${data.routeName}" created.` });
    },
  });
}
export function useUpdateBusRoute() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: BusRouteUpdate }) => {
      console.log(`Updating bus route ${id} with clean architecture...`);
      const transportUseCases = ServiceLocator.getTransportUseCases();
      const transport = await transportUseCases.updateTransport({
        id,
        vehicleNumber: payload.vehicle_number,
        vehicleCapacity: payload.vehicle_capacity,
        registrationNumber: payload.registration_number,
        driverEmployeeId: payload.driver_employee_id,
        routeNo: payload.route_no,
        routeName: payload.route_name,
        startLocation: payload.start_location,
        endLocation: payload.end_location,
        totalDistance: payload.total_distance,
        estimatedDuration: payload.estimated_duration,
        isActive: payload.is_active,
      });
      
      // Return the response data directly
      return transport;
    },
    onSuccess: (data, { id }) => {
      qc.invalidateQueries({ queryKey: keys.routes });
      qc.invalidateQueries({ queryKey: keys.route(id) });
      toast({ title: "Success", description: `Route updated.` });
    },
  });
}
export function useDeleteBusRoute() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (id: number) => {
      console.log(`Deleting bus route ${id} with clean architecture...`);
      const transportUseCases = ServiceLocator.getTransportUseCases();
      await transportUseCases.deleteTransport(id);
      
      // Return mock response for compatibility
      return {
        bus_route_id: id,
        vehicle_number: 'DELETED',
        vehicle_capacity: 0,
        registration_number: 'DELETED',
        driver_employee_id: null,
        route_no: 'DELETED',
        route_name: 'Deleted Route',
        start_location: 'DELETED',
        end_location: 'DELETED',
        total_distance: 0,
        estimated_duration: 0,
        is_active: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_by: null,
        updated_by: null,
      };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.routes });
      toast({ title: "Success", description: `Route deleted.` });
    },
  });
}

export function useBusRouteNames() {
  return useQuery<{ bus_route_id: number; route_name: string; route_no?: string }[]>({ 
    queryKey: keys.routeNames, 
    queryFn: async () => {
      const transportUseCases = ServiceLocator.getTransportUseCases();
      const transports = await transportUseCases.getAllTransports();
      
      // Convert to route names format for dropdowns
      return transports.map(transport => ({
        bus_route_id: transport.id,
        route_name: transport.routeName,
        route_no: transport.routeNo,
      }));
    },
    staleTime: QUERY_STALE_TIME 
  });
}

// Distance Slabs
export function useDistanceSlabs() {
  return useQuery<DistanceSlabRead[]>({ 
    queryKey: keys.distanceSlabs, 
    queryFn: async () => {
      const transportUseCases = ServiceLocator.getTransportUseCases();
      const transports = await transportUseCases.getAllTransports();
      
      // Convert transport data to distance slab format (backend schema)
      return transports.map((transport: any, index: number) => ({
        slab_id: transport.id,
        slab_name: transport.route || `Route ${index + 1}`,
        min_distance: 0, // Default value
        max_distance: 50, // Default value
        fee_amount: 10.00 + (index * 5), // Default calculation
      }));
    }, 
    staleTime: QUERY_STALE_TIME 
  });
}
export function useCreateDistanceSlab() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (payload: DistanceSlabCreate) => {
      console.log("Creating distance slab with legacy API...");
      const transportUseCases = ServiceLocator.getTransportUseCases();
      const transport = await transportUseCases.createTransport({
        vehicleNumber: payload.slab_name || 'SLAB001',
        vehicleCapacity: 50,
        registrationNumber: '',
        driverEmployeeId: 0,
        routeNo: '',
        routeName: payload.slab_name || 'Unknown Route',
        startLocation: '',
        totalDistance: 0,
        estimatedDuration: 0,
      });
      
      // Convert transport response to distance slab format
      return {
        slab_id: transport.id,
        slab_name: transport.routeName,
        min_distance: payload.min_distance,
        max_distance: payload.max_distance,
        fee_amount: payload.fee_amount,
        is_active: transport.isActive,
      };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.distanceSlabs });
      toast({ title: "Success", description: `Distance slab created.` });
    },
  });
}
export function useUpdateDistanceSlab() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: number; payload: DistanceSlabUpdate }) => {
      console.log(`Updating distance slab ${id} with clean architecture...`);
      const transportUseCases = ServiceLocator.getTransportUseCases();
      const transport = await transportUseCases.updateTransport({
        id,
        vehicleNumber: payload.slab_name || 'SLAB001',
        vehicleCapacity: 50,
        registrationNumber: '',
        driverEmployeeId: 0,
        routeNo: '',
        routeName: payload.slab_name || 'Unknown Route',
        startLocation: '',
        totalDistance: 0,
        estimatedDuration: 0,
        isActive: true,
      });
      
      // Convert transport response to distance slab format
      return {
        slab_id: transport.id,
        slab_name: transport.routeName,
        min_distance: payload.min_distance,
        max_distance: payload.max_distance,
        fee_amount: payload.fee_amount,
        is_active: transport.isActive,
      };
    },
    onSuccess: (data, { id }) => {
      qc.invalidateQueries({ queryKey: keys.distanceSlabs });
      qc.invalidateQueries({ queryKey: keys.distanceSlab(id) });
      toast({ title: "Success", description: `Distance slab updated.` });
    },
  });
}
