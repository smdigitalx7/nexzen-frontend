export interface BusRouteRead {
  bus_route_id: number;
  vehicle_number?: string | null;
  vehicle_capacity: number;
  registration_number?: string | null;
  driver_employee_id?: number | null;
  route_no?: string | null;
  route_name?: string | null;
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
  driver_employee_id: number;
  route_no: string;
  route_name: string;
  start_location: string;
  end_location: string;
  total_distance: number;
  estimated_duration: number;
  is_active?: boolean;
}

export type BusRouteUpdate = Partial<{
  vehicle_number: string;
  vehicle_capacity: number;
  registration_number: string;
  driver_employee_id: number;
  route_no: string;
  route_name: string;
  start_location: string;
  end_location: string;
  total_distance: number;
  estimated_duration: number;
  is_active: boolean;
}>;

// Distance Slabs
export interface DistanceSlabRead {
  slab_id: number;
  slab_name: string;
  min_distance: number;
  max_distance?: number | null;
  fee_amount: number;
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
