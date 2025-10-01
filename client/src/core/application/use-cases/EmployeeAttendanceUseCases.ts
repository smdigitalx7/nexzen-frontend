import { EmployeeAttendanceRepository } from '../../domain/repositories/EmployeeAttendanceRepository';
import { EmployeeAttendanceEntity, AttendanceStatus } from '../../domain/entities/EmployeeAttendance';
import { EmployeeAttendanceId } from '../../domain/value-objects/EmployeeAttendanceId';
import { 
  CreateEmployeeAttendanceRequest, 
  UpdateEmployeeAttendanceRequest,
  CheckInRequest,
  CheckOutRequest,
  EmployeeAttendanceResponse,
  AttendanceSummaryResponse
} from '../dto/EmployeeAttendanceDto';

export class EmployeeAttendanceUseCases {
  constructor(private employeeAttendanceRepository: EmployeeAttendanceRepository) {}

  async getAllEmployeeAttendance(): Promise<EmployeeAttendanceResponse[]> {
    const attendance = await this.employeeAttendanceRepository.findAll();
    return attendance.map(this.mapToResponse);
  }

  async getEmployeeAttendanceById(id: number): Promise<EmployeeAttendanceResponse | null> {
    const attendanceEntity = await this.employeeAttendanceRepository.findById(new EmployeeAttendanceId(id));
    return attendanceEntity ? this.mapToResponse(attendanceEntity) : null;
  }

  async getEmployeeAttendanceByEmployee(employeeId: number): Promise<EmployeeAttendanceResponse[]> {
    const attendance = await this.employeeAttendanceRepository.findByEmployeeId(employeeId);
    return attendance.map(this.mapToResponse);
  }

  async getEmployeeAttendanceByBranch(branchId: number): Promise<EmployeeAttendanceResponse[]> {
    const attendance = await this.employeeAttendanceRepository.findByBranchId(branchId);
    return attendance.map(this.mapToResponse);
  }

  async getEmployeeAttendanceByDateRange(startDate: Date, endDate: Date): Promise<EmployeeAttendanceResponse[]> {
    const attendance = await this.employeeAttendanceRepository.findByDateRange(startDate, endDate);
    return attendance.map(this.mapToResponse);
  }

  async getEmployeeAttendanceSummary(employeeId: number, startDate: Date, endDate: Date): Promise<AttendanceSummaryResponse> {
    const summary = await this.employeeAttendanceRepository.getAttendanceSummary(employeeId, startDate, endDate);
    return {
      totalDays: summary.totalDays,
      presentDays: summary.presentDays,
      absentDays: summary.absentDays,
      lateDays: summary.lateDays,
      totalWorkingHours: summary.totalWorkingHours,
      totalOvertimeHours: summary.totalOvertimeHours,
    };
  }

  async createEmployeeAttendance(request: CreateEmployeeAttendanceRequest): Promise<EmployeeAttendanceResponse> {
    const attendanceEntity = new EmployeeAttendanceEntity(
      new EmployeeAttendanceId(0), // Will be set by repository
      request.employeeId,
      request.attendanceDate,
      request.checkInTime || null,
      request.checkOutTime || null,
      request.status,
      request.checkInTime && request.checkOutTime ? 
        this.calculateWorkingHours(request.checkInTime, request.checkOutTime) : 0,
      request.checkInTime && request.checkOutTime ? 
        this.calculateOvertimeHours(this.calculateWorkingHours(request.checkInTime, request.checkOutTime)) : 0,
      request.notes || null,
      request.branchId,
      new Date(),
      new Date()
    );

    const savedAttendance = await this.employeeAttendanceRepository.save(attendanceEntity);
    return this.mapToResponse(savedAttendance);
  }

  async updateEmployeeAttendance(request: UpdateEmployeeAttendanceRequest): Promise<EmployeeAttendanceResponse> {
    const existingAttendance = await this.employeeAttendanceRepository.findById(new EmployeeAttendanceId(request.id));
    if (!existingAttendance) {
      throw new Error('Employee attendance not found');
    }

    let updatedAttendance = existingAttendance;

    if (request.checkInTime !== undefined) {
      updatedAttendance = updatedAttendance.checkIn(request.checkInTime);
    }

    if (request.checkOutTime !== undefined) {
      updatedAttendance = updatedAttendance.checkOut(request.checkOutTime);
    }

    if (request.status !== undefined) {
      updatedAttendance = updatedAttendance.updateStatus(request.status);
    }

    if (request.notes !== undefined) {
      updatedAttendance = updatedAttendance.updateNotes(request.notes);
    }

    const savedAttendance = await this.employeeAttendanceRepository.update(updatedAttendance);
    return this.mapToResponse(savedAttendance);
  }

  async checkIn(request: CheckInRequest): Promise<EmployeeAttendanceResponse> {
    const existingAttendance = await this.employeeAttendanceRepository.findById(new EmployeeAttendanceId(request.id));
    if (!existingAttendance) {
      throw new Error('Employee attendance not found');
    }

    const checkedInAttendance = existingAttendance.checkIn(request.checkInTime);
    const savedAttendance = await this.employeeAttendanceRepository.update(checkedInAttendance);
    return this.mapToResponse(savedAttendance);
  }

  async checkOut(request: CheckOutRequest): Promise<EmployeeAttendanceResponse> {
    const existingAttendance = await this.employeeAttendanceRepository.findById(new EmployeeAttendanceId(request.id));
    if (!existingAttendance) {
      throw new Error('Employee attendance not found');
    }

    const checkedOutAttendance = existingAttendance.checkOut(request.checkOutTime);
    const savedAttendance = await this.employeeAttendanceRepository.update(checkedOutAttendance);
    return this.mapToResponse(savedAttendance);
  }

  async deleteEmployeeAttendance(id: number): Promise<void> {
    await this.employeeAttendanceRepository.delete(new EmployeeAttendanceId(id));
  }

  private calculateWorkingHours(checkInTime: Date, checkOutTime: Date): number {
    const diffMs = checkOutTime.getTime() - checkInTime.getTime();
    return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
  }

  private calculateOvertimeHours(workingHours: number): number {
    const standardHours = 8;
    return Math.max(0, workingHours - standardHours);
  }

  private mapToResponse(attendanceEntity: EmployeeAttendanceEntity): EmployeeAttendanceResponse {
    return {
      id: attendanceEntity.id.getValue(),
      employeeId: attendanceEntity.employeeId,
      attendanceDate: attendanceEntity.attendanceDate.toISOString(),
      checkInTime: attendanceEntity.checkInTime?.toISOString() || null,
      checkOutTime: attendanceEntity.checkOutTime?.toISOString() || null,
      status: attendanceEntity.status,
      workingHours: attendanceEntity.workingHours,
      overtimeHours: attendanceEntity.overtimeHours,
      notes: attendanceEntity.notes,
      branchId: attendanceEntity.branchId,
      createdAt: attendanceEntity.createdAt.toISOString(),
      updatedAt: attendanceEntity.updatedAt.toISOString(),
    };
  }
}
