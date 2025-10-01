import { IAdvanceRepository } from '../../domain/repositories/AdvanceRepository';
import { AdvanceEntity, AdvanceStatus } from '../../domain/entities/Advance';
import { AdvanceId } from '../../domain/value-objects/AdvanceId';
import { ApiClient } from '../api/ApiClient';

export class AdvanceApiRepository implements IAdvanceRepository {
  constructor(private apiClient: ApiClient) {}

  async findById(id: AdvanceId): Promise<AdvanceEntity | null> {
    try {
      const response = await this.apiClient.get(`/advances/${id.getValue()}`);
      return this.mapToEntity(response.data as any);
    } catch (error) {
      return null;
    }
  }

  async findAll(): Promise<AdvanceEntity[]> {
    const response = await this.apiClient.get('/advances');
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async findByEmployeeId(employeeId: number): Promise<AdvanceEntity[]> {
    const response = await this.apiClient.get(`/advances?employee_id=${employeeId}`);
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async findByBranchId(branchId: number): Promise<AdvanceEntity[]> {
    console.log('🔍 AdvanceApiRepository.findByBranchId: Starting to fetch advances...');
    const response = await this.apiClient.get(`/advances/branch`);
    console.log('🔍 AdvanceApiRepository.findByBranchId: Raw response:', response);
    console.log('🔍 AdvanceApiRepository.findByBranchId: Response.data:', response.data);
    console.log('🔍 AdvanceApiRepository.findByBranchId: Data type:', typeof response.data);
    console.log('🔍 AdvanceApiRepository.findByBranchId: Is array:', Array.isArray(response.data));
    
    // Handle case where API returns non-array data
    const dataArray = Array.isArray(response.data) ? response.data : [];
    const mappedEntities = dataArray.map((item: any) => this.mapToEntity(item));
    console.log('🔍 AdvanceApiRepository.findByBranchId: Mapped entities:', mappedEntities.length, 'entities');
    return mappedEntities;
  }

  async save(advanceEntity: AdvanceEntity): Promise<AdvanceEntity> {
    const response = await this.apiClient.post('/advances', this.mapToApiRequest(advanceEntity));
    return this.mapToEntity(response.data as any);
  }

  async update(advanceEntity: AdvanceEntity): Promise<AdvanceEntity> {
    const response = await this.apiClient.put(`/advances/${advanceEntity.id.getValue()}`, this.mapToApiRequest(advanceEntity));
    return this.mapToEntity(response.data as any);
  }

  async delete(id: AdvanceId): Promise<void> {
    await this.apiClient.delete(`/advances/${id.getValue()}`);
  }

  async exists(id: AdvanceId): Promise<boolean> {
    try {
      await this.apiClient.get(`/advances/${id.getValue()}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async count(): Promise<number> {
    const response = await this.apiClient.get('/advances/count');
    return (response.data as any).count;
  }

  async findByStatus(status: any): Promise<AdvanceEntity[]> {
    const response = await this.apiClient.get(`/advances?status=${status}`);
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async findByEmployeeAndStatus(employeeId: number, status: any): Promise<AdvanceEntity[]> {
    const response = await this.apiClient.get(`/advances?employee_id=${employeeId}&status=${status}`);
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async countByEmployeeId(employeeId: number): Promise<number> {
    const response = await this.apiClient.get(`/advances/count?employee_id=${employeeId}`);
    return (response.data as any).count;
  }

  async countByBranchId(branchId: number): Promise<number> {
    const response = await this.apiClient.get(`/advances/count?branch_id=${branchId}`);
    return (response.data as any).count;
  }

  async countByStatus(status: any): Promise<number> {
    const response = await this.apiClient.get(`/advances/count?status=${status}`);
    return (response.data as any).count;
  }

  private mapToEntity(apiData: any): AdvanceEntity {
    return new AdvanceEntity(
      new AdvanceId(apiData.advance_id || apiData.id),
      apiData.employee_id || apiData.employeeId,
      apiData.advance_amount || apiData.amount || 0,
      apiData.request_reason || apiData.reason || '',
      apiData.status as AdvanceStatus || AdvanceStatus.PENDING,
      new Date(apiData.advance_date || apiData.requested_date || apiData.requestedDate || apiData.created_at || apiData.createdAt),
      apiData.branch_id || apiData.branchId || 1,
      new Date(apiData.created_at || apiData.createdAt),
      new Date(apiData.updated_at || apiData.updatedAt),
      apiData.approved_at ? new Date(apiData.approved_at) : undefined,
      apiData.paid_date ? new Date(apiData.paid_date) : undefined,
      apiData.amount_paid || 0,
      apiData.notes
    );
  }

  private mapToApiRequest(advanceEntity: AdvanceEntity): any {
    return {
      employee_id: advanceEntity.employeeId,
      advance_amount: advanceEntity.amount,
      request_reason: advanceEntity.reason,
      advance_date: advanceEntity.requestedDate.toISOString().split('T')[0], // Format as YYYY-MM-DD
      status: advanceEntity.status,
      branch_id: advanceEntity.branchId,
    };
  }
}
