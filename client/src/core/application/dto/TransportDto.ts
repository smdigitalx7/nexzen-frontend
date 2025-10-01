export interface CreateTransportRequest {
  vehicleNumber: string;
  vehicleCapacity: number;
  registrationNumber?: string;
  driverEmployeeId?: number;
  routeNo?: string;
  routeName?: string;
  startLocation?: string;
  totalDistance?: number;
  estimatedDuration?: number;
}

export interface UpdateTransportRequest {
  id: number;
  vehicleNumber?: string;
  vehicleCapacity?: number;
  registrationNumber?: string;
  driverEmployeeId?: number;
  routeNo?: string;
  routeName?: string;
  startLocation?: string;
  totalDistance?: number;
  estimatedDuration?: number;
  isActive?: boolean;
}

export interface TransportResponse {
  id: number;
  vehicleNumber: string;
  vehicleCapacity: number;
  registrationNumber: string;
  driverEmployeeId: number;
  routeNo: string;
  routeName: string;
  startLocation: string;
  totalDistance: number;
  estimatedDuration: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
