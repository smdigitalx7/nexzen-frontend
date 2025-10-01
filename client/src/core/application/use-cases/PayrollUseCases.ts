import { PayrollRepository } from '../../domain/repositories/PayrollRepository';
import { PayrollEntity } from '../../domain/entities/Payroll';
import { PayrollId } from '../../domain/value-objects/PayrollId';
import { CreatePayrollRequest, UpdatePayrollRequest, PayrollResponse } from '../dto/PayrollDto';

export class PayrollUseCases {
  constructor(private payrollRepository: PayrollRepository) {}

  async getAllPayrolls(): Promise<PayrollResponse[]> {
    const payrolls = await this.payrollRepository.findAll();
    return payrolls.map(this.mapToResponse);
  }

  async getPayrollById(id: number): Promise<PayrollResponse | null> {
    const payrollEntity = await this.payrollRepository.findById(new PayrollId(id));
    return payrollEntity ? this.mapToResponse(payrollEntity) : null;
  }

  async getPayrollsByEmployee(employeeId: number): Promise<PayrollResponse[]> {
    const payrolls = await this.payrollRepository.findByEmployeeId(employeeId);
    return payrolls.map(this.mapToResponse);
  }

  async getPayrollsByBranch(branchId: number): Promise<PayrollResponse[]> {
    const payrolls = await this.payrollRepository.findByBranchId(branchId);
    return payrolls.map(this.mapToResponse);
  }

  async getPayrollsByMonthYear(month: number, year: number): Promise<PayrollResponse[]> {
    const payrolls = await this.payrollRepository.findByMonthYear(month, year);
    return payrolls.map(this.mapToResponse);
  }

  async getPayrollsByStatus(status: string): Promise<PayrollResponse[]> {
    const payrolls = await this.payrollRepository.findByStatus(status);
    return payrolls.map(this.mapToResponse);
  }

  async createPayroll(request: CreatePayrollRequest): Promise<PayrollResponse> {
    const netSalary = request.basicSalary + request.allowances - request.deductions;
    
    const payrollEntity = new PayrollEntity(
      new PayrollId(0), // Will be set by repository
      request.employeeId,
      request.branchId,
      request.month,
      request.year,
      request.basicSalary,
      request.allowances,
      request.deductions,
      netSalary,
      request.status,
      request.paymentMethod,
      request.paymentDate || null,
      request.notes || null,
      new Date(),
      new Date()
    );

    const savedPayroll = await this.payrollRepository.save(payrollEntity);
    return this.mapToResponse(savedPayroll);
  }

  async updatePayroll(request: UpdatePayrollRequest): Promise<PayrollResponse> {
    const existingPayroll = await this.payrollRepository.findById(new PayrollId(request.id));
    if (!existingPayroll) {
      throw new Error('Payroll not found');
    }

    // If only status is being updated, use the dedicated status update method
    if (request.status !== undefined && 
        request.basicSalary === undefined && 
        request.allowances === undefined && 
        request.deductions === undefined && 
        request.paymentMethod === undefined && 
        request.paymentDate === undefined && 
        request.notes === undefined) {
      const updatedPayroll = await this.payrollRepository.updateStatus(new PayrollId(request.id), request.status);
      return this.mapToResponse(updatedPayroll);
    }

    let updatedPayroll = existingPayroll;

    if (request.basicSalary !== undefined) {
      updatedPayroll = updatedPayroll.updateBasicSalary(request.basicSalary);
    }

    if (request.allowances !== undefined) {
      updatedPayroll = updatedPayroll.updateAllowances(request.allowances);
    }

    if (request.deductions !== undefined) {
      updatedPayroll = updatedPayroll.updateDeductions(request.deductions);
    }

    if (request.status !== undefined) {
      updatedPayroll = updatedPayroll.updateStatus(request.status);
    }

    if (request.paymentMethod !== undefined || request.paymentDate !== undefined) {
      updatedPayroll = updatedPayroll.updatePaymentInfo(
        request.paymentMethod || updatedPayroll.paymentMethod,
        request.paymentDate || updatedPayroll.paymentDate
      );
    }

    if (request.notes !== undefined) {
      updatedPayroll = updatedPayroll.updateNotes(request.notes);
    }

    const savedPayroll = await this.payrollRepository.update(updatedPayroll);
    return this.mapToResponse(savedPayroll);
  }

  async deletePayroll(id: number): Promise<void> {
    await this.payrollRepository.delete(new PayrollId(id));
  }

  async searchPayrolls(query: string): Promise<PayrollResponse[]> {
    const payrolls = await this.payrollRepository.searchPayrolls(query);
    return payrolls.map(this.mapToResponse);
  }

  private mapToResponse(payrollEntity: PayrollEntity): PayrollResponse {
    return {
      id: payrollEntity.id.getValue(),
      employeeId: payrollEntity.employeeId,
      branchId: payrollEntity.branchId,
      month: payrollEntity.month,
      year: payrollEntity.year,
      basicSalary: payrollEntity.basicSalary,
      allowances: payrollEntity.allowances,
      deductions: payrollEntity.deductions,
      netSalary: payrollEntity.netSalary,
      status: payrollEntity.status,
      paymentMethod: payrollEntity.paymentMethod,
      paymentDate: payrollEntity.paymentDate?.toISOString() || null,
      notes: payrollEntity.notes,
      createdAt: payrollEntity.createdAt.toISOString(),
      updatedAt: payrollEntity.updatedAt.toISOString(),
    };
  }
}
