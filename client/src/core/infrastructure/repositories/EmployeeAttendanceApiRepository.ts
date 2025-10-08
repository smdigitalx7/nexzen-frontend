import { EmployeeAttendanceRepository } from '../../domain/repositories/EmployeeAttendanceRepository';
import { EmployeeAttendanceEntity, AttendanceStatus } from '../../domain/entities/EmployeeAttendance';
import { EmployeeAttendanceId } from '../../domain/value-objects/EmployeeAttendanceId';
import { ApiClient } from '../api/ApiClient';

export class EmployeeAttendanceApiRepository implements EmployeeAttendanceRepository {
  constructor(private apiClient: ApiClient) {}

  async findById(id: EmployeeAttendanceId): Promise<EmployeeAttendanceEntity | null> {
    try {
      const response = await this.apiClient.get(`/employee-attendances/${id.getValue()}`);
      return this.mapToEntity(response.data as any);
    } catch (error) {
      return null;
    }
  }

  async findAll(): Promise<EmployeeAttendanceEntity[]> {
    const response = await this.apiClient.get('/employee-attendances/');
    const wrapper = response.data as { data?: any[] } | any[];
    const records = Array.isArray(wrapper) ? wrapper : (wrapper?.data ?? []);
    return records.map((item: any) => this.mapToEntity(item));
  }

  async findByEmployeeId(employeeId: number): Promise<EmployeeAttendanceEntity[]> {
    // Backend does not support employee_id filter yet; fallback to all and client filter
    const all = await this.findAll();
    return all.filter(a => a.employeeId === employeeId);
  }

  async findByBranchId(branchId: number): Promise<EmployeeAttendanceEntity[]> {
    const response = await this.apiClient.get(`/employee-attendances/branch`);
    const wrapper = response.data as { data?: any[] } | any[];
    const records = Array.isArray(wrapper) ? wrapper : (wrapper?.data ?? []);
    return records.map((item: any) => this.mapToEntity(item));
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<EmployeeAttendanceEntity[]> {
    // Backend does not support date range; fallback to all and filter by month/year
    const all = await this.findAll();
    const start = startDate.getTime();
    const end = endDate.getTime();
    return all.filter(a => {
      const t = a.attendanceDate.getTime();
      return t >= start && t <= end;
    });
  }

  async save(attendanceEntity: EmployeeAttendanceEntity): Promise<EmployeeAttendanceEntity> {
    const response = await this.apiClient.post('/employee-attendances', this.mapToApiRequest(attendanceEntity));
    return this.mapToEntity(response.data as any);
  }

  async update(attendanceEntity: EmployeeAttendanceEntity): Promise<EmployeeAttendanceEntity> {
    const response = await this.apiClient.put(`/employee-attendances/${attendanceEntity.id.getValue()}`, this.mapToApiRequest(attendanceEntity));
    return this.mapToEntity(response.data as any);
  }

  async delete(id: EmployeeAttendanceId): Promise<void> {
    await this.apiClient.delete(`/employee-attendances/${id.getValue()}`);
  }

  async exists(id: EmployeeAttendanceId): Promise<boolean> {
    try {
      await this.apiClient.get(`/employee-attendances/${id.getValue()}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async count(): Promise<number> {
    // Not supported in backend; derive from list
    const all = await this.findAll();
    return all.length;
  }

  private mapToEntity(apiData: any): EmployeeAttendanceEntity {
    // Backend schema: attendance_month, total_working_days, days_present, days_absent, ...
    const attendanceDate = new Date(apiData.attendance_month || apiData.attendanceDate || apiData.date);
    const workingHours = apiData.total_working_days ?? apiData.working_hours ?? apiData.workingHours ?? 0;
    return new EmployeeAttendanceEntity(
      new EmployeeAttendanceId(apiData.attendance_id || apiData.id),
      apiData.employee_id || apiData.employeeId,
      attendanceDate,
      null,
      null,
      (apiData.days_present ?? 0) >= 1 ? AttendanceStatus.PRESENT : AttendanceStatus.ABSENT,
      workingHours,
      0,
      null,
      apiData.branch_id || apiData.branchId || 1,
      new Date(apiData.created_at || apiData.createdAt || attendanceDate),
      new Date(apiData.updated_at || apiData.updatedAt || attendanceDate)
    );
  }

  private mapToApiRequest(attendanceEntity: EmployeeAttendanceEntity): any {
    // Map domain to backend expected fields
    const isPresent = attendanceEntity.status === 'PRESENT';
    return {
      employee_id: attendanceEntity.employeeId,
      attendance_month: attendanceEntity.attendanceDate.toISOString().split('T')[0],
      total_working_days: 1,
      days_present: isPresent ? 1 : 0,
      days_absent: isPresent ? 0 : 1,
      paid_leaves: 0,
      unpaid_leaves: 0,
      late_arrivals: 0,
      early_departures: 0,
    };
  }

  async findByEmployeeAndDate(employeeId: number, date: Date): Promise<EmployeeAttendanceEntity | null> {
    // Not supported; approximate via list
    const all = await this.findAll();
    const target = all.find(a => a.employeeId === employeeId && a.attendanceDate.toDateString() === date.toDateString()) || null;
    return target;
  }

  async findByStatus(status: AttendanceStatus): Promise<EmployeeAttendanceEntity[]> {
    // Not supported; filter client-side
    const all = await this.findAll();
    return all.filter(a => a.status === status);
  }

  async countByEmployee(employeeId: number): Promise<number> {
    const list = await this.findByEmployeeId(employeeId);
    return list.length;
  }

  async countByStatus(status: AttendanceStatus): Promise<number> {
    const list = await this.findByStatus(status);
    return list.length;
  }

  async countByBranch(branchId: number): Promise<number> {
    const list = await this.findByBranchId(branchId);
    return list.length;
  }

  async getAttendanceSummary(employeeId: number, startDate: Date, endDate: Date): Promise<{
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    totalWorkingHours: number;
    totalOvertimeHours: number;
  }> {
    // Not supported; derive summary client-side
    const list = await this.findByEmployeeId(employeeId);
    const inRange = list.filter(a => a.attendanceDate >= new Date(startDate.toDateString()) && a.attendanceDate <= new Date(endDate.toDateString()));
    const totalDays = inRange.length;
    const presentDays = inRange.filter(a => a.status === 'PRESENT').length;
    const absentDays = totalDays - presentDays;
    const lateDays = 0;
    const totalWorkingHours = inRange.reduce((s, a) => s + a.workingHours, 0);
    const totalOvertimeHours = inRange.reduce((s, a) => s + a.overtimeHours, 0);
    return { totalDays, presentDays, absentDays, lateDays, totalWorkingHours, totalOvertimeHours } as any;
  }

  async searchEmployeeAttendance(query: string): Promise<EmployeeAttendanceEntity[]> {
    // Not supported; filter client-side
    const all = await this.findAll();
    const q = query.toLowerCase();
    return all.filter(a => `${a.employeeId}`.includes(q));
  }
}
