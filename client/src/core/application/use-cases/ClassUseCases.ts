import { ClassRepository } from '../../domain/repositories/ClassRepository';
import { ClassEntity } from '../../domain/entities/Class';
import { ClassId } from '../../domain/value-objects/ClassId';
import { CreateClassRequest, UpdateClassRequest, ClassResponse } from '../dto/ClassDto';

export class ClassUseCases {
  constructor(private classRepository: ClassRepository) {}

  async getAllClasses(): Promise<ClassResponse[]> {
    const classes = await this.classRepository.findAll();
    return classes.map(this.mapToResponse);
  }

  async getClassById(id: number): Promise<ClassResponse | null> {
    const classEntity = await this.classRepository.findById(new ClassId(id));
    return classEntity ? this.mapToResponse(classEntity) : null;
  }

  async getClassesByBranch(branchId: number): Promise<ClassResponse[]> {
    const classes = await this.classRepository.findByBranchId(branchId);
    return classes.map(this.mapToResponse);
  }

  async getActiveClasses(): Promise<ClassResponse[]> {
    const classes = await this.classRepository.findActiveClasses();
    return classes.map(this.mapToResponse);
  }

  async createClass(request: CreateClassRequest): Promise<ClassResponse> {
    const classEntity = new ClassEntity(
      new ClassId(0), // Will be set by repository
      request.name,
      request.description || null,
      request.branchId,
      true,
      new Date(),
      new Date()
    );

    const savedClass = await this.classRepository.save(classEntity);
    return this.mapToResponse(savedClass);
  }

  async updateClass(request: UpdateClassRequest): Promise<ClassResponse> {
    const existingClass = await this.classRepository.findById(new ClassId(request.id));
    if (!existingClass) {
      throw new Error('Class not found');
    }

    let updatedClass = existingClass;

    if (request.name !== undefined) {
      updatedClass = updatedClass.updateName(request.name);
    }

    if (request.description !== undefined) {
      updatedClass = updatedClass.updateDescription(request.description);
    }

    if (request.isActive !== undefined) {
      updatedClass = request.isActive ? updatedClass.activate() : updatedClass.deactivate();
    }

    const savedClass = await this.classRepository.update(updatedClass);
    return this.mapToResponse(savedClass);
  }

  async deleteClass(id: number): Promise<void> {
    await this.classRepository.delete(new ClassId(id));
  }

  async searchClasses(query: string): Promise<ClassResponse[]> {
    const classes = await this.classRepository.searchClasses(query);
    return classes.map(this.mapToResponse);
  }

  private mapToResponse(classEntity: ClassEntity): ClassResponse {
    return {
      id: classEntity.id.getValue(),
      name: classEntity.name,
      description: classEntity.description,
      branchId: classEntity.branchId,
      isActive: classEntity.isActive,
      createdAt: classEntity.createdAt.toISOString(),
      updatedAt: classEntity.updatedAt.toISOString(),
    };
  }
}
