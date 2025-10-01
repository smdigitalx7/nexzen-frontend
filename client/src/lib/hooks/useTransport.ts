import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ServiceLocator } from "@/core";
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
          registration_number: transport.vehicleNumber,
          driver_employee_id: null, // Not available in entity
          route_no: transport.vehicleNumber,
          route_name: transport.routeName,
          start_location: transport.startLocation,
          total_distance: null, // Not available in entity
          estimated_duration: null, // Not available in entity
          is_active: transport.isActive,
          created_at: transport.createdAt, // Already in correct format
          updated_at: transport.updatedAt, // Already in correct format
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
    staleTime: 1000 * 60 * 5 
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
        registration_number: transport.vehicleNumber,
        driver_employee_id: null, // Not available in entity
        route_no: transport.vehicleNumber,
        route_name: transport.routeName,
        start_location: transport.startLocation,
        total_distance: null, // Not available in entity
        estimated_duration: null, // Not available in entity
        is_active: transport.isActive,
        created_at: transport.createdAt, // Already in correct format
        updated_at: transport.updatedAt, // Already in correct format
        created_by: null, // Not available in entity
        updated_by: null, // Not available in entity
      };
    }, 
    enabled: Number.isFinite(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
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
        vehicleNumber: payload.vehicle_number || payload.route_no || 'ROUTE001',
        vehicleCapacity: payload.vehicle_capacity || 50,
        registrationNumber: payload.vehicle_number || '',
        driverEmployeeId: 0,
        routeNo: payload.route_no || '',
        routeName: payload.route_name || 'Unknown Route',
        startLocation: '',
        totalDistance: 0,
        estimatedDuration: 0,
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
        registrationNumber: payload.vehicle_number,
        driverEmployeeId: 0,
        routeNo: payload.route_no,
        routeName: payload.route_name,
        startLocation: '',
        totalDistance: 0,
        estimatedDuration: 0,
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
        route_id: id,
        route_name: 'Deleted Route',
        route_no: 'DELETED',
        vehicle_number: 'DELETED',
        vehicle_type: 'DELETED',
        capacity: 0,
        driver_name: 'Deleted Driver',
        driver_phone: '',
        is_active: false,
        branch_id: 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.routes });
      toast({ title: "Success", description: `Route deleted.` });
    },
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
    staleTime: 1000 * 60 * 5 
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
