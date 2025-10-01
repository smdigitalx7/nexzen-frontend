import { PayrollId } from '../value-objects/PayrollId';

export class PayrollEntity {
  constructor(
    public readonly id: PayrollId,
    public readonly employeeId: number,
    public readonly branchId: number,
    public readonly month: number,
    public readonly year: number,
    public readonly basicSalary: number,
    public readonly allowances: number,
    public readonly deductions: number,
    public readonly netSalary: number,
    public readonly status: string,
    public readonly paymentMethod: string,
    public readonly paymentDate: Date | null,
    public readonly notes: string | null,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}

  public updateBasicSalary(basicSalary: number): PayrollEntity {
    const newNetSalary = basicSalary + this.allowances - this.deductions;
    return new PayrollEntity(
      this.id,
      this.employeeId,
      this.branchId,
      this.month,
      this.year,
      basicSalary,
      this.allowances,
      this.deductions,
      newNetSalary,
      this.status,
      this.paymentMethod,
      this.paymentDate,
      this.notes,
      this.createdAt,
      new Date()
    );
  }

  public updateAllowances(allowances: number): PayrollEntity {
    const newNetSalary = this.basicSalary + allowances - this.deductions;
    return new PayrollEntity(
      this.id,
      this.employeeId,
      this.branchId,
      this.month,
      this.year,
      this.basicSalary,
      allowances,
      this.deductions,
      newNetSalary,
      this.status,
      this.paymentMethod,
      this.paymentDate,
      this.notes,
      this.createdAt,
      new Date()
    );
  }

  public updateDeductions(deductions: number): PayrollEntity {
    const newNetSalary = this.basicSalary + this.allowances - deductions;
    return new PayrollEntity(
      this.id,
      this.employeeId,
      this.branchId,
      this.month,
      this.year,
      this.basicSalary,
      this.allowances,
      deductions,
      newNetSalary,
      this.status,
      this.paymentMethod,
      this.paymentDate,
      this.notes,
      this.createdAt,
      new Date()
    );
  }

  public updateStatus(status: string): PayrollEntity {
    return new PayrollEntity(
      this.id,
      this.employeeId,
      this.branchId,
      this.month,
      this.year,
      this.basicSalary,
      this.allowances,
      this.deductions,
      this.netSalary,
      status,
      this.paymentMethod,
      this.paymentDate,
      this.notes,
      this.createdAt,
      new Date()
    );
  }

  public updatePaymentInfo(paymentMethod: string, paymentDate: Date | null): PayrollEntity {
    return new PayrollEntity(
      this.id,
      this.employeeId,
      this.branchId,
      this.month,
      this.year,
      this.basicSalary,
      this.allowances,
      this.deductions,
      this.netSalary,
      this.status,
      paymentMethod,
      paymentDate,
      this.notes,
      this.createdAt,
      new Date()
    );
  }

  public updateNotes(notes: string | null): PayrollEntity {
    return new PayrollEntity(
      this.id,
      this.employeeId,
      this.branchId,
      this.month,
      this.year,
      this.basicSalary,
      this.allowances,
      this.deductions,
      this.netSalary,
      this.status,
      this.paymentMethod,
      this.paymentDate,
      notes,
      this.createdAt,
      new Date()
    );
  }
}
