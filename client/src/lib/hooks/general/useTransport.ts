import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TransportService } from '@/lib/services/general/transport.service';
import type {
  BusRouteRead,
  BusRouteCreate,
  BusRouteUpdate,
  DistanceSlabRead,
  DistanceSlabCreate,
  DistanceSlabUpdate,
  TransportDashboardStats,
  RecentRoute,
} from '@/lib/types/general/transport';

// Query keys
export const transportKeys = {
  all: ['transport'] as const,
  routes: () => [...transportKeys.all, 'routes'] as const,
  route: (id: number) => [...transportKeys.routes(), id] as const,
  routeNames: () => [...transportKeys.routes(), 'names'] as const,
  distanceSlabs: () => [...transportKeys.all, 'distance-slabs'] as const,
  distanceSlab: (id: number) => [...transportKeys.distanceSlabs(), id] as const,
  dashboard: () => [...transportKeys.all, 'dashboard'] as const,
  recent: (limit?: number) => [...transportKeys.all, 'recent', { limit }] as const,
};

// Route hooks
export const useBusRoutes = () => {
  return useQuery({
    queryKey: transportKeys.routes(),
    queryFn: () => TransportService.listRoutes(),
  });
};

export const useBusRoute = (id: number) => {
  return useQuery({
    queryKey: transportKeys.route(id),
    queryFn: () => TransportService.getRoute(id),
    enabled: !!id,
  });
};

export const useRouteNames = () => {
  return useQuery({
    queryKey: transportKeys.routeNames(),
    queryFn: () => TransportService.getRouteNames(),
  });
};

export const useTransportDashboard = () => {
  return useQuery({
    queryKey: transportKeys.dashboard(),
    queryFn: () => TransportService.getDashboard(),
  });
};

export const useRecentRoutes = (limit: number = 5) => {
  return useQuery({
    queryKey: transportKeys.recent(limit),
    queryFn: () => TransportService.getRecent(limit),
  });
};

// Distance slab hooks
export const useDistanceSlabs = () => {
  return useQuery({
    queryKey: transportKeys.distanceSlabs(),
    queryFn: () => TransportService.listDistanceSlabs(),
  });
};

export const useDistanceSlab = (id: number) => {
  return useQuery({
    queryKey: transportKeys.distanceSlab(id),
    queryFn: () => TransportService.getDistanceSlab(id),
    enabled: !!id,
  });
};

// Route mutations
export const useCreateBusRoute = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: BusRouteCreate) => TransportService.createRoute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transportKeys.routes() });
      queryClient.invalidateQueries({ queryKey: transportKeys.routeNames() });
      queryClient.invalidateQueries({ queryKey: transportKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: transportKeys.recent() });
    },
  });
};

export const useUpdateBusRoute = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: BusRouteUpdate }) =>
      TransportService.updateRoute(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: transportKeys.routes() });
      queryClient.invalidateQueries({ queryKey: transportKeys.route(id) });
      queryClient.invalidateQueries({ queryKey: transportKeys.routeNames() });
      queryClient.invalidateQueries({ queryKey: transportKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: transportKeys.recent() });
    },
  });
};

export const useDeleteBusRoute = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => TransportService.deleteRoute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transportKeys.routes() });
      queryClient.invalidateQueries({ queryKey: transportKeys.routeNames() });
      queryClient.invalidateQueries({ queryKey: transportKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: transportKeys.recent() });
    },
  });
};

// Distance slab mutations
export const useCreateDistanceSlab = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: DistanceSlabCreate) => TransportService.createDistanceSlab(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transportKeys.distanceSlabs() });
    },
  });
};

export const useUpdateDistanceSlab = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: DistanceSlabUpdate }) =>
      TransportService.updateDistanceSlab(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: transportKeys.distanceSlabs() });
      queryClient.invalidateQueries({ queryKey: transportKeys.distanceSlab(id) });
    },
  });
};

export const useDeleteDistanceSlab = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => TransportService.deleteDistanceSlab(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transportKeys.distanceSlabs() });
    },
  });
};
