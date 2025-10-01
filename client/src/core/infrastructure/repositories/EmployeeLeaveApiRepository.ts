import { EmployeeLeaveRepository } from '../../domain/repositories/EmployeeLeaveRepository';
import { EmployeeLeaveEntity } from '../../domain/entities/EmployeeLeave';
import { EmployeeLeaveId } from '../../domain/value-objects/EmployeeLeaveId';
import { ApiClient } from '../api/ApiClient';

export class EmployeeLeaveApiRepository implements EmployeeLeaveRepository {
  constructor(private apiClient: ApiClient) {}

  async findById(id: EmployeeLeaveId): Promise<EmployeeLeaveEntity | null> {
    try {
      const response = await this.apiClient.get(`/employee-leave/${id.getValue()}`);
      return this.mapToEntity(response.data as any);
    } catch (error) {
      return null;
    }
  }

  async findAll(): Promise<EmployeeLeaveEntity[]> {
    console.log('🔍 EmployeeLeaveApiRepository.findAll: Starting to fetch leaves...');
    const response = await this.apiClient.get('/employee-leave/');
    console.log('🔍 EmployeeLeaveApiRepository.findAll: Raw response:', response);
    console.log('🔍 EmployeeLeaveApiRepository.findAll: Response type:', typeof response);
    console.log('🔍 EmployeeLeaveApiRepository.findAll: Response.data:', response.data);
    console.log('🔍 EmployeeLeaveApiRepository.findAll: Response length:', Array.isArray(response) ? response.length : (response.data && Array.isArray(response.data) ? response.data.length : 0));
    
    const data = response.data || response;
    console.log('🔍 EmployeeLeaveApiRepository.findAll: Data type:', typeof data);
    console.log('🔍 EmployeeLeaveApiRepository.findAll: Is array:', Array.isArray(data));
    console.log('🔍 EmployeeLeaveApiRepository.findAll: Data value:', data);
    
    // Handle case where API returns non-array data
    const dataArray = Array.isArray(data) ? data : [];
    const mappedEntities = dataArray.map((item: any) => this.mapToEntity(item));
    console.log('🔍 EmployeeLeaveApiRepository.findAll: Mapped entities:', mappedEntities.length, 'entities');
    return mappedEntities;
  }

  async findByEmployeeId(employeeId: number): Promise<EmployeeLeaveEntity[]> {
    const response = await this.apiClient.get(`/employee-leave?employee_id=${employeeId}`);
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async findByBranchId(branchId: number): Promise<EmployeeLeaveEntity[]> {
    const response = await this.apiClient.get(`/employee-leave?branch_id=${branchId}`);
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async findByStatus(status: string): Promise<EmployeeLeaveEntity[]> {
    const response = await this.apiClient.get(`/employee-leave?status=${status}`);
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<EmployeeLeaveEntity[]> {
    const response = await this.apiClient.get(`/employee-leave?start_date=${startDate.toISOString()}&end_date=${endDate.toISOString()}`);
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async save(leaveEntity: EmployeeLeaveEntity): Promise<EmployeeLeaveEntity> {
    const response = await this.apiClient.post('/employee-leave', this.mapToApiRequest(leaveEntity));
    return this.mapToEntity(response.data as any);
  }

  async update(leaveEntity: EmployeeLeaveEntity): Promise<EmployeeLeaveEntity> {
    const response = await this.apiClient.put(`/employee-leave/${leaveEntity.id.getValue()}`, this.mapToApiRequest(leaveEntity));
    return this.mapToEntity(response.data as any);
  }

  async delete(id: EmployeeLeaveId): Promise<void> {
    await this.apiClient.delete(`/employee-leave/${id.getValue()}`);
  }

  async exists(id: EmployeeLeaveId): Promise<boolean> {
    try {
      await this.apiClient.get(`/employee-leave/${id.getValue()}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async count(): Promise<number> {
    const response = await this.apiClient.get('/employee-leave/count');
    return (response.data as any).count;
  }

  async getLeaveSummary(employeeId: number, year: number): Promise<any> {
    const response = await this.apiClient.get(`/employee-leave/summary/${employeeId}?year=${year}`);
    return response.data;
  }

  async approveLeave(id: EmployeeLeaveId, notes?: string): Promise<EmployeeLeaveEntity> {
    const response = await this.apiClient.put(`/employee-leave/${id.getValue()}/approve`, { notes });
    return this.mapToEntity(response.data as any);
  }

  async rejectLeave(id: EmployeeLeaveId, notes?: string): Promise<EmployeeLeaveEntity> {
    const response = await this.apiClient.put(`/employee-leave/${id.getValue()}/reject`, { notes });
    return this.mapToEntity(response.data as any);
  }

  async findByLeaveType(leaveType: string): Promise<EmployeeLeaveEntity[]> {
    const response = await this.apiClient.get(`/employee-leave/type/${leaveType}`);
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async findByEmployeeAndYear(employeeId: number, year: number): Promise<EmployeeLeaveEntity[]> {
    const response = await this.apiClient.get(`/employee-leave/employee/${employeeId}/year/${year}`);
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async countByEmployee(employeeId: number): Promise<number> {
    const response = await this.apiClient.get(`/employee-leave/employee/${employeeId}/count`);
    return (response.data as any).count;
  }

  async countByStatus(status: string): Promise<number> {
    const response = await this.apiClient.get(`/employee-leave/status/${status}/count`);
    return (response.data as any).count;
  }

  async countByBranch(branchId: number): Promise<number> {
    const response = await this.apiClient.get(`/employee-leave/branch/${branchId}/count`);
    return (response.data as any).count;
  }


  async searchEmployeeLeaves(query: string): Promise<EmployeeLeaveEntity[]> {
    const response = await this.apiClient.get(`/employee-leave/search?q=${encodeURIComponent(query)}`);
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  private mapToEntity(apiData: any): EmployeeLeaveEntity {
    return new EmployeeLeaveEntity(
      new EmployeeLeaveId(apiData.leave_id || apiData.id),
      apiData.employee_id || apiData.employeeId,
      apiData.leave_type || apiData.leaveType,
      new Date(apiData.start_date || apiData.startDate),
      new Date(apiData.end_date || apiData.endDate),
      apiData.total_days || apiData.totalDays || 0,
      apiData.reason || '',
      apiData.status || 'PENDING',
      new Date(apiData.applied_date || apiData.appliedDate),
      apiData.approved_by || apiData.approvedBy || null,
      apiData.approved_date ? new Date(apiData.approved_date) : null,
      apiData.rejected_by || apiData.rejectedBy || null,
      apiData.rejected_date ? new Date(apiData.rejected_date) : null,
      apiData.rejection_reason || apiData.rejectionReason || null,
      apiData.branch_id || apiData.branchId || 1,
      new Date(apiData.created_at || apiData.createdAt),
      new Date(apiData.updated_at || apiData.updatedAt)
    );
  }

  private mapToApiRequest(leaveEntity: EmployeeLeaveEntity): any {
    return {
      employee_id: leaveEntity.employeeId,
      leave_type: leaveEntity.leaveType,
      start_date: leaveEntity.startDate.toISOString(),
      end_date: leaveEntity.endDate.toISOString(),
      reason: leaveEntity.reason,
      status: leaveEntity.status,
      branch_id: leaveEntity.branchId,
    };
  }
}
