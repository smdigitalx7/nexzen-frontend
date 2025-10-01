import { BranchRepository } from '../../domain/repositories/BranchRepository';
import { BranchEntity } from '../../domain/entities/Branch';
import { BranchId } from '../../domain/value-objects/BranchId';
import { ApiClient } from '../api/ApiClient';

export class BranchApiRepository implements BranchRepository {
  constructor(private apiClient: ApiClient) {}

  async findById(id: BranchId): Promise<BranchEntity | null> {
    try {
      const response = await this.apiClient.get(`/branches/${id.getValue()}`);
      return this.mapToEntity(response.data as any);
    } catch (error) {
      return null;
    }
  }

  async findAll(): Promise<BranchEntity[]> {
    const response = await this.apiClient.get('/branches/');
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async findActiveBranches(): Promise<BranchEntity[]> {
    const response = await this.apiClient.get('/branches/?active=true');
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async findByType(branchType: string): Promise<BranchEntity[]> {
    const response = await this.apiClient.get(`/branches/?type=${branchType}`);
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async findByCode(code: string): Promise<BranchEntity | null> {
    try {
      const response = await this.apiClient.get(`/branches/?code=${code}`);
      const branches = response.data as any[];
      return branches.length > 0 ? this.mapToEntity(branches[0]) : null;
    } catch (error) {
      return null;
    }
  }

  async save(branchEntity: BranchEntity): Promise<BranchEntity> {
    const response = await this.apiClient.post('/branches/', this.mapToApiRequest(branchEntity));
    return this.mapToEntity(response.data as any);
  }

  async update(branchEntity: BranchEntity): Promise<BranchEntity> {
    const response = await this.apiClient.put(`/branches/${branchEntity.id.getValue()}`, this.mapToApiRequest(branchEntity));
    return this.mapToEntity(response.data as any);
  }

  async delete(id: BranchId): Promise<void> {
    await this.apiClient.delete(`/branches/${id.getValue()}`);
  }

  async exists(id: BranchId): Promise<boolean> {
    try {
      await this.apiClient.get(`/branches/${id.getValue()}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async count(): Promise<number> {
    const response = await this.apiClient.get('/branches/count');
    return (response.data as any).count;
  }

  async countByType(branchType: string): Promise<number> {
    const response = await this.apiClient.get(`/branches/count?type=${branchType}`);
    return (response.data as any).count;
  }

  async searchBranches(query: string): Promise<BranchEntity[]> {
    const response = await this.apiClient.get(`/branches/search?q=${encodeURIComponent(query)}`);
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  private mapToEntity(apiData: any): BranchEntity {
    return new BranchEntity(
      new BranchId(apiData.branch_id || apiData.id),
      apiData.branch_name || apiData.name,
      apiData.branch_code || apiData.code,
      apiData.address || null,
      apiData.phone || null,
      apiData.email || null,
      apiData.branch_type || apiData.branchType,
      apiData.is_active !== false,
      new Date(apiData.created_at || apiData.createdAt),
      new Date(apiData.updated_at || apiData.updatedAt)
    );
  }

  private mapToApiRequest(branchEntity: BranchEntity): any {
    return {
      branch_name: branchEntity.name,
      branch_code: branchEntity.code,
      address: branchEntity.address,
      phone: branchEntity.phone,
      email: branchEntity.email,
      branch_type: branchEntity.branchType,
      is_active: branchEntity.isActive,
    };
  }
}
