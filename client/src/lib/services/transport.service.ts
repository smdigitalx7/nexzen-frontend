import { Api } from "@/lib/api";
import type {
  BusRouteRead,
  BusRouteCreate,
  BusRouteUpdate,
  DistanceSlabRead,
  DistanceSlabCreate,
  DistanceSlabUpdate,
} from "@/lib/types/transport";

export const TransportService = {
  // Bus Routes
  listRoutes(): Promise<BusRouteRead[]> {
    return Api.get<BusRouteRead[]>("/bus-routes/");
  },
  getRoute(id: number): Promise<BusRouteRead> {
    return Api.get<BusRouteRead>(`/bus-routes/${id}`);
  },
  createRoute(payload: BusRouteCreate): Promise<BusRouteRead> {
    return Api.post<BusRouteRead>("/bus-routes/", payload);
  },
  updateRoute(id: number, payload: BusRouteUpdate): Promise<BusRouteRead> {
    return Api.put<BusRouteRead>(`/bus-routes/${id}`, payload);
  },
  deleteRoute(id: number): Promise<BusRouteRead> {
    return Api.delete<BusRouteRead>(`/bus-routes/${id}`);
  },
  
  // Distance Slabs
  listDistanceSlabs(): Promise<DistanceSlabRead[]> {
    return Api.get<DistanceSlabRead[]>("/transport-fee-structures/");
  },
  getDistanceSlab(id: number): Promise<DistanceSlabRead> {
    return Api.get<DistanceSlabRead>(`/transport-fee-structures/${id}`);
  },
  createDistanceSlab(payload: DistanceSlabCreate): Promise<DistanceSlabRead> {
    return Api.post<DistanceSlabRead>("/transport-fee-structures/", payload);
  },
  updateDistanceSlab(id: number, payload: DistanceSlabUpdate): Promise<DistanceSlabRead> {
    return Api.put<DistanceSlabRead>(`/transport-fee-structures/${id}`, payload);
  },
};
