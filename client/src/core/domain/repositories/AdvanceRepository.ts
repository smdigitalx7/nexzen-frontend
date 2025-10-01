import { AdvanceEntity, AdvanceStatus } from '../entities/Advance';
import { AdvanceId } from '../value-objects/AdvanceId';

export interface IAdvanceRepository {
  findById(id: AdvanceId): Promise<AdvanceEntity | null>;
  findAll(): Promise<AdvanceEntity[]>;
  findByEmployeeId(employeeId: number): Promise<AdvanceEntity[]>;
  findByBranchId(branchId: number): Promise<AdvanceEntity[]>;
  findByStatus(status: AdvanceStatus): Promise<AdvanceEntity[]>;
  findByEmployeeAndStatus(employeeId: number, status: AdvanceStatus): Promise<AdvanceEntity[]>;
  save(advance: AdvanceEntity): Promise<AdvanceEntity>;
  update(advance: AdvanceEntity): Promise<AdvanceEntity>;
  delete(id: AdvanceId): Promise<void>;
  exists(id: AdvanceId): Promise<boolean>;
  count(): Promise<number>;
  countByEmployeeId(employeeId: number): Promise<number>;
  countByBranchId(branchId: number): Promise<number>;
  countByStatus(status: AdvanceStatus): Promise<number>;
}
