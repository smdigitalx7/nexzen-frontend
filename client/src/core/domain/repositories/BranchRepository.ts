import { BranchEntity } from '../entities/Branch';
import { BranchId } from '../value-objects/BranchId';

export interface BranchRepository {
  findById(id: BranchId): Promise<BranchEntity | null>;
  findAll(): Promise<BranchEntity[]>;
  findActiveBranches(): Promise<BranchEntity[]>;
  findByType(branchType: string): Promise<BranchEntity[]>;
  findByCode(code: string): Promise<BranchEntity | null>;
  save(branchEntity: BranchEntity): Promise<BranchEntity>;
  update(branchEntity: BranchEntity): Promise<BranchEntity>;
  delete(id: BranchId): Promise<void>;
  exists(id: BranchId): Promise<boolean>;
  count(): Promise<number>;
  countByType(branchType: string): Promise<number>;
  searchBranches(query: string): Promise<BranchEntity[]>;
}