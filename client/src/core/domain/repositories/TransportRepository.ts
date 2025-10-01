import { TransportEntity } from '../entities/Transport';
import { TransportId } from '../value-objects/TransportId';

export interface TransportRepository {
  findById(id: TransportId): Promise<TransportEntity | null>;
  findAll(): Promise<TransportEntity[]>;
  findActiveTransports(): Promise<TransportEntity[]>;
  findByBranchId(branchId: number): Promise<TransportEntity[]>;
  findByVehicleNumber(vehicleNumber: string): Promise<TransportEntity | null>;
  findByDriverName(driverName: string): Promise<TransportEntity[]>;
  save(transportEntity: TransportEntity): Promise<TransportEntity>;
  update(transportEntity: TransportEntity): Promise<TransportEntity>;
  delete(id: TransportId): Promise<void>;
  exists(id: TransportId): Promise<boolean>;
  count(): Promise<number>;
  countByBranch(branchId: number): Promise<number>;
  searchTransports(query: string): Promise<TransportEntity[]>;
}
