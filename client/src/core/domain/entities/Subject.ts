import { SubjectId } from '../value-objects/SubjectId';

export class SubjectEntity {
  constructor(
    public readonly id: SubjectId,
    public readonly name: string,
    public readonly code: string,
    public readonly description: string | null,
    public readonly branchId: number,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  public updateName(name: string): SubjectEntity {
    return new SubjectEntity(
      this.id,
      name,
      this.code,
      this.description,
      this.branchId,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  public updateCode(code: string): SubjectEntity {
    return new SubjectEntity(
      this.id,
      this.name,
      code,
      this.description,
      this.branchId,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  public updateDescription(description: string | null): SubjectEntity {
    return new SubjectEntity(
      this.id,
      this.name,
      this.code,
      description,
      this.branchId,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }

  public activate(): SubjectEntity {
    return new SubjectEntity(
      this.id,
      this.name,
      this.code,
      this.description,
      this.branchId,
      true,
      this.createdAt,
      new Date()
    );
  }

  public deactivate(): SubjectEntity {
    return new SubjectEntity(
      this.id,
      this.name,
      this.code,
      this.description,
      this.branchId,
      false,
      this.createdAt,
      new Date()
    );
  }
}
