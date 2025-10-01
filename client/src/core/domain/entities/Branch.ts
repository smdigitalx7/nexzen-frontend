import { BranchId } from '../value-objects/BranchId';

export class BranchEntity {
  constructor(
    public readonly id: BranchId,
    public readonly name: string,
    public readonly code: string,
    public readonly address: string | null,
    public readonly phone: string | null,
    public readonly email: string | null,
    public readonly branchType: string,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  public updateName(name: string): BranchEntity {
    return new BranchEntity(
      this.id,
      name,
      this.code,
      this.address,
      this.phone,
      this.email,
      this.branchType,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  public updateCode(code: string): BranchEntity {
    return new BranchEntity(
      this.id,
      this.name,
      code,
      this.address,
      this.phone,
      this.email,
      this.branchType,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  public updateAddress(address: string | null): BranchEntity {
    return new BranchEntity(
      this.id,
      this.name,
      this.code,
      address,
      this.phone,
      this.email,
      this.branchType,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  public updateContactInfo(phone: string | null, email: string | null): BranchEntity {
    return new BranchEntity(
      this.id,
      this.name,
      this.code,
      this.address,
      phone,
      email,
      this.branchType,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  public activate(): BranchEntity {
    return new BranchEntity(
      this.id,
      this.name,
      this.code,
      this.address,
      this.phone,
      this.email,
      this.branchType,
      true,
      this.createdAt,
      new Date()
    );
  }

  public deactivate(): BranchEntity {
    return new BranchEntity(
      this.id,
      this.name,
      this.code,
      this.address,
      this.phone,
      this.email,
      this.branchType,
      false,
      this.createdAt,
      new Date()
    );
  }
}