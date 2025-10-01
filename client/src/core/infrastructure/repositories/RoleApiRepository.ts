import { RoleRepository } from '../../domain/repositories/RoleRepository';
import { RoleEntity } from '../../domain/entities/Role';
import { RoleId } from '../../domain/value-objects/RoleId';
import { ApiClient } from '../api/ApiClient';

export class RoleApiRepository implements RoleRepository {
  constructor(private apiClient: ApiClient) {}

  async findById(id: RoleId): Promise<RoleEntity | null> {
    try {
      const response = await this.apiClient.get(`/roles/${id.getValue()}`);
      return this.mapToEntity(response.data as any);
    } catch (error) {
      return null;
    }
  }

  async findAll(): Promise<RoleEntity[]> {
    const response = await this.apiClient.get('/roles');
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async findByName(name: string): Promise<RoleEntity | null> {
    try {
      const response = await this.apiClient.get(`/roles?name=${encodeURIComponent(name)}`);
      const roles = response.data as any[];
      return roles.length > 0 ? this.mapToEntity(roles[0]) : null;
    } catch (error) {
      return null;
    }
  }

  async save(roleEntity: RoleEntity): Promise<RoleEntity> {
    const response = await this.apiClient.post('/roles', this.mapToApiRequest(roleEntity));
    return this.mapToEntity(response.data as any);
  }

  async update(roleEntity: RoleEntity): Promise<RoleEntity> {
    const response = await this.apiClient.put(`/roles/${roleEntity.id.getValue()}`, this.mapToApiRequest(roleEntity));
    return this.mapToEntity(response.data as any);
  }

  async delete(id: RoleId): Promise<void> {
    await this.apiClient.delete(`/roles/${id.getValue()}`);
  }

  async exists(id: RoleId): Promise<boolean> {
    try {
      await this.apiClient.get(`/roles/${id.getValue()}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async count(): Promise<number> {
    const response = await this.apiClient.get('/roles/count');
    return (response.data as any).count;
  }

  async findActiveRoles(): Promise<RoleEntity[]> {
    const response = await this.apiClient.get('/roles?active=true');
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async searchRoles(query: string): Promise<RoleEntity[]> {
    const response = await this.apiClient.get(`/roles/search?q=${encodeURIComponent(query)}`);
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  private mapToEntity(apiData: any): RoleEntity {
    return new RoleEntity(
      new RoleId(apiData.role_id || apiData.id),
      apiData.role_name || apiData.name,
      apiData.description || null,
      apiData.permissions || [],
      apiData.is_active !== false,
      new Date(apiData.created_at || apiData.createdAt),
      new Date(apiData.updated_at || apiData.updatedAt)
    );
  }

  private mapToApiRequest(roleEntity: RoleEntity): any {
    return {
      role_name: roleEntity.name,
      description: roleEntity.description,
      is_active: roleEntity.isActive,
    };
  }
}
