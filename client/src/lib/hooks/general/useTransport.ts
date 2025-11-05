import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TransportService } from '@/lib/services/general/transport.service';
import type {
  BusRouteCreate,
  BusRouteUpdate,
} from '@/lib/types/general/transport';
import { useMutationWithSuccessToast } from '../common/use-mutation-with-toast';
import { useGlobalRefetch } from '../common/useGlobalRefetch';

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
  const { invalidateEntity } = useGlobalRefetch();
  
  return useMutationWithSuccessToast({
    mutationFn: (data: BusRouteCreate) => TransportService.createRoute(data),
    onSuccess: () => {
      invalidateEntity("transport");
    },
  }, "Bus route created successfully");
};

export const useUpdateBusRoute = () => {
  const { invalidateEntity } = useGlobalRefetch();
  
  return useMutationWithSuccessToast({
    mutationFn: ({ id, payload }: { id: number; payload: BusRouteUpdate }) =>
      TransportService.updateRoute(id, payload),
    onSuccess: () => {
      invalidateEntity("transport");
    },
  }, "Bus route updated successfully");
};

export const useDeleteBusRoute = () => {
  const { invalidateEntity } = useGlobalRefetch();
  
  return useMutationWithSuccessToast({
    mutationFn: (id: number) => TransportService.deleteRoute(id),
    onSuccess: () => {
      invalidateEntity("transport");
    },
  }, "Bus route deleted successfully");
};

export const useAssignDriverToRoute = () => {
  const { invalidateEntity } = useGlobalRefetch();
  const queryClient = useQueryClient();
  
  return useMutationWithSuccessToast({
    mutationFn: ({ id, driverEmployeeId }: { id: number; driverEmployeeId: number }) =>
      TransportService.assignDriverToRoute(id, driverEmployeeId),
    onSuccess: (data, variables) => {
      invalidateEntity("transport");
      // Also invalidate the specific route query to refresh the dialog
      queryClient.invalidateQueries({ queryKey: transportKeys.route(variables.id) });
    },
  }, "Driver assigned successfully");
};

export const useRemoveDriverFromRoute = () => {
  const { invalidateEntity } = useGlobalRefetch();
  const queryClient = useQueryClient();
  
  return useMutationWithSuccessToast({
    mutationFn: (id: number) => {
      console.log("Calling removeDriverFromRoute with id:", id);
      return TransportService.removeDriverFromRoute(id);
    },
    onSuccess: (data, variables) => {
      console.log("Remove driver success, data:", data, "variables:", variables);
      invalidateEntity("transport");
      // Invalidate the specific route query to refresh the dialog
      queryClient.invalidateQueries({ queryKey: transportKeys.route(variables) });
      // Also set the query data directly with the response
      if (data) {
        queryClient.setQueryData(transportKeys.route(variables), data);
      }
    },
    onError: (error, variables) => {
      console.error("Remove driver error:", error, "variables:", variables);
    },
  }, "Driver removed successfully");
};

