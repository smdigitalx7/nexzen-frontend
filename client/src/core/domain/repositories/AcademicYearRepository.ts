import { AcademicYearEntity, AcademicYearStatus } from '../entities/AcademicYear';
import { AcademicYearId } from '../value-objects/AcademicYearId';

export interface AcademicYearRepository {
  findById(id: AcademicYearId): Promise<AcademicYearEntity | null>;
  findAll(): Promise<AcademicYearEntity[]>;
  findByBranchId(branchId: number): Promise<AcademicYearEntity[]>;
  findByStatus(status: AcademicYearStatus): Promise<AcademicYearEntity[]>;
  findCurrent(): Promise<AcademicYearEntity | null>;
  findByDateRange(startDate: Date, endDate: Date): Promise<AcademicYearEntity[]>;
  findByYearName(yearName: string): Promise<AcademicYearEntity | null>;
  save(academicYearEntity: AcademicYearEntity): Promise<AcademicYearEntity>;
  update(academicYearEntity: AcademicYearEntity): Promise<AcademicYearEntity>;
  delete(id: AcademicYearId): Promise<void>;
  exists(id: AcademicYearId): Promise<boolean>;
  count(): Promise<number>;
  countByBranch(branchId: number): Promise<number>;
  countByStatus(status: AcademicYearStatus): Promise<number>;
  searchAcademicYears(query: string): Promise<AcademicYearEntity[]>;
}
