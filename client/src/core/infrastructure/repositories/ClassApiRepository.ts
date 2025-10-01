import { ClassRepository } from '../../domain/repositories/ClassRepository';
import { ClassEntity } from '../../domain/entities/Class';
import { ClassId } from '../../domain/value-objects/ClassId';
import { ApiClient } from '../api/ApiClient';

export class ClassApiRepository implements ClassRepository {
  constructor(private apiClient: ApiClient) {}

  async findById(id: ClassId): Promise<ClassEntity | null> {
    try {
      const response = await this.apiClient.get(`/school/classes/${id.getValue()}`);
      return this.mapToEntity(response.data as any);
    } catch (error) {
      return null;
    }
  }

  async findAll(): Promise<ClassEntity[]> {
    const response = await this.apiClient.get('/school/classes/');
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async findByBranchId(branchId: number): Promise<ClassEntity[]> {
    const response = await this.apiClient.get(`/school/classes?branch_id=${branchId}`);
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async findByAcademicYear(academicYearId: number): Promise<ClassEntity[]> {
    const response = await this.apiClient.get(`/school/classes?academic_year_id=${academicYearId}`);
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async findWithSubjects(): Promise<ClassEntity[]> {
    const response = await this.apiClient.get('/school/classes/with-subjects');
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async save(classEntity: ClassEntity): Promise<ClassEntity> {
    const response = await this.apiClient.post('/school/classes/', this.mapToApiRequest(classEntity));
    return this.mapToEntity(response.data as any);
  }

  async update(classEntity: ClassEntity): Promise<ClassEntity> {
    const response = await this.apiClient.put(`/school/classes/${classEntity.id.getValue()}`, this.mapToApiRequest(classEntity));
    return this.mapToEntity(response.data as any);
  }

  async delete(id: ClassId): Promise<void> {
    await this.apiClient.delete(`/school/classes/${id.getValue()}`);
  }

  async exists(id: ClassId): Promise<boolean> {
    try {
      await this.apiClient.get(`/school/classes/${id.getValue()}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async count(): Promise<number> {
    const response = await this.apiClient.get('/school/classes/count');
    return (response.data as any).count;
  }

  async searchClasses(query: string): Promise<ClassEntity[]> {
    const response = await this.apiClient.get(`/school/classes/search?q=${encodeURIComponent(query)}`);
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  private safeParseDate(value: any): Date {
    if (!value) return new Date();
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  }

  private mapToEntity(apiData: any): ClassEntity {
    return new ClassEntity(
      new ClassId(apiData.class_id || apiData.id),
      apiData.class_name || apiData.className,
      apiData.description || null,
      apiData.branch_id || apiData.branchId || 1,
      apiData.is_active !== false,
      this.safeParseDate(apiData.created_at || apiData.createdAt),
      this.safeParseDate(apiData.updated_at || apiData.updatedAt)
    );
  }

  async findActiveClasses(): Promise<ClassEntity[]> {
    const response = await this.apiClient.get('/school/classes/active');
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async countByBranch(branchId: number): Promise<number> {
    const response = await this.apiClient.get(`/school/classes/branch/${branchId}/count`);
    return (response.data as any).count;
  }

  private mapToApiRequest(classEntity: ClassEntity): any {
    return {
      class_name: classEntity.name,
      description: classEntity.description,
      branch_id: classEntity.branchId,
      is_active: classEntity.isActive,
    };
  }
}
