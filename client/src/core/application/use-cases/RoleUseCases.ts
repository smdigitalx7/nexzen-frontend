import { RoleRepository } from '../../domain/repositories/RoleRepository';
import { RoleEntity } from '../../domain/entities/Role';
import { RoleId } from '../../domain/value-objects/RoleId';
import { CreateRoleRequest, UpdateRoleRequest, RoleResponse } from '../dto/RoleDto';

export class RoleUseCases {
  constructor(private roleRepository: RoleRepository) {}

  async getAllRoles(): Promise<RoleResponse[]> {
    const roles = await this.roleRepository.findAll();
    return roles.map(this.mapToResponse);
  }

  async getRoleById(id: number): Promise<RoleResponse | null> {
    const roleEntity = await this.roleRepository.findById(new RoleId(id));
    return roleEntity ? this.mapToResponse(roleEntity) : null;
  }

  async getActiveRoles(): Promise<RoleResponse[]> {
    const roles = await this.roleRepository.findActiveRoles();
    return roles.map(this.mapToResponse);
  }

  async createRole(request: CreateRoleRequest): Promise<RoleResponse> {
    const roleEntity = new RoleEntity(
      new RoleId(0), // Will be set by repository
      request.name,
      request.description || null,
      request.permissions,
      true,
      new Date(),
      new Date()
    );

    const savedRole = await this.roleRepository.save(roleEntity);
    return this.mapToResponse(savedRole);
  }

  async updateRole(request: UpdateRoleRequest): Promise<RoleResponse> {
    const existingRole = await this.roleRepository.findById(new RoleId(request.id));
    if (!existingRole) {
      throw new Error('Role not found');
    }

    let updatedRole = existingRole;

    if (request.name !== undefined) {
      updatedRole = updatedRole.updateName(request.name);
    }

    if (request.description !== undefined) {
      updatedRole = updatedRole.updateDescription(request.description);
    }

    if (request.permissions !== undefined) {
      updatedRole = updatedRole.updatePermissions(request.permissions);
    }

    if (request.isActive !== undefined) {
      updatedRole = request.isActive ? updatedRole.activate() : updatedRole.deactivate();
    }

    const savedRole = await this.roleRepository.update(updatedRole);
    return this.mapToResponse(savedRole);
  }

  async deleteRole(id: number): Promise<void> {
    await this.roleRepository.delete(new RoleId(id));
  }

  async searchRoles(query: string): Promise<RoleResponse[]> {
    const roles = await this.roleRepository.searchRoles(query);
    return roles.map(this.mapToResponse);
  }

  private mapToResponse(roleEntity: RoleEntity): RoleResponse {
    return {
      id: roleEntity.id.getValue(),
      name: roleEntity.name,
      description: roleEntity.description,
      permissions: roleEntity.permissions,
      isActive: roleEntity.isActive,
      createdAt: roleEntity.createdAt.toISOString(),
      updatedAt: roleEntity.updatedAt.toISOString(),
    };
  }
}
