export interface DriverDetails {
  employee_name: string;
  mobile_no?: string | null;
  status: string;
}

export interface BusRouteRead {
  bus_route_id: number;
  vehicle_number?: string | null;
  vehicle_capacity: number;
  registration_number?: string | null;
  driver_employee_id?: number | null;
  driver_name?: string | null;
  driver_details?: DriverDetails | null;
  route_no?: string | null;
  route_name?: string | null;
  via?: string | null;
  start_location?: string | null;
  end_location?: string | null;
  total_distance?: number | null;
  estimated_duration?: number | null;
  is_active?: boolean | null;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface BusRouteCreate {
  vehicle_number: string;
  vehicle_capacity: number;
  registration_number: string;
  route_no: string;
  route_name: string;
  via?: string;
  start_location: string;
  total_distance: number;
  estimated_duration: number;
  is_active?: boolean;
}

export interface BusRouteUpdate {
  vehicle_number?: string;
  vehicle_capacity?: number;
  registration_number?: string;
  driver_employee_id?: number;
  route_no?: string;
  route_name?: string;
  start_location?: string;
  end_location?: string;
  total_distance?: number;
  estimated_duration?: number;
  is_active?: boolean;
}

// Distance Slabs
export interface DistanceSlabRead {
  slab_id: number;
  slab_name: string;
  min_distance: number;
  max_distance?: number | null;
  fee_amount: number;
  created_at: string;
  updated_at?: string | null;
}

export interface DistanceSlabCreate {
  slab_name: string;
  min_distance: number;
  max_distance?: number | null;
  fee_amount: number;
}

export interface DistanceSlabUpdate {
  slab_name?: string;
  min_distance?: number;
  max_distance?: number | null;
  fee_amount?: number;
}

// Transport Dashboard Stats
export interface TransportDashboardStats {
  total_routes: number;
  active_routes: number;
  inactive_routes: number;
  total_vehicles: number;
  total_capacity: number;
  total_distance_slabs: number;
  average_fee_amount: number;
  routes_created_this_month: number;
  routes_created_this_year: number;
}

// Recent Routes
export interface RecentRoute {
  bus_route_id: number;
  route_name: string;
  route_no: string;
  vehicle_number: string;
  driver_name: string;
  is_active: boolean;
  created_at: string;
}
