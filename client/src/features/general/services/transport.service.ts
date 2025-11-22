import { Api } from "@/core/api";
import type {
  BusRouteRead,
  BusRouteCreate,
  BusRouteUpdate,
  TransportDashboardStats,
  RecentRoute,
} from "@/features/general/types/transport";

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
   * Assign a driver to a route
   * @param id - Route ID
   * @param driverEmployeeId - Driver employee ID
   * @returns Promise<BusRouteRead> - Updated route details
   */
  assignDriverToRoute(id: number, driverEmployeeId: number): Promise<BusRouteRead> {
    return Api.post<BusRouteRead>(`/bus-routes/${id}/assign-driver`, { driver_employee_id: driverEmployeeId });
  },

  /**
   * Remove driver from a route
   * @param id - Route ID
   * @returns Promise<BusRouteRead> - Updated route details
   */
  removeDriverFromRoute(id: number): Promise<BusRouteRead> {
    return Api.delete<BusRouteRead>(`/bus-routes/${id}/remove-driver`);
  },

};
