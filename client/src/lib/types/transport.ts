export interface BusRouteRead {
  bus_route_id: number;
  vehicle_number?: string | null;
  vehicle_capacity: number;
  registration_number?: string | null;
  insurance_expiry?: string | null; // ISO date
  fitness_expiry?: string | null; // ISO date
  permit_expiry?: string | null; // ISO date
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
  insurance_expiry: string; // ISO date
  fitness_expiry: string; // ISO date
  permit_expiry: string; // ISO date
  driver_employee_id: number;
  route_no: string;
  route_name: string;
  start_location: string;
  end_location: string;
  total_distance: number;
  estimated_duration: number;
  is_active?: boolean;
}

export type BusRouteUpdate = Partial<BusRouteCreate>;

export interface BusStopRead {
  stop_id: number;
  bus_route_id: number;
  stop_name: string;
  stop_sequence: number;
  pickup_time: string; // HH:MM:SS
  drop_time: string; // HH:MM:SS
  landmark: string;
  distance_from_start: number;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface BusStopCreate {
  bus_route_id: number;
  stop_name: string;
  stop_sequence: number;
  pickup_time: string; // HH:MM
  drop_time: string; // HH:MM
  landmark: string;
  distance_from_start?: number | null;
}

export type BusStopUpdate = Partial<BusStopCreate>;

export interface TransportFeeStructureRead {
  fee_structure_id: number;
  institute_id: number;
  bus_route_id: number;
  stop_id: number;
  fee_amount: number;
  effective_from_date?: string | null;
  effective_to_date?: string | null;
  created_at: string;
  updated_at?: string | null;
  created_by?: number | null;
  updated_by?: number | null;
}

export interface TransportFeeStructureCreate {
  bus_route_id: number;
  stop_id: number;
  fee_amount: number;
  effective_from_date?: string | null;
  effective_to_date?: string | null;
}

export interface TransportFeeStructureUpdate {
  fee_amount: number;
}


