import { AcademicYearRepository } from '../../domain/repositories/AcademicYearRepository';
import { AcademicYearEntity, AcademicYearStatus } from '../../domain/entities/AcademicYear';
import { AcademicYearId } from '../../domain/value-objects/AcademicYearId';
import { CreateAcademicYearRequest, UpdateAcademicYearRequest, AcademicYearResponse } from '../dto/AcademicYearDto';

export class AcademicYearUseCases {
  constructor(private academicYearRepository: AcademicYearRepository) {}

  async getAllAcademicYears(): Promise<AcademicYearResponse[]> {
    const academicYears = await this.academicYearRepository.findAll();
    return academicYears.map(this.mapToResponse);
  }

  async getAcademicYearById(id: number): Promise<AcademicYearResponse | null> {
    const academicYearEntity = await this.academicYearRepository.findById(new AcademicYearId(id));
    return academicYearEntity ? this.mapToResponse(academicYearEntity) : null;
  }

  async getAcademicYearsByBranch(branchId: number): Promise<AcademicYearResponse[]> {
    const academicYears = await this.academicYearRepository.findByBranchId(branchId);
    return academicYears.map(this.mapToResponse);
  }

  async getAcademicYearsByStatus(status: AcademicYearStatus): Promise<AcademicYearResponse[]> {
    const academicYears = await this.academicYearRepository.findByStatus(status);
    return academicYears.map(this.mapToResponse);
  }

  async getCurrentAcademicYear(): Promise<AcademicYearResponse | null> {
    const academicYearEntity = await this.academicYearRepository.findCurrent();
    return academicYearEntity ? this.mapToResponse(academicYearEntity) : null;
  }

  async createAcademicYear(request: CreateAcademicYearRequest): Promise<AcademicYearResponse> {
    const academicYearEntity = new AcademicYearEntity(
      new AcademicYearId(0), // Will be set by repository
      request.yearName,
      request.startDate,
      request.endDate,
      request.status,
      request.isCurrent,
      request.description || null,
      request.branchId,
      new Date(),
      new Date()
    );

    const savedAcademicYear = await this.academicYearRepository.save(academicYearEntity);
    return this.mapToResponse(savedAcademicYear);
  }

  async updateAcademicYear(request: UpdateAcademicYearRequest): Promise<AcademicYearResponse> {
    const existingAcademicYear = await this.academicYearRepository.findById(new AcademicYearId(request.id));
    if (!existingAcademicYear) {
      throw new Error('Academic year not found');
    }

    const updatedAcademicYear = existingAcademicYear.updateDetails(
      request.yearName ?? existingAcademicYear.yearName,
      request.startDate ?? existingAcademicYear.startDate,
      request.endDate ?? existingAcademicYear.endDate,
      request.description ?? existingAcademicYear.description
    );

    let finalAcademicYear = updatedAcademicYear;

    if (request.status !== undefined) {
      switch (request.status) {
        case AcademicYearStatus.ACTIVE:
          finalAcademicYear = finalAcademicYear.activate();
          break;
        case AcademicYearStatus.COMPLETED:
          finalAcademicYear = finalAcademicYear.complete();
          break;
        case AcademicYearStatus.CANCELLED:
          finalAcademicYear = finalAcademicYear.cancel();
          break;
      }
    }

    if (request.isCurrent !== undefined) {
      finalAcademicYear = request.isCurrent 
        ? finalAcademicYear.setAsCurrent() 
        : finalAcademicYear.unsetAsCurrent();
    }

    const savedAcademicYear = await this.academicYearRepository.update(finalAcademicYear);
    return this.mapToResponse(savedAcademicYear);
  }

  async deleteAcademicYear(id: number): Promise<void> {
    await this.academicYearRepository.delete(new AcademicYearId(id));
  }

  private mapToResponse(academicYearEntity: AcademicYearEntity): AcademicYearResponse {
    return {
      id: academicYearEntity.id.getValue(),
      yearName: academicYearEntity.yearName,
      startDate: academicYearEntity.startDate.toISOString(),
      endDate: academicYearEntity.endDate.toISOString(),
      status: academicYearEntity.status,
      isCurrent: academicYearEntity.isCurrent,
      description: academicYearEntity.description,
      branchId: academicYearEntity.branchId,
      createdAt: academicYearEntity.createdAt.toISOString(),
      updatedAt: academicYearEntity.updatedAt.toISOString(),
    };
  }
}
