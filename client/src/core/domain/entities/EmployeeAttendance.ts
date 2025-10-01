import { EmployeeAttendanceId } from '@/core/domain/value-objects/EmployeeAttendanceId';

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  HALF_DAY = 'HALF_DAY',
  ON_LEAVE = 'ON_LEAVE'
}

export class EmployeeAttendanceEntity {
  constructor(
    public readonly id: EmployeeAttendanceId,
    public readonly employeeId: number,
    public readonly attendanceDate: Date,
    public readonly checkInTime: Date | null,
    public readonly checkOutTime: Date | null,
    public readonly status: AttendanceStatus,
    public readonly workingHours: number,
    public readonly overtimeHours: number,
    public readonly notes: string | null,
    public readonly branchId: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  public checkIn(checkInTime: Date): EmployeeAttendanceEntity {
    const newStatus = this.calculateStatus(checkInTime);
    return new EmployeeAttendanceEntity(
      this.id,
      this.employeeId,
      this.attendanceDate,
      checkInTime,
      this.checkOutTime,
      newStatus,
      this.workingHours,
      this.overtimeHours,
      this.notes,
      this.branchId,
      this.createdAt,
      new Date()
    );
  }

  public checkOut(checkOutTime: Date): EmployeeAttendanceEntity {
    const workingHours = this.calculateWorkingHours(this.checkInTime, checkOutTime);
    const overtimeHours = this.calculateOvertimeHours(workingHours);
    
    return new EmployeeAttendanceEntity(
      this.id,
      this.employeeId,
      this.attendanceDate,
      this.checkInTime,
      checkOutTime,
      this.status,
      workingHours,
      overtimeHours,
      this.notes,
      this.branchId,
      this.createdAt,
      new Date()
    );
  }

  public updateStatus(status: AttendanceStatus): EmployeeAttendanceEntity {
    return new EmployeeAttendanceEntity(
      this.id,
      this.employeeId,
      this.attendanceDate,
      this.checkInTime,
      this.checkOutTime,
      status,
      this.workingHours,
      this.overtimeHours,
      this.notes,
      this.branchId,
      this.createdAt,
      new Date()
    );
  }

  public updateNotes(notes: string | null): EmployeeAttendanceEntity {
    return new EmployeeAttendanceEntity(
      this.id,
      this.employeeId,
      this.attendanceDate,
      this.checkInTime,
      this.checkOutTime,
      this.status,
      this.workingHours,
      this.overtimeHours,
      notes,
      this.branchId,
      this.createdAt,
      new Date()
    );
  }

  private calculateStatus(checkInTime: Date): AttendanceStatus {
    const expectedCheckIn = new Date(this.attendanceDate);
    expectedCheckIn.setHours(9, 0, 0, 0); // 9:00 AM
    
    const lateThreshold = new Date(expectedCheckIn);
    lateThreshold.setMinutes(lateThreshold.getMinutes() + 30); // 30 minutes late
    
    if (checkInTime <= expectedCheckIn) {
      return AttendanceStatus.PRESENT;
    } else if (checkInTime <= lateThreshold) {
      return AttendanceStatus.LATE;
    } else {
      return AttendanceStatus.ABSENT;
    }
  }

  private calculateWorkingHours(checkInTime: Date | null, checkOutTime: Date): number {
    if (!checkInTime) return 0;
    
    const diffMs = checkOutTime.getTime() - checkInTime.getTime();
    return Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // Round to 2 decimal places
  }

  private calculateOvertimeHours(workingHours: number): number {
    const standardHours = 8; // 8 hours standard
    return Math.max(0, workingHours - standardHours);
  }
}
