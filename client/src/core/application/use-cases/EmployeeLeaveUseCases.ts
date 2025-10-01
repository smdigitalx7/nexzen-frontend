import { EmployeeLeaveRepository } from '../../domain/repositories/EmployeeLeaveRepository';
import { EmployeeLeaveEntity, LeaveStatus, LeaveType } from '../../domain/entities/EmployeeLeave';
import { EmployeeLeaveId } from '../../domain/value-objects/EmployeeLeaveId';
import { 
  CreateEmployeeLeaveRequest, 
  UpdateEmployeeLeaveRequest, 
  ApproveEmployeeLeaveRequest,
  RejectEmployeeLeaveRequest,
  EmployeeLeaveResponse,
  EmployeeLeaveSummaryResponse
} from '../dto/EmployeeLeaveDto';

export class EmployeeLeaveUseCases {
  constructor(private employeeLeaveRepository: EmployeeLeaveRepository) {}

  async getAllEmployeeLeaves(): Promise<EmployeeLeaveResponse[]> {
    const leaves = await this.employeeLeaveRepository.findAll();
    return leaves.map(this.mapToResponse);
  }

  async getEmployeeLeaveById(id: number): Promise<EmployeeLeaveResponse | null> {
    const leaveEntity = await this.employeeLeaveRepository.findById(new EmployeeLeaveId(id));
    return leaveEntity ? this.mapToResponse(leaveEntity) : null;
  }

  async getEmployeeLeavesByEmployee(employeeId: number): Promise<EmployeeLeaveResponse[]> {
    const leaves = await this.employeeLeaveRepository.findByEmployeeId(employeeId);
    return leaves.map(this.mapToResponse);
  }

  async getEmployeeLeavesByBranch(branchId: number): Promise<EmployeeLeaveResponse[]> {
    const leaves = await this.employeeLeaveRepository.findByBranchId(branchId);
    return leaves.map(this.mapToResponse);
  }

  async getEmployeeLeavesByStatus(status: LeaveStatus): Promise<EmployeeLeaveResponse[]> {
    const leaves = await this.employeeLeaveRepository.findByStatus(status);
    return leaves.map(this.mapToResponse);
  }

  async getEmployeeLeaveSummary(employeeId: number, year: number): Promise<EmployeeLeaveSummaryResponse> {
    return await this.employeeLeaveRepository.getLeaveSummary(employeeId, year);
  }

  async createEmployeeLeave(request: CreateEmployeeLeaveRequest): Promise<EmployeeLeaveResponse> {
    const totalDays = Math.ceil((request.endDate.getTime() - request.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    
    const leaveEntity = new EmployeeLeaveEntity(
      new EmployeeLeaveId(0), // Will be set by repository
      request.employeeId,
      request.leaveType,
      request.startDate,
      request.endDate,
      totalDays,
      request.reason,
      LeaveStatus.PENDING,
      new Date(),
      null,
      null,
      null,
      null,
      null,
      request.branchId,
      new Date(),
      new Date()
    );

    const savedLeave = await this.employeeLeaveRepository.save(leaveEntity);
    return this.mapToResponse(savedLeave);
  }

  async updateEmployeeLeave(request: UpdateEmployeeLeaveRequest): Promise<EmployeeLeaveResponse> {
    const existingLeave = await this.employeeLeaveRepository.findById(new EmployeeLeaveId(request.id));
    if (!existingLeave) {
      throw new Error('Employee leave not found');
    }

    const updatedLeave = existingLeave.updateDetails(
      request.leaveType ?? existingLeave.leaveType,
      request.startDate ?? existingLeave.startDate,
      request.endDate ?? existingLeave.endDate,
      request.reason ?? existingLeave.reason
    );

    const savedLeave = await this.employeeLeaveRepository.update(updatedLeave);
    return this.mapToResponse(savedLeave);
  }

  async approveEmployeeLeave(request: ApproveEmployeeLeaveRequest): Promise<EmployeeLeaveResponse> {
    const existingLeave = await this.employeeLeaveRepository.findById(new EmployeeLeaveId(request.id));
    if (!existingLeave) {
      throw new Error('Employee leave not found');
    }

    const approvedLeave = existingLeave.approve(request.approvedBy);
    const savedLeave = await this.employeeLeaveRepository.update(approvedLeave);
    return this.mapToResponse(savedLeave);
  }

  async rejectEmployeeLeave(request: RejectEmployeeLeaveRequest): Promise<EmployeeLeaveResponse> {
    const existingLeave = await this.employeeLeaveRepository.findById(new EmployeeLeaveId(request.id));
    if (!existingLeave) {
      throw new Error('Employee leave not found');
    }

    const rejectedLeave = existingLeave.reject(request.rejectedBy, request.rejectionReason);
    const savedLeave = await this.employeeLeaveRepository.update(rejectedLeave);
    return this.mapToResponse(savedLeave);
  }

  async deleteEmployeeLeave(id: number): Promise<void> {
    await this.employeeLeaveRepository.delete(new EmployeeLeaveId(id));
  }

  private mapToResponse(leaveEntity: EmployeeLeaveEntity): EmployeeLeaveResponse {
    return {
      id: leaveEntity.id.getValue(),
      employeeId: leaveEntity.employeeId,
      leaveType: leaveEntity.leaveType,
      startDate: leaveEntity.startDate.toISOString(),
      endDate: leaveEntity.endDate.toISOString(),
      totalDays: leaveEntity.totalDays,
      reason: leaveEntity.reason,
      status: leaveEntity.status,
      appliedDate: leaveEntity.appliedDate.toISOString(),
      approvedBy: leaveEntity.approvedBy,
      approvedDate: leaveEntity.approvedDate?.toISOString() || null,
      rejectedBy: leaveEntity.rejectedBy,
      rejectedDate: leaveEntity.rejectedDate?.toISOString() || null,
      rejectionReason: leaveEntity.rejectionReason,
      branchId: leaveEntity.branchId,
      createdAt: leaveEntity.createdAt.toISOString(),
      updatedAt: leaveEntity.updatedAt.toISOString(),
    };
  }
}
