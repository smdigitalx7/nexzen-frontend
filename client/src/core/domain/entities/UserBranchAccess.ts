import { UserBranchAccessId } from '../value-objects/UserBranchAccessId';

export class UserBranchAccessEntity {
  constructor(
    public readonly id: UserBranchAccessId,
    public readonly userId: number,
    public readonly branchId: number,
    public readonly roleId: number,
    public readonly isDefault: boolean,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  public static create(
    userId: number,
    branchId: number,
    roleId: number,
    isDefault: boolean = false,
    isActive: boolean = true
  ): UserBranchAccessEntity {
    const now = new Date();
    return new UserBranchAccessEntity(
      new UserBranchAccessId(0), // Will be set by repository
      userId,
      branchId,
      roleId,
      isDefault,
      isActive,
      now,
      now
    );
  }

  public update(
    roleId?: number,
    isDefault?: boolean,
    isActive?: boolean
  ): UserBranchAccessEntity {
    return new UserBranchAccessEntity(
      this.id,
      this.userId,
      this.branchId,
      roleId ?? this.roleId,
      isDefault ?? this.isDefault,
      isActive ?? this.isActive,
      this.createdAt,
      new Date()
    );
  }

  public revoke(): UserBranchAccessEntity {
    return this.update(undefined, undefined, false);
  }

  public activate(): UserBranchAccessEntity {
    return this.update(undefined, undefined, true);
  }

  public setAsDefault(): UserBranchAccessEntity {
    return this.update(undefined, true, undefined);
  }

  public removeDefault(): UserBranchAccessEntity {
    return this.update(undefined, false, undefined);
  }
}
