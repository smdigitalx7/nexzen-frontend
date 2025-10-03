import { TransportRepository } from '../../domain/repositories/TransportRepository';
import { TransportEntity } from '../../domain/entities/Transport';
import { TransportId } from '../../domain/value-objects/TransportId';
import { CreateTransportRequest, UpdateTransportRequest, TransportResponse } from '../dto/TransportDto';

export class TransportUseCases {
  constructor(private transportRepository: TransportRepository) {}

  async getAllTransports(): Promise<TransportResponse[]> {
    const transports = await this.transportRepository.findAll();
    return transports.map(this.mapToResponse);
  }

  async getTransportById(id: number): Promise<TransportResponse | null> {
    const transportEntity = await this.transportRepository.findById(new TransportId(id));
    return transportEntity ? this.mapToResponse(transportEntity) : null;
  }

  async getActiveTransports(): Promise<TransportResponse[]> {
    const transports = await this.transportRepository.findActiveTransports();
    return transports.map(this.mapToResponse);
  }

  async getTransportsByBranch(branchId: number): Promise<TransportResponse[]> {
    const transports = await this.transportRepository.findByBranchId(branchId);
    return transports.map(this.mapToResponse);
  }

  async createTransport(request: CreateTransportRequest): Promise<TransportResponse> {
    const transportEntity = new TransportEntity(
      new TransportId(0), // Will be set by repository
      request.vehicleNumber,
      request.vehicleCapacity,
      request.registrationNumber || '',
      request.driverEmployeeId || 0,
      request.routeNo || '',
      request.routeName || '',
      request.startLocation || '',
      request.endLocation || '',
      request.totalDistance || 0,
      request.estimatedDuration || 0,
      true,
      new Date(),
      new Date()
    );

    const savedTransport = await this.transportRepository.save(transportEntity);
    return this.mapToResponse(savedTransport);
  }

  async updateTransport(request: UpdateTransportRequest): Promise<TransportResponse> {
    const existingTransport = await this.transportRepository.findById(new TransportId(request.id));
    if (!existingTransport) {
      throw new Error('Transport not found');
    }

    let updatedTransport = existingTransport;

    if (request.vehicleNumber !== undefined || request.vehicleCapacity !== undefined || request.registrationNumber !== undefined) {
      updatedTransport = updatedTransport.updateVehicleInfo(
        request.vehicleNumber ?? updatedTransport.vehicleNumber,
        request.vehicleCapacity ?? updatedTransport.vehicleCapacity,
        request.registrationNumber ?? updatedTransport.registrationNumber
      );
    }

    if (request.driverEmployeeId !== undefined) {
      updatedTransport = updatedTransport.updateDriverInfo(request.driverEmployeeId);
    }

    if (request.routeNo !== undefined || request.routeName !== undefined || request.startLocation !== undefined || request.endLocation !== undefined || request.totalDistance !== undefined || request.estimatedDuration !== undefined) {
      updatedTransport = updatedTransport.updateRoute(
        request.routeNo ?? updatedTransport.routeNo,
        request.routeName ?? updatedTransport.routeName,
        request.startLocation ?? updatedTransport.startLocation,
        request.endLocation ?? updatedTransport.endLocation,
        request.totalDistance ?? updatedTransport.totalDistance,
        request.estimatedDuration ?? updatedTransport.estimatedDuration
      );
    }

    if (request.isActive !== undefined) {
      updatedTransport = request.isActive ? updatedTransport.activate() : updatedTransport.deactivate();
    }

    const savedTransport = await this.transportRepository.update(updatedTransport);
    return this.mapToResponse(savedTransport);
  }

  async deleteTransport(id: number): Promise<void> {
    await this.transportRepository.delete(new TransportId(id));
  }

  async searchTransports(query: string): Promise<TransportResponse[]> {
    const transports = await this.transportRepository.searchTransports(query);
    return transports.map(this.mapToResponse);
  }

  private mapToResponse(transportEntity: TransportEntity): TransportResponse {
    return {
      id: transportEntity.id.getValue(),
      vehicleNumber: transportEntity.vehicleNumber,
      vehicleCapacity: transportEntity.vehicleCapacity,
      registrationNumber: transportEntity.registrationNumber,
      driverEmployeeId: transportEntity.driverEmployeeId,
      routeNo: transportEntity.routeNo,
      routeName: transportEntity.routeName,
      startLocation: transportEntity.startLocation,
      endLocation: transportEntity.endLocation,
      totalDistance: transportEntity.totalDistance,
      estimatedDuration: transportEntity.estimatedDuration,
      isActive: transportEntity.isActive,
      createdAt: transportEntity.createdAt.toISOString(),
      updatedAt: transportEntity.updatedAt.toISOString(),
    };
  }
}
