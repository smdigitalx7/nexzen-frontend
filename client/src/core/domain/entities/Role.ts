import { RoleId } from '../value-objects/RoleId';

export class RoleEntity {
  constructor(
    public readonly id: RoleId,
    public readonly name: string,
    public readonly description: string | null,
    public readonly permissions: string[],
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  public updateName(name: string): RoleEntity {
    return new RoleEntity(
      this.id,
      name,
      this.description,
      this.permissions,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  public updateDescription(description: string | null): RoleEntity {
    return new RoleEntity(
      this.id,
      this.name,
      description,
      this.permissions,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  public updatePermissions(permissions: string[]): RoleEntity {
    return new RoleEntity(
      this.id,
      this.name,
      this.description,
      permissions,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  public activate(): RoleEntity {
    return new RoleEntity(
      this.id,
      this.name,
      this.description,
      this.permissions,
      true,
      this.createdAt,
      new Date()
    );
  }

  public deactivate(): RoleEntity {
    return new RoleEntity(
      this.id,
      this.name,
      this.description,
      this.permissions,
      false,
      this.createdAt,
      new Date()
    );
  }
}
