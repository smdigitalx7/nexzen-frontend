import { SubjectRepository } from '../../domain/repositories/SubjectRepository';
import { SubjectEntity } from '../../domain/entities/Subject';
import { SubjectId } from '../../domain/value-objects/SubjectId';
import { CreateSubjectRequest, UpdateSubjectRequest, SubjectResponse } from '../dto/SubjectDto';

export class SubjectUseCases {
  constructor(private subjectRepository: SubjectRepository) {}

  async getAllSubjects(): Promise<SubjectResponse[]> {
    const subjects = await this.subjectRepository.findAll();
    return subjects.map(this.mapToResponse);
  }

  async getSubjectById(id: number): Promise<SubjectResponse | null> {
    const subjectEntity = await this.subjectRepository.findById(new SubjectId(id));
    return subjectEntity ? this.mapToResponse(subjectEntity) : null;
  }

  async getSubjectsByBranch(branchId: number): Promise<SubjectResponse[]> {
    const subjects = await this.subjectRepository.findByBranchId(branchId);
    return subjects.map(this.mapToResponse);
  }

  async getActiveSubjects(): Promise<SubjectResponse[]> {
    const subjects = await this.subjectRepository.findActiveSubjects();
    return subjects.map(this.mapToResponse);
  }

  async createSubject(request: CreateSubjectRequest): Promise<SubjectResponse> {
    const subjectEntity = new SubjectEntity(
      new SubjectId(0), // Will be set by repository
      request.name,
      request.code,
      request.description || null,
      request.branchId,
      true,
      new Date(),
      new Date()
    );

    const savedSubject = await this.subjectRepository.save(subjectEntity);
    return this.mapToResponse(savedSubject);
  }

  async updateSubject(request: UpdateSubjectRequest): Promise<SubjectResponse> {
    const existingSubject = await this.subjectRepository.findById(new SubjectId(request.id));
    if (!existingSubject) {
      throw new Error('Subject not found');
    }

    let updatedSubject = existingSubject;

    if (request.name !== undefined) {
      updatedSubject = updatedSubject.updateName(request.name);
    }

    if (request.code !== undefined) {
      updatedSubject = updatedSubject.updateCode(request.code);
    }

    if (request.description !== undefined) {
      updatedSubject = updatedSubject.updateDescription(request.description);
    }

    if (request.isActive !== undefined) {
      updatedSubject = request.isActive ? updatedSubject.activate() : updatedSubject.deactivate();
    }

    const savedSubject = await this.subjectRepository.update(updatedSubject);
    return this.mapToResponse(savedSubject);
  }

  async deleteSubject(id: number): Promise<void> {
    await this.subjectRepository.delete(new SubjectId(id));
  }

  async searchSubjects(query: string): Promise<SubjectResponse[]> {
    const subjects = await this.subjectRepository.searchSubjects(query);
    return subjects.map(this.mapToResponse);
  }

  private mapToResponse(subjectEntity: SubjectEntity): SubjectResponse {
    return {
      id: subjectEntity.id.getValue(),
      name: subjectEntity.name,
      code: subjectEntity.code,
      description: subjectEntity.description,
      branchId: subjectEntity.branchId,
      isActive: subjectEntity.isActive,
      createdAt: subjectEntity.createdAt.toISOString(),
      updatedAt: subjectEntity.updatedAt.toISOString(),
    };
  }
}
