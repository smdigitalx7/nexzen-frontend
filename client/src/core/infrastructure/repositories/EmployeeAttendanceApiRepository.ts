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
    console.log('🔍 EmployeeAttendanceApiRepository.findAll: Starting to fetch attendance...');
    const response = await this.apiClient.get('/employee-attendances/');
    console.log('🔍 EmployeeAttendanceApiRepository.findAll: Raw response:', response);
    console.log('🔍 EmployeeAttendanceApiRepository.findAll: Response type:', typeof response);
    console.log('🔍 EmployeeAttendanceApiRepository.findAll: Response.data:', response.data);
    console.log('🔍 EmployeeAttendanceApiRepository.findAll: Response length:', Array.isArray(response) ? response.length : (response.data && Array.isArray(response.data) ? response.data.length : 0));
    
    const data = response.data || response;
    console.log('🔍 EmployeeAttendanceApiRepository.findAll: Data type:', typeof data);
    console.log('🔍 EmployeeAttendanceApiRepository.findAll: Is array:', Array.isArray(data));
    console.log('🔍 EmployeeAttendanceApiRepository.findAll: Data value:', data);
    
    // Handle case where API returns non-array data
    const dataArray = Array.isArray(data) ? data : [];
    const mappedEntities = dataArray.map((item: any) => this.mapToEntity(item));
    console.log('🔍 EmployeeAttendanceApiRepository.findAll: Mapped entities:', mappedEntities.length, 'entities');
    return mappedEntities;
  }

  async findByEmployeeId(employeeId: number): Promise<EmployeeAttendanceEntity[]> {
    const response = await this.apiClient.get(`/employee-attendances?employee_id=${employeeId}`);
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async findByBranchId(branchId: number): Promise<EmployeeAttendanceEntity[]> {
    const response = await this.apiClient.get(`/employee-attendances?branch_id=${branchId}`);
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<EmployeeAttendanceEntity[]> {
    const response = await this.apiClient.get(`/employee-attendances?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`);
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
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
    const response = await this.apiClient.get('/employee-attendances/count');
    return (response.data as any).count;
  }

  private mapToEntity(apiData: any): EmployeeAttendanceEntity {
    return new EmployeeAttendanceEntity(
      new EmployeeAttendanceId(apiData.attendance_id || apiData.id),
      apiData.employee_id || apiData.employeeId,
      new Date(apiData.attendance_date || apiData.attendanceDate || apiData.date),
      apiData.check_in_time ? new Date(apiData.check_in_time) : null,
      apiData.check_out_time ? new Date(apiData.check_out_time) : null,
      apiData.status || 'PRESENT' as AttendanceStatus,
      apiData.working_hours || apiData.workingHours || 0,
      apiData.overtime_hours || apiData.overtimeHours || 0,
      apiData.notes || null,
      apiData.branch_id || apiData.branchId || 1,
      new Date(apiData.created_at || apiData.createdAt),
      new Date(apiData.updated_at || apiData.updatedAt)
    );
  }

  private mapToApiRequest(attendanceEntity: EmployeeAttendanceEntity): any {
    return {
      employee_id: attendanceEntity.employeeId,
      branch_id: attendanceEntity.branchId,
      attendance_date: attendanceEntity.attendanceDate.toISOString(),
      status: attendanceEntity.status,
    };
  }

  async findByEmployeeAndDate(employeeId: number, date: Date): Promise<EmployeeAttendanceEntity | null> {
    try {
      const response = await this.apiClient.get(`/employee-attendance/employee/${employeeId}/date/${date.toISOString().split('T')[0]}`);
      return this.mapToEntity(response.data as any);
    } catch (error) {
      return null;
    }
  }

  async findByStatus(status: AttendanceStatus): Promise<EmployeeAttendanceEntity[]> {
    const response = await this.apiClient.get(`/employee-attendance/status/${status}`);
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async countByEmployee(employeeId: number): Promise<number> {
    const response = await this.apiClient.get(`/employee-attendance/employee/${employeeId}/count`);
    return (response.data as any).count;
  }

  async countByStatus(status: AttendanceStatus): Promise<number> {
    const response = await this.apiClient.get(`/employee-attendance/status/${status}/count`);
    return (response.data as any).count;
  }

  async countByBranch(branchId: number): Promise<number> {
    const response = await this.apiClient.get(`/employee-attendance/branch/${branchId}/count`);
    return (response.data as any).count;
  }

  async getAttendanceSummary(employeeId: number, startDate: Date, endDate: Date): Promise<{
    totalDays: number;
    presentDays: number;
    absentDays: number;
    lateDays: number;
    totalWorkingHours: number;
    totalOvertimeHours: number;
  }> {
    const response = await this.apiClient.get(`/employee-attendance/employee/${employeeId}/summary?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`);
    return response.data as any;
  }

  async searchEmployeeAttendance(query: string): Promise<EmployeeAttendanceEntity[]> {
    const response = await this.apiClient.get(`/employee-attendance/search?q=${encodeURIComponent(query)}`);
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }
}
