import { SubjectEntity } from '../entities/Subject';
import { SubjectId } from '../value-objects/SubjectId';

export interface SubjectRepository {
  findById(id: SubjectId): Promise<SubjectEntity | null>;
  findAll(): Promise<SubjectEntity[]>;
  findByBranchId(branchId: number): Promise<SubjectEntity[]>;
  findActiveSubjects(): Promise<SubjectEntity[]>;
  findByCode(code: string): Promise<SubjectEntity | null>;
  save(subjectEntity: SubjectEntity): Promise<SubjectEntity>;
  update(subjectEntity: SubjectEntity): Promise<SubjectEntity>;
  delete(id: SubjectId): Promise<void>;
  exists(id: SubjectId): Promise<boolean>;
  count(): Promise<number>;
  countByBranch(branchId: number): Promise<number>;
  searchSubjects(query: string): Promise<SubjectEntity[]>;
}
