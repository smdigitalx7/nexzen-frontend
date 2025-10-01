export class BranchId {
  constructor(private readonly value: number) {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error('BranchId must be a positive number');
    }
  }

  public getValue(): number {
    return this.value;
  }

  public equals(other: BranchId): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value.toString();
  }
}
