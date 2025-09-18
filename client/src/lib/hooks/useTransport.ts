import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { TransportService } from "@/lib/services/transport.service";
import type {
  BusRouteRead,
  BusRouteCreate,
  BusRouteUpdate,
  BusStopRead,
  BusStopCreate,
  BusStopUpdate,
  TransportFeeStructureRead,
  TransportFeeStructureCreate,
  TransportFeeStructureUpdate,
} from "@/lib/types/transport";
import { useToast } from "@/hooks/use-toast";

const keys = {
  routes: ["transport", "routes"] as const,
  route: (id: number) => ["transport", "routes", id] as const,
  stops: ["transport", "stops"] as const,
  stopsByRoute: (routeId: number) => ["transport", "stops", routeId] as const,
  stop: (id: number) => ["transport", "stops", id] as const,
  fees: ["transport", "fees"] as const,
  fee: (id: number) => ["transport", "fees", id] as const,
};

// Routes
export function useBusRoutes() {
  return useQuery<BusRouteRead[]>({ queryKey: keys.routes, queryFn: () => TransportService.listRoutes(), staleTime: 1000 * 60 * 5 });
}
export function useBusRoute(id: number) {
  return useQuery<BusRouteRead>({ queryKey: keys.route(id), queryFn: () => TransportService.getRoute(id), enabled: Number.isFinite(id) });
}
export function useCreateBusRoute() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (payload: BusRouteCreate) => TransportService.createRoute(payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: keys.routes });
      toast({ title: "Success", description: `Route "${data.route_no || data.route_name}" created.` });
    },
  });
}
export function useUpdateBusRoute() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: BusRouteUpdate }) => TransportService.updateRoute(id, payload),
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
    mutationFn: (id: number) => TransportService.deleteRoute(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.routes });
      toast({ title: "Success", description: `Route deleted.` });
    },
  });
}

// Stops
export function useBusStops() {
  return useQuery<BusStopRead[]>({ queryKey: keys.stops, queryFn: () => TransportService.listStops(), staleTime: 1000 * 60 * 5 });
}
export function useBusStopsByRoute(routeId: number) {
  return useQuery<BusStopRead[]>({ queryKey: keys.stopsByRoute(routeId), queryFn: () => TransportService.listStopsByRoute(routeId), enabled: Number.isFinite(routeId) });
}
export function useCreateBusStop() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (payload: BusStopCreate) => TransportService.createStop(payload),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: keys.stops });
      qc.invalidateQueries({ queryKey: keys.stopsByRoute(data.bus_route_id) });
      toast({ title: "Success", description: `Stop "${data.stop_name}" created.` });
    },
  });
}
export function useUpdateBusStop() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: BusStopUpdate }) => TransportService.updateStop(id, payload),
    onSuccess: (data, { id }) => {
      qc.invalidateQueries({ queryKey: keys.stops });
      qc.invalidateQueries({ queryKey: keys.stop(id) });
      if (data.bus_route_id) qc.invalidateQueries({ queryKey: keys.stopsByRoute(data.bus_route_id) });
      toast({ title: "Success", description: `Stop updated.` });
    },
  });
}
export function useDeleteBusStop() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: number) => TransportService.deleteStop(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.stops });
      toast({ title: "Success", description: `Stop deleted.` });
    },
  });
}

// Fees
export function useTransportFees() {
  return useQuery<TransportFeeStructureRead[]>({ queryKey: keys.fees, queryFn: () => TransportService.listFees(), staleTime: 1000 * 60 * 5 });
}
export function useCreateTransportFee() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (payload: TransportFeeStructureCreate) => TransportService.createFee(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.fees });
      toast({ title: "Success", description: `Fee structure created.` });
    },
  });
}
export function useUpdateTransportFee() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: TransportFeeStructureUpdate }) => TransportService.updateFee(id, payload),
    onSuccess: (data, { id }) => {
      qc.invalidateQueries({ queryKey: keys.fees });
      qc.invalidateQueries({ queryKey: keys.fee(id) });
      toast({ title: "Success", description: `Fee structure updated.` });
    },
  });
}
export function useDeleteTransportFee() {
  const qc = useQueryClient();
  const { toast } = useToast();
  return useMutation({
    mutationFn: (id: number) => TransportService.deleteFee(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: keys.fees });
      toast({ title: "Success", description: `Fee structure deleted.` });
    },
  });
}
