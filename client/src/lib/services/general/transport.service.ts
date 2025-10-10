import { Api } from "@/lib/api";
import type {
  BusRouteRead,
  BusRouteCreate,
  BusRouteUpdate,
  DistanceSlabRead,
  DistanceSlabCreate,
  DistanceSlabUpdate,
  TransportDashboardStats,
  RecentRoute,
} from "@/lib/types/general/transport";

/**
 * TransportService - Handles all transport-related API operations
 * 
 * Required roles for most operations: INSTITUTE_ADMIN, ADMIN, ACADEMIC, ACCOUNTANT
 * 
 * Available endpoints:
 * - GET /bus-routes/dashboard - Get transport dashboard statistics
 * - GET /bus-routes/recent - Get recent routes
 * - GET /bus-routes/ - List all bus routes
 * - GET /bus-routes/{id} - Get route by ID
 * - POST /bus-routes/ - Create new route
 * - PUT /bus-routes/{id} - Update route
 * - DELETE /bus-routes/{id} - Delete route
 * - GET /transport-fee-structures/ - List distance slabs
 * - GET /transport-fee-structures/{id} - Get distance slab by ID
 * - POST /transport-fee-structures/ - Create new distance slab
 * - PUT /transport-fee-structures/{id} - Update distance slab
 * - DELETE /transport-fee-structures/{id} - Delete distance slab
 */
export const TransportService = {
  /**
   * Get transport dashboard statistics
   * @returns Promise<TransportDashboardStats> - Dashboard statistics
   */
  getDashboard(): Promise<TransportDashboardStats> {
    return Api.get<TransportDashboardStats>("/bus-routes/dashboard");
  },

  /**
   * Get recent routes
   * @param limit - Number of recent records to return (default: 5)
   * @returns Promise<RecentRoute[]> - List of recent routes
   */
  getRecent(limit: number = 5): Promise<RecentRoute[]> {
    return Api.get<RecentRoute[]>(`/bus-routes/recent?limit=${limit}`);
  },

  /**
   * Get all bus routes
   * @returns Promise<BusRouteRead[]> - List of all routes
   */
  listRoutes(): Promise<BusRouteRead[]> {
    return Api.get<BusRouteRead[]>("/bus-routes");
  },

  /**
   * Get route names for dropdowns
   * @returns Promise<{bus_route_id: number; route_name: string; route_no?: string}[]> - Route names
   */
  getRouteNames(): Promise<{ bus_route_id: number; route_name: string; route_no?: string }[]> {
    return Api.get<{ bus_route_id: number; route_name: string; route_no?: string }[]>("/bus-routes/names");
  },

  /**
   * Get a specific route by ID
   * @param id - Route ID
   * @returns Promise<BusRouteRead> - Route details
   */
  getRoute(id: number): Promise<BusRouteRead> {
    return Api.get<BusRouteRead>(`/bus-routes/${id}`);
  },

  /**
   * Create a new route
   * @param payload - Route creation data
   * @returns Promise<BusRouteRead> - Created route details
   */
  createRoute(payload: BusRouteCreate): Promise<BusRouteRead> {
    return Api.post<BusRouteRead>("/bus-routes", payload);
  },

  /**
   * Update an existing route
   * @param id - Route ID
   * @param payload - Route update data
   * @returns Promise<BusRouteRead> - Updated route details
   */
  updateRoute(id: number, payload: BusRouteUpdate): Promise<BusRouteRead> {
    return Api.put<BusRouteRead>(`/bus-routes/${id}`, payload);
  },

  /**
   * Delete a route
   * @param id - Route ID
   * @returns Promise<void> - Success status
   */
  deleteRoute(id: number): Promise<void> {
    return Api.delete<void>(`/bus-routes/${id}`);
  },

  /**
   * Get all distance slabs
   * @returns Promise<DistanceSlabRead[]> - List of all distance slabs
   */
  listDistanceSlabs(): Promise<DistanceSlabRead[]> {
    return Api.get<DistanceSlabRead[]>("/transport-fee-structures");
  },

  /**
   * Get a specific distance slab by ID
   * @param id - Distance slab ID
   * @returns Promise<DistanceSlabRead> - Distance slab details
   */
  getDistanceSlab(id: number): Promise<DistanceSlabRead> {
    return Api.get<DistanceSlabRead>(`/transport-fee-structures/${id}`);
  },

  /**
   * Create a new distance slab
   * @param payload - Distance slab creation data
   * @returns Promise<DistanceSlabRead> - Created distance slab details
   */
  createDistanceSlab(payload: DistanceSlabCreate): Promise<DistanceSlabRead> {
    return Api.post<DistanceSlabRead>("/transport-fee-structures", payload);
  },

  /**
   * Update an existing distance slab
   * @param id - Distance slab ID
   * @param payload - Distance slab update data
   * @returns Promise<DistanceSlabRead> - Updated distance slab details
   */
  updateDistanceSlab(id: number, payload: DistanceSlabUpdate): Promise<DistanceSlabRead> {
    return Api.put<DistanceSlabRead>(`/transport-fee-structures/${id}`, payload);
  },

  /**
   * Delete a distance slab
   * @param id - Distance slab ID
   * @returns Promise<void> - Success status
   */
  deleteDistanceSlab(id: number): Promise<void> {
    return Api.delete<void>(`/transport-fee-structures/${id}`);
  },
};
