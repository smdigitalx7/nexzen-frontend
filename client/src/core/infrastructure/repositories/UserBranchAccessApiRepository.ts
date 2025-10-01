import { IUserBranchAccessRepository } from '../../domain/repositories/UserBranchAccessRepository';
import { UserBranchAccessEntity } from '../../domain/entities/UserBranchAccess';
import { UserBranchAccessId } from '../../domain/value-objects/UserBranchAccessId';
import { ApiClient } from '../api/ApiClient';

export class UserBranchAccessApiRepository implements IUserBranchAccessRepository {
  constructor(private apiClient: ApiClient) {}

  async findById(id: UserBranchAccessId): Promise<UserBranchAccessEntity | null> {
    try {
      const response = await this.apiClient.get(`/user-branch-accesses/${id.getValue()}`);
      return this.mapToEntity(response.data as any);
    } catch (error) {
      return null;
    }
  }

  async findAll(): Promise<UserBranchAccessEntity[]> {
    const response = await this.apiClient.get('/user-branch-accesses');
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async findByUserId(userId: number): Promise<UserBranchAccessEntity[]> {
    const response = await this.apiClient.get(`/user-branch-accesses?user_id=${userId}`);
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async findByBranchId(branchId: number): Promise<UserBranchAccessEntity[]> {
    const response = await this.apiClient.get(`/user-branch-accesses?branch_id=${branchId}`);
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async findByUserAndBranch(userId: number, branchId: number): Promise<UserBranchAccessEntity | null> {
    try {
      const response = await this.apiClient.get(`/user-branch-accesses?user_id=${userId}&branch_id=${branchId}`);
      const accesses = response.data as any[];
      return accesses.length > 0 ? this.mapToEntity(accesses[0]) : null;
    } catch (error) {
      return null;
    }
  }

  async save(accessEntity: UserBranchAccessEntity): Promise<UserBranchAccessEntity> {
    const response = await this.apiClient.post('/user-branch-accesses', this.mapToApiRequest(accessEntity));
    return this.mapToEntity(response.data as any);
  }

  async update(accessEntity: UserBranchAccessEntity): Promise<UserBranchAccessEntity> {
    const response = await this.apiClient.put(`/user-branch-accesses/${accessEntity.id.getValue()}`, this.mapToApiRequest(accessEntity));
    return this.mapToEntity(response.data as any);
  }

  async delete(id: UserBranchAccessId): Promise<void> {
    await this.apiClient.delete(`/user-branch-accesses/${id.getValue()}`);
  }

  async exists(id: UserBranchAccessId): Promise<boolean> {
    try {
      await this.apiClient.get(`/user-branch-accesses/${id.getValue()}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async count(): Promise<number> {
    const response = await this.apiClient.get('/user-branch-accesses/count');
    return (response.data as any).count;
  }

  async hasAccess(userId: number, branchId: number): Promise<boolean> {
    try {
      const response = await this.apiClient.get(`/user-branch-accesses/check?user_id=${userId}&branch_id=${branchId}`);
      return (response.data as any).hasAccess || false;
    } catch (error) {
      return false;
    }
  }

  async countByUserId(userId: number): Promise<number> {
    const response = await this.apiClient.get(`/user-branch-access/user/${userId}/count`);
    return (response.data as any).count;
  }

  async countByBranchId(branchId: number): Promise<number> {
    const response = await this.apiClient.get(`/user-branch-access/branch/${branchId}/count`);
    return (response.data as any).count;
  }

  private mapToEntity(apiData: any): UserBranchAccessEntity {
    return new UserBranchAccessEntity(
      new UserBranchAccessId(apiData.access_id || apiData.id),
      apiData.user_id || apiData.userId,
      apiData.branch_id || apiData.branchId,
      apiData.role_id || apiData.roleId || 1,
      apiData.is_default || false,
      apiData.is_active !== false,
      new Date(apiData.created_at || apiData.createdAt),
      new Date(apiData.updated_at || apiData.updatedAt)
    );
  }

  private mapToApiRequest(accessEntity: UserBranchAccessEntity): any {
    return {
      user_id: accessEntity.userId,
      branch_id: accessEntity.branchId,
      is_active: accessEntity.isActive,
    };
  }
}
