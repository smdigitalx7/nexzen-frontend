export interface User {
  id: UserId;
  fullName: string;
  email: Email;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class UserId {
  constructor(private readonly value: number) {}
  
  getValue(): number {
    return this.value;
  }
  
  equals(other: UserId): boolean {
    return this.value === other.value;
  }
  
  toString(): string {
    return this.value.toString();
  }
}

export class Email {
  constructor(private readonly value: string) {
    if (!this.isValid(value)) {
      throw new Error('Invalid email format');
    }
  }
  
  private isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  getValue(): string {
    return this.value;
  }
  
  equals(other: Email): boolean {
    return this.value === other.value;
  }
  
  toString(): string {
    return this.value;
  }
}

export enum UserRole {
  INSTITUTE_ADMIN = 'institute_admin',
  ACADEMIC = 'academic',
  ACCOUNTANT = 'accountant'
}

export class UserEntity implements User {
  constructor(
    public readonly id: UserId,
    public readonly fullName: string,
    public readonly email: Email,
    public readonly role: UserRole,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
  
  static create(
    id: number,
    fullName: string,
    email: string,
    role: UserRole,
    isActive: boolean = true
  ): UserEntity {
    return new UserEntity(
      new UserId(id),
      fullName,
      new Email(email),
      role,
      isActive,
      new Date(),
      new Date()
    );
  }
  
  updateFullName(fullName: string): UserEntity {
    return new UserEntity(
      this.id,
      fullName,
      this.email,
      this.role,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }
  
  updateEmail(email: string): UserEntity {
    return new UserEntity(
      this.id,
      this.fullName,
      new Email(email),
      this.role,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }
  
  updateRole(role: UserRole): UserEntity {
    return new UserEntity(
      this.id,
      this.fullName,
      this.email,
      role,
      this.isActive,
      this.createdAt,
      new Date()
    );
  }
  
  activate(): UserEntity {
    return new UserEntity(
      this.id,
      this.fullName,
      this.email,
      this.role,
      true,
      this.createdAt,
      new Date()
    );
  }
  
  deactivate(): UserEntity {
    return new UserEntity(
      this.id,
      this.fullName,
      this.email,
      this.role,
      false,
      this.createdAt,
      new Date()
    );
  }
  
  isInstituteAdmin(): boolean {
    return this.role === UserRole.INSTITUTE_ADMIN;
  }
  
  canManageUsers(): boolean {
    return this.role === UserRole.INSTITUTE_ADMIN;
  }
  
  canAccessFinancials(): boolean {
    return this.role === UserRole.INSTITUTE_ADMIN || this.role === UserRole.ACCOUNTANT;
  }
  
  canAccessAcademic(): boolean {
    return this.role === UserRole.INSTITUTE_ADMIN || this.role === UserRole.ACADEMIC;
  }
}
