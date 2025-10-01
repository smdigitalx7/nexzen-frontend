import { PayrollEntity } from '../entities/Payroll';
import { PayrollId } from '../value-objects/PayrollId';

export interface PayrollRepository {
  findById(id: PayrollId): Promise<PayrollEntity | null>;
  findAll(): Promise<PayrollEntity[]>;
  findByEmployeeId(employeeId: number): Promise<PayrollEntity[]>;
  findByBranchId(branchId: number): Promise<PayrollEntity[]>;
  findByMonthYear(month: number, year: number): Promise<PayrollEntity[]>;
  findByStatus(status: string): Promise<PayrollEntity[]>;
  findByEmployeeAndMonthYear(employeeId: number, month: number, year: number): Promise<PayrollEntity | null>;
  save(payrollEntity: PayrollEntity): Promise<PayrollEntity>;
  update(payrollEntity: PayrollEntity): Promise<PayrollEntity>;
  updateStatus(id: PayrollId, status: string): Promise<PayrollEntity>;
  delete(id: PayrollId): Promise<void>;
  exists(id: PayrollId): Promise<boolean>;
  count(): Promise<number>;
  countByEmployee(employeeId: number): Promise<number>;
  countByBranch(branchId: number): Promise<number>;
  countByStatus(status: string): Promise<number>;
  searchPayrolls(query: string): Promise<PayrollEntity[]>;
}
