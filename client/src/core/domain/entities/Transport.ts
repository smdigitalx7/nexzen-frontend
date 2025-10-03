import { TransportId } from '../value-objects/TransportId';

export class TransportEntity {
  constructor(
    public readonly id: TransportId,
    public readonly vehicleNumber: string,
    public readonly vehicleCapacity: number,
    public readonly registrationNumber: string,
    public readonly driverEmployeeId: number,
    public readonly routeNo: string,
    public readonly routeName: string,
    public readonly startLocation: string,
    public readonly endLocation: string,
    public readonly totalDistance: number,
    public readonly estimatedDuration: number,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  public updateVehicleInfo(vehicleNumber: string, vehicleCapacity: number, registrationNumber: string): TransportEntity {
    return new TransportEntity(
      this.id,
      vehicleNumber,
      vehicleCapacity,
      registrationNumber,
      this.driverEmployeeId,
      this.routeNo,
      this.routeName,
      this.startLocation,
      this.endLocation,
      this.totalDistance,
      this.estimatedDuration,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  public updateDriverInfo(driverEmployeeId: number): TransportEntity {
    return new TransportEntity(
      this.id,
      this.vehicleNumber,
      this.vehicleCapacity,
      this.registrationNumber,
      driverEmployeeId,
      this.routeNo,
      this.routeName,
      this.startLocation,
      this.endLocation,
      this.totalDistance,
      this.estimatedDuration,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  public updateRoute(routeNo: string, routeName: string, startLocation: string, endLocation: string, totalDistance: number, estimatedDuration: number): TransportEntity {
    return new TransportEntity(
      this.id,
      this.vehicleNumber,
      this.vehicleCapacity,
      this.registrationNumber,
      this.driverEmployeeId,
      routeNo,
      routeName,
      startLocation,
      endLocation,
      totalDistance,
      estimatedDuration,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  public activate(): TransportEntity {
    return new TransportEntity(
      this.id,
      this.vehicleNumber,
      this.vehicleCapacity,
      this.registrationNumber,
      this.driverEmployeeId,
      this.routeNo,
      this.routeName,
      this.startLocation,
      this.endLocation,
      this.totalDistance,
      this.estimatedDuration,
      true,
      this.createdAt,
      new Date()
    );
  }

  public deactivate(): TransportEntity {
    return new TransportEntity(
      this.id,
      this.vehicleNumber,
      this.vehicleCapacity,
      this.registrationNumber,
      this.driverEmployeeId,
      this.routeNo,
      this.routeName,
      this.startLocation,
      this.endLocation,
      this.totalDistance,
      this.estimatedDuration,
      false,
      this.createdAt,
      new Date()
    );
  }
}
