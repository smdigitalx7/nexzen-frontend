export class EmployeeLeaveId {
  constructor(private readonly value: number) {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error('EmployeeLeaveId must be a positive number');
    }
  }

  public getValue(): number {
    return this.value;
  }

  public equals(other: EmployeeLeaveId): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value.toString();
  }
}
