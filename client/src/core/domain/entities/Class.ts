import { ClassId } from '../value-objects/ClassId';

export class ClassEntity {
  constructor(
    public readonly id: ClassId,
    public readonly name: string,
    public readonly description: string | null,
    public readonly branchId: number,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  public updateName(name: string): ClassEntity {
    return new ClassEntity(
      this.id,
      name,
      this.description,
      this.branchId,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  public updateDescription(description: string | null): ClassEntity {
    return new ClassEntity(
      this.id,
      this.name,
      description,
      this.branchId,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  public activate(): ClassEntity {
    return new ClassEntity(
      this.id,
      this.name,
      this.description,
      this.branchId,
      true,
      this.createdAt,
      new Date()
    );
  }

  public deactivate(): ClassEntity {
    return new ClassEntity(
      this.id,
      this.name,
      this.description,
      this.branchId,
      false,
      this.createdAt,
      new Date()
    );
  }
}
