import { SubjectRepository } from '../../domain/repositories/SubjectRepository';
import { SubjectEntity } from '../../domain/entities/Subject';
import { SubjectId } from '../../domain/value-objects/SubjectId';
import { ApiClient } from '../api/ApiClient';

export class SubjectApiRepository implements SubjectRepository {
  constructor(private apiClient: ApiClient) {}

  async findById(id: SubjectId): Promise<SubjectEntity | null> {
    try {
      const response = await this.apiClient.get(`/school/subjects/${id.getValue()}`);
      return this.mapToEntity(response.data as any);
    } catch (error) {
      return null;
    }
  }

  async findAll(): Promise<SubjectEntity[]> {
    const response = await this.apiClient.get('/school/subjects/');
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async findByBranchId(branchId: number): Promise<SubjectEntity[]> {
    const response = await this.apiClient.get(`/school/subjects?branch_id=${branchId}`);
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async findByClassId(classId: number): Promise<SubjectEntity[]> {
    const response = await this.apiClient.get(`/school/subjects?class_id=${classId}`);
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async findBySubjectCode(subjectCode: string): Promise<SubjectEntity | null> {
    try {
      const response = await this.apiClient.get(`/school/subjects?subject_code=${encodeURIComponent(subjectCode)}`);
      const subjects = response.data as any[];
      return subjects.length > 0 ? this.mapToEntity(subjects[0]) : null;
    } catch (error) {
      return null;
    }
  }

  async save(subjectEntity: SubjectEntity): Promise<SubjectEntity> {
    const response = await this.apiClient.post('/school/subjects/', this.mapToApiRequest(subjectEntity));
    return this.mapToEntity(response.data as any);
  }

  async update(subjectEntity: SubjectEntity): Promise<SubjectEntity> {
    const response = await this.apiClient.put(`/school/subjects/${subjectEntity.id.getValue()}`, this.mapToApiRequest(subjectEntity));
    return this.mapToEntity(response.data as any);
  }

  async delete(id: SubjectId): Promise<void> {
    await this.apiClient.delete(`/school/subjects/${id.getValue()}`);
  }

  async exists(id: SubjectId): Promise<boolean> {
    try {
      await this.apiClient.get(`/school/subjects/${id.getValue()}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async count(): Promise<number> {
    const response = await this.apiClient.get('/school/subjects/count');
    return (response.data as any).count;
  }

  async searchSubjects(query: string): Promise<SubjectEntity[]> {
    const response = await this.apiClient.get(`/school/subjects/search?q=${encodeURIComponent(query)}`);
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  private safeParseDate(value: any): Date {
    if (!value) return new Date();
    const d = new Date(value);
    return isNaN(d.getTime()) ? new Date() : d;
  }

  private mapToEntity(apiData: any): SubjectEntity {
    return new SubjectEntity(
      new SubjectId(apiData.subject_id || apiData.id),
      apiData.subject_name || apiData.subjectName,
      apiData.subject_code || apiData.subjectCode,
      apiData.description || null,
      apiData.branch_id || apiData.branchId || 1,
      apiData.is_active !== false,
      this.safeParseDate(apiData.created_at || apiData.createdAt),
      this.safeParseDate(apiData.updated_at || apiData.updatedAt)
    );
  }

  async findActiveSubjects(): Promise<SubjectEntity[]> {
    const response = await this.apiClient.get('/school/subjects/active');
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async findByCode(subjectCode: string): Promise<SubjectEntity | null> {
    try {
      const response = await this.apiClient.get(`/school/subjects/code/${subjectCode}`);
      return this.mapToEntity(response.data as any);
    } catch (error) {
      return null;
    }
  }

  async countByBranch(branchId: number): Promise<number> {
    const response = await this.apiClient.get(`/school/subjects/branch/${branchId}/count`);
    return (response.data as any).count;
  }

  private mapToApiRequest(subjectEntity: SubjectEntity): any {
    return {
      subject_name: subjectEntity.name,
      subject_code: subjectEntity.code,
      description: subjectEntity.description,
      branch_id: subjectEntity.branchId,
      is_active: subjectEntity.isActive,
    };
  }
}
