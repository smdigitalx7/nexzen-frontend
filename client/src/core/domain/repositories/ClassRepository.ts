import { ClassEntity } from '../entities/Class';
import { ClassId } from '../value-objects/ClassId';

export interface ClassRepository {
  findById(id: ClassId): Promise<ClassEntity | null>;
  findAll(): Promise<ClassEntity[]>;
  findByBranchId(branchId: number): Promise<ClassEntity[]>;
  findActiveClasses(): Promise<ClassEntity[]>;
  save(classEntity: ClassEntity): Promise<ClassEntity>;
  update(classEntity: ClassEntity): Promise<ClassEntity>;
  delete(id: ClassId): Promise<void>;
  exists(id: ClassId): Promise<boolean>;
  count(): Promise<number>;
  countByBranch(branchId: number): Promise<number>;
  searchClasses(query: string): Promise<ClassEntity[]>;
}
