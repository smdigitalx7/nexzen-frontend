import { RoleEntity } from '../entities/Role';
import { RoleId } from '../value-objects/RoleId';

export interface RoleRepository {
  findById(id: RoleId): Promise<RoleEntity | null>;
  findAll(): Promise<RoleEntity[]>;
  findActiveRoles(): Promise<RoleEntity[]>;
  findByName(name: string): Promise<RoleEntity | null>;
  save(roleEntity: RoleEntity): Promise<RoleEntity>;
  update(roleEntity: RoleEntity): Promise<RoleEntity>;
  delete(id: RoleId): Promise<void>;
  exists(id: RoleId): Promise<boolean>;
  count(): Promise<number>;
  searchRoles(query: string): Promise<RoleEntity[]>;
}
