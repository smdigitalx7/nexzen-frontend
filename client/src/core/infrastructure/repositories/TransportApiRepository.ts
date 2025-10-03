import { TransportRepository } from '../../domain/repositories/TransportRepository';
import { TransportEntity } from '../../domain/entities/Transport';
import { TransportId } from '../../domain/value-objects/TransportId';
import { ApiClient } from '../api/ApiClient';

export class TransportApiRepository implements TransportRepository {
  constructor(private apiClient: ApiClient) {}

  async findById(id: TransportId): Promise<TransportEntity | null> {
    try {
      const response = await this.apiClient.get(`/bus-routes/${id.getValue()}/`);
      return this.mapToEntity(response.data as any);
    } catch (error) {
      return null;
    }
  }

  async findAll(): Promise<TransportEntity[]> {
    const response = await this.apiClient.get('/bus-routes/');
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async findByBranchId(branchId: number): Promise<TransportEntity[]> {
    const response = await this.apiClient.get(`/bus-routes/?branch_id=${branchId}`);
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async findByRoute(route: string): Promise<TransportEntity[]> {
    const response = await this.apiClient.get(`/bus-routes/?route=${encodeURIComponent(route)}`);
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async findActive(): Promise<TransportEntity[]> {
    const response = await this.apiClient.get('/bus-routes/');
    const allRoutes = (response.data as any[]).map((item: any) => this.mapToEntity(item));
    return allRoutes.filter(route => route.isActive);
  }

  async save(transportEntity: TransportEntity): Promise<TransportEntity> {
    const response = await this.apiClient.post('/bus-routes/', this.mapToApiRequest(transportEntity));
    return this.mapToEntity(response.data as any);
  }

  async update(transportEntity: TransportEntity): Promise<TransportEntity> {
    const response = await this.apiClient.put(`/bus-routes/${transportEntity.id.getValue()}/`, this.mapToApiRequest(transportEntity));
    return this.mapToEntity(response.data as any);
  }

  async delete(id: TransportId): Promise<void> {
    await this.apiClient.delete(`/bus-routes/${id.getValue()}/`);
  }

  async exists(id: TransportId): Promise<boolean> {
    try {
      await this.apiClient.get(`/bus-routes/${id.getValue()}/`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async count(): Promise<number> {
    const response = await this.apiClient.get('/bus-routes/');
    return (response.data as any[]).length;
  }

  async searchTransports(query: string): Promise<TransportEntity[]> {
    const response = await this.apiClient.get('/bus-routes/');
    const allRoutes = (response.data as any[]).map((item: any) => this.mapToEntity(item));
    return allRoutes.filter(route => 
      route.routeName.toLowerCase().includes(query.toLowerCase()) ||
      route.vehicleNumber.toLowerCase().includes(query.toLowerCase()) ||
      route.routeNo.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Distance Slab methods
  async getDistanceSlabs(): Promise<any[]> {
    const response = await this.apiClient.get('/transport-fee-structures/');
    return response.data as any[];
  }

  async createDistanceSlab(payload: any): Promise<any> {
    const response = await this.apiClient.post('/transport-fee-structures/', payload);
    return response.data;
  }

  async updateDistanceSlab(id: number, payload: any): Promise<any> {
    const response = await this.apiClient.put(`/transport-fee-structures/${id}/`, payload);
    return response.data;
  }

  async findActiveTransports(): Promise<TransportEntity[]> {
    const response = await this.apiClient.get('/bus-routes/');
    const allRoutes = (response.data as any[]).map((item: any) => this.mapToEntity(item));
    return allRoutes.filter(route => route.isActive);
  }

  async findByVehicleNumber(vehicleNumber: string): Promise<TransportEntity | null> {
    try {
      const response = await this.apiClient.get('/bus-routes/');
      const allRoutes = (response.data as any[]).map((item: any) => this.mapToEntity(item));
      return allRoutes.find(route => route.vehicleNumber === vehicleNumber) || null;
    } catch (error) {
      return null;
    }
  }

  async findByDriverName(driverName: string): Promise<TransportEntity[]> {
    // Use the existing get all endpoint and filter on frontend since backend doesn't have driver endpoint
    const response = await this.apiClient.get('/bus-routes/');
    const allRoutes = (response.data as any[]).map((item: any) => this.mapToEntity(item));
    return allRoutes.filter(route => 
      route.driverEmployeeId && route.driverEmployeeId.toString().includes(driverName)
    );
  }

  async countByBranch(branchId: number): Promise<number> {
    // Use the existing get all endpoint and filter on frontend since backend doesn't have branch count endpoint
    const response = await this.apiClient.get('/bus-routes/');
    const allRoutes = (response.data as any[]).map((item: any) => this.mapToEntity(item));
    return allRoutes.length; // Since we don't have branch filtering in the backend, return total count
  }

  private mapToEntity(apiData: any): TransportEntity {
    return new TransportEntity(
      new TransportId(apiData.bus_route_id),
      apiData.vehicle_number || '',
      apiData.vehicle_capacity || 0,
      apiData.registration_number || '',
      apiData.driver_employee_id || 0,
      apiData.route_no || '',
      apiData.route_name || '',
      apiData.start_location || '',
      apiData.end_location || '',
      apiData.total_distance || 0,
      apiData.estimated_duration || 0,
      apiData.is_active !== false,
      new Date(apiData.created_at),
      new Date(apiData.updated_at || apiData.created_at)
    );
  }

  private mapToApiRequest(transportEntity: TransportEntity): any {
    return {
      vehicle_number: transportEntity.vehicleNumber,
      vehicle_capacity: transportEntity.vehicleCapacity,
      registration_number: transportEntity.registrationNumber,
      driver_employee_id: transportEntity.driverEmployeeId,
      route_no: transportEntity.routeNo,
      route_name: transportEntity.routeName,
      start_location: transportEntity.startLocation,
      end_location: transportEntity.endLocation,
      total_distance: transportEntity.totalDistance,
      estimated_duration: transportEntity.estimatedDuration,
      is_active: transportEntity.isActive,
    };
  }
}
