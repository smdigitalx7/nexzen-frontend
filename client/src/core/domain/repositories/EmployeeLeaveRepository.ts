import { EmployeeLeaveEntity, LeaveStatus, LeaveType } from '../entities/EmployeeLeave';
import { EmployeeLeaveId } from '../value-objects/EmployeeLeaveId';

export interface EmployeeLeaveRepository {
  findById(id: EmployeeLeaveId): Promise<EmployeeLeaveEntity | null>;
  findAll(): Promise<EmployeeLeaveEntity[]>;
  findByEmployeeId(employeeId: number): Promise<EmployeeLeaveEntity[]>;
  findByBranchId(branchId: number): Promise<EmployeeLeaveEntity[]>;
  findByStatus(status: LeaveStatus): Promise<EmployeeLeaveEntity[]>;
  findByLeaveType(leaveType: LeaveType): Promise<EmployeeLeaveEntity[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<EmployeeLeaveEntity[]>;
  findByEmployeeAndYear(employeeId: number, year: number): Promise<EmployeeLeaveEntity[]>;
  save(employeeLeaveEntity: EmployeeLeaveEntity): Promise<EmployeeLeaveEntity>;
  update(employeeLeaveEntity: EmployeeLeaveEntity): Promise<EmployeeLeaveEntity>;
  delete(id: EmployeeLeaveId): Promise<void>;
  exists(id: EmployeeLeaveId): Promise<boolean>;
  count(): Promise<number>;
  countByEmployee(employeeId: number): Promise<number>;
  countByStatus(status: LeaveStatus): Promise<number>;
  countByBranch(branchId: number): Promise<number>;
  getLeaveSummary(employeeId: number, year: number): Promise<{
    totalLeaves: number;
    approvedLeaves: number;
    pendingLeaves: number;
    rejectedLeaves: number;
    totalDays: number;
    remainingDays: number;
  }>;
  searchEmployeeLeaves(query: string): Promise<EmployeeLeaveEntity[]>;
}
