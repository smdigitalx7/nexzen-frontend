import { Email } from './User';

export interface Student {
  id: StudentId;
  studentId: string;
  fullName: string;
  email: Email;
  phoneNumber?: string;
  dateOfBirth: Date;
  address: Address;
  classId: number;
  sectionId: number;
  status: StudentStatus;
  enrollmentDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class StudentId {
  constructor(private readonly value: number) {}
  
  getValue(): number {
    return this.value;
  }
  
  equals(other: StudentId): boolean {
    return this.value === other.value;
  }
  
  toString(): string {
    return this.value.toString();
  }
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export enum StudentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  GRADUATED = 'graduated',
  TRANSFERRED = 'transferred',
  DROPPED = 'dropped'
}

export class StudentEntity implements Student {
  constructor(
    public readonly id: StudentId,
    public readonly studentId: string,
    public readonly fullName: string,
    public readonly email: Email,
    public readonly phoneNumber: string | undefined,
    public readonly dateOfBirth: Date,
    public readonly address: Address,
    public readonly classId: number,
    public readonly sectionId: number,
    public readonly status: StudentStatus,
    public readonly enrollmentDate: Date,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
  
  static create(
    id: number,
    studentId: string,
    fullName: string,
    email: string,
    dateOfBirth: Date,
    address: Address,
    classId: number,
    sectionId: number,
    phoneNumber?: string
  ): StudentEntity {
    return new StudentEntity(
      new StudentId(id),
      studentId,
      fullName,
      new Email(email),
      phoneNumber,
      dateOfBirth,
      address,
      classId,
      sectionId,
      StudentStatus.ACTIVE,
      new Date(),
      new Date(),
      new Date()
    );
  }
  
  updatePersonalInfo(
    fullName: string, 
    email: string, 
    phoneNumber?: string,
    dateOfBirth?: Date
  ): StudentEntity {
    return new StudentEntity(
      this.id,
      this.studentId,
      fullName,
      new Email(email),
      phoneNumber,
      dateOfBirth || this.dateOfBirth,
      this.address,
      this.classId,
      this.sectionId,
      this.status,
      this.enrollmentDate,
      this.createdAt,
      new Date()
    );
  }
  
  updateAddress(address: Address): StudentEntity {
    return new StudentEntity(
      this.id,
      this.studentId,
      this.fullName,
      this.email,
      this.phoneNumber,
      this.dateOfBirth,
      address,
      this.classId,
      this.sectionId,
      this.status,
      this.enrollmentDate,
      this.createdAt,
      new Date()
    );
  }
  
  transferToClass(classId: number, sectionId: number): StudentEntity {
    return new StudentEntity(
      this.id,
      this.studentId,
      this.fullName,
      this.email,
      this.phoneNumber,
      this.dateOfBirth,
      this.address,
      classId,
      sectionId,
      this.status,
      this.enrollmentDate,
      this.createdAt,
      new Date()
    );
  }
  
  activate(): StudentEntity {
    return new StudentEntity(
      this.id,
      this.studentId,
      this.fullName,
      this.email,
      this.phoneNumber,
      this.dateOfBirth,
      this.address,
      this.classId,
      this.sectionId,
      StudentStatus.ACTIVE,
      this.enrollmentDate,
      this.createdAt,
      new Date()
    );
  }
  
  deactivate(): StudentEntity {
    return new StudentEntity(
      this.id,
      this.studentId,
      this.fullName,
      this.email,
      this.phoneNumber,
      this.dateOfBirth,
      this.address,
      this.classId,
      this.sectionId,
      StudentStatus.INACTIVE,
      this.enrollmentDate,
      this.createdAt,
      new Date()
    );
  }
  
  graduate(): StudentEntity {
    return new StudentEntity(
      this.id,
      this.studentId,
      this.fullName,
      this.email,
      this.phoneNumber,
      this.dateOfBirth,
      this.address,
      this.classId,
      this.sectionId,
      StudentStatus.GRADUATED,
      this.enrollmentDate,
      this.createdAt,
      new Date()
    );
  }
  
  transfer(): StudentEntity {
    return new StudentEntity(
      this.id,
      this.studentId,
      this.fullName,
      this.email,
      this.phoneNumber,
      this.dateOfBirth,
      this.address,
      this.classId,
      this.sectionId,
      StudentStatus.TRANSFERRED,
      this.enrollmentDate,
      this.createdAt,
      new Date()
    );
  }
  
  drop(): StudentEntity {
    return new StudentEntity(
      this.id,
      this.studentId,
      this.fullName,
      this.email,
      this.phoneNumber,
      this.dateOfBirth,
      this.address,
      this.classId,
      this.sectionId,
      StudentStatus.DROPPED,
      this.enrollmentDate,
      this.createdAt,
      new Date()
    );
  }
  
  isActive(): boolean {
    return this.status === StudentStatus.ACTIVE;
  }
  
  isGraduated(): boolean {
    return this.status === StudentStatus.GRADUATED;
  }
  
  isTransferred(): boolean {
    return this.status === StudentStatus.TRANSFERRED;
  }
  
  isDropped(): boolean {
    return this.status === StudentStatus.DROPPED;
  }
  
  getAge(): number {
    const today = new Date();
    const birthDate = this.dateOfBirth;
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}
