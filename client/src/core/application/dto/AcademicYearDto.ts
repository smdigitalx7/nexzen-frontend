import { AcademicYearStatus } from '../../domain/entities/AcademicYear';

export interface CreateAcademicYearRequest {
  yearName: string;
  startDate: Date;
  endDate: Date;
  status: AcademicYearStatus;
  isCurrent: boolean;
  description?: string;
  branchId: number;
}

export interface UpdateAcademicYearRequest {
  id: number;
  yearName?: string;
  startDate?: Date;
  endDate?: Date;
  status?: AcademicYearStatus;
  isCurrent?: boolean;
  description?: string;
}

export interface AcademicYearResponse {
  id: number;
  yearName: string;
  startDate: string;
  endDate: string;
  status: AcademicYearStatus;
  isCurrent: boolean;
  description: string | null;
  branchId: number;
  createdAt: string;
  updatedAt: string;
}
