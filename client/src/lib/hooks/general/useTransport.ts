import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TransportService } from '@/lib/services/general/transport.service';
import type {
  BusRouteRead,
  BusRouteCreate,
  BusRouteUpdate,
  TransportDashboardStats,
  RecentRoute,
} from '@/lib/types/general/transport';
import { useMutationWithSuccessToast } from '../common/use-mutation-with-toast';

// Query keys
export const transportKeys = {
  all: ['transport'] as const,
  routes: () => [...transportKeys.all, 'routes'] as const,
  route: (id: number) => [...transportKeys.routes(), id] as const,
  routeNames: () => [...transportKeys.routes(), 'names'] as const,
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


// Route mutations
export const useCreateBusRoute = () => {
  const queryClient = useQueryClient();
  
  return useMutationWithSuccessToast({
    mutationFn: (data: BusRouteCreate) => TransportService.createRoute(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transportKeys.routes() });
      queryClient.invalidateQueries({ queryKey: transportKeys.routeNames() });
      queryClient.invalidateQueries({ queryKey: transportKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: transportKeys.recent() });
    },
  }, "Bus route created successfully");
};

export const useUpdateBusRoute = () => {
  const queryClient = useQueryClient();
  
  return useMutationWithSuccessToast({
    mutationFn: ({ id, payload }: { id: number; payload: BusRouteUpdate }) =>
      TransportService.updateRoute(id, payload),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: transportKeys.routes() });
      queryClient.invalidateQueries({ queryKey: transportKeys.route(id) });
      queryClient.invalidateQueries({ queryKey: transportKeys.routeNames() });
      queryClient.invalidateQueries({ queryKey: transportKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: transportKeys.recent() });
    },
  }, "Bus route updated successfully");
};

export const useDeleteBusRoute = () => {
  const queryClient = useQueryClient();
  
  return useMutationWithSuccessToast({
    mutationFn: (id: number) => TransportService.deleteRoute(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transportKeys.routes() });
      queryClient.invalidateQueries({ queryKey: transportKeys.routeNames() });
      queryClient.invalidateQueries({ queryKey: transportKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: transportKeys.recent() });
    },
  }, "Bus route deleted successfully");
};

export const useAssignDriverToRoute = () => {
  const queryClient = useQueryClient();
  
  return useMutationWithSuccessToast({
    mutationFn: ({ id, driverEmployeeId }: { id: number; driverEmployeeId: number }) =>
      TransportService.assignDriverToRoute(id, driverEmployeeId),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: transportKeys.routes() });
      queryClient.invalidateQueries({ queryKey: transportKeys.route(id) });
      queryClient.invalidateQueries({ queryKey: transportKeys.routeNames() });
      queryClient.invalidateQueries({ queryKey: transportKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: transportKeys.recent() });
    },
  }, "Driver assigned successfully");
};

export const useRemoveDriverFromRoute = () => {
  const queryClient = useQueryClient();
  
  return useMutationWithSuccessToast({
    mutationFn: (id: number) => TransportService.removeDriverFromRoute(id),
    onSuccess: (_, routeId) => {
      queryClient.invalidateQueries({ queryKey: transportKeys.routes() });
      queryClient.invalidateQueries({ queryKey: transportKeys.route(routeId) });
      queryClient.invalidateQueries({ queryKey: transportKeys.routeNames() });
      queryClient.invalidateQueries({ queryKey: transportKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: transportKeys.recent() });
    },
  }, "Driver removed successfully");
};

