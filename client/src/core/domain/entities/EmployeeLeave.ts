import { EmployeeLeaveId } from '../value-objects/EmployeeLeaveId';

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export enum LeaveType {
  SICK = 'SICK',
  VACATION = 'VACATION',
  PERSONAL = 'PERSONAL',
  EMERGENCY = 'EMERGENCY',
  MATERNITY = 'MATERNITY',
  PATERNITY = 'PATERNITY',
  BEREAVEMENT = 'BEREAVEMENT'
}

export class EmployeeLeaveEntity {
  constructor(
    public readonly id: EmployeeLeaveId,
    public readonly employeeId: number,
    public readonly leaveType: LeaveType,
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly totalDays: number,
    public readonly reason: string,
    public readonly status: LeaveStatus,
    public readonly appliedDate: Date,
    public readonly approvedBy: number | null,
    public readonly approvedDate: Date | null,
    public readonly rejectedBy: number | null,
    public readonly rejectedDate: Date | null,
    public readonly rejectionReason: string | null,
    public readonly branchId: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  public approve(approvedBy: number): EmployeeLeaveEntity {
    return new EmployeeLeaveEntity(
      this.id,
      this.employeeId,
      this.leaveType,
      this.startDate,
      this.endDate,
      this.totalDays,
      this.reason,
      LeaveStatus.APPROVED,
      this.appliedDate,
      approvedBy,
      new Date(),
      this.rejectedBy,
      this.rejectedDate,
      this.rejectionReason,
      this.branchId,
      this.createdAt,
      new Date()
    );
  }

  public reject(rejectedBy: number, rejectionReason: string): EmployeeLeaveEntity {
    return new EmployeeLeaveEntity(
      this.id,
      this.employeeId,
      this.leaveType,
      this.startDate,
      this.endDate,
      this.totalDays,
      this.reason,
      LeaveStatus.REJECTED,
      this.appliedDate,
      this.approvedBy,
      this.approvedDate,
      rejectedBy,
      new Date(),
      rejectionReason,
      this.branchId,
      this.createdAt,
      new Date()
    );
  }

  public cancel(): EmployeeLeaveEntity {
    return new EmployeeLeaveEntity(
      this.id,
      this.employeeId,
      this.leaveType,
      this.startDate,
      this.endDate,
      this.totalDays,
      this.reason,
      LeaveStatus.CANCELLED,
      this.appliedDate,
      this.approvedBy,
      this.approvedDate,
      this.rejectedBy,
      this.rejectedDate,
      this.rejectionReason,
      this.branchId,
      this.createdAt,
      new Date()
    );
  }

  public updateDetails(
    leaveType: LeaveType,
    startDate: Date,
    endDate: Date,
    reason: string
  ): EmployeeLeaveEntity {
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    return new EmployeeLeaveEntity(
      this.id,
      this.employeeId,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason,
      this.status,
      this.appliedDate,
      this.approvedBy,
      this.approvedDate,
      this.rejectedBy,
      this.rejectedDate,
      this.rejectionReason,
      this.branchId,
      this.createdAt,
      new Date()
    );
  }
}
