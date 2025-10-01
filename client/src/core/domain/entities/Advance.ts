import { AdvanceId } from '../value-objects/AdvanceId';

export enum AdvanceStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
  CANCELLED = 'CANCELLED'
}

export class AdvanceEntity {
  constructor(
    public readonly id: AdvanceId,
    public readonly employeeId: number,
    public readonly amount: number,
    public readonly reason: string,
    public readonly status: AdvanceStatus,
    public readonly requestedDate: Date,
    public readonly branchId: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly approvedDate?: Date,
    public readonly paidDate?: Date,
    public readonly amountPaid: number = 0,
    public readonly notes?: string
  ) {}

  public static create(
    employeeId: number,
    amount: number,
    reason: string,
    branchId: number,
    notes?: string
  ): AdvanceEntity {
    const now = new Date();
    return new AdvanceEntity(
      new AdvanceId(0), // Will be set by repository
      employeeId,
      amount,
      reason,
      AdvanceStatus.PENDING,
      now,
      branchId,
      now,
      now,
      undefined, // approvedDate
      undefined, // paidDate
      0,         // amountPaid
      notes
    );
  }

  public approve(notes?: string): AdvanceEntity {
    return new AdvanceEntity(
      this.id,
      this.employeeId,
      this.amount,
      this.reason,
      AdvanceStatus.APPROVED,
      this.requestedDate,
      this.branchId,
      this.createdAt,
      new Date(),
      new Date(), // approvedDate
      this.paidDate,
      this.amountPaid,
      notes || this.notes
    );
  }

  public reject(notes?: string): AdvanceEntity {
    return new AdvanceEntity(
      this.id,
      this.employeeId,
      this.amount,
      this.reason,
      AdvanceStatus.REJECTED,
      this.requestedDate,
      this.branchId,
      this.createdAt,
      new Date(),
      this.approvedDate,
      this.paidDate,
      this.amountPaid,
      notes || this.notes
    );
  }

  public markAsPaid(amountPaid: number, notes?: string): AdvanceEntity {
    return new AdvanceEntity(
      this.id,
      this.employeeId,
      this.amount,
      this.reason,
      AdvanceStatus.PAID,
      this.requestedDate,
      this.branchId,
      this.createdAt,
      new Date(),
      this.approvedDate,
      new Date(), // paidDate
      amountPaid,
      notes || this.notes
    );
  }

  public cancel(notes?: string): AdvanceEntity {
    return new AdvanceEntity(
      this.id,
      this.employeeId,
      this.amount,
      this.reason,
      AdvanceStatus.CANCELLED,
      this.requestedDate,
      this.branchId,
      this.createdAt,
      new Date(),
      this.approvedDate,
      this.paidDate,
      this.amountPaid,
      notes || this.notes
    );
  }

  public updateAmount(amount: number): AdvanceEntity {
    return new AdvanceEntity(
      this.id,
      this.employeeId,
      amount,
      this.reason,
      this.status,
      this.requestedDate,
      this.branchId,
      this.createdAt,
      new Date(),
      this.approvedDate,
      this.paidDate,
      this.amountPaid,
      this.notes
    );
  }

  public updateReason(reason: string): AdvanceEntity {
    return new AdvanceEntity(
      this.id,
      this.employeeId,
      this.amount,
      reason,
      this.status,
      this.requestedDate,
      this.branchId,
      this.createdAt,
      new Date(),
      this.approvedDate,
      this.paidDate,
      this.amountPaid,
      this.notes
    );
  }
}
