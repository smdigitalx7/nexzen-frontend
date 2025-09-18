import { Api } from "@/lib/api";
import type { BusStopRead, BusStopCreate, BusStopUpdate } from "@/lib/types/transport";

export const TransportStopsService = {
  list(): Promise<BusStopRead[]> {
    return Api.get("/bus-stops/");
  },
  listByRoute(route_id: number): Promise<BusStopRead[]> {
    return Api.get(`/bus-stops/route/${route_id}`);
  },
  getById(id: number): Promise<BusStopRead> {
    return Api.get(`/bus-stops/${id}`);
  },
  create(payload: BusStopCreate): Promise<BusStopRead> {
    return Api.post("/bus-stops/", payload);
  },
  update(id: number, payload: BusStopUpdate): Promise<BusStopRead> {
    return Api.put(`/bus-stops/${id}`, payload);
  },
  remove(id: number): Promise<BusStopRead> {
    return Api.delete(`/bus-stops/${id}`) as unknown as Promise<BusStopRead>;
  },
};


