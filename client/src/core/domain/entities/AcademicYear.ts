import { AcademicYearId } from "@/core/domain/value-objects/AcademicYearId";

export enum AcademicYearStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export class AcademicYearEntity {
  constructor(
    public readonly id: AcademicYearId,
    public readonly yearName: string,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly status: AcademicYearStatus,
    public readonly isCurrent: boolean,
    public readonly description: string | null,
    public readonly branchId: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  public activate(): AcademicYearEntity {
    return new AcademicYearEntity(
      this.id,
      this.yearName,
      this.startDate,
      this.endDate,
      AcademicYearStatus.ACTIVE,
      true,
      this.description,
      this.branchId,
      this.createdAt,
      new Date()
    );
  }

  public complete(): AcademicYearEntity {
    return new AcademicYearEntity(
      this.id,
      this.yearName,
      this.startDate,
      this.endDate,
      AcademicYearStatus.COMPLETED,
      false,
      this.description,
      this.branchId,
      this.createdAt,
      new Date()
    );
  }

  public cancel(): AcademicYearEntity {
    return new AcademicYearEntity(
      this.id,
      this.yearName,
      this.startDate,
      this.endDate,
      AcademicYearStatus.CANCELLED,
      false,
      this.description,
      this.branchId,
      this.createdAt,
      new Date()
    );
  }

  public updateDetails(
    yearName: string,
    startDate: Date,
    endDate: Date,
    description: string | null
  ): AcademicYearEntity {
    return new AcademicYearEntity(
      this.id,
      yearName,
      startDate,
      endDate,
      this.status,
      this.isCurrent,
      description,
      this.branchId,
      this.createdAt,
      new Date()
    );
  }

  public setAsCurrent(): AcademicYearEntity {
    return new AcademicYearEntity(
      this.id,
      this.yearName,
      this.startDate,
      this.endDate,
      this.status,
      true,
      this.description,
      this.branchId,
      this.createdAt,
      new Date()
    );
  }

  public unsetAsCurrent(): AcademicYearEntity {
    return new AcademicYearEntity(
      this.id,
      this.yearName,
      this.startDate,
      this.endDate,
      this.status,
      false,
      this.description,
      this.branchId,
      this.createdAt,
      new Date()
    );
  }

  public isActive(): boolean {
    return this.status === AcademicYearStatus.ACTIVE;
  }

  public isCompleted(): boolean {
    return this.status === AcademicYearStatus.COMPLETED;
  }

  public isCancelled(): boolean {
    return this.status === AcademicYearStatus.CANCELLED;
  }

  public getDurationInDays(): number {
    const diffTime = this.endDate.getTime() - this.startDate.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  public isDateInRange(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }
}
