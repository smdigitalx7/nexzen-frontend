import { UserBranchAccessEntity } from '../entities/UserBranchAccess';
import { UserBranchAccessId } from '../value-objects/UserBranchAccessId';

export interface IUserBranchAccessRepository {
  findById(id: UserBranchAccessId): Promise<UserBranchAccessEntity | null>;
  findAll(): Promise<UserBranchAccessEntity[]>;
  findByUserId(userId: number): Promise<UserBranchAccessEntity[]>;
  findByBranchId(branchId: number): Promise<UserBranchAccessEntity[]>;
  findByUserAndBranch(userId: number, branchId: number): Promise<UserBranchAccessEntity | null>;
  save(userBranchAccess: UserBranchAccessEntity): Promise<UserBranchAccessEntity>;
  update(userBranchAccess: UserBranchAccessEntity): Promise<UserBranchAccessEntity>;
  delete(id: UserBranchAccessId): Promise<void>;
  exists(id: UserBranchAccessId): Promise<boolean>;
  count(): Promise<number>;
  countByUserId(userId: number): Promise<number>;
  countByBranchId(branchId: number): Promise<number>;
}
