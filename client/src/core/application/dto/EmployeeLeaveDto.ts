import { LeaveType, LeaveStatus } from '../../domain/entities/EmployeeLeave';

export interface CreateEmployeeLeaveRequest {
  employeeId: number;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;
  branchId: number;
}

export interface UpdateEmployeeLeaveRequest {
  id: number;
  leaveType?: LeaveType;
  startDate?: Date;
  endDate?: Date;
  reason?: string;
}

export interface ApproveEmployeeLeaveRequest {
  id: number;
  approvedBy: number;
}

export interface RejectEmployeeLeaveRequest {
  id: number;
  rejectedBy: number;
  rejectionReason: string;
}

export interface EmployeeLeaveResponse {
  id: number;
  employeeId: number;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  appliedDate: string;
  approvedBy: number | null;
  approvedDate: string | null;
  rejectedBy: number | null;
  rejectedDate: string | null;
  rejectionReason: string | null;
  branchId: number;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeLeaveSummaryResponse {
  totalLeaves: number;
  approvedLeaves: number;
  pendingLeaves: number;
  rejectedLeaves: number;
  totalDays: number;
  remainingDays: number;
}
