import { AttendanceStatus } from '../../domain/entities/EmployeeAttendance';

export interface CreateEmployeeAttendanceRequest {
  employeeId: number;
  attendanceDate: Date;
  checkInTime?: Date;
  checkOutTime?: Date;
  status: AttendanceStatus;
  notes?: string;
  branchId: number;
}

export interface UpdateEmployeeAttendanceRequest {
  id: number;
  checkInTime?: Date;
  checkOutTime?: Date;
  status?: AttendanceStatus;
  notes?: string;
}

export interface CheckInRequest {
  id: number;
  checkInTime: Date;
}

export interface CheckOutRequest {
  id: number;
  checkOutTime: Date;
}

export interface EmployeeAttendanceResponse {
  id: number;
  employeeId: number;
  attendanceDate: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  status: AttendanceStatus;
  workingHours: number;
  overtimeHours: number;
  notes: string | null;
  branchId: number;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceSummaryResponse {
  totalDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  totalWorkingHours: number;
  totalOvertimeHours: number;
}
