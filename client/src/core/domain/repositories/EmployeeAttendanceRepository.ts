import { EmployeeAttendanceEntity, AttendanceStatus } from '../entities/EmployeeAttendance';
import { EmployeeAttendanceId } from '../value-objects/EmployeeAttendanceId';

export interface EmployeeAttendanceRepository {
  findById(id: EmployeeAttendanceId): Promise<EmployeeAttendanceEntity | null>;
  findAll(): Promise<EmployeeAttendanceEntity[]>;
  findByEmployeeId(employeeId: number): Promise<EmployeeAttendanceEntity[]>;
  findByBranchId(branchId: number): Promise<EmployeeAttendanceEntity[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<EmployeeAttendanceEntity[]>;
  findByEmployeeAndDate(employeeId: number, date: Date): Promise<EmployeeAttendanceEntity | null>;
  findByStatus(status: AttendanceStatus): Promise<EmployeeAttendanceEntity[]>;
  save(employeeAttendanceEntity: EmployeeAttendanceEntity): Promise<EmployeeAttendanceEntity>;
  update(employeeAttendanceEntity: EmployeeAttendanceEntity): Promise<EmployeeAttendanceEntity>;
  delete(id: EmployeeAttendanceId): Promise<void>;
  exists(id: EmployeeAttendanceId): Promise<boolean>;
  count(): Promise<number>;
  countByEmployee(employeeId: number): Promise<number>;
  countByStatus(status: AttendanceStatus): Promise<number>;
  countByBranch(branchId: number): Promise<number>;
  getAttendanceSummary(employeeId: number, startDate: Date, endDate: Date): Promise<{
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    totalWorkingHours: number;
    totalOvertimeHours: number;
  }>;
  searchEmployeeAttendance(query: string): Promise<EmployeeAttendanceEntity[]>;
}
