export class TransportId {
  constructor(private readonly value: number) {
    if (!Number.isFinite(value) || value <= 0) {
      throw new Error('TransportId must be a positive number');
    }
  }

  public getValue(): number {
    return this.value;
  }

  public equals(other: TransportId): boolean {
    return this.value === other.value;
  }

  public toString(): string {
    return this.value.toString();
  }
}
