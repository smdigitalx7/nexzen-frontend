import { PayrollRepository } from '../../domain/repositories/PayrollRepository';
import { PayrollEntity } from '../../domain/entities/Payroll';
import { PayrollId } from '../../domain/value-objects/PayrollId';
import { ApiClient } from '../api/ApiClient';

export class PayrollApiRepository implements PayrollRepository {
  constructor(private apiClient: ApiClient) {}

  async findById(id: PayrollId): Promise<PayrollEntity | null> {
    try {
      const response = await this.apiClient.get(`/payrolls/${id.getValue()}`);
      return this.mapToEntity(response.data as any);
    } catch (error) {
      return null;
    }
  }

  async findAll(): Promise<PayrollEntity[]> {
    const response = await this.apiClient.get('/payrolls/');
    const payrollListResponse = response.data as any;
    return payrollListResponse.data.map((item: any) => this.mapToEntity(item));
  }

  async findByEmployeeId(employeeId: number): Promise<PayrollEntity[]> {
    const response = await this.apiClient.get(`/payrolls?employee_id=${employeeId}`);
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async findByBranchId(branchId: number): Promise<PayrollEntity[]> {
    const response = await this.apiClient.get('/payrolls/branch');
    const payrollListResponse = response.data as any;
    return payrollListResponse.data.map((item: any) => this.mapToEntity(item));
  }

  async findByMonth(month: number, year: number): Promise<PayrollEntity[]> {
    const response = await this.apiClient.get(`/payrolls?month=${month}&year=${year}`);
    const payrollListResponse = response.data as any;
    return payrollListResponse.data.map((item: any) => this.mapToEntity(item));
  }

  async findByStatus(status: string): Promise<PayrollEntity[]> {
    const response = await this.apiClient.get(`/payrolls?status=${status}`);
    const payrollListResponse = response.data as any;
    return payrollListResponse.data.map((item: any) => this.mapToEntity(item));
  }

  async save(payrollEntity: PayrollEntity): Promise<PayrollEntity> {
    const response = await this.apiClient.post('/payrolls/', this.mapToApiRequest(payrollEntity));
    return this.mapToEntity(response.data as any);
  }

  async update(payrollEntity: PayrollEntity): Promise<PayrollEntity> {
    const response = await this.apiClient.put(`/payrolls/${payrollEntity.id.getValue()}`, this.mapToApiRequest(payrollEntity));
    return this.mapToEntity(response.data as any);
  }

  async updateStatus(id: PayrollId, status: string): Promise<PayrollEntity> {
    const response = await this.apiClient.put(`/payrolls/${id.getValue()}/status`, status);
    return this.mapToEntity(response.data as any);
  }

  async delete(id: PayrollId): Promise<void> {
    await this.apiClient.delete(`/payrolls/${id.getValue()}`);
  }

  async exists(id: PayrollId): Promise<boolean> {
    try {
      await this.apiClient.get(`/payrolls/${id.getValue()}`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async count(): Promise<number> {
    const response = await this.apiClient.get('/payrolls/count');
    return (response.data as any).count;
  }

  async generatePayroll(employeeId: number, month: number, year: number): Promise<PayrollEntity> {
    const response = await this.apiClient.post('/payrolls/generate', {
      employee_id: employeeId,
      month,
      year
    });
    return this.mapToEntity(response.data as any);
  }

  async approvePayroll(id: PayrollId): Promise<PayrollEntity> {
    const response = await this.apiClient.put(`/payrolls/${id.getValue()}/approve`, {});
    return this.mapToEntity(response.data as any);
  }

  async processPayroll(id: PayrollId): Promise<PayrollEntity> {
    const response = await this.apiClient.put(`/payrolls/${id.getValue()}/process`, {});
    return this.mapToEntity(response.data as any);
  }

  async findByMonthYear(month: number, year: number): Promise<PayrollEntity[]> {
    const response = await this.apiClient.get(`/payrolls/month/${month}/year/${year}`);
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  async findByEmployeeAndMonthYear(employeeId: number, month: number, year: number): Promise<PayrollEntity | null> {
    try {
      const response = await this.apiClient.get(`/payrolls/employee/${employeeId}/month/${month}/year/${year}`);
      return this.mapToEntity(response.data as any);
    } catch (error) {
      return null;
    }
  }

  async countByEmployee(employeeId: number): Promise<number> {
    const response = await this.apiClient.get(`/payrolls/employee/${employeeId}/count`);
    return (response.data as any).count;
  }

  async countByBranch(branchId: number): Promise<number> {
    const response = await this.apiClient.get(`/payrolls/branch/${branchId}/count`);
    return (response.data as any).count;
  }

  async countByStatus(status: string): Promise<number> {
    const response = await this.apiClient.get(`/payrolls/status/${status}/count`);
    return (response.data as any).count;
  }

  async getPayrollSummary(employeeId: number, startDate: Date, endDate: Date): Promise<any> {
    const response = await this.apiClient.get(`/payrolls/employee/${employeeId}/summary?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`);
    return response.data;
  }

  async searchPayrolls(query: string): Promise<PayrollEntity[]> {
    const response = await this.apiClient.get(`/payrolls/search?q=${encodeURIComponent(query)}`);
    return (response.data as any[]).map((item: any) => this.mapToEntity(item));
  }

  private mapToEntity(apiData: any): PayrollEntity {
    // Extract month and year from payroll_month date
    const payrollMonth = new Date(apiData.payroll_month);
    const month = payrollMonth.getMonth() + 1;
    const year = payrollMonth.getFullYear();
    
    return new PayrollEntity(
      new PayrollId(apiData.payroll_id),
      apiData.employee_id,
      1, // Default branch ID since backend doesn't provide it directly
      month,
      year,
      apiData.gross_pay,
      0, // Allowances not provided in backend response
      apiData.total_deductions,
      apiData.net_pay,
      apiData.status,
      apiData.payment_method || 'CASH',
      null, // Payment date not provided in backend response
      apiData.payment_notes,
      new Date(apiData.generated_at),
      new Date(apiData.updated_at || apiData.generated_at)
    );
  }

  private mapToApiRequest(payrollEntity: PayrollEntity): any {
    // Create payroll_month date from month and year
    const payrollMonth = new Date(payrollEntity.year, payrollEntity.month - 1, 1);
    
    return {
      employee_id: payrollEntity.employeeId,
      payroll_month: payrollMonth.toISOString().split('T')[0],
      gross_pay: payrollEntity.basicSalary,
      advance_deduction: 0,
      other_deductions: payrollEntity.deductions,
      payment_method: payrollEntity.paymentMethod,
      payment_notes: payrollEntity.notes,
      status: payrollEntity.status,
    };
  }
}
