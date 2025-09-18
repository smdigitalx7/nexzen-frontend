import { Api } from "@/lib/api";
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

  // Bus Stops
  listStops(): Promise<BusStopRead[]> {
    return Api.get<BusStopRead[]>("/bus-stops/");
  },
  getStop(id: number): Promise<BusStopRead> {
    return Api.get<BusStopRead>(`/bus-stops/${id}`);
  },
  listStopsByRoute(routeId: number): Promise<BusStopRead[]> {
    return Api.get<BusStopRead[]>(`/bus-stops/route/${routeId}`);
  },
  createStop(payload: BusStopCreate): Promise<BusStopRead> {
    return Api.post<BusStopRead>("/bus-stops/", payload);
  },
  updateStop(id: number, payload: BusStopUpdate): Promise<BusStopRead> {
    return Api.put<BusStopRead>(`/bus-stops/${id}`, payload);
  },
  deleteStop(id: number): Promise<BusStopRead> {
    return Api.delete<BusStopRead>(`/bus-stops/${id}`);
  },

  // Transport Fee Structures
  listFees(): Promise<TransportFeeStructureRead[]> {
    return Api.get<TransportFeeStructureRead[]>("/transport-fee-structures/");
  },
  getFee(id: number): Promise<TransportFeeStructureRead> {
    return Api.get<TransportFeeStructureRead>(`/transport-fee-structures/${id}`);
  },
  createFee(payload: TransportFeeStructureCreate): Promise<TransportFeeStructureRead> {
    return Api.post<TransportFeeStructureRead>("/transport-fee-structures/", payload);
  },
  updateFee(id: number, payload: TransportFeeStructureUpdate): Promise<TransportFeeStructureRead> {
    return Api.put<TransportFeeStructureRead>(`/transport-fee-structures/${id}`, payload);
  },
  deleteFee(id: number): Promise<TransportFeeStructureRead> {
    return Api.delete<TransportFeeStructureRead>(`/transport-fee-structures/${id}`);
  },
};


