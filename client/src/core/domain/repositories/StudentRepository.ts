import { StudentEntity, StudentId, StudentStatus } from '../entities/Student';

export interface StudentRepository {
  findById(id: StudentId): Promise<StudentEntity | null>;
  findAll(): Promise<StudentEntity[]>;
  findByStatus(status: StudentStatus): Promise<StudentEntity[]>;
  findByClass(classId: number): Promise<StudentEntity[]>;
  findBySection(sectionId: number): Promise<StudentEntity[]>;
  findByClassAndSection(classId: number, sectionId: number): Promise<StudentEntity[]>;
  findActiveStudents(): Promise<StudentEntity[]>;
  save(student: StudentEntity): Promise<StudentEntity>;
  update(student: StudentEntity): Promise<StudentEntity>;
  delete(id: StudentId): Promise<void>;
  exists(id: StudentId): Promise<boolean>;
  count(): Promise<number>;
  countByStatus(status: StudentStatus): Promise<number>;
  countByClass(classId: number): Promise<number>;
  countBySection(sectionId: number): Promise<number>;
}
