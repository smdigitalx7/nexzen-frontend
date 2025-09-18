import { Api } from "@/lib/api";
import type { BusRouteRead, BusRouteCreate, BusRouteUpdate } from "@/lib/types/transport";

export const TransportRoutesService = {
  list(): Promise<BusRouteRead[]> {
    return Api.get("/bus-routes/");
  },
  getById(id: number): Promise<BusRouteRead> {
    return Api.get(`/bus-routes/${id}`);
  },
  create(payload: BusRouteCreate): Promise<BusRouteRead> {
    return Api.post("/bus-routes/", payload);
  },
  update(id: number, payload: BusRouteUpdate): Promise<BusRouteRead> {
    return Api.put(`/bus-routes/${id}`, payload);
  },
  remove(id: number): Promise<BusRouteRead> {
    return Api.delete(`/bus-routes/${id}`) as unknown as Promise<BusRouteRead>;
  },
};


