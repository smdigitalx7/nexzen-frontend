import { Email } from './User';

export interface Employee {
  id: EmployeeId;
  employeeId: string;
  fullName: string;
  email: Email;
  phoneNumber?: string;
  department: string;
  position: string;
  salary: number;
  status: EmployeeStatus;
  hireDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class EmployeeId {
  constructor(private readonly value: number) {}
  
  getValue(): number {
    return this.value;
  }
  
  equals(other: EmployeeId): boolean {
    return this.value === other.value;
  }
  
  toString(): string {
    return this.value.toString();
  }
}

export enum EmployeeStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  TERMINATED = 'terminated',
  ON_LEAVE = 'on_leave'
}

export class EmployeeEntity implements Employee {
  constructor(
    public readonly id: EmployeeId,
    public readonly employeeId: string,
    public readonly fullName: string,
    public readonly email: Email,
    public readonly phoneNumber: string | undefined,
    public readonly department: string,
    public readonly position: string,
    public readonly salary: number,
    public readonly status: EmployeeStatus,
    public readonly hireDate: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
  
  static create(
    id: number,
    employeeId: string,
    fullName: string,
    email: string,
    department: string,
    position: string,
    salary: number,
    phoneNumber?: string
  ): EmployeeEntity {
    return new EmployeeEntity(
      new EmployeeId(id),
      employeeId,
      fullName,
      new Email(email),
      phoneNumber,
      department,
      position,
      salary,
      EmployeeStatus.ACTIVE,
      new Date(),
      new Date(),
      new Date()
    );
  }
  
  updatePersonalInfo(fullName: string, phoneNumber?: string): EmployeeEntity {
    return new EmployeeEntity(
      this.id,
      this.employeeId,
      fullName,
      this.email,
      phoneNumber,
      this.department,
      this.position,
      this.salary,
      this.status,
      this.hireDate,
      this.createdAt,
      new Date()
    );
  }
  
  updateWorkInfo(department: string, position: string, salary: number): EmployeeEntity {
    return new EmployeeEntity(
      this.id,
      this.employeeId,
      this.fullName,
      this.email,
      this.phoneNumber,
      department,
      position,
      salary,
      this.status,
      this.hireDate,
      this.createdAt,
      new Date()
    );
  }
  
  activate(): EmployeeEntity {
    return new EmployeeEntity(
      this.id,
      this.employeeId,
      this.fullName,
      this.email,
      this.phoneNumber,
      this.department,
      this.position,
      this.salary,
      EmployeeStatus.ACTIVE,
      this.hireDate,
      this.createdAt,
      new Date()
    );
  }
  
  deactivate(): EmployeeEntity {
    return new EmployeeEntity(
      this.id,
      this.employeeId,
      this.fullName,
      this.email,
      this.phoneNumber,
      this.department,
      this.position,
      this.salary,
      EmployeeStatus.INACTIVE,
      this.hireDate,
      this.createdAt,
      new Date()
    );
  }
  
  terminate(): EmployeeEntity {
    return new EmployeeEntity(
      this.id,
      this.employeeId,
      this.fullName,
      this.email,
      this.phoneNumber,
      this.department,
      this.position,
      this.salary,
      EmployeeStatus.TERMINATED,
      this.hireDate,
      this.createdAt,
      new Date()
    );
  }
  
  isActive(): boolean {
    return this.status === EmployeeStatus.ACTIVE;
  }
  
  isOnLeave(): boolean {
    return this.status === EmployeeStatus.ON_LEAVE;
  }
  
  isTerminated(): boolean {
    return this.status === EmployeeStatus.TERMINATED;
  }
}
