import { AcademicYearRepository } from '../../domain/repositories/AcademicYearRepository';
import { AcademicYearEntity, AcademicYearStatus } from '../../domain/entities/AcademicYear';
import { AcademicYearId } from '../../domain/value-objects/AcademicYearId';
import { ApiClient } from '../api/ApiClient';

export class AcademicYearApiRepository implements AcademicYearRepository {
  constructor(private apiClient: ApiClient) {}

  async findById(id: AcademicYearId): Promise<AcademicYearEntity | null> {
    try {
      const response = await this.apiClient.get(`/academic-years/${id.getValue()}`);
      return this.mapToEntity(response.data as any);
    } catch (error) {
      return null;
    }
  }

  async findAll(): Promise<AcademicYearEntity[]> {
    console.log('🔍 AcademicYearApiRepository.findAll: Fetching academic years...');
    const response = await this.apiClient.get('/academic-years/');
    console.log('🔍 AcademicYearApiRepository.findAll: Raw response:', response.data);
    const entities = (response.data as any[]).map((item: any) => this.mapToEntity(item));
    console.log('🔍 AcademicYearApiRepository.findAll: Mapped entities:', entities);
    return entities;
  }

  async findByBranchId(branchId: number): Promise<AcademicYearEntity[]> {
    const response = await this.apiClient.get(`/academic-years?branch_id=${branchId}`);
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async findByStatus(status: AcademicYearStatus): Promise<AcademicYearEntity[]> {
    const response = await this.apiClient.get(`/academic-years?status=${status}`);
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async findCurrent(): Promise<AcademicYearEntity | null> {
    // Backend doesn't have /current endpoint, so we'll get all and find current
    try {
      const response = await this.apiClient.get('/academic-years/');
      const academicYears = response.data as any[];
      const currentYear = academicYears.find((year: any) => year.is_active === true);
      return currentYear ? this.mapToEntity(currentYear) : null;
    } catch (error) {
      return null;
    }
  }

  async save(academicYearEntity: AcademicYearEntity): Promise<AcademicYearEntity> {
    const response = await this.apiClient.post('/academic-years/', this.mapToApiRequest(academicYearEntity));
    return this.mapToEntity(response.data as any);
  }

  async update(academicYearEntity: AcademicYearEntity): Promise<AcademicYearEntity> {
    const response = await this.apiClient.put(`/academic-years/${academicYearEntity.id.getValue()}`, this.mapToApiRequest(academicYearEntity));
    return this.mapToEntity(response.data as any);
  }

  async delete(id: AcademicYearId): Promise<void> {
    await this.apiClient.delete(`/academic-years/${id.getValue()}`);
  }

  async exists(id: AcademicYearId): Promise<boolean> {
    try {
      await this.apiClient.get(`/academic-years/${id.getValue()}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async count(): Promise<number> {
    // Backend doesn't have /count endpoint, so we'll get all and count
    try {
      const response = await this.apiClient.get('/academic-years/');
      const academicYears = response.data as any[];
      return academicYears.length;
    } catch (error) {
      return 0;
    }
  }

  async countByBranch(branchId: number): Promise<number> {
    // Backend doesn't have /count endpoint, so we'll get all and filter
    try {
      const response = await this.apiClient.get('/academic-years/');
      const academicYears = response.data as any[];
      return academicYears.filter((year: any) => year.is_active === true).length;
    } catch (error) {
      return 0;
    }
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<AcademicYearEntity[]> {
    // Backend doesn't support date filtering, so we'll get all and filter
    try {
      const response = await this.apiClient.get('/academic-years/');
      const academicYears = response.data as any[];
      return academicYears
        .filter((year: any) => {
          const yearStart = new Date(year.start_date);
          const yearEnd = new Date(year.end_date);
          return yearStart >= startDate && yearEnd <= endDate;
        })
        .map((item: any) => this.mapToEntity(item));
    } catch (error) {
      return [];
    }
  }

  async findByYearName(yearName: string): Promise<AcademicYearEntity | null> {
    // Backend doesn't support year_name filtering, so we'll get all and filter
    try {
      const response = await this.apiClient.get('/academic-years/');
      const academicYears = response.data as any[];
      const matchingYear = academicYears.find((year: any) => year.year_name === yearName);
      return matchingYear ? this.mapToEntity(matchingYear) : null;
    } catch (error) {
      return null;
    }
  }

  async countByStatus(status: any): Promise<number> {
    // Backend doesn't have /count endpoint, so we'll get all and filter
    try {
      const response = await this.apiClient.get('/academic-years/');
      const academicYears = response.data as any[];
      return academicYears.filter((year: any) => year.is_active === (status === 'ACTIVE')).length;
    } catch (error) {
      return 0;
    }
  }

  async searchAcademicYears(query: string): Promise<AcademicYearEntity[]> {
    // Backend doesn't have /search endpoint, so we'll get all and filter
    try {
      const response = await this.apiClient.get('/academic-years/');
      const academicYears = response.data as any[];
      return academicYears
        .filter((year: any) => 
          year.year_name?.toLowerCase().includes(query.toLowerCase())
        )
        .map((item: any) => this.mapToEntity(item));
    } catch (error) {
      return [];
    }
  }

  private mapToEntity(apiData: any): AcademicYearEntity {
    console.log('🔍 mapToEntity: Mapping API data:', apiData);
    const safeDate = (v: any) => {
      if (!v) return new Date();
      const d = new Date(v);
      return isNaN(d.getTime()) ? new Date() : d;
    };
    return new AcademicYearEntity(
      new AcademicYearId(apiData.academic_year_id),
      apiData.year_name,
      safeDate(apiData.start_date),
      safeDate(apiData.end_date),
      apiData.is_active ? AcademicYearStatus.ACTIVE : AcademicYearStatus.CANCELLED,
      false, // Backend doesn't have is_current field
      null, // Backend doesn't have description field
      1, // Default branch_id since backend doesn't return it
      safeDate(apiData.created_at),
      safeDate(apiData.updated_at || apiData.created_at)
    );
  }

  private mapToApiRequest(academicYearEntity: AcademicYearEntity): any {
    return {
      year_name: academicYearEntity.yearName,
      start_date: academicYearEntity.startDate.toISOString(),
      end_date: academicYearEntity.endDate.toISOString(),
      status: academicYearEntity.status,
      is_current: academicYearEntity.isCurrent,
      description: academicYearEntity.description,
      branch_id: academicYearEntity.branchId,
    };
  }
}
